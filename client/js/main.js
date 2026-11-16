import * as THREE from "three";
import { Network } from "./network.js";
import { buildArena, createPlayerMesh } from "./game/scene.js";

const $=id=>document.getElementById(id);
const network=new Network();
let scene,camera,renderer,clock,flagMesh,me=null,joined=false,mode="br",yaw=0,pitch=0,velocityY=0,grounded=true;
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
 renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.domElement.style.touchAction="none";$("scene").appendChild(renderer.domElement);
 clock=new THREE.Clock();flagMesh=buildArena(scene);
 window.addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
 renderer.domElement.addEventListener("click",()=>{if(innerWidth>700)renderer.domElement.requestPointerLock();});
 document.addEventListener("mousemove",e=>{if(document.pointerLockElement===renderer.domElement){yaw-=e.movementX*.0022;pitch=THREE.MathUtils.clamp(pitch-e.movementY*.0022,-1.3,1.3);}});
 renderer.domElement.addEventListener("mousedown",e=>{if(e.button===0)network.fire();});
 let touchLook=null;
 renderer.domElement.addEventListener("touchstart",e=>{const t=e.changedTouches[0];if(t.clientX>innerWidth*.38)touchLook={x:t.clientX,y:t.clientY,id:t.identifier};},{passive:true});
 renderer.domElement.addEventListener("touchmove",e=>{if(!touchLook)return;const t=[...e.changedTouches].find(v=>v.identifier===touchLook.id);if(!t)return;yaw-=(t.clientX-touchLook.x)*.006;pitch=THREE.MathUtils.clamp(pitch-(t.clientY-touchLook.y)*.006,-1.3,1.3);touchLook.x=t.clientX;touchLook.y=t.clientY;},{passive:true});
 renderer.domElement.addEventListener("touchend",()=>touchLook=null);
 document.addEventListener("keydown",e=>{keys[e.code]=true;if(e.code==="KeyQ")network.ability();if(e.code==="KeyE")tryPickup();if(e.code==="Space"&&grounded){velocityY=7;grounded=false;network.jump();}});
 document.addEventListener("keyup",e=>keys[e.code]=false);
 $("abilityBtn").onclick=()=>network.ability();
 document.querySelectorAll("[data-buy]").forEach(b=>b.onclick=()=>network.buy(b.dataset.buy));
 $("fireTouch").ontouchstart=e=>{e.preventDefault();network.fire();};
 $("jumpTouch").ontouchstart=e=>{e.preventDefault();if(grounded){velocityY=7;grounded=false;network.jump();}};
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
function makePlayerMesh(p){ return createPlayerMesh(scene,p.team); }
function renderState(state){
 if(flagMesh)flagMesh.visible=!!state.flag?.active;
 $("modeLabel").textContent=state.mode==="br"?"BATTLE ROYALE":"SQUAD FIGHT";
 $("phaseLabel").textContent=state.phase.toUpperCase();
 $("shop").classList.toggle("hidden",state.phase!=="buy");
 $("scores").textContent=state.mode==="sf"?"VERMELHO "+state.scores.red+" — AZUL "+state.scores.blue:"ZONA "+Math.round(state.zone.radius)+"m";
 const present=new Set();
 for(const p of state.players){present.add(p.id);let m=meshes.get(p.id);if(!m){m=makePlayerMesh(p);meshes.set(p.id,m);}
  m.position.set(p.x,p.y||0,p.z);m.rotation.y=p.yaw;m.visible=p.alive;
  if(p.id===me){$("hp").textContent=Math.max(0,Math.round(p.hp));$("hpBar").style.width=Math.max(0,p.hp/p.maxHp*100)+"%";
   $("armor").textContent=Math.round(p.armor);$("armorBar").style.width=Math.max(0,p.armor/(p.armorMax||25)*100)+"%";
   $("armorLevel").textContent=["I","II","III"][Math.min(2,p.armorLevel-1)]||"III";
   $("kills").textContent="ABATES "+p.kills;$("money").textContent="$"+p.money;$("weapon").textContent=(p.weapon||"rifle").toUpperCase();
   $("wildcards").textContent="WILDCARDS: "+p.wildcards.length+"/3";
  }
  if(p.shield){let s=meshes.get("shield"+p.id);if(!s){s=new THREE.Mesh(new THREE.BoxGeometry(4,3,.2),new THREE.MeshStandardMaterial({color:0x36bfff,transparent:true,opacity:.35,emissive:0x124d77}));scene.add(s);meshes.set("shield"+p.id,s);}s.position.set(p.shield.x,1.5,p.shield.z);s.rotation.y=p.shield.yaw;}else if(meshes.has("shield"+p.id)){scene.remove(meshes.get("shield"+p.id));meshes.delete("shield"+p.id);}
  if(p.turret){let t=meshes.get("turret"+p.id);if(!t){t=new THREE.Group();const base=new THREE.Mesh(new THREE.CylinderGeometry(.48,.55,.35,8),new THREE.MeshStandardMaterial({color:0x333b49,metalness:.4}));base.position.y=.2;t.add(base);const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.16,.22,.75,8),new THREE.MeshStandardMaterial({color:0xc5a34b,metalness:.6}));barrel.position.y=.7;t.add(barrel);scene.add(t);meshes.set("turret"+p.id,t);}t.position.set(p.turret.x,0,p.turret.z);}else if(meshes.has("turret"+p.id)){scene.remove(meshes.get("turret"+p.id));meshes.delete("turret"+p.id);}
 }
 for(const [id,m] of meshes){if(!present.has(id)&&!id.startsWith("shield")){scene.remove(m);meshes.delete(id);}}
 const activePickups=new Set();for(const item of state.world?.wildcards||[]){const id="pickup"+item.id;activePickups.add(id);if(!meshes.has(id)){const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.45),new THREE.MeshStandardMaterial({color:0xeac54b,emissive:0x61450c}));gem.position.set(item.x,.7,item.z);scene.add(gem);meshes.set(id,gem);}}
 for(const [id,obj] of meshes){if(id.startsWith("pickup")&&!activePickups.has(id)){scene.remove(obj);meshes.delete(id);}}
}
function tryPickup(){
 if(!me||!network.state)return;const p=network.state.players.find(v=>v.id===me);if(!p)return;
 const item=(network.state.world?.wildcards||[]).find(v=>Math.hypot(v.x-p.x,v.z-p.z)<3);if(item)network.pickup(item.id);
}
function showNotice(msg){const n=$("notice");n.textContent=msg;n.classList.add("show");setTimeout(()=>n.classList.remove("show"),2200);}
