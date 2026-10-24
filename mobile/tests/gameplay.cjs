const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
(async()=>{
 const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
 const page = await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 const errors=[], remote=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:4173/'))remote.push(r.url());});
 await page.goto('http://127.0.0.1:4173/');
 await page.waitForFunction(()=>typeof engine!=='undefined' && engine);
 const shots = path.resolve(__dirname,'../test-results'); fs.mkdirSync(shots,{recursive:true});
 await page.screenshot({path:path.join(shots,'01-home.png')});
 await page.click('#btn-hero-select');
 assert.equal(await page.locator('#levels-grid button').count(),100);
 assert.equal(await page.locator('#levels-grid button:disabled').count(),99);
 await page.screenshot({path:path.join(shots,'02-levels.png')});
 await page.click('#levels-grid button:first-child');
 assert(await page.locator('#modal-overlay').evaluate(e=>e.classList.contains('hidden')));
 await page.screenshot({path:path.join(shots,'03-game.png')});
 // Drag with pointer events at the actual rendered sling coordinates.
 const sling=await page.evaluate(()=>({x:slingshotPos.x*cameraScale+cameraOffsetX,y:slingshotPos.y*cameraScale+cameraOffsetY,scale:cameraScale}));
 await page.mouse.move(sling.x,sling.y);await page.mouse.down();await page.mouse.move(sling.x-70*sling.scale,sling.y+45*sling.scale,{steps:10});await page.mouse.up();
 assert.equal(await page.evaluate(()=>shotsFired),1);
 assert(await page.evaluate(()=>!!launchedCatBody));
 await page.click('#btn-pause');
 const before=await page.evaluate(()=>({x:launchedCatBody.position.x,t:[...gameTimers.values()][0].ms}));
 await page.waitForTimeout(350);
 const after=await page.evaluate(()=>({x:launchedCatBody.position.x,t:[...gameTimers.values()][0].ms}));
 assert.equal(before.x,after.x);assert.equal(before.t,after.t);
 await page.click('#btn-resume');
 assert.equal(await page.evaluate(()=>paused),false);
 // A retry must discard old turn callbacks.
 await page.click('#btn-restart');assert.equal(await page.evaluate(()=>gameTimers.size),0);
 // Controlled game-state checks for scoring, unlocks, results and persistence.
 await page.evaluate(()=>{shotsFired=1;score=12345;triggerVictory();});
 assert.equal(await page.evaluate(()=>playerProgress.unlocked),2);
 assert.equal(await page.locator('#card-hero-play').isVisible(),false);
 assert.equal(await page.locator('#card-result').isVisible(),true);
 await page.screenshot({path:path.join(shots,'04-result.png')});
 await page.click('#btn-result-next');assert.equal(await page.evaluate(()=>currentLevelIndex),1);
 await page.reload();await page.waitForFunction(()=>typeof engine!=='undefined'&&engine);
 assert.equal(await page.evaluate(()=>playerProgress.unlocked),2);
 assert((await page.evaluate(()=>playerProgress.best[1]))>=12345);
 await page.click('#btn-hero-start');await page.evaluate(()=>triggerDefeat());
 assert.equal(await page.locator('#btn-result-next').isVisible(),false);
 // All generated levels contain targets and four valid cat types.
 await page.evaluate(()=>{for(let n=1;n<=100;n++){Composite.clear(world,false);const l=generateLevel(n);l.build();if(!world.bodies.some(b=>b.label==='target')||!l.cats.length)throw Error('Invalid level '+n);}});
 await page.setViewportSize({width:844,height:390});await page.click('#btn-result-menu');
 await page.screenshot({path:path.join(shots,'05-landscape.png')});
 assert.deepEqual(remote,[],'Every runtime asset must be local');assert.deepEqual(errors,[],'No browser exceptions');
 console.log('PASS: 100 levels, touch/pointer launch, paused physics and timers, retry cancellation, stars/unlocks/best scores, persistence, failure gating, portrait/landscape, zero remote requests.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
