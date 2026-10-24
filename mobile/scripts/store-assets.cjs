const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
(async()=>{
 const out=path.resolve(process.argv[2]); fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true});
 try{
  const context=await browser.newContext({viewport:{width:360,height:640},deviceScaleFactor:3,hasTouch:true,isMobile:true});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await page.waitForFunction(()=>typeof engine!=='undefined'&&engine);
  await page.screenshot({path:path.join(out,'phone-01-home.png')});
  await page.click('#btn-hero-select');
  await page.screenshot({path:path.join(out,'phone-02-levels.png')});
  await page.click('#levels-grid button:first-child');
  await page.screenshot({path:path.join(out,'phone-03-game.png')});
  const sling=await page.evaluate(()=>({x:slingshotPos.x*cameraScale+cameraOffsetX,y:slingshotPos.y*cameraScale+cameraOffsetY,scale:cameraScale}));
  await page.mouse.move(sling.x,sling.y); await page.mouse.down();
  await page.mouse.move(sling.x-70*sling.scale,sling.y+35*sling.scale,{steps:10});
  await page.screenshot({path:path.join(out,'phone-04-aim.png')});
  await page.mouse.up();
  const svg=await page.locator('.hero-art').innerHTML();
  const feature=await browser.newPage({viewport:{width:1024,height:500}});
  await feature.setContent(`<!doctype html><meta charset="utf-8"><style>
  *{box-sizing:border-box}body{margin:0;width:1024px;height:500px;overflow:hidden;background:linear-gradient(#ff9c66,#efca84 65%,#406745);font-family:Arial,sans-serif;color:#fff3ce;display:flex;align-items:center;padding:46px 64px;position:relative}
  .sun{position:absolute;width:260px;height:260px;border-radius:50%;background:#ffe79d;right:190px;top:35px;opacity:.75}.hills{position:absolute;left:-100px;right:-100px;bottom:-135px;height:270px;border-radius:50%;background:#2b5035}
  main{z-index:1;width:540px}small{font-size:17px;letter-spacing:5px;color:#4c4930;font-weight:800}h1{font-size:91px;line-height:.9;margin:23px 0 19px;letter-spacing:-5px;color:#ffd247;-webkit-text-stroke:3px #542c39;paint-order:stroke fill;text-shadow:0 7px #542c39;transform:rotate(-3deg)}h1 span{color:#ff7741}p{font-size:25px;font-weight:700;margin:23px 0;text-shadow:0 2px #375034}footer{font-size:18px;font-weight:700;letter-spacing:1px}.art{width:365px;z-index:1;filter:drop-shadow(0 12px 0 #543a3220)}svg{width:100%;height:100%}
  </style><div class="sun"></div><div class="hills"></div><main><small>FAMZZ GAMES</small><h1>ANGRY<br><span>CATS!</span></h1><p>Small paws. Big destruction.</p><footer>100 levels · 4 cat powers · Play offline</footer></main><div class="art">${svg}</div>`);
  await feature.screenshot({path:path.join(out,'feature-1024x500.png')});
  console.log('Saved four 1080x1920 phone screenshots and 1024x500 feature graphic');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
