// Authoritative gameplay constants and the shared large-arena collision layout.
const ARENA = 220;
const STRIKERS = Object.freeze({
  Ethan: Object.freeze({ hp:100, speed:7, active:"Protection Matrix", passive:"Reinforced plating" }),
  Zero: Object.freeze({ hp:100, speed:8.5, active:"Shadowstrike", passive:"Quick recovery and increased mobility" }),
  Hank: Object.freeze({ hp:110, speed:6.5, active:"Defensive Turret", passive:"Extended turret sensor range" })
});
const WILDCARDS = Object.freeze([
  Object.freeze({id:"scavenger",name:"Scavenger",rarity:"common",effect:"loot",value:1}),
  Object.freeze({id:"runner",name:"Runner",rarity:"rare",effect:"speed",value:1.12}),
  Object.freeze({id:"medic",name:"Field Medic",rarity:"rare",effect:"heal",value:1.1}),
  Object.freeze({id:"fortified",name:"Fortified",rarity:"epic",effect:"armor",value:1.15}),
  Object.freeze({id:"marksman",name:"Marksman",rarity:"legendary",effect:"damage",value:1.12})
]);

// Solid AABBs used by the server. Visual buildings use the same centre/width/depth.
const OBSTACLES = Object.freeze([
  // Downtown
  {x:45,z:-30,w:18,d:18,h:18},{x:72,z:-30,w:20,d:18,h:25},{x:100,z:-28,w:18,d:18,h:15},
  {x:45,z:0,w:18,d:18,h:22},{x:74,z:2,w:22,d:20,h:30},{x:105,z:4,w:18,d:18,h:17},
  {x:48,z:30,w:18,d:18,h:13},{x:78,z:32,w:20,d:18,h:20},
  // Industrial district
  {x:-95,z:-92,w:32,d:22,h:12},{x:-55,z:-95,w:27,d:22,h:15},{x:-92,z:-55,w:24,d:22,h:10},
  {x:-52,z:-55,w:24,d:22,h:14},{x:-118,z:-122,w:18,d:14,h:8},
  // Village
  {x:-110,z:90,w:13,d:12,h:7},{x:-82,z:105,w:14,d:12,h:8},{x:-53,z:91,w:14,d:12,h:7},
  {x:-112,z:125,w:14,d:12,h:8},{x:-79,z:137,w:16,d:13,h:9},{x:-47,z:126,w:13,d:12,h:7},
  // Port / docks
  {x:10,z:-150,w:28,d:18,h:11},{x:52,z:-155,w:25,d:18,h:13},{x:94,z:-150,w:24,d:18,h:9},
  {x:-34,z:-165,w:11,d:3.6,h:3.1},{x:-20,z:-165,w:11,d:3.6,h:3.1},{x:125,z:-178,w:11,d:3.6,h:3.1},{x:139,z:-178,w:11,d:3.6,h:3.1},
  // Radar hill outpost
  {x:120,z:110,w:20,d:18,h:12},{x:155,z:130,w:18,d:16,h:9},
  // Scattered cover and roadside structures
  {x:-165,z:-18,w:20,d:13,h:8},{x:-145,z:35,w:15,d:15,h:9},
  {x:150,z:-65,w:16,d:17,h:10},{x:175,z:-20,w:18,d:14,h:7},
  {x:160,z:65,w:16,d:16,h:11},{x:10,z:90,w:18,d:15,h:8},
  {x:5,z:135,w:22,d:15,h:9},{x:-10,z:-15,w:12,d:10,h:5}
]);
module.exports = { ARENA, STRIKERS, WILDCARDS, OBSTACLES };
