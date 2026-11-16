import * as THREE from "three";

const mats = {
  concrete:new THREE.MeshStandardMaterial({color:0x69747a,roughness:.95}),
  dark:new THREE.MeshStandardMaterial({color:0x202a35,roughness:.7}),
  metal:new THREE.MeshStandardMaterial({color:0x77838c,metalness:.65,roughness:.38}),
  glass:new THREE.MeshStandardMaterial({color:0x263f55,metalness:.5,roughness:.2}),
  roof:new THREE.MeshStandardMaterial({color:0x3c4851,roughness:.9}),
  foliage:new THREE.MeshStandardMaterial({color:0x344d39,roughness:1}),
  sand:new THREE.MeshStandardMaterial({color:0x887e61,roughness:1}),
  red:new THREE.MeshStandardMaterial({color:0xb63342,roughness:.8}),
  blue:new THREE.MeshStandardMaterial({color:0x35647c,roughness:.8})
};

function box(parent,w,h,d,material,x,y,z) {
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
  mesh.position.set(x,y,z); mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); return mesh;
}
function cylinder(parent,r1,r2,h,material,x,y,z,segments=8) {
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,segments),material);
  mesh.position.set(x,y,z); mesh.castShadow=true; parent.add(mesh); return mesh;
}
function addBuilding(scene,o,index) {
  const group=new THREE.Group(); group.position.set(o.x,0,o.z); scene.add(group);
  const palette=[0x69747a,0x81796c,0x596974,0x77746e,0x565f64];
  const wallMat=new THREE.MeshStandardMaterial({color:palette[index%palette.length],roughness:.92});
  box(group,o.w,o.h,o.d,wallMat,0,o.h/2,0);
  box(group,o.w+.7,.5,o.d+.7,mats.roof,0,o.h+.25,0);
  // Repeating facade windows, ledges, service doors and rooftop machinery give buildings scale.
  const floors=Math.max(1,Math.floor(o.h/4));
  const windowMat=new THREE.MeshStandardMaterial({color:0x273f52,metalness:.35,roughness:.2,emissive:0x0b1a25});
  for(let floor=0;floor<floors;floor++){
    const yy=2.1+floor*3.4;
    for(let k=-1;k<=1;k++){
      const xx=k*(o.w*.27);
      if(o.w>10 && yy<o.h-.8){
        box(group,Math.min(2.6,o.w*.18),1.35,.08,windowMat,xx,yy,-o.d/2-.045);
        box(group,.09,1.45,.12,mats.metal,xx,yy,-o.d/2-.1);
      }
    }
  }
  box(group,Math.min(2.4,o.w*.22),2.3,.14,mats.dark,0,1.15,-o.d/2-.08);
  if(o.h>12){
    box(group,o.w*.24,.25,o.d*.22,mats.metal,0,o.h+.62,0);
    cylinder(group,.35,.42,1,mats.dark,o.w*.18,o.h+1.1,o.d*.15);
  } else {
    for(let x=-1;x<=1;x+=2) box(group,.35,.45,o.d*.45,mats.metal,x*(o.w*.32),o.h+.5,0);
  }
  return group;
}
function addTree(scene,x,z,scale=1) {
  const tree=new THREE.Group(); tree.position.set(x,0,z); tree.scale.setScalar(scale);
  cylinder(tree,.22,.34,2.2,new THREE.MeshStandardMaterial({color:0x574634}),0,1.1,0,7);
  const leaves=new THREE.Mesh(new THREE.ConeGeometry(1.55,3.5,7),mats.foliage);
  leaves.position.y=3; leaves.castShadow=true; tree.add(leaves);
  const crown=new THREE.Mesh(new THREE.ConeGeometry(1.15,2.6,7),new THREE.MeshStandardMaterial({color:0x496347}));
  crown.position.y=4; crown.castShadow=true; tree.add(crown); scene.add(tree);
}
function addContainer(scene,x,z,color) {
  const group=new THREE.Group();group.position.set(x,0,z);
  const paint=new THREE.MeshStandardMaterial({color,metalness:.25,roughness:.78});
  box(group,11,3.1,3.6,paint,0,1.55,0);
  const ribMat=new THREE.MeshStandardMaterial({color:0x303c43,metalness:.35,roughness:.7});
  for(let n=-5;n<=5;n++)box(group,.075,2.9,3.68,ribMat,n,1.55,0);
  box(group,10.6,.13,.09,mats.metal,0,2.95,1.85);
  for(let n=-4;n<=4;n+=2)box(group,.1,2.7,.1,mats.metal,n,1.55,1.86);
  box(group,10.4,.1,.1,mats.dark,0,.18,1.86);
  scene.add(group);
}
function addStreetLamp(scene,x,z) {
  const g=new THREE.Group(); g.position.set(x,0,z);
  cylinder(g,.08,.12,6,mats.dark,0,3,0);
  box(g,1.4,.12,.12,mats.dark,.6,5.8,0);
  const bulb=new THREE.Mesh(new THREE.BoxGeometry(.45,.16,.35),new THREE.MeshStandardMaterial({color:0xe5d5a1,emissive:0x66502a}));
  bulb.position.set(1.12,5.68,0);g.add(bulb);scene.add(g);
}
function addDistrictLabel(scene,label,x,z) {
  const canvas=document.createElement("canvas");canvas.width=512;canvas.height=112;
  const ctx=canvas.getContext("2d");
  ctx.fillStyle="rgba(8,14,20,.76)";ctx.fillRect(0,0,512,112);
  ctx.strokeStyle="#e14a5c";ctx.lineWidth=6;ctx.strokeRect(4,4,504,104);
  ctx.fillStyle="#f4f6f5";ctx.font="bold 42px Arial";ctx.textAlign="center";ctx.textBaseline="middle";
  ctx.fillText(label.toUpperCase(),256,58);
  const texture=new THREE.CanvasTexture(canvas);
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false}));
  sprite.position.set(x,24,z);sprite.scale.set(33,7.2,1);scene.add(sprite);
}
function addMountain(scene,x,z,scale,shade) {
  const mountain=new THREE.Mesh(new THREE.ConeGeometry(18*scale,30*scale,6),new THREE.MeshStandardMaterial({color:shade,roughness:1}));
  mountain.position.set(x,14*scale-1,z);mountain.castShadow=true;mountain.receiveShadow=true;scene.add(mountain);
}
function makePlane() {
  const plane=new THREE.Group();
  const fuselage=new THREE.Mesh(new THREE.CylinderGeometry(.78,1.05,19,12),new THREE.MeshStandardMaterial({color:0x56636d,metalness:.55,roughness:.5}));
  fuselage.rotation.z=Math.PI/2; plane.add(fuselage);
  const nose=new THREE.Mesh(new THREE.ConeGeometry(.8,3,12),new THREE.MeshStandardMaterial({color:0x9aa6ad,metalness:.5}));
  nose.rotation.z=-Math.PI/2;nose.position.x=10.6;plane.add(nose);
  box(plane,4,.28,34,mats.metal,0,.25,0);
  box(plane,7,.22,9,mats.dark,-7,.2,0);
  box(plane,.22,4.5,3,mats.metal,-8,2,0);
  // cockpit glazing
  const cockpit=new THREE.Mesh(new THREE.BoxGeometry(2.7,1.1,1.7),mats.glass);
  cockpit.position.set(7.3,.65,0);plane.add(cockpit);
  // Wing struts and twin engine nacelles.
  for(const side of [-1,1]){
    const engine=cylinder(plane,.45,.55,3,mats.dark,1.2,.0,side*8);
    engine.rotation.z=Math.PI/2;
    cylinder(plane,.48,.48,.35,mats.metal,2.8,0,side*8);
    const prop=new THREE.Group();prop.position.set(3,0,side*8);
    for(let i=0;i<3;i++){const bladePivot=new THREE.Group();bladePivot.rotation.x=i*Math.PI*2/3;box(bladePivot,.24,2.8,.34,mats.dark,0,1.35,0);prop.add(bladePivot);}
    plane.add(prop);(plane.userData.propellers ||= []).push(prop);
    cylinder(plane,.28,.28,.25,mats.metal,-7,.2,side*2.4);
  }
  // Tail and landing gear.
  box(plane,2.8,.18,10,mats.metal,-7,.6,0);
  for(const side of [-1,1]){
    cylinder(plane,.13,.13,1.7,mats.dark,-2,-.9,side*2.2);
    const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.22,12),mats.dark);
    wheel.rotation.x=Math.PI/2;wheel.position.set(-2,-1.65,side*2.2);plane.add(wheel);
  }
  plane.scale.setScalar(1.15); plane.visible=false;
  return plane;
}
function addParachute(group) {
  const rig=new THREE.Group();
  const canopy=new THREE.Mesh(new THREE.SphereGeometry(1.9,14,8,0,Math.PI*2,0,Math.PI/2),
    new THREE.MeshStandardMaterial({color:0xb83b4b,side:THREE.DoubleSide,roughness:.75}));
  canopy.scale.y=.62;canopy.position.y=4.3;rig.add(canopy);
  for(let i=0;i<7;i++){
    const angle=(i/6)*Math.PI;
    const x=Math.cos(angle)*1.5,z=Math.sin(angle)*.5;
    const points=[new THREE.Vector3(x,4.2,z),new THREE.Vector3(x*.45,2.5,z*.45),new THREE.Vector3(0,1.8,0)];
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0xd6dbe0}));
    rig.add(line);
  }
  rig.visible=false;group.add(rig);return rig;
}

