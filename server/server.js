// Blood Zone — authoritative multiplayer server.
// The server owns health, kills, round state, abilities and player positions.
// Clients send input intent; they never submit their own health or score.
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CORS_ORIGIN || "*" } });
const PORT = process.env.PORT || 3000;
const TICK = 50;
const { ARENA, STRIKERS, WILDCARDS } = require("./game/rules");
const rooms = new Map();
/* Weapon tuning stays server-side so clients cannot change damage or cooldowns. */
const UNUSED_RULES_NOTE = "All authoritative combat values are held on the server.";
const WEAPONS = {
  rifle: { name: "Rifle", price: 0, damage: 22, range: 75, cooldown: 180 },
  smg: { name: "SMG", price: 1800, damage: 14, range: 42, cooldown: 90 },
  marksman: { name: "Marksman", price: 2600, damage: 42, range: 100, cooldown: 520 },
  shotgun: { name: "Scatter", price: 2200, damage: 12, range: 18, cooldown: 650 }
};
app.use(express.static(path.join(__dirname, "..", "client")));
app.get("/health", (_req, res) => res.json({ ok: true, rooms: rooms.size }));

const rand = (a, b) => Math.random() * (b - a) + a;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist2 = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
function roomFor(socket) {
  for (const room of rooms.values()) if (room.players.has(socket.id)) return room;
  return null;
}
function publicPlayer(p) {
  return { id:p.id, name:p.name, striker:p.striker, team:p.team, x:p.x, y:p.y, z:p.z,
    yaw:p.yaw, pitch:p.pitch, hp:p.hp, maxHp:p.maxHp, armor:p.armor, armorMax:p.armorMax, armorLevel:p.armorLevel,
    alive:p.alive, kills:p.kills, weapon:p.weapon, shield:p.shield ? {x:p.shield.x,z:p.shield.z,yaw:p.shield.yaw,hp:p.shield.hp}:null,
    turret:p.turret ? {x:p.turret.x,z:p.turret.z,hp:p.turret.hp}:null, money:p.money, wildcards:p.wildcards };
}
function makePlayer(socket, data, team) {
  const striker = STRIKERS[data.striker] ? data.striker : "Ethan";
  return { id:socket.id, name:String(data.name || "Player").slice(0,16), striker, team,
    x:rand(-12,12), y:0, vy:0, z:rand(-12,12), vx:0, vz:0, yaw:0, pitch:0,
    hp:STRIKERS[striker].hp, maxHp:STRIKERS[striker].hp, armor:25, armorMax:25, armorLevel:1, armorXp:0,
    alive:true, kills:0, money:800, weapon:"rifle", lastShot:0, lastAbility:0,
    input:{forward:0,right:0,sprint:false,crouch:false}, wildcards:[], shield:null, turret:null, dashUntil:0 };
}
function createRoom(id, mode) {
  const room = { id, mode, players:new Map(), phase:"waiting", round:1, scores:{red:0,blue:0},
    zone:{x:0,z:0,radius:ARENA,stage:0}, flag:{x:0,z:0,owner:null,progress:0}, lastTick:Date.now(), roundEnds:0 };
  rooms.set(id, room); return room;
}
function emitState(room) {
  io.to(room.id).emit("state", { roomId:room.id, mode:room.mode, phase:room.phase, round:room.round,
    scores:room.scores, zone:room.zone, flag:room.flag,
    players:[...room.players.values()].map(publicPlayer),
    world:{wildcards:room.pickups, boxes:room.boxes} });
}
function startMatch(room) {
  room.phase = room.mode === "sf" ? "buy" : "playing";
  room.pickups = Array.from({length:12}, (_,i)=>({id:"w"+i,x:rand(-35,35),z:rand(-35,35),kind:"wildcard"}));
  room.boxes = Array.from({length:14}, (_,i)=>({id:"b"+i,x:rand(-38,38),z:rand(-38,38),opened:false}));
  if (room.mode === "sf") room.roundEnds = Date.now() + 15000;
  else room.zoneAt = Date.now() + 45000;
  io.to(room.id).emit("notice", room.mode === "br" ? "Battle Royale iniciado!" : "Loja aberta — prepare seu equipamento.");
}
function resetRound(room) {
  room.round++;
  for (const p of room.players.values()) {
    p.alive=true; p.hp=p.maxHp; p.armor=p.armorMax; p.x=rand(-10,10); p.y=0; p.vy=0; p.z=rand(-10,10);
    p.shield=null; p.turret=null; p.armorXp=0; p.armorLevel=1; p.armorMax=25;
  }
  room.phase = "buy"; room.roundEnds = Date.now()+12000;
  io.to(room.id).emit("notice", "Nova rodada! Loja aberta.");
}
function eliminate(room, victim, killer) {
  if (!victim.alive) return;
  victim.alive=false; victim.hp=0;
  if (killer && killer.id !== victim.id) {
    killer.kills++; if (room.mode==="sf") killer.money += 600;
  }
  if (victim.wildcards.length) {
    const drop = victim.wildcards.splice(Math.floor(Math.random()*victim.wildcards.length),1)[0];
    room.pickups.push({id:"drop"+Date.now()+Math.random(),x:victim.x,z:victim.z,kind:"wildcard",card:drop});
  }
  io.to(room.id).emit("notice", killer ? killer.name+" eliminou "+victim.name : victim.name+" foi eliminado.");
  checkWin(room);
}
function checkWin(room) {
  const alive=[...room.players.values()].filter(p=>p.alive);
  if (room.mode==="br" && alive.length<=1 && room.phase==="playing") {
    room.phase="finished"; io.to(room.id).emit("matchEnd",{winner:alive[0]?.name||"Ninguém",reason:"Último sobrevivente"}); return;
  }
  if (room.mode==="sf") {
    const red=alive.filter(p=>p.team==="red"), blue=alive.filter(p=>p.team==="blue");
    if (!red.length || !blue.length) {
      const winner=red.length?"red":"blue"; room.scores[winner]++;
      io.to(room.id).emit("roundEnd",{winner,scores:room.scores});
      if (room.scores[winner]>=3) {
        room.phase="finished"; io.to(room.id).emit("matchEnd",{winner:winner==="red"?"Equipe Vermelha":"Equipe Azul",reason:"3 rodadas vencidas"});
      } else if (room.scores.red===2 && room.scores.blue===2) {
        io.to(room.id).emit("notice","LAST STAND DUEL: um representante de cada equipe decide a partida!");
        resetRound(room);
        // A primeira pessoa de cada equipe é o representante do duelo final.
        for (const p of room.players.values()) {
          const teammates=[...room.players.values()].filter(q=>q.team===p.team);
          if (teammates.indexOf(p)>0) p.alive=false;
        }
        room.phase="playing";
      } else setTimeout(()=>{ if(rooms.has(room.id) && room.phase!=="finished") resetRound(room); },3500);
    }
  }
}
function applyDamage(room, target, amount, attacker, part="body") {
  // Fictional hit zones: head 1.8x, torso 1x, limbs 0.75x.
  const mult=part==="head"?1.8:part==="limb"?0.75:1;
  let damage=amount*mult;
  const absorbRate=target.striker==="Ethan"?0.72:0.65; // Ethan passive: reinforced plating.
  const absorbed=Math.min(target.armor,damage*absorbRate);
  target.armor-=absorbed; damage-=absorbed;
  target.armorXp+=absorbed;
  target.armorLevel=Math.min(4,1+Math.floor(target.armorXp/35));
  target.hp-=damage;
  if(target.hp<=0) eliminate(room,target,attacker);
}
function useAbility(room,p) {
  const now=Date.now(); const cooldown=p.striker==="Zero"?14000:p.striker==="Hank"?16000:18000; if(now-p.lastAbility<cooldown) return;
  p.lastAbility=now;
  if(p.striker==="Ethan") {
    p.shield={x:p.x+Math.sin(p.yaw)*2,z:p.z-Math.cos(p.yaw)*2,yaw:p.yaw,hp:400,expires:now+30000};
    io.to(room.id).emit("notice",p.name+" ativou Protection Matrix.");
  } else if(p.striker==="Zero") {
    p.dashUntil=now+900; p.x=clamp(p.x-Math.sin(p.yaw)*12,-ARENA,ARENA);
    p.z=clamp(p.z+Math.cos(p.yaw)*12,-ARENA,ARENA);
    io.to(room.id).emit("notice",p.name+" usou Shadowstrike!");
  } else {
    p.turret={x:p.x,z:p.z,hp:100,nextShot:now};
    io.to(room.id).emit("notice",p.name+" instalou uma torreta.");
  }
}
function update(room,dt) {
  const now=Date.now();
  for(const p of room.players.values()) {
    if(!p.alive) continue;
    const cfg=STRIKERS[p.striker], speed=cfg.speed*(p.input.sprint?1.35:1)*(p.input.crouch?0.55:1); // Zero passive: higher base mobility.
    const fx=-Math.sin(p.yaw), fz=-Math.cos(p.yaw), rx=Math.cos(p.yaw), rz=-Math.sin(p.yaw);
    let dx=(fx*p.input.forward+rx*p.input.right)*speed*dt;
    let dz=(fz*p.input.forward+rz*p.input.right)*speed*dt;
    const wc=p.wildcards.find(w=>w.effect==="speed"); if(wc){dx*=wc.value;dz*=wc.value;}
    p.x=clamp(p.x+dx,-ARENA,ARENA); p.z=clamp(p.z+dz,-ARENA,ARENA);\n    p.vy-=18*dt; p.y=Math.max(0,p.y+p.vy*dt); if(p.y===0)p.vy=0;
    if(p.shield && (p.shield.expires<now||p.shield.hp<=0)) p.shield=null;
    if(p.turret) {
      if(p.turret.hp<=0){p.turret=null;continue;}
      const enemy=[...room.players.values()].filter(q=>q.alive&&q.team!==p.team&&dist2(p.turret,q)<=22).sort((a,b)=>dist2(p.turret,a)-dist2(p.turret,b))[0];
      if(enemy && now-p.turret.nextShot>=1000){p.turret.nextShot=now;applyDamage(room,enemy,15,p,"body");}
    }
  }
  if(room.mode==="br"&&room.phase==="playing"&&now>(room.zoneAt||0)) {
    room.zone.radius=Math.max(8,room.zone.radius-0.015);
    for(const p of room.players.values()) if(p.alive&&dist2(p,room.zone)>room.zone.radius) applyDamage(room,p,5,null);
    if(now>room.zoneAt+120000 && room.flag.progress<100) {
      const carrier=[...room.players.values()].find(p=>p.alive&&dist2(p,room.flag)<5);
      if(carrier){room.flag.owner=carrier.id;room.flag.progress+=dt*10;if(room.flag.progress>=100){room.phase="finished";io.to(room.id).emit("matchEnd",{winner:carrier.name,reason:"Sudden Death Flag capturada"});}}
    }
  }
  if(room.mode==="sf"&&room.phase==="buy"&&now>room.roundEnds){room.phase="playing";io.to(room.id).emit("notice","Rodada iniciada!");}
}
io.on("connection",socket=>{
  socket.on("join",data=>{
    const mode=data.mode==="sf"?"sf":"br";
    let room=[...rooms.values()].find(r=>r.mode===mode&&r.phase!=="finished"&&r.players.size<(mode==="br"?24:10));
    if(!room) room=createRoom("BZ-"+Math.random().toString(36).slice(2,7).toUpperCase(),mode);
    const team=mode==="sf"?( [...room.players.values()].filter(p=>p.team==="red").length <= [...room.players.values()].filter(p=>p.team==="blue").length ? "red":"blue"):"solo";
    const p=makePlayer(socket,data,team); room.players.set(socket.id,p); socket.join(room.id);
    socket.emit("joined",{id:socket.id,roomId:room.id,team,players:[...room.players.values()].map(publicPlayer)});
    if(room.phase==="waiting"&&room.players.size>=2) startMatch(room);
    emitState(room);
  });
  socket.on("input",data=>{const r=roomFor(socket),p=r?.players.get(socket.id);if(!p||!p.alive)return;
    p.input={forward:clamp(Number(data.forward)||0,-1,1),right:clamp(Number(data.right)||0,-1,1),sprint:!!data.sprint,crouch:!!data.crouch};
    p.yaw=Number.isFinite(data.yaw)?data.yaw:p.yaw;p.pitch=clamp(Number(data.pitch)||0,-1.35,1.35);
  });
  socket.on("jump",()=>{const r=roomFor(socket),p=r?.players.get(socket.id);if(p?.alive&&p.y<=0.02)p.vy=7.5;});\n  socket.on("ability",()=>{const r=roomFor(socket),p=r?.players.get(socket.id);if(r&&p?.alive&&r.phase==="playing")useAbility(r,p);});
  socket.on("fire",data=>{
    const r=roomFor(socket),p=r?.players.get(socket.id);if(!r||!p?.alive||r.phase!=="playing")return;
    const w=WEAPONS[p.weapon]||WEAPONS.rifle,now=Date.now();if(now-p.lastShot<w.cooldown)return;p.lastShot=now;
    const dir={x:Math.sin(p.yaw)*Math.cos(p.pitch),y:Math.sin(p.pitch),z:-Math.cos(p.yaw)*Math.cos(p.pitch)};
    let best=null,bestT=w.range;
    for(const q of r.players.values()){
      if(!q.alive||q.id===p.id||(r.mode==="sf"&&q.team===p.team))continue;
      const vx=q.x-p.x, vz=q.z-p.z, t=vx*dir.x+vz*dir.z;
      if(t<0||t>bestT)continue;
      const miss=Math.hypot(vx-dir.x*t,vz-dir.z*t);
      if(miss<0.95){best=q;bestT=t;}
    }
    if(best){
      // Vertical ray position selects a coarse head / torso / leg hit zone.
      const heightAtTarget=1.55-Math.tan(p.pitch)*bestT;
      const part=heightAtTarget>1.48&&heightAtTarget<2.05?"head":heightAtTarget<0.48?"limb":"body";
      const bonus=p.wildcards.find(wc=>wc.effect==="damage")?.value||1;applyDamage(r,best,w.damage*bonus,p,part);
      socket.emit("hitConfirm",{target:best.id,part,damage:Math.round(w.damage*bonus*(part==="head"?1.8:part==="limb"?0.75:1))});
    }
  });
  socket.on("pickup",id=>{
    const r=roomFor(socket),p=r?.players.get(socket.id);if(!r||!p?.alive)return;
    const item=(r.pickups||[]).find(v=>v.id===id);const pickupRange=p.wildcards.some(w=>w.effect==="loot")?4.5:3;if(!item||dist2(p,item)>pickupRange)return;
    if(p.wildcards.length>=3){socket.emit("notice","Você já equipa 3 Wildcards.");return;}
    const card=item.card||WILDCARDS[Math.floor(Math.random()*WILDCARDS.length)];
    p.wildcards.push(card);r.pickups=r.pickups.filter(v=>v.id!==id);emitState(r);
  });
  socket.on("buy",id=>{
    const r=roomFor(socket),p=r?.players.get(socket.id),w=WEAPONS[id];
    if(!r||!p||r.mode!=="sf"||r.phase!=="buy"||!w||p.money<w.price)return;
    p.money-=w.price;p.weapon=id;socket.emit("notice",w.name+" comprado.");
  });
  socket.on("captureFlag",()=>{const r=roomFor(socket),p=r?.players.get(socket.id);if(r&&p?.alive&&r.mode==="br"&&dist2(p,r.flag)<5)r.flag.progress+=1;});
  socket.on("disconnect",()=>{const r=roomFor(socket);if(!r)return;r.players.delete(socket.id);if(!r.players.size)rooms.delete(r.id);else{checkWin(r);emitState(r);}});
});
setInterval(()=>{for(const r of rooms.values()){update(r,TICK/1000);emitState(r);}},TICK);
server.listen(PORT,"0.0.0.0",()=>console.log("Blood Zone server listening on "+PORT));
