// Exercise the actual interface handlers with a minimal DOM; no visual-browser claims.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import * as characters from '../src/characters.js';
import * as story from '../src/story.js';
import * as roster from '../src/duel-characters.js';
import * as unlocks from '../src/duel-unlocks.js';
import * as duel from '../src/duel.js';
import { HalloweenGame } from '../src/engine.js';
function mount(){
 const ids=new Map(),classes=new Map(),windowEvents=new Map(),memory=new Map();
 const parse=html=>{for(const match of html.matchAll(/id="([^"]+)"/g))if(!ids.has(match[1]))ids.set(match[1],new Element());};
 class Element {
  constructor(){this.listeners={};this.dataset={};this.hidden=false;this.open=false;this.value='';this.textContent='';this.classList={add(){},remove(){},toggle(){}};}
  set innerHTML(html){this.html=html;parse(html);}get innerHTML(){return this.html||'';}
  addEventListener(type,handler){(this.listeners[type]??=[]).push(handler);}
  setAttribute(name,value){this[name]=value;}focus(){}scrollIntoView(){}setPointerCapture(){}
  insertAdjacentHTML(_,html){parse(html);this.html=(this.html||'')+html;}
  querySelector(selector){if(!classes.has(selector))classes.set(selector,new Element());return classes.get(selector);}
  querySelectorAll(){return [];}
  getContext(){return {};}
  showModal(){this.open=true;}close(){this.open=false;}
 }
 parse(readFileSync(new URL('../index.html',import.meta.url),'utf8'));
 const document={hidden:false,querySelector(selector){if(selector.startsWith('#')){const node=ids.get(selector.slice(1));assert.ok(node,'Falta el elemento '+selector);return node;}if(!classes.has(selector))classes.set(selector,new Element());return classes.get(selector);},querySelectorAll(){return [];},addEventListener(){}};
 memory.set(story.SAVE_KEY,JSON.stringify({version:2,stage:3,hero:0,candy:12,won:true}));
 const context={...characters,...story,...roster,...unlocks,...duel,Art:class{},HalloweenGame,document,window:{addEventListener(type,handler){(windowEvents.get(type)||windowEvents.set(type,[]).get(type)).push(handler);}},localStorage:{getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)},Image:class{complete=true;naturalWidth=90;},matchMedia:()=>({matches:false}),performance:{now:()=>0},requestAnimationFrame(){},console};
 let script=readFileSync(new URL('../src/game.js',import.meta.url),'utf8').replace(/^import .*;\r?$/gm,'');
 script+='\nglobalThis.testing={openDuelMenu,startDuel,leaveDuel,getDuel:()=>duel,getGame:()=>game};';
 vm.runInNewContext(script,context,{filename:'game.js'});
 const fire=(id,type,event)=>{for(const handler of ids.get(id).listeners[type]||[])handler(event);};
 const choose=(player,hero)=>fire('duel-config','click',{target:{closest:()=>({dataset:{player:String(player),duelSelect:String(hero)}})}});
 return {ids,memory,context,fire,choose,windowEvents};
}
test('barra conectada desde la primera visita, ambos jugadores eligen secretos y se muestra su victoria',()=>{
 const ui=mount(),api=ui.context.testing;assert.equal(ui.ids.get('duel-code-form').listeners.submit.length,1);api.openDuelMenu();assert.ok(!ui.ids.get('duel-picker-0').innerHTML.includes('Baltazar'));
 const enterCode=code=>{ui.ids.get('duel-code').value=code;ui.fire('duel-code-form','submit',{preventDefault(){}});};
 enterCode('Escuela Bavio 16 12');assert.ok(ui.ids.get('duel-picker-0').innerHTML.includes('Baltazar'));assert.ok(ui.ids.get('duel-picker-1').innerHTML.includes('Máquina de bobadas'));
 ui.choose(0,8);ui.choose(1,9);ui.ids.get('duel-mode').value='local';api.startDuel();let battle=api.getDuel();assert.deepEqual(Array.from(battle.fighters,f=>f.hero),[8,9]);assert.ok(ui.ids.get('duel-controls').innerHTML.includes('Ecolocalización'));
 battle.fighters[1].hp=0;battle.endRound();assert.ok(ui.ids.get('screen').innerHTML.includes('Baltazar'));battle.nextRound();battle.fighters[1].hp=0;battle.endRound();assert.equal(battle.winner,0);assert.ok(ui.ids.get('screen').innerHTML.includes('Baltazar'));
 api.leaveDuel();assert.equal(ui.ids.get('duel-code-form').listeners.submit.length,1);api.openDuelMenu();enterCode('Halloween vs Día de los muertos');assert.ok(ui.ids.get('duel-picker-1').innerHTML.includes('Wis catrina'));
 ui.choose(0,10);ui.choose(1,11);api.startDuel();battle=api.getDuel();battle.fighters[0].hp=0;battle.endRound();assert.ok(ui.ids.get('screen').innerHTML.includes('Wis catrina'));assert.equal(api.getGame().hero,0);
 assert.deepEqual(unlocks.readUnlocks(ui.memory.get(unlocks.DUEL_UNLOCK_KEY)),['school','halloween']);
});
test('escribir letras y espacios en la barra no activa controles ni impide enviar el código con Enter',()=>{
 const ui=mount();ui.context.testing.openDuelMenu();const input=ui.ids.get('duel-code');for(const key of ['w','a','q',' ','Enter'])for(const handler of ui.windowEvents.get('keydown'))handler({key,target:{closest:()=>input},preventDefault(){assert.fail('El juego interceptó una tecla dentro de la barra');}});
});