// Builds the large map: five distinct districts, roads, landmarks and a transport aircraft.
export function buildArena(scene) {
  scene.add(new THREE.HemisphereLight(0xc7e5ff,0x3b493b,2.15));
  const sun=new THREE.DirectionalLight(0xfff1d8,2.6);
  sun.position.set(-65,110,45);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(470,470),new THREE.MeshStandardMaterial({color:0x596b51,roughness:1}));
  ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
  const water=new THREE.Mesh(new THREE.PlaneGeometry(900,900),new THREE.MeshStandardMaterial({color:0x294b5a,roughness:.35,metalness:.1}));
  water.rotation.x=-Math.PI/2;water.position.y=-1.1;scene.add(water);
  const roadMat=new THREE.MeshStandardMaterial({color:0x343d41,roughness:1});
  const roadLine=new THREE.MeshStandardMaterial({color:0xc6b989,roughness:1});
  const roadA=new THREE.Mesh(new THREE.PlaneGeometry(440,15),roadMat);roadA.rotation.x=-Math.PI/2;roadA.position.y=.025;scene.add(roadA);
  const roadB=new THREE.Mesh(new THREE.PlaneGeometry(15,440),roadMat);roadB.rotation.x=-Math.PI/2;roadB.position.y=.026;scene.add(roadB);
  for(let n=-200;n<=200;n+=18){
    const dash=new THREE.Mesh(new THREE.PlaneGeometry(7,.22),roadLine);dash.rotation.x=-Math.PI/2;dash.position.set(n,.04,0);scene.add(dash);
    const dash2=new THREE.Mesh(new THREE.PlaneGeometry(.22,7),roadLine);dash2.rotation.x=-Math.PI/2;dash2.position.set(0,.041,n);scene.add(dash2);
  }
  const obstacles=[
    {x:45,z:-30,w:18,d:18,h:18},{x:72,z:-30,w:20,d:18,h:25},{x:100,z:-28,w:18,d:18,h:15},
    {x:45,z:0,w:18,d:18,h:22},{x:74,z:2,w:22,d:20,h:30},{x:105,z:4,w:18,d:18,h:17},
    {x:48,z:30,w:18,d:18,h:13},{x:78,z:32,w:20,d:18,h:20},
    {x:-95,z:-92,w:32,d:22,h:12},{x:-55,z:-95,w:27,d:22,h:15},{x:-92,z:-55,w:24,d:22,h:10},
    {x:-52,z:-55,w:24,d:22,h:14},{x:-118,z:-122,w:18,d:14,h:8},
    {x:-110,z:90,w:13,d:12,h:7},{x:-82,z:105,w:14,d:12,h:8},{x:-53,z:91,w:14,d:12,h:7},
    {x:-112,z:125,w:14,d:12,h:8},{x:-79,z:137,w:16,d:13,h:9},{x:-47,z:126,w:13,d:12,h:7},
    {x:10,z:-150,w:28,d:18,h:11},{x:52,z:-155,w:25,d:18,h:13},{x:94,z:-150,w:24,d:18,h:9},
    {x:120,z:110,w:20,d:18,h:12},{x:155,z:130,w:18,d:16,h:9},
    {x:-165,z:-18,w:20,d:13,h:8},{x:-145,z:35,w:15,d:15,h:9},
    {x:150,z:-65,w:16,d:17,h:10},{x:175,z:-20,w:18,d:14,h:7},
    {x:160,z:65,w:16,d:16,h:11},{x:10,z:90,w:18,d:15,h:8},
    {x:5,z:135,w:22,d:15,h:9},{x:-10,z:-15,w:12,d:10,h:5}
  ];
  obstacles.forEach((o,i)=>addBuilding(scene,o,i));
  addContainer(scene,-34,-165,0x657b83);addContainer(scene,-20,-165,0x9a6049);
  addContainer(scene,125,-178,0x61745f);addContainer(scene,139,-178,0x667d91);
  addDistrictLabel(scene,"Industrial Yard",-88,-32);
  addDistrictLabel(scene,"Downtown",74,-72);
  addDistrictLabel(scene,"Old Village",-82,68);
  addDistrictLabel(scene,"Port Sector",48,-183);
  addDistrictLabel(scene,"Radar Ridge",141,70);
  // Low-poly mountain silhouettes frame the playable island.
  for(const [x,z,scale] of [[-225,-195,1.4],[-160,-228,1.0],[-35,-230,1.3],[95,-228,1.1],[218,-188,1.5],[-225,30,1.1],[-222,190,1.4],[-115,225,1.1],[20,230,1.4],[150,220,1.1],[225,140,1.3],[230,-35,1.1]])addMountain(scene,x,z,scale,0x59645b);
  // Industrial tanks, port cranes, radar dish and water towers make each district recognizable.
  for(const x of [-122,-92,-62]){
    cylinder(scene,5.8,5.8,9,mats.metal,x,4.5,-137,12);
    cylinder(scene,6.2,6.2,.55,mats.roof,x,9.1,-137,12);
  }
  const crane=new THREE.Group();crane.position.set(63,0,-177);
  box(crane,1,28,1,mats.red,0,14,0);box(crane,30,1,1,mats.red,0,27,0);
  box(crane,1,1,25,mats.red,0,27,0);cylinder(crane,.12,.12,18,mats.dark,12,18,0);scene.add(crane);
  const radar=new THREE.Group();radar.position.set(145,0,93);
  cylinder(radar,.45,.65,15,mats.metal,0,7.5,0);
  const dish=new THREE.Mesh(new THREE.SphereGeometry(4,12,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0xb9c3c7,metalness:.55,side:THREE.DoubleSide}));
  dish.position.set(0,15,0);dish.rotation.x=Math.PI;radar.add(dish);scene.add(radar);
  // Scenic trees and rocks are placed outside main roads and building entrances.
  const treeCount=innerWidth<=700?58:96;
  for(let i=0;i<treeCount;i++){
    const x=(Math.sin(i*91.7)*.5+.5)*410-205,z=(Math.cos(i*37.1)*.5+.5)*410-205;
    if(Math.abs(x)<15||Math.abs(z)<15)continue;
    if(obstacles.some(o=>Math.abs(x-o.x)<o.w/2+5&&Math.abs(z-o.z)<o.d/2+5))continue;
    addTree(scene,x,z,.75+(i%4)*.13);
  }
  for(let i=0;i<16;i++) addStreetLamp(scene,-190+i*25, i%2?10:-10);
  const flag=new THREE.Group();
  cylinder(flag,.07,.07,4,mats.dark,0,2,0);
  const cloth=new THREE.Mesh(new THREE.PlaneGeometry(1.3,.75),new THREE.MeshStandardMaterial({color:0xe33c57,side:THREE.DoubleSide}));
  cloth.position.set(.65,3.45,0);flag.add(cloth);flag.visible=false;scene.add(flag);
  const plane=makePlane();scene.add(plane);
  return {flag,plane};
}

