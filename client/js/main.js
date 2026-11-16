import * as THREE from "three";
import { Network } from "./network.js";
import {
  buildArena, createPlayerMesh, animatePlayerMesh,
  createFirstPersonRig, animateFirstPersonRig, animatePlane
} from "./game/scene.js";

const $=id=>document.getElementById(id);
const network=new Network();
let scene,camera,renderer,clock,worldMeshes,firstPersonRig;
let me=null,joined=false,mode="br",yaw=0,pitch=0,localPlayerState=null,latestState=null;
let inputSendTimer=0,recoilQueued=false;
const meshes=new Map(),keys={};
const strikerInfo={
 Ethan:"Protection Matrix · Barreira frontal com 400 HP por 30 segundos.",
 Zero:"Shadowstrike · Investida rápida. Passiva: mobilidade aumentada.",
 Hank:"Defensive Turret · Torretas com 100 HP e 15 de dano por segundo."
};
$("striker").addEventListener("change",()=>{$("abilityInfo").textContent=strikerInfo[$("striker").value];});
$("playBtn").onclick=()=>{
 mode=$("mode").value;
 $("menu").classList.add("hidden");$("game").classList.remove("hidden");
 init3D();network.join({name:$("playerName").value,striker:$("striker").value,mode});
};
$("dropBtn").onclick=()=>network.drop();
network.on("joined",data=>{me=data.id;joined=true;$("roomLabel").textContent="SALA "+data.roomId;});
network.on("state",renderState);
network.on("notice",message=>showNotice(message));
network.on("roundEnd",data=>{$("scores").textContent="VERMELHO "+data.scores.red+" — AZUL "+data.scores.blue;});
network.on("matchEnd",data=>{
 $("endTitle").textContent=data.winner+" VENCEU";$("endReason").textContent=data.reason;
 $("endPanel").classList.remove("hidden");
});
network.on("hitConfirm",data=>showNotice("ACERTO — "+data.part+" · "+data.damage+" dano"));

