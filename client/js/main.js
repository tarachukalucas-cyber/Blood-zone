import * as THREE from "three";
import { Network } from "./network.js";

const $=id=>document.getElementById(id);
const network=new Network();
let scene,camera,renderer,clock,me=null,joined=false,mode="br",yaw=0,pitch=0,velocityY=0,grounded=true;
const meshes=new Map(),keys={},raycaster=new THREE.Raycaster();
const strikerInfo={
 Ethan:"Protection Matrix · Barreira unidirecional com 400 HP por 30 segundos.",
 Zero:"Shadowstrike · Investida rápida. Passiva: mobilidade aumentada.",
 Hank:"Defensive Turret · Torretas com 100 HP e 15 de dano por segundo."
};
$("striker").addEventListener("change",()=>{$("abilityInfo").textContent=strikerInfo[$("striker").value];});
$("playBtn").onclick=()=>{
 mode=$("mode").value; $("menu").classList.add("hidden"); $("game").classList.remove("hidden");
 init3D(); network.join({name:$("playerName").value,striker:$("striker").value,mode});
};
network.on("joined",data=>{me=data.id;joined=true;$("roomLabel").textContent="SALA "+data.roomId;});
network.on("state",renderState);
network.on("notice",message=>showNotice(message));
network.on("roundEnd",data=>{$("scores").textContent="VERMELHO "+data.scores.red+" — AZUL "+data.scores.blue;});
network.on("matchEnd",data=>{$("endTitle").textContent=data.winner+" VENCEU";$("endReason").textContent=data.reason;$("endPanel").classList.remove("hidden");});
network.on("hitConfirm",data=>showNotice("ACERTO — "+data.part+" · "+data.damage+" dano"));

