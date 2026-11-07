import {createRequire} from 'node:module';
const require=createRequire('C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1366,height:768},reducedMotion:'reduce'});
const assert=(v,m)=>{if(!v)throw Error(m);};
const names=['Nhóm 1','Nhóm 2','Nhóm 3','Nhóm 4','Nhóm 5','Nhóm 6','Nhóm 7','Nhóm 9'];
const url='file:///C:/Users/ADMIN/Downloads/MLN/Presents/11-doi-moi-kinh-te-chinh-tri-tinh-gon-bo-may/minigame/index.html';
await page.goto(url);
assert(JSON.stringify(await page.locator('#answer-team option').allTextContents())===JSON.stringify(names),'Exact eight groups in order');
assert(await page.locator('.standing').count()===8,'Eight standings');
await page.locator('#answer-team').selectOption('7');await page.locator('[data-province="ha-noi"]').focus();await page.keyboard.press('Enter');
await page.locator('[data-answer-key="choice"][data-answer-index="1"]').click();await page.locator('#check').click();await page.locator('#round-done').click();
assert(await page.locator('[data-team-index="7"] .points').textContent()==='10','Group 9 receives points');
assert(await page.locator('#answer-team').inputValue()==='0','Group 9 wraps to group 1');
await page.reload();assert(await page.locator('.standing').count()===8,'Reload keeps eight');
await page.locator('#settings-open').click();
assert(await page.locator('#team-count option').count()===1,'Only fixed eight option');
assert(JSON.stringify(await page.locator('#team-inputs input').evaluateAll(items=>items.map(i=>i.value)))===JSON.stringify(names),'Fixed settings roster');
await page.locator('#settings-close').click();
await page.evaluate(()=>localStorage.setItem('mln11-34-provinces-v1',JSON.stringify({version:1,teams:Array.from({length:9},(_,i)=>'Đội '+(i+1)),currentTeam:8,records:{
 'ha-noi':{attempts:0,draft:{},team:8,result:{status:'correct',points:10}},
 'bac-ninh':{attempts:1,draft:{},team:7,result:{status:'correct',points:7}},
 'phu-tho':{attempts:2,draft:{},team:6,result:{status:'correct',points:5}}
}})));
await page.reload();
assert(await page.locator('#answer-team').inputValue()==='7','Legacy group 9 remapped');
assert(await page.locator('[data-team-index="7"] .points').textContent()==='10','Legacy group 9 points preserved separately');
assert(await page.locator('[data-team-index="6"] .points').textContent()==='5','Group 7 points retained');
assert(await page.locator('[data-province="bac-ninh"]').isDisabled(),'Removed group history remains locked');
assert((await page.locator('#score-summary').textContent()).includes('15 điểm'),'Active total excludes removed group');
await page.locator('#score-tab').click();await page.screenshot({path:'.codex-build/topic11-minigame/eight-groups-1-7-9.png',fullPage:false});
await page.locator('#game-tab').click();await page.locator('#sound-toggle').click();await page.reload();
assert(await page.locator('[data-team-index="7"] .points').textContent()==='10','Migration remains stable after save and reload');
assert((await page.locator('#score-history').textContent()).includes('Nhóm 8 (ván trước)'),'Old history retained');
assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'Projector no horizontal overflow');
console.log('PASS exact groups 1-7 and 9, fixed count, group 9 scoring and turn wrap, persistence and old nine-team migration.');
await browser.close();