function makeLimb(material,radius,length) {
  const mesh=new THREE.Mesh(new THREE.CapsuleGeometry(radius,length,4,8),material);
  mesh.castShadow=true;mesh.receiveShadow=true;return mesh;
}
export function createPlayerMesh(scene,team) {
  const group=new THREE.Group();
  const uniform=new THREE.MeshStandardMaterial({color:team==="blue"?0x344b60:team==="red"?0x574044:0x505b57,roughness:.95});
  const armor=new THREE.MeshStandardMaterial({color:team==="blue"?0x57758a:team==="red"?0x873f49:0x6b746d,metalness:.22,roughness:.75});
  const dark=new THREE.MeshStandardMaterial({color:0x1c252c,roughness:.9});
  const skin=new THREE.MeshStandardMaterial({color:0x9a775d,roughness:.8});
  const helmet=new THREE.MeshStandardMaterial({color:team==="blue"?0x536e80:team==="red"?0x74424a:0x657064,metalness:.2,roughness:.7});
  const vest=new THREE.Group();group.add(vest);
  const torso=makeLimb(uniform,.35,.65);torso.position.y=1.23;group.add(torso);
  box(group,.78,.68,.43,armor,0,1.34,-.015);
  box(group,.62,.24,.45,dark,0,1.02,-.015);
  for(let x of [-.22,0,.22])box(group,.16,.35,.035,team==="blue"?mats.blue:team==="red"?mats.red:mats.metal,x,1.35,-.25);
  box(group,.11,.88,.12,dark,0,1.35,.29);
  box(group,.48,.55,.27,uniform,0,1.34,.38); // backpack
  box(group,.48,.12,.3,armor,0,1.08,.38);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.25,12,10),skin);head.position.y=2.02;head.castShadow=true;group.add(head);
  const helmetShell=new THREE.Mesh(new THREE.SphereGeometry(.3,12,8,0,Math.PI*2,0,Math.PI*.65),helmet);
  helmetShell.position.set(0,2.13,0);helmetShell.castShadow=true;group.add(helmetShell);
  box(group,.42,.13,.06,dark,0,2.02,-.235); // goggles
  box(group,.3,.2,.24,dark,0,1.83,-.05); // face covering
  box(group,.47,.13,.42,armor,0,1.78,0);
  const armPivots=[],legPivots=[];
  for(const side of [-1,1]){
    const arm=new THREE.Group();arm.position.set(side*.49,1.58,0);group.add(arm);armPivots.push(arm);
    const shoulder=new THREE.Mesh(new THREE.SphereGeometry(.22,8,7),armor);shoulder.position.y=-.03;arm.add(shoulder);
    const upper=makeLimb(uniform,.15,.38);upper.position.y=-.31;arm.add(upper);
    const elbow=new THREE.Mesh(new THREE.SphereGeometry(.14,8,6),dark);elbow.position.y=-.58;arm.add(elbow);
    const lower=makeLimb(armor,.13,.38);lower.position.set(0,-.81,.015);lower.rotation.x=-.12;arm.add(lower);
    const glove=new THREE.Mesh(new THREE.BoxGeometry(.23,.2,.22),dark);glove.position.set(0,-1.08,-.01);arm.add(glove);
    for(let f=0;f<3;f++)box(arm,.045,.12,.055,dark,(f-1)*.065,-1.21,-.085);
    const leg=new THREE.Group();leg.position.set(side*.21,.83,0);group.add(leg);legPivots.push(leg);
    const thigh=makeLimb(uniform,.18,.38);thigh.position.y=-.27;leg.add(thigh);
    const knee=new THREE.Mesh(new THREE.BoxGeometry(.3,.21,.28),armor);knee.position.set(0,-.54,-.015);leg.add(knee);
    const shin=makeLimb(uniform,.145,.37);shin.position.set(0,-.79,0);leg.add(shin);
    box(leg,.34,.19,.48,dark,0,-1.08,-.09);
    box(leg,.34,.06,.5,armor,0,-1.17,-.09);
  }
  const parachute=addParachute(group);
  group.userData={armPivots,legPivots,parachute,torso,head};
  scene.add(group);return group;
}
export function animatePlayerMesh(group,moveAmount,time,parachuting=false,airborne=false) {
  const rig=group.userData;if(!rig)return;
  const gait=airborne?0:Math.sin(time*10)*Math.min(1,moveAmount)*.6;
  rig.legPivots[0].rotation.x=airborne?(parachuting?-.18:.28):gait;
  rig.legPivots[1].rotation.x=airborne?(parachuting?-.18:.28):-gait;
  rig.armPivots[0].rotation.x=airborne?(parachuting?-.22:-.34):-gait*.72;
  rig.armPivots[1].rotation.x=airborne?(parachuting?-.22:-.34):gait*.72;
  group.position.y += 0; // root height is supplied by the authoritative server snapshot
  rig.parachute.visible=!!parachuting;
  rig.parachute.rotation.z=parachuting?Math.sin(time*1.7)*.045:0;
  rig.torso.position.y=1.23+Math.sin(time*2.4)*.012;
  rig.head.rotation.y=Math.sin(time*1.1)*.025;
}
function makeHand(parent,material,x,y,z) {
  const hand=new THREE.Group();hand.position.set(x,y,z);parent.add(hand);
  box(hand,.19,.16,.2,material,0,0,0);
  for(let i=0;i<4;i++)box(hand,.045,.13,.055,material,-.07+i*.047,-.11,-.06);
  return hand;
}
function makeWeaponModel(type="rifle") {
  // Fictional energy projector: abstract geometry only, with no real-world mechanism.
  const model=new THREE.Group();
  const chassis=new THREE.MeshStandardMaterial({color:0x263a45,metalness:.48,roughness:.38});
  const trim=new THREE.MeshStandardMaterial({color:0x617984,metalness:.62,roughness:.3});
  const glow=new THREE.MeshStandardMaterial({color:0x38d8ed,emissive:0x087c9d,emissiveIntensity:1.8,metalness:.25,roughness:.22});
  const warm=new THREE.MeshStandardMaterial({color:0xff9d54,emissive:0x8b3212,emissiveIntensity:1.3});
  const length=type==="marksman" ? 1.18 : type==="shotgun" ? .82 : type==="smg" ? .58 : .9;
  box(model,.28,.25,length,chassis,0,0,0);
  box(model,.34,.07,length*.68,trim,0,.16,-.01);
  box(model,.08,.31,length*.48,chassis,-.2,0,-.02);
  box(model,.08,.31,length*.48,chassis,.2,0,-.02);
  const core=new THREE.Mesh(new THREE.OctahedronGeometry(type==="marksman" ? .17 : .14,1),glow);
  core.position.set(0,.06,-.08);model.add(core);
  const ringCount=type==="marksman"?3:1;
  for(let i=0;i<ringCount;i++){
    const ring=new THREE.Mesh(new THREE.TorusGeometry(type==="marksman" ? .16 : .13,.035,7,14),trim);
    ring.position.set(0,.02,-length*.31-i*.17);model.add(ring);
  }
  const emitters=type==="shotgun"?[-.13,0,.13]:type==="smg"?[-.1,.1]:[0];
  for(const x of emitters){
    const orb=new THREE.Mesh(new THREE.SphereGeometry(type==="marksman" ? .1 : .085,10,8),glow);
    orb.position.set(x,.025,-length*.52);model.add(orb);
    const collar=new THREE.Mesh(new THREE.TorusGeometry(.105,.025,6,12),warm);
    collar.position.set(x,.025,-length*.49);model.add(collar);
  }
  // Small side fins and an illuminated status strip make the silhouette distinct.
  for(const side of [-1,1]){
    const fin=box(model,.055,.2,.3,side===1?warm:trim,side*.19,.02,length*.12);
    fin.rotation.y=side*.15;
  }
  const flash=new THREE.Mesh(new THREE.SphereGeometry(.18,8,6),new THREE.MeshBasicMaterial({color:0xb9faff}));
  flash.position.set(0,.025,-length*.62);flash.visible=false;model.add(flash);
  model.userData.flash=flash;return model;
}
export function setFirstPersonWeapon(rig,type) {
  const u=rig?.userData;if(!u||u.weaponType===type)return;
  if(u.weaponModel)u.weapon.remove(u.weaponModel);
  u.weaponModel=makeWeaponModel(type);u.weaponType=type;u.weapon.add(u.weaponModel);u.flash=u.weaponModel.userData.flash;
}
export function createFirstPersonRig(camera) {
  const rig=new THREE.Group();camera.add(rig);
  const sleeve=new THREE.MeshStandardMaterial({color:0x434e4d,roughness:.95});
  const glove=new THREE.MeshStandardMaterial({color:0x20282b,roughness:.85});
  const pad=new THREE.MeshStandardMaterial({color:0x64736b,roughness:.8});
  const leftArm=new THREE.Group();leftArm.position.set(-.5,-.34,-.28);rig.add(leftArm);
  const leftSleeve=makeLimb(sleeve,.16,.55);leftSleeve.position.set(0,-.1,.1);leftSleeve.rotation.x=-.8;leftArm.add(leftSleeve);
  const leftFore=makeLimb(pad,.13,.42);leftFore.position.set(.12,-.23,-.25);leftFore.rotation.x=-1.1;leftArm.add(leftFore);
  const leftHand=makeHand(leftArm,glove,.19,-.42,-.47);
  const rightArm=new THREE.Group();rightArm.position.set(.5,-.32,-.22);rig.add(rightArm);
  const rightSleeve=makeLimb(sleeve,.16,.55);rightSleeve.position.set(0,-.1,.12);rightSleeve.rotation.x=-.72;rightArm.add(rightSleeve);
  const rightFore=makeLimb(pad,.13,.42);rightFore.position.set(-.07,-.24,-.26);rightFore.rotation.x=-1.03;rightArm.add(rightFore);
  const rightHand=makeHand(rightArm,glove,-.08,-.43,-.49);
  const weapon=new THREE.Group();weapon.position.set(.24,-.25,-.78);rig.add(weapon);
  const weaponModel=makeWeaponModel("rifle");weapon.add(weaponModel);
  rig.userData={weapon,weaponModel,weaponType:"rifle",leftArm,rightArm,flash:weaponModel.userData.flash,recoil:0,leftHand,rightHand};
  rig.position.set(0,0,0);return rig;
}
export function animateFirstPersonRig(rig,time,moving,sprinting,airborne,dt) {
  const u=rig.userData;if(!u)return;
  const bob=moving?Math.sin(time*(sprinting?14:10))*(sprinting ? 0.027 : 0.015):Math.sin(time*1.5)*.004;
  rig.position.set(moving?Math.cos(time*5)*.008:0,bob,0);
  rig.rotation.z=(moving?Math.sin(time*5)*.012:0)+(sprinting?-.025:0);
  u.recoil=Math.max(0,u.recoil-dt*5.5);
  u.weapon.position.z=-.78+u.recoil*.13;
  u.weapon.rotation.x=-u.recoil*.16;
  u.weapon.rotation.y=Math.sin(time*8)*(moving ? .012 : .003);
  u.flash.visible=u.recoil>.72;
  u.leftArm.rotation.x=airborne?-.07:0;
  u.rightArm.rotation.x=airborne?-.06:0;
}
export function animatePlane(plane,state,dt,time) {
  if(!plane||!state)return;
  plane.visible=!!state.active;
  if(!state.active)return;
  plane.position.lerp(new THREE.Vector3(state.x,state.y,state.z),Math.min(1,dt*8));
  for(const prop of plane.userData.propellers||[])prop.rotation.x+=dt*24;
  plane.rotation.z=Math.sin(time*.8)*.018;
}
