import {createRequire} from 'node:module';
const require=createRequire('C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1400,height:1100},reducedMotion:'reduce'});
await page.goto('file:///C:/Users/ADMIN/Downloads/MLN/Presents/11-doi-moi-kinh-te-chinh-tri-tinh-gon-bo-may/minigame/index.html');
await page.locator('.map-card').screenshot({path:'.codex-build/topic11-pptx-v2/minigame-map.png'});
await browser.close();
