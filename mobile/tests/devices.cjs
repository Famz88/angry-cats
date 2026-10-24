const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const out = path.resolve(__dirname, '../test-results');
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [name, width, height] of [
      ['phone-portrait', 412, 915], ['phone-landscape', 915, 412],
      ['small-phone-landscape', 568, 320],
      ['tablet-portrait', 768, 1024], ['tablet-landscape', 1024, 768]
    ]) {
      const context = await browser.newContext({ viewport: { width, height }, hasTouch: true, isMobile: true });
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      const touchTap = async (x,y) => {
        await cdp.send('Input.dispatchTouchEvent', {type:'touchStart',touchPoints:[{x,y}]});
        await page.waitForTimeout(80);
        await cdp.send('Input.dispatchTouchEvent', {type:'touchEnd',touchPoints:[]});
        await page.waitForTimeout(350);
      };
      const tap = async selector => {
        await page.locator(selector).waitFor({state:'visible'});
        const box = await page.locator(selector).boundingBox();
        await page.locator(selector).click();
      };
      const errors = [], remote = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:4173/')) remote.push(request.url()); });
      await page.goto('http://127.0.0.1:4173/');
      await page.waitForFunction(() => typeof engine !== 'undefined' && engine);
      const visibleInViewport = async selector => {
        const box = await page.locator(selector).boundingBox();
        if (!box || box.x < 0 || box.y < 0 || box.x+box.width>width+1 || box.y+box.height>height+1) await page.screenshot({path:path.join(out,`${name}-clipped.png`)});
        assert(box && box.x >= 0 && box.y >= 0 && box.x + box.width <= width + 1 && box.y + box.height <= height + 1, `${name}: clipped ${selector}`);
      };
      await visibleInViewport('#btn-hero-start');
      await visibleInViewport('#btn-hero-select');
      await page.screenshot({ path: path.join(out, `${name}-home.png`) });
      await tap('#btn-hero-select');
      assert.equal(await page.locator('#levels-grid button').count(), 100);
      await tap('#levels-grid button:first-child');
      await visibleInViewport('#btn-pause');
      await visibleInViewport('#btn-restart');
      await page.screenshot({ path: path.join(out, `${name}-game.png`) });
      const launch = async () => {
        await tap('#btn-camera-reset');
        const sling = await page.evaluate(() => ({ x: slingshotPos.x * cameraScale + cameraOffsetX, y: slingshotPos.y * cameraScale + cameraOffsetY, scale: cameraScale }));
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: sling.x, y: sling.y }] });
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: sling.x - 65 * sling.scale, y: sling.y + 35 * sling.scale }] });
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await page.waitForTimeout(350);
      };
      await launch();
      assert.equal(await page.evaluate(() => shotsFired), 1, `${name}: touch launch`);
      await tap('#btn-pause');
      assert.equal(await page.evaluate(() => paused), true);
      await tap('#btn-resume');
      await page.waitForFunction(() => !paused);
      await tap('#btn-restart');
      assert.equal(await page.evaluate(() => shotsFired), 0);
      // Real touch input activates each power; controlled setup isolates it from level queues.
      for (const type of ['TABBY', 'NINJA', 'BOMB', 'SPLIT']) {
        await tap('#btn-restart');
        await page.evaluate(type => { activeCatData = CAT_TYPES[type]; }, type);
        await launch();
        assert.equal(await page.evaluate(() => !!launchedCatBody), true);
        assert.equal(await page.evaluate(() => activeCatData), null, 'A launched cat must leave the sling empty');
        await touchTap(width / 2, height / 2);
        assert.equal(await page.evaluate(() => catAbilityUsed), true, `${name}: ${type}`);
        if (type === 'BOMB' || type === 'SPLIT') {
          assert.equal(await page.evaluate(() => launchedCatBody), null);
          await page.evaluate(() => { for (const timer of gameTimers.values()) timer.ms = 60000; });
          await launch();
          assert.equal(await page.evaluate(() => shotsFired), 1, 'Cannot fire another cat during an unresolved turn');
        }
      }
      await page.evaluate(() => {
        window.AngryCatsLifecycle.pause();
      });
      assert.equal(await page.evaluate(() => paused), true);
      await page.waitForTimeout(350);
      await tap('#btn-resume');
      await page.screenshot({ path: path.join(out, `${name}-resumed.png`) });
      await page.waitForFunction(() => !paused);
      await tap('#btn-restart');
      await page.evaluate(() => { shotsFired = 1; score = 5000; triggerVictory(); });
      await visibleInViewport('#btn-result-next');
      await visibleInViewport('#btn-result-retry');
      await visibleInViewport('#btn-result-menu');
      await page.screenshot({ path: path.join(out, `${name}-result.png`) });
      await page.reload();
      await page.waitForFunction(() => typeof engine !== 'undefined' && engine);
      assert.equal(await page.evaluate(() => playerProgress.unlocked), 2);
      await tap('#btn-hero-select');
      await visibleInViewport('#btn-main-play');
      await page.screenshot({ path: path.join(out, `${name}-levels.png`) });
      assert.deepEqual(errors, []);
      assert.deepEqual(remote, []);
      console.log(`PASS ${name}: touch drag/launch, all four cats, pause/resume, restart, lifecycle, results, progress and layout`);
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
