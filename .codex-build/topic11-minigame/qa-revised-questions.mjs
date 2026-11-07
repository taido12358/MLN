import {createRequire} from 'node:module';
const require=createRequire('C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({reducedMotion:'reduce'});
const assert=(v,m)=>{if(!v)throw Error(m);};
const url='file:///C:/Users/ADMIN/Downloads/MLN/Presents/11-doi-moi-kinh-te-chinh-tri-tinh-gon-bo-may/minigame/index.html';
await page.goto(url);
await page.evaluate(()=>localStorage.setItem('mln11-34-provinces-v1',JSON.stringify({version:1,teams:Array.from({length:9},(_,i)=>`Đội ${i+1}`),currentTeam:1,records:{
 'ha-noi':{attempts:0,draft:{choice:1},team:0,result:{status:'correct',points:10}},
 'dak-lak':{attempts:1,draft:{},team:0,result:{status:'correct',points:7}},
 'ha-tinh':{attempts:2,draft:{choice:0,reason:0},team:1},
 'bac-ninh':{attempts:1,draft:{tokens:[3]},team:2}
},sound:false})));
await page.reload();
assert(await page.locator('[data-team-index="0"] .points').textContent()==='17','Completed points retained');
assert(await page.locator('[data-province="dak-lak"]').isDisabled(),'Revised completed question stays locked');
await page.locator('#map-select').selectOption('ha-tinh');await page.locator('#map-open').click();
assert((await page.locator('#question-meta').textContent()).includes('0 lần'),'Revised unfinished attempts reset');
assert(await page.locator('#quiz-area [aria-pressed="true"]').count()===0,'Old answer selections cleared');
await page.locator('[data-answer-key="choice"][data-answer-index="0"]').click();
await page.locator('[data-answer-key="reason"][data-answer-index="0"]').click();await page.locator('#check').click();
assert((await page.locator('#feedback').textContent()).includes('+10'),'New question first attempt points');
assert((await page.locator('#feedback a').getAttribute('href')).includes('PCI-2024'),'Question specific source');
assert((await page.locator('#feedback').textContent()).includes('Slide 5'),'Slide connection');
const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mln11-34-provinces-v1')));
assert(saved.records['ha-tinh'].revision===2,'Revision saved');
assert(saved.records['bac-ninh'].attempts===1,'Unchanged unfinished attempts retained');
assert(saved.records['bac-ninh'].draft.tokens[0]===3,'Unchanged draft retained');
await page.locator('#round-done').click();await page.reload();
assert(await page.locator('[data-team-index="1"] .points').textContent()==='10','New score persists');
console.log('PASS migration: completed points and locks retained, unchanged draft retained, revised unfinished draft and attempts cleared, source and slide links verified.');
await browser.close();
