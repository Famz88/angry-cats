/* Logic/physics checks in Node. This does not replace browser or device tests. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'../www');
const Matter=require(path.join(root,'vendor/matter.min.js'));
Matter.Runner.run=()=>{};
class Element {
 constructor(){this.classes=new Set();this.children=[];this.style={};this.listeners={};this.textContent='';this.innerText='';this.innerHTML='';this.clientWidth=390;this.clientHeight=844;this.classList={add:(...a)=>a.forEach(v=>this.classes.add(v)),remove:(...a)=>a.forEach(v=>this.classes.delete(v)),contains:v=>this.classes.has(v),toggle:(v,b)=>{const enabled=b===undefined?!this.classes.has(v):b;if(enabled)this.classes.add(v);else this.classes.delete(v);}};}
 set className(v){this.classes=new Set(v.split(/\s+/));} get className(){return [...this.classes].join(' ');}
 appendChild(e){this.children.push(e);}setAttribute(){}addEventListener(t,fn){this.listeners[t]=fn;}getBoundingClientRect(){return {left:0,top:0,width:390,height:844};}click(){this.onclick?.();}setPointerCapture(){}
}
const ids={};for(const m of fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/id="([^"]+)"(?: class="([^"]+)")?/g)){ids[m[1]]=new Element();ids[m[1]].className=m[2]||'';}
let canvas;
try{canvas=require('@napi-rs/canvas').createCanvas(390,844);}catch{}
const noop=()=>{},fake=new Proxy({createLinearGradient:()=>({addColorStop:noop}),measureText:()=>({width:20})},{get:(t,k)=>t[k]||noop,set:()=>true});
ids.gameCanvas.getContext=()=>canvas?canvas.getContext('2d'):fake;
const listeners={},storage=new Map();let clock=1000;
const context={console,Matter,setTimeout,clearTimeout,Date,Math,Map,performance:{now:()=>clock},requestAnimationFrame:noop,confirm:()=>true,document:{hidden:false,getElementById:id=>{assert(ids[id],'Unknown DOM id '+id);return ids[id];},createElement:()=>new Element(),addEventListener:(t,fn)=>listeners['doc:'+t]=fn},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)}};
context.window={innerWidth:390,innerHeight:844,addEventListener:(t,fn)=>listeners[t]=fn};
vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'game.js'),'utf8'),context);
const run=code=>vm.runInContext(code,context);
run('audio.init=()=>{}');listeners.load();
assert.equal(ids['levels-grid'].children.length,100);
assert.equal(ids['levels-grid'].children.filter(e=>e.disabled).length,99);
ids['btn-hero-start'].click();assert.equal(run('gameActive'),true);
const sling=run('({x:slingshotPos.x*cameraScale+cameraOffsetX,y:slingshotPos.y*cameraScale+cameraOffsetY,scale:cameraScale})');
ids.gameCanvas.listeners.pointerdown({pointerId:1,clientX:sling.x,clientY:sling.y});
listeners.pointermove({pointerId:1,clientX:sling.x-70*sling.scale,clientY:sling.y+45*sling.scale});
listeners.pointerup({pointerId:1});assert.equal(run('shotsFired'),1);assert(run('!!launchedCatBody'));
run('Engine.update(engine,16.666)');const x=run('launchedCatBody.position.x');
ids['btn-pause'].click();const remaining=run('[...gameTimers.values()][0].ms');
clock+=400;run('gameLoop();Engine.update(engine,16.666)');assert.equal(run('launchedCatBody.position.x'),x);assert.equal(run('[...gameTimers.values()][0].ms'),remaining);
ids['btn-resume'].click();assert.equal(run('paused'),false);
ids['btn-restart'].click();assert.equal(run('gameTimers.size'),0);
run('shotsFired=1;score=12345;triggerVictory()');assert.equal(run('playerProgress.unlocked'),2);assert(ids['card-hero-play'].classList.contains('hidden'));assert(!ids['card-result'].classList.contains('hidden'));assert(run('playerProgress.best[1]>=12345'));
ids['btn-result-next'].click();assert.equal(run('currentLevelIndex'),1);
run('loadProgress()');assert.equal(run('playerProgress.unlocked'),2);
run('triggerDefeat()');assert(ids['btn-result-next'].classList.contains('hidden'));
run(`setPaused(false); for(let n=1;n<=100;n++){Composite.clear(world,false);const level=generateLevel(n);level.build();if(!world.bodies.some(b=>b.label==='target')||!level.cats.length)throw Error('Invalid level '+n);for(let i=0;i<45;i++)Engine.update(engine,16.666);if(world.bodies.some(b=>!Number.isFinite(b.position.x)||!Number.isFinite(b.position.y)))throw Error('Invalid physics '+n);}`);
run('startLevel(0); gameLoop()');
if(canvas){fs.mkdirSync(path.resolve(__dirname,'../test-results'),{recursive:true});fs.writeFileSync(path.resolve(__dirname,'../test-results/canvas-render.png'),canvas.toBuffer('image/png'));}
assert(!/https?:\/\//.test(fs.readFileSync(path.join(root,'index.html'),'utf8')),'Runtime HTML must not require remote resources');
console.log('PASS: 100 generated levels and finite physics, pointer launch, pause freezes physics/timers, retry cancels timers, results visibility, unlocks, local best scores and persistence. Canvas render: '+!!canvas);
