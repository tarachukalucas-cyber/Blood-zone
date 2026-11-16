// Shared authoritative gameplay tuning. Never trust client-supplied copies of these values.
const ARENA = 90;
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
const OBSTACLES = Object.freeze([
  {x:-24,z:-22,w:7,d:6,h:3},{x:24,z:-22,w:7,d:6,h:3},
  {x:-24,z:22,w:7,d:6,h:3},{x:24,z:22,w:7,d:6,h:3},
  {x:0,z:-38,w:16,d:4,h:4},{x:0,z:38,w:16,d:4,h:4},
  {x:-42,z:0,w:4,d:18,h:5},{x:42,z:0,w:4,d:18,h:5},
  {x:-12,z:-44,w:8,d:5,h:2},{x:12,z:44,w:8,d:5,h:2},
  {x:-48,z:-38,w:9,d:9,h:5},{x:48,z:38,w:9,d:9,h:5}
]);
module.exports = { ARENA, STRIKERS, WILDCARDS, OBSTACLES };
