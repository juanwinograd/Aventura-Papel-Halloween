import { DUEL_HEROES } from './duel-characters.js';
export const DUEL_UNLOCK_KEY='aventura-papel-halloween-duel-unlocks-v1';
const groups=['school','halloween'];
const codes={'escuela bavio 16 12':'school','halloween vs dia de los muertos':'halloween'};
export function normalizeCode(value){return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toLowerCase();}
export function readUnlocks(raw){try{const value=JSON.parse(raw);return value?.version===1&&Array.isArray(value.groups)?[...new Set(value.groups.filter(g=>groups.includes(g)))]:[];}catch{return [];}}
export function availableDuelIndices(unlocked=[]){return DUEL_HEROES.map((h,i)=>!h.secretGroup||unlocked.includes(h.secretGroup)?i:null).filter(i=>i!==null);}
export function redeemDuelCode(code,unlocked=[]){const key=normalizeCode(code),group=Object.hasOwn(codes,key)?codes[key]:null,known=[...new Set((Array.isArray(unlocked)?unlocked:[]).filter(g=>groups.includes(g)))];if(!group)return {accepted:false,changed:false,groups:known,heroes:[]};return {accepted:true,changed:!known.includes(group),groups:[...new Set([...known,group])],heroes:DUEL_HEROES.filter(h=>h.secretGroup===group).map(h=>h.name)};}
