import * as THREE from "three";

// Builds the lightweight arena and geometric player rigs used by the browser client.
export function buildArena(scene) {
  scene.add(new THREE.HemisphereLight(0xc7e5ff,0x38402f,2));
  const sun=new THREE.DirectionalLight(0xffffff,2.2);
  sun.position.set(25,45,20); sun.castShadow=true; scene.add(sun);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(190,190),new THREE.MeshStandardMaterial({color:0x566a57,roughness:1}));
  ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
  const grid=new THREE.GridHelper(180,36,0x435b51,0x65776b); grid.position.y=.02; scene.add(grid);
  // Fixed cover layout matches the server's collision map.
  const obstacles=[
    [-24,-22,7,6,3],[24,-22,7,6,3],[-24,22,7,6,3],[24,22,7,6,3],
    [0,-38,16,4,4],[0,38,16,4,4],[-42,0,4,18,5],[42,0,4,18,5],
    [-12,-44,8,5,2],[12,44,8,5,2],[-48,-38,9,9,5],[48,38,9,9,5]
  ];
  for(const [x,z,w,d,h] of obstacles){
    const box=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color:0x777f7e}));
    box.position.set(x,h/2,z);box.castShadow=true;box.receiveShadow=true;scene.add(box);
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
