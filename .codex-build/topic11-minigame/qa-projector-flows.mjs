import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {questions} from './questions.mjs';
const require=createRequire('C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'});
const page=await context.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
const base='C:/Users/ADMIN/Downloads/MLN/.codex-build/topic11-minigame/';
await page.goto('file:///C:/Users/ADMIN/Downloads/MLN/Presents/11-doi-moi-kinh-te-chinh-tri-tinh-gon-bo-may/minigame/index.html');
await page.locator('.province').first().waitFor();
if(await page.locator('.province').count()!==34)throw Error('Province count');
await page.screenshot({path:base+'board-desktop.png',fullPage:true});
const choose=async(key,index)=>page.locator(`[data-answer-key="${key}"][data-answer-index="${index}"]`).click();
const field=async(key,value)=>page.locator(`[data-field="${key}"]`).fill(String(value));
const select=async(key,value)=>page.locator(`[data-field="${key}"]`).selectOption(value);
for(const q of questions){
  await page.locator(`[data-province="${q.id}"]`).focus(); await page.keyboard.press("Enter");
  await page.locator('#question-dialog').waitFor({state:'visible'});
  switch(q.kind){
    case 'binary':case 'odd':await choose('choice',q.answer);break;
    case 'letters':{
      const used=new Set();
      for(const char of [...q.answer]){const i=q.tokens.findIndex((token,index)=>token===char&&!used.has(index));used.add(i);await page.locator(`[data-token-index="${i}"]`).click();}break;
    }
    case 'sentence':for(const i of q.answer)await page.locator(`[data-token-index="${i}"]`).click();break;
    case 'double':case 'triple':for(const i of q.answer)await choose('choices',i);break;
    case 'cloze':case 'correction':await select('value',q.answer);break;
    case 'matching':case 'truth-matrix':case 'classification':case 'fact-inference':for(let i=0;i<q.answer.length;i++)await select(`row-${i}`,q.answer[i]);break;
    case 'vowels':for(let i=0;i<2;i++)await field(`vowel-${i}`,q.answer[i]);break;
    case 'equation':for(let i=0;i<2;i++)await field(`n-${i}`,q.answer[i]);break;
    case 'memory':for(let i=0;i<q.pairs.length;i++){await page.locator(`[data-memory-index="${i*2}"]`).click();await page.locator(`[data-memory-index="${i*2+1}"]`).click();}break;
    case 'number':await field('number',q.answer);break;
    case 'slider':await page.locator('#answer-range').focus();await page.keyboard.press('Home');for(let i=0;i<q.answer;i++)await page.keyboard.press('ArrowRight');break;
    case 'wordsearch':for(let i=21;i<28;i++)await page.locator(`[data-cell="${i}"]`).click();break;
    case 'decision':case 'rapid':for(let i=0;i<q.steps.length;i++){await choose(`step-${i}`,q.steps[i].answer);if(q.kind==='rapid'&&i<q.steps.length-1)await page.getByRole('button',{name:'Mở bước tiếp theo',exact:true}).click();}break;
    case 'timeline':case 'policy-order':{
      const order=q.items.map((_,i)=>i);
      for(let target=0;target<q.answer.length;target++){
        let current=order.indexOf(q.answer[target]);
        while(current>target){await page.locator(`[data-item="${q.answer[target]}"][data-move="-1"]`).click();[order[current],order[current-1]]=[order[current-1],order[current]];current--;}
      }break;
    }
    case 'evidence':case 'two-claims':await choose('choice',q.answer[0]);await choose('reason',q.answer[1]);break;
    case 'connect':for(const i of q.answer[0])await choose('choices',i);await select('target',q.answer[1]);break;
    case 'crossword':{
      const cells=new Map();q.across.split('').forEach((letter,index)=>cells.set(`3-${index+1}`,letter));q.down.split('').forEach((letter,index)=>cells.set(`${index}-3`,letter));
      for(const [cell,value] of cells)await page.locator(`[data-cross="${cell}"]`).fill(value);break;
    }
    case 'hints':await field('guess',q.answer);break;
    case 'budget':for(const [index,amount] of [30,30,20,20].entries())await field(`amount-${index}`,amount);break;
    case 'assembly':case 'reading':case 'argument':for(let i=0;i<q.answer.length;i++)await select(`field-${i}`,q.answer[i]);break;
    case 'pin':for(let i=0;i<q.answer.length;i++)await page.locator(`[data-pin="${i}"]`).fill(q.answer[i]);break;
    case 'buckets':for(let group=0;group<q.groups.length;group++){await page.locator(`[data-bucket="${group}"]`).click();for(let i=0;i<q.tokens.length;i++)if(q.answer[i]===group)await page.locator(`[data-bucket-token="${i}"]`).click();}break;
    case 'binary-lock':for(let i=0;i<q.answer.length;i++)await select(`bit-${i}`,q.answer[i]);break;
    default:throw Error('Unsupported QA '+q.kind);
  }
  await page.locator('#check').click();
  if(!await page.locator('#feedback .success').count())throw Error(`${q.id}: ${await page.locator('#feedback').innerText()}`);
  if(q.id==='phu-tho')await page.screenshot({path:base+'phu-tho.png',fullPage:true});
  await page.locator('#round-done').click();
  console.log('PASS',q.id,q.kind);
}
const total=await page.locator('.standing .points').allTextContents();
if(total.reduce((s,n)=>s+Number(n),0)!==340)throw Error('Total score');
await page.reload();
if((await page.locator('#counter').innerText())!=='34 / 34 hoàn thành')throw Error('Persistence');
if(!await page.locator('[data-province="phu-tho"]').isDisabled())throw Error('Completed province must be locked');
if(await page.locator('.province[aria-disabled="true"]').count()!==34)throw Error('All completed provinces must be locked');
await page.locator('#finish-open').click();
await page.screenshot({path:base+'ending.png',fullPage:true});
if(!(await page.locator('#game-summary').innerText()).includes('34 / 34'))throw Error('Summary');
await page.locator('#ending-close').click();
await page.setViewportSize({width:390,height:844});
if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Mobile board overflow');
await page.screenshot({path:base+'mobile.png',fullPage:true});
// A fresh file:// context confirms the self-contained deliverable works offline.
const fileContext=await browser.newContext({viewport:{width:1280,height:800}});
const filePage=await fileContext.newPage();filePage.on('pageerror',e=>errors.push(e.message));
await filePage.goto('file:///C:/Users/ADMIN/Downloads/MLN/Presents/11-doi-moi-kinh-te-chinh-tri-tinh-gon-bo-may/minigame/index.html');
if(await filePage.locator('.province').count()!==34)throw Error('file:// startup');
await filePage.locator('[data-province="bac-ninh"]').focus(); await filePage.keyboard.press("Enter");
await filePage.locator('#check').click();
if(!(await filePage.locator('#question-meta').innerText()).includes('0 lần'))throw Error('Incomplete answer penalized');
for(const index of [0,1,2,3,4,5,6])await filePage.locator(`[data-token-index="${index}"]`).click();
await filePage.locator('#check').click();
if(!(await filePage.locator('#question-meta').innerText()).includes('1 lần'))throw Error('Wrong attempt not recorded');
await filePage.locator('#round-done').click();await filePage.reload();await filePage.locator('[data-province="bac-ninh"]').focus(); await filePage.keyboard.press("Enter");
if(!(await filePage.locator('#question-meta').innerText()).includes('1 lần'))throw Error('Draft not persisted');
await filePage.getByRole('button',{name:'Ghép lại',exact:true}).click();
for(const index of [3,1,6,0,4,5,2])await filePage.locator(`[data-token-index="${index}"]`).click();
await filePage.locator('#check').click();
if(!(await filePage.locator('#feedback .success').innerText()).includes('+7 điểm'))throw Error('Retry score');
if(errors.length)throw Error(errors.join('\n'));
await fs.writeFile(base+'qa-result.json',JSON.stringify({provinces:34,formats:34,correctFlows:34,totalScore:340,persistence:true,preventDoubleScore:true,mobileNoOverflow:true,fileProtocol:true,retryScore:7,pageErrors:errors},null,2));
console.log('PASS all 34 flows, persistence, score, retry, file mode, mobile and ending.');
await browser.close();
