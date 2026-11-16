import * as THREE from "three";

// Builds the lightweight arena and geometric player rigs used by the browser client.
export function buildArena(scene) {
  scene.add(new THREE.HemisphereLight(0xc7e5ff,0x38402f,2));
  const sun=new THREE.DirectionalLight(0xffffff,2.2);
  sun.position.set(25,45,20); sun.castShadow=true; scene.add(sun);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(190,190),new THREE.MeshStandardMaterial({color:0x566a57,roughness:1}));
  ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
  const grid=new THREE.GridHelper(180,36,0x435b51,0x65776b); grid.position.y=.02; scene.add(grid);
  // Cover props are decorative and intentionally use simple collision-free geometry in this prototype.
  for(let i=0;i<34;i++){
    const w=2+Math.random()*4,h=1+Math.random()*3,d=2+Math.random()*4;
    const box=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color:i%3===0?0x6d5360:0x777f7e}));
    box.position.set((Math.random()-.5)*100,h/2,(Math.random()-.5)*100);
    box.castShadow=true; box.receiveShadow=true; scene.add(box);
  }
  const flag=new THREE.Group();
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,4),new THREE.MeshStandardMaterial({color:0x303947}));
  pole.position.y=2; flag.add(pole);
  const cloth=new THREE.Mesh(new THREE.PlaneGeometry(1.3,.75),new THREE.MeshStandardMaterial({color:0xe33c57,side:THREE.DoubleSide}));
  cloth.position.set(.65,3.45,0); flag.add(cloth); scene.add(flag);
}
export function createPlayerMesh(scene,team) {
  const group=new THREE.Group();
  const color=team==="blue"?0x42a9ff:team==="red"?0xf04459:0xd4d8df;
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.42,.85,4,8),new THREE.MeshStandardMaterial({color,roughness:.7}));
  body.position.y=.9; body.castShadow=true; group.add(body);
  const visor=new THREE.Mesh(new THREE.BoxGeometry(.48,.16,.12),new THREE.MeshStandardMaterial({color:0x142331,metalness:.5,roughness:.2}));
  visor.position.set(0,1.35,-.34); group.add(visor);
  scene.add(group); return group;
}