function init3D(){
 scene=new THREE.Scene();scene.background=new THREE.Color(0x8799a5);scene.fog=new THREE.Fog(0x8799a5,65,145);
 camera=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,.1,250);
 renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;$("scene").appendChild(renderer.domElement);
 clock=new THREE.Clock();scene.add(new THREE.HemisphereLight(0xc7e5ff,0x38402f,2));
 const sun=new THREE.DirectionalLight(0xffffff,2.2);sun.position.set(25,45,20);sun.castShadow=true;scene.add(sun);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(190,190),new THREE.MeshStandardMaterial({color:0x566a57,roughness:1}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
 const grid=new THREE.GridHelper(180,36,0x435b51,0x65776b);grid.position.y=.02;scene.add(grid);
 // Simple cover layout: crates, low walls and platforms.
 for(let i=0;i<34;i++){const w=2+Math.random()*4,h=1+Math.random()*3,d=2+Math.random()*4;
  const box=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color:i%3===0?0x6d5360:0x777f7e}));
  box.position.set((Math.random()-.5)*100,h/2,(Math.random()-.5)*100);box.castShadow=true;box.receiveShadow=true;scene.add(box);}
 const flag=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,4),new THREE.MeshStandardMaterial({color:0xe33c57}));flag.position.set(0,2,0);scene.add(flag);
 window.addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
 renderer.domElement.addEventListener("click",()=>{if(innerWidth>700)renderer.domElement.requestPointerLock();});
 document.addEventListener("mousemove",e=>{if(document.pointerLockElement===renderer.domElement){yaw-=e.movementX*.0022;pitch=THREE.MathUtils.clamp(pitch-e.movementY*.0022,-1.3,1.3);}});
 renderer.domElement.addEventListener("mousedown",e=>{if(e.button===0)network.fire();});
 document.addEventListener("keydown",e=>{keys[e.code]=true;if(e.code==="KeyQ")network.ability();if(e.code==="KeyE")tryPickup();if(e.code==="Space"&&grounded){velocityY=7;grounded=false;}});
 document.addEventListener("keyup",e=>keys[e.code]=false);
 $("abilityBtn").onclick=()=>network.ability();
 document.querySelectorAll("[data-buy]").forEach(b=>b.onclick=()=>network.buy(b.dataset.buy));
 $("fireTouch").ontouchstart=e=>{e.preventDefault();network.fire();};
 $("jumpTouch").ontouchstart=e=>{e.preventDefault();if(grounded){velocityY=7;grounded=false;}};
 setupStick();animate();
}
function setupStick(){
 const stick=$("stick");let origin=null;
 stick.addEventListener("touchstart",e=>{origin=e.touches[0];},{passive:true});
 stick.addEventListener("touchmove",e=>{if(!origin)return;const t=e.touches[0];keys.TouchForward=THREE.MathUtils.clamp((origin.clientY-t.clientY)/35,-1,1);keys.TouchRight=THREE.MathUtils.clamp((t.clientX-origin.clientX)/35,-1,1);},{passive:true});
 stick.addEventListener("touchend",()=>{origin=null;keys.TouchForward=0;keys.TouchRight=0;});
}
function animate(){
 requestAnimationFrame(animate);if(!renderer)return;const dt=Math.min(clock.getDelta(),.05);
 if(joined&&me){
  const forward=(keys.KeyW?1:0)-(keys.KeyS?1:0)+(keys.TouchForward||0),right=(keys.KeyD?1:0)-(keys.KeyA?1:0)+(keys.TouchRight||0);
  const fwd=forward/Math.max(1,Math.hypot(forward,right)),side=right/Math.max(1,Math.hypot(forward,right));
  const speed=keys.ShiftLeft?10:6;
  const my=meshes.get(me);if(my){my.position.x+=(-Math.sin(yaw)*fwd+Math.cos(yaw)*side)*speed*dt;my.position.z+=(-Math.cos(yaw)*fwd-Math.sin(yaw)*side)*speed*dt;
   velocityY-=19*dt;my.position.y+=velocityY*dt;if(my.position.y<0){my.position.y=0;velocityY=0;grounded=true;}
   camera.position.set(my.position.x,my.position.y+1.55,my.position.z);camera.rotation.order="YXZ";camera.rotation.set(pitch,yaw,0);}
  network.input({forward:fwd,right:side,sprint:!!keys.ShiftLeft,crouch:!!keys.ControlLeft,yaw,pitch});
 }
 renderer.render(scene,camera);
}
function makePlayerMesh(p){
 const group=new THREE.Group(),color=p.team==="blue"?0x42a9ff:p.team==="red"?0xf04459:0xd4d8df;
 const body=new THREE.Mesh(new THREE.CapsuleGeometry(.42,.85,4,8),new THREE.MeshStandardMaterial({color,roughness:.7}));
 body.position.y=.9;body.castShadow=true;group.add(body);
 const visor=new THREE.Mesh(new THREE.BoxGeometry(.48,.16,.12),new THREE.MeshStandardMaterial({color:0x142331,metalness:.5,roughness:.2}));
 visor.position.set(0,1.35,-.34);group.add(visor);
 scene.add(group);return group;
}
function renderState(state){
 $("modeLabel").textContent=state.mode==="br"?"BATTLE ROYALE":"SQUAD FIGHT";
 $("phaseLabel").textContent=state.phase.toUpperCase();
 $("shop").classList.toggle("hidden",state.phase!=="buy");
 $("scores").textContent=state.mode==="sf"?"VERMELHO "+state.scores.red+" — AZUL "+state.scores.blue:"ZONA "+Math.round(state.zone.radius)+"m";
 const present=new Set();
 for(const p of state.players){present.add(p.id);let m=meshes.get(p.id);if(!m){m=makePlayerMesh(p);meshes.set(p.id,m);}
  m.position.set(p.x,p.y||0,p.z);m.rotation.y=p.yaw;
  if(p.id===me){$("hp").textContent=Math.max(0,Math.round(p.hp));$("hpBar").style.width=Math.max(0,p.hp/p.maxHp*100)+"%";
   $("armor").textContent=Math.round(p.armor);$("armorBar").style.width=Math.max(0,p.armor/50*100)+"%";
   $("armorLevel").textContent=["I","II","III"][Math.min(2,p.armorLevel-1)]||"III";
   $("kills").textContent="ABATES "+p.kills;$("money").textContent="$"+p.money;$("weapon").textContent=(p.weapon||"rifle").toUpperCase();
   $("wildcards").textContent="WILDCARDS: "+p.wildcards.length+"/3";
  }
  if(p.shield&&!meshes.has("shield"+p.id)){const s=new THREE.Mesh(new THREE.BoxGeometry(4,3,.2),new THREE.MeshStandardMaterial({color:0x36bfff,transparent:true,opacity:.35,emissive:0x124d77}));s.position.set(p.shield.x,1.5,p.shield.z);s.rotation.y=p.shield.yaw;scene.add(s);meshes.set("shield"+p.id,s);}
 }
 for(const [id,m] of meshes){if(!present.has(id)&&!id.startsWith("shield")){scene.remove(m);meshes.delete(id);}}
 for(const item of state.world?.wildcards||[]){const id="pickup"+item.id;if(!meshes.has(id)){const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.45),new THREE.MeshStandardMaterial({color:0xeac54b,emissive:0x61450c}));gem.position.set(item.x,.7,item.z);scene.add(gem);meshes.set(id,gem);}}
}
function tryPickup(){
 if(!me||!network.state)return;const p=network.state.players.find(v=>v.id===me);if(!p)return;
 const item=(network.state.world?.wildcards||[]).find(v=>Math.hypot(v.x-p.x,v.z-p.z)<3);if(item)network.pickup(item.id);
}
function showNotice(msg){const n=$("notice");n.textContent=msg;n.classList.add("show");setTimeout(()=>n.classList.remove("show"),2200);}
