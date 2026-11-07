import {createRequire} from 'node:module';
const require=createRequire('C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const url='file:///C:/Users/ADMIN/Downloads/MLN/Presents/11-doi-moi-kinh-te-chinh-tri-tinh-gon-bo-may/minigame/index.html';
const assert=(v,m)=>{if(!v)throw Error(m);};
for(const [width,height] of [[1920,1080],[1366,768]]){
 await page.setViewportSize({width,height});await page.goto(url);
 await page.screenshot({path:`.codex-build/topic11-minigame/projector-${width}-board.png`,fullPage:false});
 for(const province of ['dak-lak','phu-tho','cao-bang','quang-ngai']){
  await page.locator('[data-province="'+province+'"]').focus();await page.keyboard.press('Enter');
  const promptSize=await page.locator('#prompt').evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
  assert(promptSize>=30,'Question font at '+width);
  assert(!await page.locator('#question-dialog').evaluate(el=>el.scrollWidth>el.clientWidth+2),'Dialog horizontal overflow '+province);
  if(province==='dak-lak'){
   for(const [i,value] of ['Thời hạn được công bố','Thời hạn được công bố','Phân tích vận dụng'].entries())await page.locator(`[data-field="row-${i}"]`).selectOption(value);
   await page.screenshot({path:`.codex-build/topic11-minigame/projector-${width}-question.png`,fullPage:false});
   await page.locator('#check').click();assert(await page.locator('#feedback .success').count()===1,'Large question can be answered');
  }
  await page.locator('#round-done').click();
 }
 await page.locator('#score-tab').click();
 const last=await page.locator('.standing').last().boundingBox();
 console.log('Scoreboard',width,'last card bottom',Math.round(last.y+last.height),'viewport',height);
 assert(last.y+last.height<=height+10,'Nine teams fit at '+width);
 await page.screenshot({path:`.codex-build/topic11-minigame/projector-${width}-scores.png`,fullPage:false});
 assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'Page horizontal overflow '+width);
 // Each viewport gets a fresh game for the next pass.
 await page.evaluate(()=>localStorage.clear());
}
await page.setViewportSize({width:390,height:844});await page.goto(url);
assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'Mobile overflow');
await page.locator('[data-province="ha-noi"]').focus();await page.keyboard.press('Enter');
assert(!await page.locator('#question-dialog').evaluate(el=>el.scrollWidth>el.clientWidth+2),'Mobile dialog overflow');
assert(errors.length===0,errors.join('\n'));
console.log('PASS projector typography, answer entry, result, 9-team visibility, 2 projector resolutions and mobile.');
await browser.close();