function shoot(){
 network.fire();
 if(firstPersonRig?.userData)firstPersonRig.userData.recoil=1;
}
function init3D(){
 scene=new THREE.Scene();scene.background=new THREE.Color(0x8da0a5);scene.fog=new THREE.Fog(0x8da0a5,180,430);
 camera=new THREE.PerspectiveCamera(76,innerWidth/innerHeight,.08,900);scene.add(camera); // camera children render the first-person arms and weapon.
 renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.setSize(innerWidth,innerHeight);
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.domElement.style.touchAction="none";$("scene").appendChild(renderer.domElement);
 clock=new THREE.Clock();worldMeshes=buildArena(scene);firstPersonRig=createFirstPersonRig(camera);
 window.addEventListener("resize",()=>{
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);
 });
 renderer.domElement.addEventListener("click",()=>{if(innerWidth>700)renderer.domElement.requestPointerLock();});
 document.addEventListener("mousemove",e=>{
  if(document.pointerLockElement===renderer.domElement){yaw-=e.movementX*.0022;pitch=THREE.MathUtils.clamp(pitch-e.movementY*.0022,-1.3,1.3);}
 });
 renderer.domElement.addEventListener("mousedown",e=>{if(e.button===0)shoot();});
 let touchLook=null;
 renderer.domElement.addEventListener("touchstart",e=>{
  const t=e.changedTouches[0];
  if(t.clientX>innerWidth*.38)touchLook={x:t.clientX,y:t.clientY,id:t.identifier};
 },{passive:true});
 renderer.domElement.addEventListener("touchmove",e=>{
  if(!touchLook)return;
  const t=[...e.changedTouches].find(v=>v.identifier===touchLook.id);if(!t)return;
  yaw-=(t.clientX-touchLook.x)*.006;
  pitch=THREE.MathUtils.clamp(pitch-(t.clientY-touchLook.y)*.006,-1.3,1.3);
  touchLook.x=t.clientX;touchLook.y=t.clientY;
 },{passive:true});
 renderer.domElement.addEventListener("touchend",()=>touchLook=null);
 document.addEventListener("keydown",e=>{
  keys[e.code]=true;
  if(e.code==="KeyQ")network.ability();
  if(e.code==="KeyE")tryPickup();
  if(e.code==="KeyF"&&localPlayerState&&!localPlayerState.deployed)network.drop();
  if(e.code==="Space"&&localPlayerState?.deployed&&!localPlayerState.parachuting&&localPlayerState.y<=.05)network.jump();
 });
 document.addEventListener("keyup",e=>keys[e.code]=false);
 window.addEventListener("blur",()=>{for(const k of Object.keys(keys))keys[k]=false;});
 $("abilityBtn").onclick=()=>network.ability();
 document.querySelectorAll("[data-buy]").forEach(b=>b.onclick=()=>network.buy(b.dataset.buy));
 $("fireTouch").ontouchstart=e=>{e.preventDefault();shoot();};
 $("jumpTouch").ontouchstart=e=>{
  e.preventDefault();
  if(localPlayerState?.deployed&&!localPlayerState.parachuting&&localPlayerState.y<=.05)network.jump();
 };
 setupStick();animate();
}
function setupStick(){
 const stick=$("stick");let origin=null;
 stick.addEventListener("touchstart",e=>{origin=e.touches[0];},{passive:true});
 stick.addEventListener("touchmove",e=>{
  if(!origin)return;const t=e.touches[0];
  keys.TouchForward=THREE.MathUtils.clamp((origin.clientY-t.clientY)/35,-1,1);
  keys.TouchRight=THREE.MathUtils.clamp((t.clientX-origin.clientX)/35,-1,1);
 },{passive:true});
 stick.addEventListener("touchend",()=>{origin=null;keys.TouchForward=0;keys.TouchRight=0;});
}
function animate(){
 requestAnimationFrame(animate);
 if(!renderer)return;
 const dt=Math.min(clock.getDelta(),.05),time=clock.elapsedTime;
 if(joined&&me){
  const forward=(keys.KeyW?1:0)-(keys.KeyS?1:0)+(keys.TouchForward||0);
  const right=(keys.KeyD?1:0)-(keys.KeyA?1:0)+(keys.TouchRight||0);
  const length=Math.max(1,Math.hypot(forward,right));
  const fwd=forward/length,side=right/length;
  const sprint=!!keys.ShiftLeft;
  inputSendTimer+=dt;
  if(inputSendTimer>=.033){
   network.input({forward:fwd,right:side,sprint,crouch:!!keys.ControlLeft,yaw,pitch});
   inputSendTimer=0;
  }
  for(const [id,m] of meshes){
   if(id.startsWith("shield")||id.startsWith("turret")||id.startsWith("pickup"))continue;
   if(m.userData.targetPos){
    m.position.lerp(m.userData.targetPos,1-Math.exp(-dt*13));
    m.rotation.y=THREE.MathUtils.lerp(m.rotation.y,m.userData.targetYaw||0,1-Math.exp(-dt*15));
    animatePlayerMesh(m,m.userData.moveAmount||0,time,m.userData.parachuting);
   }
  }
  const local=meshes.get(me);
  if(local&&localPlayerState){
   if(!localPlayerState.deployed){
    firstPersonRig.visible=false;local.visible=!!localPlayerState.alive;
    const chase=new THREE.Vector3(local.position.x-17,local.position.y+8,local.position.z+24);
    camera.position.lerp(chase,1-Math.exp(-dt*3.8));
    camera.lookAt(local.position.x,local.position.y+1.3,local.position.z);
   }else{
    local.visible=false;
    camera.position.set(local.position.x,local.position.y+1.62,local.position.z);
    camera.rotation.order="YXZ";camera.rotation.set(pitch,yaw,0);
    firstPersonRig.visible=!!localPlayerState.alive;
    animateFirstPersonRig(firstPersonRig,time,Math.hypot(fwd,side)>.05,sprint,localPlayerState.parachuting,dt);
   }
  }
 }
 if(worldMeshes){
  if(latestState?.plane)animatePlane(worldMeshes.plane,latestState.plane,dt,time);
  else worldMeshes.plane.visible=false;
  worldMeshes.flag.visible=!!latestState?.flag?.active;
 }
 renderer.render(scene,camera);
}
function makePlayerMesh(p){return createPlayerMesh(scene,p.team);}
function renderState(state){
 latestState=state;
 $("modeLabel").textContent=state.mode==="br"?"BATTLE ROYALE":"SQUAD FIGHT";
 $("phaseLabel").textContent=state.phase==="insertion"?"INSERÇÃO AÉREA":state.phase.toUpperCase();
 $("shop").classList.toggle("hidden",state.phase!=="buy");
 $("scores").textContent=state.mode==="sf"?"VERMELHO "+state.scores.red+" — AZUL "+state.scores.blue:"ZONA "+Math.round(state.zone.radius)+"m";
 const present=new Set();
 for(const p of state.players){
  present.add(p.id);
  let m=meshes.get(p.id);
  if(!m){m=makePlayerMesh(p);meshes.set(p.id,m);m.position.set(p.x,p.y,p.z);m.rotation.y=p.yaw;}
  const now=performance.now(),last=m.userData.lastSnapshot;
  if(last&&m.userData.lastNetPos){
   const elapsed=Math.max(.02,(now-last)/1000);
   const travelled=m.userData.lastNetPos.distanceTo(new THREE.Vector3(p.x,p.y,p.z));
   m.userData.moveAmount=THREE.MathUtils.clamp(travelled/(elapsed*7),0,1);
  }else m.userData.moveAmount=0;
  m.userData.lastSnapshot=now;
  m.userData.lastNetPos=new THREE.Vector3(p.x,p.y,p.z);
  m.userData.targetPos=new THREE.Vector3(p.x,p.y,p.z);
  m.userData.targetYaw=p.yaw;
  m.userData.parachuting=!!p.parachuting;
  m.visible=p.id===me?!p.deployed&&p.alive:p.alive;
  if(p.id===me){
   localPlayerState=p;
   $("hp").textContent=Math.max(0,Math.round(p.hp));$("hpBar").style.width=Math.max(0,p.hp/p.maxHp*100)+"%";
   $("armor").textContent=Math.round(p.armor);$("armorBar").style.width=Math.max(0,p.armor/(p.armorMax||25)*100)+"%";
   $("armorLevel").textContent=["I","II","III","IV"][Math.min(3,p.armorLevel-1)]||"IV";
   $("kills").textContent="ABATES "+p.kills;$("money").textContent="$"+p.money;
   $("weapon").textContent=(p.weapon||"rifle").toUpperCase();
   $("wildcards").textContent="WILDCARDS: "+p.wildcards.length+"/3";
   $("dropBtn").classList.toggle("hidden",state.mode!=="br"||p.deployed||!p.alive);
  }
  if(p.shield){
   let shield=meshes.get("shield"+p.id);
   if(!shield){shield=new THREE.Mesh(new THREE.BoxGeometry(4,3,.2),new THREE.MeshStandardMaterial({color:0x36bfff,transparent:true,opacity:.35,emissive:0x124d77}));scene.add(shield);meshes.set("shield"+p.id,shield);}
   shield.position.set(p.shield.x,1.5,p.shield.z);shield.rotation.y=p.shield.yaw;
  }else if(meshes.has("shield"+p.id)){scene.remove(meshes.get("shield"+p.id));meshes.delete("shield"+p.id);}
  if(p.turret){
   let turret=meshes.get("turret"+p.id);
   if(!turret){
    turret=new THREE.Group();
    const base=new THREE.Mesh(new THREE.CylinderGeometry(.48,.55,.35,8),new THREE.MeshStandardMaterial({color:0x333b49,metalness:.4}));
    base.position.y=.2;turret.add(base);
    const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.16,.22,.75,8),new THREE.MeshStandardMaterial({color:0xc5a34b,metalness:.6}));
    barrel.position.y=.7;turret.add(barrel);scene.add(turret);meshes.set("turret"+p.id,turret);
   }
   turret.position.set(p.turret.x,0,p.turret.z);
  }else if(meshes.has("turret"+p.id)){scene.remove(meshes.get("turret"+p.id));meshes.delete("turret"+p.id);}
 }
 for(const [id,m] of meshes){
  if(id.startsWith("shield")||id.startsWith("turret")||id.startsWith("pickup"))continue;
  if(!present.has(id)){scene.remove(m);meshes.delete(id);}
 }
 const activePickups=new Set();
 for(const item of state.world?.wildcards||[]){
  const id="pickup"+item.id;activePickups.add(id);
  if(!meshes.has(id)){
   const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.45),new THREE.MeshStandardMaterial({color:0xeac54b,emissive:0x61450c}));
   gem.position.set(item.x,.7,item.z);scene.add(gem);meshes.set(id,gem);
  }
 }
 for(const [id,obj] of meshes){if(id.startsWith("pickup")&&!activePickups.has(id)){scene.remove(obj);meshes.delete(id);}}
}
function tryPickup(){
 if(!me||!network.state)return;
 const p=network.state.players.find(v=>v.id===me);if(!p)return;
 const item=(network.state.world?.wildcards||[]).find(v=>Math.hypot(v.x-p.x,v.z-p.z)<3);
 if(item)network.pickup(item.id);
}
function showNotice(msg){const n=$("notice");n.textContent=msg;n.classList.add("show");setTimeout(()=>n.classList.remove("show"),2500);}
