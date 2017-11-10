const fs = require('fs');
const path = require('path');

const puppeteer = require('puppeteer');

async function readJSON(inPath) {
  return await new Promise((resolve, reject) => {
    fs.readFile(inPath, { encoding: 'utf-8' }, (error, data) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(JSON.parse(data));
    });
  });
}

async function asChrome(page) {
  await page.setViewport({
    width: 1280,
    height: 800,
  });
}

async function asIPhone6Plus(page) {
  await page.emulate({
    viewport: {
      width: 414,
      height: 736,
      deviceScaleFactor: 2.6,
      isMobile: true,
      hasTouch: true,
      isLandscape: false,
    },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
  });
}

async function screenshot(browser, name, url, outPath, as = 'sd') {
  const page = await browser.newPage();
  if (as === 'sd') {
    await asIPhone6Plus(page);
  } else {
    await asChrome(page);
  }
  await page.goto(url);
  await page.screenshot({
    path: path.join(outPath, `${as}-${name}.png`),
    fullPage: true,
  });
  await page.close();
}

(async () => {
  const targets = await readJSON('./targets.json');
  const outPath = './screenshot';
  const browser = await puppeteer.launch();

  const sdTargets = targets.map(target => screenshot(browser, target.name, target.url, outPath));
  const pcTargets = targets.map(target => screenshot(browser, target.name, target.url, outPath, 'pc'));
  const takenScreenshots = [...sdTargets, ...pcTargets];
  await Promise.all(takenScreenshots);

  await browser.close();
})();
