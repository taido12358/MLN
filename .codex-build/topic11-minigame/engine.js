(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const STORE = 'mln11-34-provinces-v1';
  const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const equal = (a,b) => JSON.stringify(a) === JSON.stringify(b);
  const node = (tag,text,className) => {
    const result = document.createElement(tag);
    if (text !== undefined) result.textContent = text;
    if (className) result.className = className;
    return result;
  };
  const TEAM_NAMES = ['Nhóm 1','Nhóm 2','Nhóm 3','Nhóm 4','Nhóm 5','Nhóm 6','Nhóm 7','Nhóm 9'];
  const TEAM_COUNT = TEAM_NAMES.length;
  const blankState = () => ({version:1,rosterVersion:2,teams:[...TEAM_NAMES],currentTeam:0,records:{},sound:false});
  let storageAvailable = true;
  function load() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORE) || 'null');
      if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.teams) || parsed.teams.length < 2 || parsed.teams.length > 9) return blankState();
      const migrateNineTeams=parsed.rosterVersion!==2&&parsed.teams.length===9;
      parsed.teams=[...TEAM_NAMES];parsed.rosterVersion=2;
      if(migrateNineTeams)parsed.currentTeam=parsed.currentTeam===8?7:parsed.currentTeam===7?0:parsed.currentTeam;
      if (!Number.isInteger(parsed.currentTeam) || parsed.currentTeam < 0 || parsed.currentTeam >= parsed.teams.length) parsed.currentTeam = 0;
      const records = {};
      for (const question of QUESTIONS) {
        const saved = parsed.records?.[question.id];
        if (!saved || typeof saved !== 'object') continue;
        const record = {attempts:Number.isInteger(saved.attempts) && saved.attempts >= 0 ? Math.min(saved.attempts,1000) : 0,draft:saved.draft && typeof saved.draft === 'object' && !Array.isArray(saved.draft) ? saved.draft : {}};
        record.revision=Number.isInteger(saved.revision)?saved.revision:1;
        if(!saved.result&&record.revision!==(question.revision||1)){
          record.draft={};record.attempts=0;record.revision=question.revision||1;
        }
        if(saved.retiredTeam)record.retiredTeam=String(saved.retiredTeam).slice(0,40);
        if(migrateNineTeams&&saved.team===7){
          if(saved.result)record.retiredTeam='Nhóm 8 (ván trước)';
          else {record.attempts=0;record.draft={};}
        }else if(Number.isInteger(saved.team)&&saved.team>=0&&saved.team<(migrateNineTeams?9:TEAM_COUNT)){
          record.team=migrateNineTeams&&saved.team===8?7:saved.team;
        }
        if (saved.result && ['correct','revealed'].includes(saved.result.status) && [0,5,7,10].includes(saved.result.points) && (record.team !== undefined||record.retiredTeam)) record.result = saved.result;
        records[question.id] = record;
      }
      return {...blankState(),...parsed,records};
    } catch { storageAvailable = false; return blankState(); }
  }
  let state = load();
  let activeQuestion = null;
  let evaluation = null;
  let lastCard = null;
  let memoryTimer = null;
  let memoryFlips = [];
  let audioContext;
  let animateBoardEntrance=true;
  let completedProvince=null;
  const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
  function animateElement(element,keyframes,options) {
    if(!element||motionPreference.matches)return;
    element.animate(keyframes,options);
  }
  function showDialog(id) {
    const dialog=$(id);
    dialog.showModal();
    if(id==='question-dialog')scheduleQuestionFit();
    animateElement(dialog,[
      {opacity:0,transform:'perspective(1000px) translateY(50px) rotateX(-9deg) scale(.88)'},
      {opacity:1,transform:'perspective(1000px) translateY(-7px) rotateX(2deg) scale(1.025)',offset:.72},
      {opacity:1,transform:'none'},
    ],{duration:480,easing:'cubic-bezier(.16,1,.3,1)'});
  }
  let questionFitFrame=0;
  function scheduleQuestionFit(){
    cancelAnimationFrame(questionFitFrame);
    questionFitFrame=requestAnimationFrame(fitQuestion);
  }
  function fitQuestion(){
    const dialog=$('question-dialog');
    if(!dialog.open)return;
    const body=dialog.querySelector('.dialog-body');
    const availableHeight=parseFloat(getComputedStyle(dialog).maxHeight)-8;
    const availableWidth=dialog.clientWidth;
    const measure=scale=>{
      body.style.zoom=String(scale);
      body.style.width=`${availableWidth/scale}px`;
      return Math.max(body.offsetHeight,body.scrollHeight)*scale;
    };
    let scale=1;
    if(measure(1)>availableHeight){
      let low=.15,high=1;
      for(let i=0;i<9;i++){
        const candidate=(low+high)/2;
        if(measure(candidate)<=availableHeight)low=candidate;else high=candidate;
      }
      scale=low;
    }
    measure(scale);
    dialog.dataset.fitScale=scale.toFixed(3);
  }
  new MutationObserver(scheduleQuestionFit).observe($('question-dialog').querySelector('.dialog-body'),{childList:true,subtree:true,characterData:true});
  window.addEventListener('resize',scheduleQuestionFit);
  window.visualViewport?.addEventListener('resize',scheduleQuestionFit);
  document.fonts?.ready.then(scheduleQuestionFit);
  function celebrate(dialog,points) {
    if(motionPreference.matches)return;
    dialog.querySelector('.celebration')?.remove();
    const layer=node('div',undefined,'celebration');layer.setAttribute('aria-hidden','true');
    const colors=['#2454d7','#15998b','#f5b747','#e77d48','#7650c8','#35a6d5'];
    const count=window.innerWidth<600?42:80;
    for(let index=0;index<count;index++){
      const piece=node('i',undefined,'confetti');
      const travelX=(Math.random()-.5)*1050;
      piece.style.setProperty('--piece-color',colors[index%colors.length]);
      piece.style.setProperty('--piece-width',`${5+Math.random()*6}px`);
      piece.style.setProperty('--piece-height',`${8+Math.random()*9}px`);
      piece.style.setProperty('--piece-radius',index%4===0?'50%':'2px');
      piece.style.setProperty('--piece-duration',`${1.3+Math.random()*.8}s`);
      piece.style.setProperty('--piece-delay',`${Math.random()*.14}s`);
      piece.style.setProperty('--mid-x',`${travelX*.48}px`);
      piece.style.setProperty('--launch-y',`${-70-Math.random()*160}px`);
      piece.style.setProperty('--travel-x',`${travelX}px`);
      piece.style.setProperty('--travel-y',`${120+Math.random()*480}px`);
      piece.style.setProperty('--spin',`${(Math.random()-.5)*1400}deg`);
      layer.append(piece);
    }
    if(points!==undefined)layer.append(node('strong',`+${points}`,'flying-score'));
    layer.addEventListener('animationend',event=>{event.target.remove();if(!layer.childElementCount)layer.remove();});
    dialog.append(layer);
  }
  function save() {
    try { localStorage.setItem(STORE,JSON.stringify(state)); }
    catch { storageAvailable = false; $('notice').textContent = 'Trình duyệt đang giữ tiến độ trong phiên chơi này.'; }
  }
  function getRecord(q) { return state.records[q.id] ||= {attempts:0,draft:{},revision:q.revision||1}; }
  function setDraft(key,value) { getRecord(activeQuestion).draft[key] = value; save(); }
  function currentDraft(key,fallback='') { return getRecord(activeQuestion).draft[key] ?? fallback; }
  function scores() {
    return state.teams.map((name,index) => {
      const results=Object.values(state.records).filter(record=>record.team===index&&record.result);
      return {name,index,points:results.reduce((sum,record)=>sum+record.result.points,0),correct:results.filter(record=>record.result.status==='correct').length};
    });
  }
  function setTab(name,focus=false) {
    for (const tab of ['game','score']) {
      const selected=tab===name;
      $(tab+'-tab').setAttribute('aria-selected',String(selected));
      $(tab+'-tab').tabIndex=selected?0:-1;
      $(tab+'-panel').hidden=!selected;
    }
    if(focus)$(name+'-tab').focus();
    animateElement($(name+'-panel'),[{opacity:0,transform:'translateY(25px)'},{opacity:1,transform:'none'}],{duration:430,easing:'cubic-bezier(.16,1,.3,1)'});
    if(name==='score')document.querySelectorAll('.standing').forEach((card,index)=>animateElement(card,[{opacity:0,transform:'perspective(900px) rotateY(-15deg) translateY(30px) scale(.85)'},{opacity:1,transform:'none'}],{duration:560,delay:index*55,easing:'cubic-bezier(.16,1,.3,1)'}));
  }
  function renderScoreboard() {
    const table=scores();
    $('score-tab').textContent=`Bảng điểm ${state.teams.length} nhóm`;
    $('score-title').textContent=`Bảng điểm ${state.teams.length} nhóm`;
    $('standings').setAttribute('aria-label',`Điểm và thứ hạng ${state.teams.length} nhóm`);
    const standings=$('standings');standings.replaceChildren();
    [...table].sort((a,b)=>b.points-a.points||a.index-b.index).forEach(team=>{
      const rank=table.filter(other=>other.points>team.points).length+1;
      const card=node('article',undefined,'standing'+(team.index===state.currentTeam?' active':''));
      card.dataset.teamIndex=team.index;
      card.append(node('span',`Hạng ${rank}`,'rank'),node('h3',team.name),node('strong',String(team.points),'points'),node('span',`${team.correct} câu đúng`,'record-count'));
      const selectTeam=node('button',team.index===state.currentTeam?'Nhóm đang trả lời':'Chọn nhóm trả lời');
      selectTeam.dataset.selectTeam=team.index;
      selectTeam.setAttribute('aria-label',`Chọn ${team.name} trả lời`);
      selectTeam.onclick=()=>{state.currentTeam=team.index;save();renderBoard();setTab('game');};
      card.append(selectTeam);standings.append(card);
    });
    const history=$('score-history');history.replaceChildren();
    let total=0;let count=0;let retiredCount=0;
    for(const question of QUESTIONS) {
      const record=state.records[question.id];
      if(!record?.result)continue;
      const row=node('tr');
      row.append(node('td',question.name),node('td',record.retiredTeam||state.teams[record.team]),node('td',record.result.status==='correct'?'Trả lời đúng':'Đã mở lời giải'),node('td',String(record.result.points)));
      history.append(row);if(record.retiredTeam)retiredCount++;else total+=record.result.points;count++;
    }
    if(!count){const row=node('tr');const cell=node('td','Điểm sẽ xuất hiện sau khi hoàn thành câu hỏi đầu tiên.');cell.colSpan=4;row.append(cell);history.append(row);}
    $('score-summary').textContent=`${count} câu đã hoàn thành, tổng ${total} điểm của 8 nhóm.${retiredCount?` Có ${retiredCount} câu của nhóm cũ được lưu trong lịch sử.`:''} Mỗi câu chỉ ghi điểm một lần.`;
  }
  function tone(correct) {
    if (!state.sound) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      audioContext.resume();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.connect(gain); gain.connect(audioContext.destination);
      const now = audioContext.currentTime;
      oscillator.frequency.setValueAtTime(correct ? 660 : 220,now);
      oscillator.frequency.setValueAtTime(correct ? 880 : 170,now+.12);
      gain.gain.setValueAtTime(.045,now);
      gain.gain.exponentialRampToValueAtTime(.001,now+.28);
      oscillator.start(now); oscillator.stop(now+.3);
    } catch { /* Visual feedback remains available. */ }
  }
  let inspectedProvince=null;
  let mapZoom=1;
  function inspectProvince(question) {
    const changed=inspectedProvince!==question.id;
    inspectedProvince=question.id;
    document.querySelector('.map-info').dataset.region=question.region;
    const result=state.records[question.id]?.result;
    document.querySelectorAll('#board .province').forEach(region=>region.classList.toggle('is-selected',region.dataset.province===question.id));
    $('map-number').textContent=String(QUESTIONS.indexOf(question)+1).padStart(2,'0');
    $('map-name').textContent=question.name;
    $('map-type').textContent=question.type;
    $('map-state').textContent=result?`Đã hoàn thành · ${result.points} điểm · Đã khóa`:'Sẵn sàng · Tối đa 10 điểm';
    $('map-open').disabled=!!result;
    $('map-open').textContent=result?'Địa phương đã khóa':'Mở câu hỏi';
    $('map-select').value=question.id;
    if(changed)animateElement($('map-name'),[{opacity:.3,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,easing:'cubic-bezier(.16,1,.3,1)'});
  }
  $('map-select').onchange=event=>{
    const question=QUESTIONS.find(q=>q.id===event.target.value);
    if(question)inspectProvince(question);
  };
  $('map-open').onclick=()=>{
    const question=QUESTIONS.find(q=>q.id===inspectedProvince);
    if(question)openQuestion(question,document.querySelector(`[data-province="${question.id}"]`));
  };
  function zoomMap(value) {
    mapZoom=Math.max(1,Math.min(3,value));
    const viewport=$('map-viewport');
    const svg=$('vietnam-map');
    svg.style.width=`${mapZoom*100}%`;svg.style.height=`${mapZoom*100}%`;
    $('map-zoom-level').textContent=`${Math.round(mapZoom*100)}%`;
    $('map-zoom-out').disabled=mapZoom===1;$('map-zoom-in').disabled=mapZoom===3;
    if(mapZoom===1){viewport.scrollLeft=0;viewport.scrollTop=0;}
  }
  $('map-zoom-in').onclick=()=>zoomMap(mapZoom+.5);
  $('map-zoom-out').onclick=()=>zoomMap(mapZoom-.5);
  $('map-reset').onclick=()=>zoomMap(1);
  zoomMap(1);
  function renderBoard() {
    const completed = Object.values(state.records).filter(r => r.result).length;
    $('counter').textContent = `${completed} / 34 hoàn thành`;
    $('progress-fill').style.width = `${completed/34*100}%`;
    document.querySelector('[role="progressbar"]').setAttribute('aria-valuenow',completed);
    const scoreArea = $('scores');scoreArea.replaceChildren();
    const label=node('label',undefined,'answer-team-label');
    const select=node('select');select.id='answer-team';
    state.teams.forEach((name,index)=>{const option=node('option',name);option.value=index;select.append(option);});
    select.value=state.currentTeam;
    select.onchange=()=>{state.currentTeam=Number(select.value);save();renderBoard();};
    label.append(node('span','Chọn nhóm trả lời trước khi mở địa phương'),select,node('strong',`${scores()[state.currentTeam].points} điểm`,'current-points'));
    const viewScores=node('button',`Xem bảng điểm ${state.teams.length} nhóm`);viewScores.onclick=()=>setTab('score',true);
    scoreArea.append(label,viewScores);
    const search = normalize($('search').value);
    const region = $('region').value;
    const filter = $('status-filter').value;
    const shown = QUESTIONS.filter(q => normalize(q.name).includes(search) && (region === 'all' || q.region === region) && (filter === 'all' || (filter === 'done') === !!state.records[q.id]?.result));
    const board = $('board'); board.replaceChildren();
    const svgNode = (tag, attributes = {}) => {
      const element = document.createElementNS('http://www.w3.org/2000/svg',tag);
      for (const [key,value] of Object.entries(attributes)) element.setAttribute(key,value);
      return element;
    };
    const matching = new Set(shown.map(q=>q.id));
    const quickSelect=$('map-select');quickSelect.replaceChildren(node('option','Chọn một địa phương…'));
    quickSelect.firstChild.value='';
    QUESTIONS.forEach((q,index) => {
      const geometry=MAP_REGIONS.find(region=>region.id===q.id);
      const result=state.records[q.id]?.result;
      const matches=matching.has(q.id);
      const card=svgNode('g',{
        class:'province'+(result?' done':'')+(!matches?' is-filtered':''),
        'data-province':q.id,'data-region':q.region,role:'button',
        tabindex:matches?'0':'-1','aria-disabled':String(!!result||!matches),
        'aria-label':`${q.name}, ${q.type}${result?', đã hoàn thành và khóa':''}`,
      });
      const title=svgNode('title');title.textContent=`${q.name} · ${result?'Đã hoàn thành':q.type}`;
      card.append(title,svgNode('path',{d:geometry.path,'fill-rule':'evenodd'}));
      if(geometry.offshore)card.append(svgNode('path',{d:geometry.offshore,'fill-rule':'evenodd',class:'offshore-islands'}));
      card.append(svgNode('circle',{cx:geometry.x,cy:geometry.y,r:8,class:'map-dot'}));
      const number=svgNode('text',{x:geometry.x,y:geometry.y});number.textContent=index+1;card.append(number);
      if(animateBoardEntrance&&!result){
        card.classList.add('is-entering');
        card.style.setProperty('--entry-delay',`${Math.min(index*22,550)}ms`);
        card.addEventListener('animationend',()=>card.classList.remove('is-entering'),{once:true});
      }
      const inspect=()=>inspectProvince(q);
      card.onpointerenter=inspect;card.onfocus=inspect;
      card.onclick=()=>{if(matches&&!result)openQuestion(q,card);};
      card.onkeydown=event=>{
        if(event.key==='Enter'||event.key===' '){event.preventDefault();if(matches&&!result)openQuestion(q,card);}
      };
      board.append(card);
      if(matches){
        const option=node('option',`${index+1}. ${q.name}${result?' · Đã khóa':''}`);
        option.value=q.id;quickSelect.append(option);
      }
    });
    animateBoardEntrance=false;
    $('map-matches').textContent=shown.length?`${shown.length} địa phương phù hợp bộ lọc`:'Chưa có địa phương phù hợp bộ lọc.';
    const selected=shown.find(q=>q.id===inspectedProvince);
    if(selected)inspectProvince(selected);
    else {
      inspectedProvince=null;
      delete document.querySelector('.map-info').dataset.region;
      $('map-number').textContent='34';$('map-name').textContent='Di chuột trên bản đồ';
      $('map-type').textContent='Mỗi tỉnh, thành là một thử thách riêng.';
      $('map-state').textContent='Rê chuột để xem · Bấm để chơi';$('map-open').disabled=true;
      $('map-open').textContent='Mở câu hỏi';
    }
    $('sound-toggle').textContent = state.sound ? 'Âm hiệu bật' : 'Âm hiệu tắt';
    $('sound-toggle').setAttribute('aria-pressed',!!state.sound);
    renderScoreboard();
  }
  function refreshQuestion() {
    const q = activeQuestion;
    $('question-dialog').dataset.kind=q.kind;
    const record = getRecord(q);
    const done = !!record.result;
    $('question-type').textContent=q.type;
    $('question-title').textContent=q.name;
    $('question-meta').textContent=`${state.teams[record.team]} · ${record.attempts} lần kiểm tra chưa đúng · ${done ? 'Lượt đã hoàn thành' : 'Tối đa 10 điểm'}`;
    $('prompt').textContent=q.prompt;
    $('quiz-area').replaceChildren();
    $('quiz-area').disabled=done;
    $('check').hidden=done;
    $('reveal').hidden=done;
    renderQuestion(q);
    if (done) showResult(record);
  }
  function openQuestion(q,card) {
    if(state.records[q.id]?.result)return;
    activeQuestion=q; lastCard=card;
    const record=getRecord(q);
    if (record.team === undefined) record.team=state.currentTeam;
    memoryFlips=[]; clearTimeout(memoryTimer);
    $('feedback').replaceChildren();
    refreshQuestion(); save();
    showDialog('question-dialog');
    $('question-close').focus();
  }
  function closeQuestion() {
    clearTimeout(memoryTimer); memoryFlips=[];
    $('question-dialog').close();
    $('question-dialog').querySelector('.celebration')?.remove();
    renderBoard();
    if(completedProvince){
      const completedCard=document.querySelector(`[data-province="${completedProvince}"]`);
      if(completedCard&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
        completedCard.classList.add('is-completing');
        completedCard.addEventListener('animationend',()=>completedCard.classList.remove('is-completing'),{once:true});
      }
      completedProvince=null;
    }
    const card=document.querySelector(`[data-province="${activeQuestion?.id}"]`);
    const focusTarget=card&&card.getAttribute('aria-disabled')==='false'?card:document.querySelector('.province[aria-disabled="false"]')||$('finish-open');
    focusTarget.focus();
    activeQuestion=null;
  }
  const area=()=>$('quiz-area');
  function quote(text) { area().append(node('p',text,'quotation')); }
  function choices(label,options,key,multiple=false,limit=1) {
    const fieldset=node('fieldset',undefined,'choice-set');
    if(label) fieldset.append(node('legend',label));
    const group=node('div',undefined,'options');
    options.forEach((value,index) => {
      const button=node('button',value,'option'); button.type='button'; button.dataset.answerIndex=index; button.dataset.answerKey=key;
      const selected = currentDraft(key,multiple ? [] : null);
      button.setAttribute('aria-pressed',multiple ? Array.isArray(selected) && selected.includes(index) : selected === index);
      button.onclick=()=>{
        if(multiple) {
          const selected=currentDraft(key,[]);
          const next=Array.isArray(selected)?[...selected]:[];
          const position=next.indexOf(index);
          if(position>=0) next.splice(position,1);
          else if(next.length<limit) next.push(index);
          else {message(`Chọn đúng ${limit} phương án. Bỏ một lựa chọn để đổi đáp án.`);return;}
          setDraft(key,next);
        } else setDraft(key,index);
        for(const item of group.children) {
          const current=currentDraft(key,multiple?[]:null);
          item.setAttribute('aria-pressed',multiple ? current.includes(Number(item.dataset.answerIndex)) : current === Number(item.dataset.answerIndex));
        }
      };
      group.append(button);
    });
    fieldset.append(group); area().append(fieldset);
  }
  function input(label,key,{placeholder='',number=false,length,uppercase=false}={}) {
    const field=node('label',undefined,'field'); field.append(node('span',label));
    const element=node('input'); element.type=number?'number':'text'; element.value=currentDraft(key); element.placeholder=placeholder; element.autocomplete='off'; element.dataset.field=key;
    if(number){element.min='0';element.step='1';}
    if(length) element.maxLength=length;
    if(uppercase) element.style.textTransform='uppercase';
    element.oninput=()=>{setDraft(key,element.value);if(activeQuestion.kind==='budget') updateBudget();};
    field.append(element); area().append(field); return element;
  }
  function select(label,options,key,parent=area()) {
    const field=node('label',undefined,'field');field.append(node('span',label));
    const element=node('select');element.dataset.field=key;
    const empty=node('option','Chọn đáp án');empty.value='';element.append(empty);
    for(const option of options){const item=node('option',option);item.value=option;element.append(item);}
    element.value=currentDraft(key);element.onchange=()=>setDraft(key,element.value);
    field.append(element);parent.append(field);return element;
  }
  function rowSelects(rows,options,key) {
    const list=node('div',undefined,'rows');
    rows.forEach((row,index)=>select(row,options,`${key}-${index}`,list));area().append(list);
  }
  function tokens(q,key,letters=false) {
    const strip=node('div',undefined,'answer-strip');strip.setAttribute('aria-label','Đáp án đã ghép');
    const bank=node('div',undefined,'tokens');
    const chosen=currentDraft(key,[]);
    if(!Array.isArray(chosen)||!chosen.length) strip.append(node('span','Bấm các mảnh bên dưới theo thứ tự','placeholder'));
    (Array.isArray(chosen)?chosen:[]).forEach((index,position)=>{
      const piece=node('button',q.tokens[index],'token');piece.type='button';piece.setAttribute('aria-label',`Bỏ ${q.tokens[index]} ở vị trí ${position+1}`);
      piece.onclick=()=>{const next=[...currentDraft(key,[])];next.splice(position,1);setDraft(key,next);refreshQuestion();};strip.append(piece);
    });
    q.tokens.forEach((value,index)=>{
      const piece=node('button',value,'token');piece.type='button';piece.disabled=Array.isArray(chosen)&&chosen.includes(index);piece.dataset.tokenIndex=index;
      piece.onclick=()=>{setDraft(key,[...currentDraft(key,[]),index]);refreshQuestion();};bank.append(piece);
    });
    area().append(strip,bank);
    const clear=node('button','Ghép lại','quiet small');clear.type='button';clear.style.marginTop='14px';clear.onclick=()=>{setDraft(key,[]);refreshQuestion();};area().append(clear);
    return ()=>{const order=currentDraft(key,[]);return {complete:Array.isArray(order)&&order.length===q.tokens.length,correct:letters?normalize(order.map(i=>q.tokens[i]).join(''))===normalize(q.answer):equal(order,q.answer)};};
  }
  function order(q,key) {
    let items=currentDraft(key,null);
    if(!Array.isArray(items)||items.length!==q.items.length||new Set(items).size!==q.items.length){items=q.items.map((_,i)=>i);setDraft(key,items);}
    const list=node('ol',undefined,'order-list');
    items.forEach((index,position)=>{
      const li=node('li');li.append(node('strong',String(position+1)),node('span',q.items[index]));
      const buttons=node('div',undefined,'order-buttons');
      for(const [delta,arrow,label] of [[-1,'↑','Lên'],[1,'↓','Xuống']]) {
        const b=node('button',arrow);b.type='button';b.disabled=position+delta<0||position+delta>=items.length;b.setAttribute('aria-label',`${label} ${q.items[index]}`);b.dataset.move=delta;b.dataset.item=index;
        b.onclick=()=>{const next=[...currentDraft(key,[])];[next[position],next[position+delta]]=[next[position+delta],next[position]];setDraft(key,next);refreshQuestion();};buttons.append(b);
      }
      li.append(buttons);list.append(li);
    });
    area().append(list);return ()=>({complete:true,correct:equal(currentDraft(key,[]),q.answer)});
  }
  function memory(q) {
    const deck=q.pairs.flatMap((pair,index)=>pair.map((text,side)=>({text,pair:index,side})));
    let order=currentDraft('deck',null);
    if(!Array.isArray(order)||order.length!==deck.length){order=deck.map((_,i)=>i).sort(()=>Math.random()-.5);setDraft('deck',order);}
    const matched=currentDraft('matched',[]);
    const grid=node('div',undefined,'memory-grid');
    order.forEach(index=>{
      const data=deck[index];const isMatched=matched.includes(data.pair);const flipped=memoryFlips.includes(index)||isMatched;
      const b=node('button',flipped?data.text:'Lật thẻ','memory-card'+(isMatched?' matched':flipped?' flipped':''));b.type='button';b.dataset.memoryIndex=index;
      b.setAttribute('aria-label',flipped?data.text:`Lật thẻ ${order.indexOf(index)+1}`);b.disabled=isMatched;
      b.onclick=()=>{
        if(memoryFlips.length>=2||memoryFlips.includes(index)) return;
        memoryFlips.push(index);
        if(memoryFlips.length===2) {
          const [a,b]=memoryFlips.map(i=>deck[i]);
          if(a.pair===b.pair) {setDraft('matched',[...currentDraft('matched',[]),a.pair]);memoryFlips=[];}
          else {const id=q.id;memoryTimer=setTimeout(()=>{if(activeQuestion?.id!==id)return;memoryFlips=[];refreshQuestion();},850);}
        }
        refreshQuestion();
      };
      grid.append(b);
    });area().append(grid);
    area().append(node('p',`${matched.length} / ${q.pairs.length} cặp đã nối`,'muted'));
    return ()=>({complete:currentDraft('matched',[]).length===q.pairs.length,correct:currentDraft('matched',[]).length===q.pairs.length});
  }
  function wordsearch(q) {
    const selected=currentDraft('cells',[]);const grid=node('div',undefined,'word-grid');
    q.grid.join('').split('').forEach((letter,index)=>{
      const b=node('button',letter,selected.includes(index)?'selected':'');b.type='button';b.dataset.cell=index;b.setAttribute('aria-label',`Hàng ${Math.floor(index/7)+1}, cột ${index%7+1}, chữ ${letter}`);
      b.onclick=()=>{let cells=[...currentDraft('cells',[])];if(cells.includes(index)) cells=cells.slice(0,cells.indexOf(index));else cells.push(index);setDraft('cells',cells);refreshQuestion();};grid.append(b);
    });area().append(grid);
    const selectedText=selected.map(i=>q.grid.join('')[i]).join('');area().append(node('p',selectedText||'Bấm chữ đầu tiên của tên cần tìm.','counter'));
    const clear=node('button','Chọn lại','quiet small');clear.type='button';clear.onclick=()=>{setDraft('cells',[]);refreshQuestion();};area().append(clear);
    return ()=>{const cells=currentDraft('cells',[]);return {complete:cells.length===q.answer.length,correct:cells.map(i=>q.grid.join('')[i]).join('')===q.answer&&cells.every((value,index)=>index===0||(value===cells[index-1]+1&&Math.floor(value/7)===Math.floor(cells[index-1]/7)))};};
  }
  function crossword(q) {
    const cells=new Map();
    q.across.split('').forEach((letter,index)=>cells.set(`3-${index+1}`,letter));
    q.down.split('').forEach((letter,index)=>cells.set(`${index}-3`,letter));
    const grid=node('div',undefined,'cross-grid');
    for(let row=0;row<9;row++)for(let col=0;col<7;col++){
      const cell=`${row}-${col}`;
      if(!cells.has(cell)){grid.append(node('span'));continue;}
      const field=node('input');field.maxLength=1;field.autocomplete='off';field.dataset.cross=cell;field.setAttribute('aria-label',`Ô chữ hàng ${row+1} cột ${col+1}`);field.value=currentDraft(`cross-${cell}`);field.oninput=()=>setDraft(`cross-${cell}`,field.value);if(cell==='3-3')field.className='shared';grid.append(field);
    }
    area().append(grid);
    return ()=>({complete:[...cells.keys()].every(cell=>normalize(currentDraft(`cross-${cell}`)).length===1),correct:[...cells].every(([cell,letter])=>normalize(currentDraft(`cross-${cell}`))===letter)});
  }
  function steps(q,progressive) {
    for(let index=0;index<q.steps.length;index++){
      if(progressive&&index>0&&currentDraft(`step-${index-1}`,null)===null)break;
      const wrapper=node('div',undefined,'step-block');area().append(wrapper);
      choices(`${index+1}. ${q.steps[index].label}`,q.steps[index].options,`step-${index}`);
    }
    // Progressive challenges expose the next step after selecting and pressing Continue.
    if(progressive){const next=node('button','Mở bước tiếp theo','quiet');next.type='button';next.onclick=()=>refreshQuestion();area().append(next);}
    return ()=>({complete:q.steps.every((_,i)=>currentDraft(`step-${i}`,null)!==null),correct:q.steps.every((step,i)=>currentDraft(`step-${i}`,null)===step.answer)});
  }
  function pin(q) {
    const group=node('div',undefined,'pin');
    q.answer.split('').forEach((_,index)=>{
      const field=node('input');field.maxLength=1;field.inputMode='numeric';field.autocomplete='off';field.dataset.pin=index;field.setAttribute('aria-label',`Chữ số thứ ${index+1}`);field.value=currentDraft(`pin-${index}`);
      field.oninput=()=>{field.value=field.value.replace(/\D/g,'').slice(0,1);setDraft(`pin-${index}`,field.value);if(field.value&&index<3)group.children[index+1].focus();};
      field.onpaste=event=>{const digits=event.clipboardData.getData('text').replace(/\D/g,'');if(digits.length>1){event.preventDefault();for(let i=index;i<4;i++){const value=digits[i-index]||'';group.children[i].value=value;setDraft(`pin-${i}`,value);}group.children[Math.min(index+digits.length-1,3)].focus();}};
      group.append(field);
    });area().append(group);
    return ()=>{const value=q.answer.split('').map((_,i)=>currentDraft(`pin-${i}`)).join('');return {complete:value.length===q.answer.length,correct:value===q.answer};};
  }
  function updateBudget() {
    const total=activeQuestion.labels.reduce((sum,_,index)=>sum+(Number(currentDraft(`amount-${index}`))||0),0);
    $('budget-total').textContent=`Đã phân bổ ${total} / ${activeQuestion.total} đơn vị`;
  }
  function buckets(q) {
    const selected=currentDraft('bucket',0);const targets=node('div',undefined,'bucket-buttons');
    q.groups.forEach((name,index)=>{const b=node('button',`Chọn nhóm ${name}`,index===selected?'active':'');b.type='button';b.dataset.bucket=index;b.onclick=()=>{setDraft('bucket',index);refreshQuestion();};targets.append(b);});area().append(targets);
    const unsorted=node('div',undefined,'bucket-zone');unsorted.append(node('h3','Thẻ chưa phân nhóm'));
    const zones=q.groups.map(name=>{const z=node('div',undefined,'bucket-zone');z.append(node('h3',name));return z;});
    q.tokens.forEach((name,index)=>{const value=currentDraft(`bucket-${index}`,null);const b=node('button',name);b.type='button';b.dataset.bucketToken=index;b.onclick=()=>{setDraft(`bucket-${index}`,currentDraft('bucket',0));refreshQuestion();};(value===null?unsorted:zones[value]).append(b);});
    area().append(unsorted,...zones);
    return ()=>({complete:q.tokens.every((_,index)=>currentDraft(`bucket-${index}`,null)!==null),correct:q.answer.every((value,index)=>currentDraft(`bucket-${index}`,null)===value)});
  }
  function renderQuestion(q) {
    const answerArray=(count,key='choices')=>{const value=currentDraft(key,[]);return {complete:Array.isArray(value)&&value.length===count,correct:Array.isArray(value)&&equal([...value].sort((a,b)=>a-b),[...q.answer].sort((a,b)=>a-b))};};
    const selectedRows=(rows,answers,key='row')=>({complete:rows.every((_,index)=>currentDraft(`${key}-${index}`)!==''),correct:answers.every((value,index)=>currentDraft(`${key}-${index}`)===value)});
    switch(q.kind){
      case 'binary': case 'odd':
        choices('Chọn một đáp án',q.options,'choice');evaluation=()=>({complete:currentDraft('choice',null)!==null,correct:currentDraft('choice',null)===q.answer});break;
      case 'letters':evaluation=tokens(q,'tokens',true);break;
      case 'sentence':evaluation=tokens(q,'tokens');break;
      case 'double':case 'triple':
        choices(`Chọn đúng ${q.answer.length} phương án`,q.options,'choices',true,q.answer.length);evaluation=()=>answerArray(q.answer.length);break;
      case 'cloze':case 'correction':
        quote(q.sentence);select(q.kind==='cloze'?'Nội dung còn thiếu':'Nội dung thay thế phần đánh dấu',q.options,'value');evaluation=()=>({complete:currentDraft('value')!=='',correct:currentDraft('value')===q.answer});break;
      case 'matching':case 'truth-matrix':case 'classification':case 'fact-inference':
        rowSelects(q.rows,q.options,'row');evaluation=()=>selectedRows(q.rows,q.answer);break;
      case 'vowels':
        quote('B _ C   K _ N');input('Nguyên âm thứ nhất','vowel-0',{length:1,uppercase:true});input('Nguyên âm thứ hai','vowel-1',{length:1,uppercase:true});evaluation=()=>({complete:q.answer.every((_,i)=>currentDraft(`vowel-${i}`)!==''),correct:q.answer.every((value,i)=>normalize(currentDraft(`vowel-${i}`))===normalize(value))});break;
      case 'equation':
        q.labels.forEach((label,i)=>input(label,`n-${i}`,{number:true}));evaluation=()=>({complete:q.labels.every((_,i)=>currentDraft(`n-${i}`)!==''),correct:q.answer.every((value,i)=>Number(currentDraft(`n-${i}`))===value)});break;
      case 'memory':evaluation=memory(q);break;
      case 'number':
        input(q.inputLabel||'Số đơn vị giảm','number',{number:true});evaluation=()=>({complete:currentDraft('number')!=='',correct:Number(currentDraft('number'))===q.answer});break;
      case 'slider': {
        const output=node('output',String(currentDraft('range',17)),'range-output');output.id='range-output';output.htmlFor='answer-range';
        const range=node('input');range.type='range';range.min=q.min;range.max=q.max;range.step=1;range.value=currentDraft('range',17);range.id='answer-range';range.className='range';range.setAttribute('aria-label',q.rangeLabel||'Số tỉnh thành giữ nguyên');range.oninput=()=>{setDraft('range',Number(range.value));output.textContent=range.value;};area().append(output,range);evaluation=()=>({complete:true,correct:Number(currentDraft('range',17))===q.answer});break;
      }
      case 'wordsearch':evaluation=wordsearch(q);break;
      case 'decision':evaluation=steps(q,false);break;
      case 'rapid':evaluation=steps(q,true);break;
      case 'policy-order':case 'timeline':evaluation=order(q,'order');break;
      case 'evidence':case 'two-claims':
        choices(q.kind==='evidence'?'Nguồn kiểm chứng':'Người nói đúng',q.options,'choice');choices('Lý do',q.reasons,'reason');evaluation=()=>({complete:currentDraft('choice',null)!==null&&currentDraft('reason',null)!==null,correct:currentDraft('choice',null)===q.answer[0]&&currentDraft('reason',null)===q.answer[1]});break;
      case 'connect':
        choices('Hai địa phương đầu vào',q.options,'choices',true,2);select('Nối đến địa phương sau hợp nhất',q.targets,'target');evaluation=()=>({complete:currentDraft('choices',[]).length===2&&currentDraft('target')!=='',correct:equal([...currentDraft('choices',[])].sort((a,b)=>a-b),q.answer[0])&&currentDraft('target')===q.answer[1]});break;
      case 'crossword':evaluation=crossword(q);break;
      case 'hints': {
        const count=currentDraft('hint-count',0);q.hints.slice(0,count).forEach(text=>area().append(node('p',text,'hint')));
        const hint=node('button',count<q.hints.length?'Mở thêm gợi ý':'Đã mở hết gợi ý','quiet');hint.type='button';hint.disabled=count>=q.hints.length;hint.onclick=()=>{setDraft('hint-count',count+1);refreshQuestion();};area().append(hint);
        input('Tên tỉnh cần tìm','guess',{placeholder:'Có thể nhập không dấu'});evaluation=()=>({complete:normalize(currentDraft('guess')).length>0,correct:normalize(currentDraft('guess'))===normalize(q.answer)});break;
      }
      case 'budget':
        q.labels.forEach((label,i)=>input(label,`amount-${i}`,{number:true}));area().append(node('p','','budget-total'));area().lastChild.id='budget-total';updateBudget();evaluation=()=>{const amounts=q.labels.map((_,i)=>Number(currentDraft(`amount-${i}`)));return {complete:q.labels.every((_,i)=>currentDraft(`amount-${i}`)!==''),correct:amounts.every((amount,i)=>Number.isInteger(amount)&&amount>=q.minimums[i])&&amounts.reduce((sum,n)=>sum+n,0)===q.total};};break;
      case 'assembly':case 'reading':case 'argument':
        if(q.passage)quote(q.passage);q.fields.forEach((field,i)=>select(field.label,field.options,`field-${i}`));evaluation=()=>selectedRows(q.fields,q.answer,'field');break;
      case 'pin':evaluation=pin(q);break;
      case 'buckets':evaluation=buckets(q);break;
      case 'binary-lock':
        q.rows.forEach((text,i)=>select(text,['0','1'],`bit-${i}`));evaluation=()=>({complete:q.rows.every((_,i)=>currentDraft(`bit-${i}`)!==''),correct:q.rows.map((_,i)=>currentDraft(`bit-${i}`)).join('')===q.answer});break;
      default:throw new Error(`Unknown question type ${q.kind}`);
    }
  }
  function message(text) {
    const box=node('div',undefined,'feedback');box.append(node('p',text));$('feedback').replaceChildren(box);
    animateElement(box,[{transform:'translateX(0)'},{transform:'translateX(-12px)'},{transform:'translateX(10px)'},{transform:'translateX(-6px)'},{transform:'translateX(0)'}],{duration:380,easing:'ease-out'});
  }
  function showResult(record) {
    const q=activeQuestion;const result=record.result;const success=result.status==='correct';
    const box=node('div',undefined,'feedback'+(success?' success':''));
    box.append(node('h3',success?`Chính xác · +${result.points} điểm cho ${state.teams[record.team]}`:'Đã mở lời giải · 0 điểm'),node('p',q.explanation),node('p',q.lesson,'lesson'));
    const a=node('a',q.sourceLabel||'Xem nguồn phương án sắp xếp');a.href=q.sourceUrl||FACT_SOURCE;a.target='_blank';a.rel='noopener';box.append(a);
    if(q.slide)box.append(node('p',`Nối vào bài thuyết trình · Slide ${q.slide}`,'lesson'));
    if (['decision','policy-order','classification','budget','fact-inference','argument'].includes(q.kind)) {
      const policy=node('a',' · Tư liệu về phân cấp và thực thi');policy.href=POLICY_SOURCE;policy.target='_blank';policy.rel='noopener';box.append(policy);
    }
    if (q.kind==='timeline') {
      const report=node('a',' · Tư liệu VTV ngày 23/08/2025');report.href='https://vtv.vn/video/can-day-manh-phan-cap-cho-can-bo-108674902.htm';report.target='_blank';report.rel='noopener';box.append(report);
    }
    $('feedback').replaceChildren(box);
  }
  function finishRound(correct) {
    const record=getRecord(activeQuestion);
    if(record.result)return;
    const points=correct?(record.attempts===0?10:record.attempts===1?7:5):0;
    record.result={status:correct?'correct':'revealed',points};
    completedProvince=activeQuestion.id;
    state.currentTeam=(record.team+1)%state.teams.length;save();refreshQuestion();renderBoard();tone(correct);
    animateElement($('feedback').firstElementChild,[{opacity:0,transform:'translateY(25px) scale(.94)'},{opacity:1,transform:'none'}],{duration:500,easing:'cubic-bezier(.16,1,.3,1)'});
    if(correct)celebrate($('question-dialog'),points);
  }
  $('quiz-form').onsubmit=event=>{
    event.preventDefault();if(!activeQuestion||getRecord(activeQuestion).result)return;
    const result=evaluation();
    if(!result.complete){message('Hãy hoàn thành đủ các lựa chọn hoặc ô trả lời trước khi kiểm tra.');return;}
    if(result.correct){finishRound(true);return;}
    getRecord(activeQuestion).attempts++;save();
    $('question-meta').textContent=`${state.teams[getRecord(activeQuestion).team]} · ${getRecord(activeQuestion).attempts} lần kiểm tra chưa đúng · Tối đa ${getRecord(activeQuestion).attempts===1?7:5} điểm`;
    message('Chưa chính xác. Kiểm tra lại thông tin và thử thêm một lần.');tone(false);
  };
  $('reveal').onclick=()=>finishRound(false);
  $('question-close').onclick=closeQuestion;$('round-done').onclick=closeQuestion;
  $('question-dialog').addEventListener('cancel',event=>{event.preventDefault();closeQuestion();});
  ['search','region','status-filter'].forEach(id=>$(id).addEventListener(id==='search'?'input':'change',renderBoard));
  $('random').onclick=()=>{
    const candidates=QUESTIONS.filter(q=>!state.records[q.id]?.result);
    if(!candidates.length){openEnding();return;}
    const q=candidates[Math.floor(Math.random()*candidates.length)];openQuestion(q,document.querySelector(`[data-province="${q.id}"]`));
  };
  $('sound-toggle').onclick=()=>{state.sound=!state.sound;save();renderBoard();if(state.sound)tone(true);};
  $('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('notice').textContent='Bạn có thể dùng phím F11 để mở chế độ toàn màn hình.';}};
  function teamInputs() {
    const count=TEAM_COUNT;
    $('team-inputs').replaceChildren();
    for(let i=0;i<count;i++){
      const label=node('label',undefined,'field');label.append(node('span',`Nhóm thi thứ ${i+1}`));const field=node('input');field.readOnly=true;field.value=TEAM_NAMES[i];label.append(field);$('team-inputs').append(label);
    }
  }
  $('settings-open').onclick=()=>{$('team-count').value=TEAM_COUNT;$('team-inputs').replaceChildren();teamInputs();$('settings-message').textContent='';showDialog('settings-dialog');};
  $('team-count').onchange=teamInputs;
  $('score-team-settings').onclick=()=>$('settings-open').click();
  $('settings-close').onclick=()=>$('settings-dialog').close();
  $('settings-form').onsubmit=event=>{
    event.preventDefault();
    state.teams=[...TEAM_NAMES];state.currentTeam%=TEAM_COUNT;save();renderBoard();$('settings-dialog').close();
  };
  $('reset-open').onclick=()=>showDialog('reset-dialog');$('reset-cancel').onclick=()=>$('reset-dialog').close();
  $('reset-confirm').onclick=()=>{const teams=state.teams;const sound=state.sound;state={...blankState(),teams,sound};animateBoardEntrance=true;completedProvince=null;save();$('reset-dialog').close();$('settings-dialog').close();renderBoard();$('notice').textContent='Ván mới đã sẵn sàng.';};
  function openEnding() {
    const table=scores();const completed=Object.values(state.records).filter(r=>r.result).length;const best=Math.max(...table.map(team=>team.points));const leaders=table.filter(team=>team.points===best).map(team=>team.name).join(', ');
    $('game-summary').textContent=completed?`Đã hoàn thành ${completed} / 34 thử thách. ${leaders} ${table.filter(team=>team.points===best).length>1?'cùng có':'có'} ${best} điểm.`:'Có thể chuyển sang video recap hoặc quay lại chọn thử thách.';
    $('copy-message').textContent='';showDialog('ending-dialog');
    if(completed)celebrate($('ending-dialog'));
  }
  $('ending-dialog').addEventListener('close',()=>$('ending-dialog').querySelector('.celebration')?.remove());
  document.addEventListener('pointerdown',event=>{
    if(motionPreference.matches)return;
    const button=event.target.closest('button');
    if(!button||button.disabled)return;
    button.querySelector('.click-ripple')?.remove();
    const bounds=button.getBoundingClientRect();
    const ripple=node('span',undefined,'click-ripple');ripple.setAttribute('aria-hidden','true');
    const size=Math.max(bounds.width,bounds.height)*2;
    ripple.style.width=ripple.style.height=`${size}px`;
    ripple.style.left=`${event.clientX-bounds.left}px`;ripple.style.top=`${event.clientY-bounds.top}px`;
    ripple.addEventListener('animationend',()=>ripple.remove(),{once:true});
    ripple.addEventListener('animationcancel',()=>ripple.remove(),{once:true});
    button.append(ripple);
  });
  $('finish-open').onclick=openEnding;$('ending-close').onclick=()=>$('ending-dialog').close();$('back-to-game').onclick=()=>$('ending-dialog').close();
  $('copy-bridge').onclick=async()=>{try{await navigator.clipboard.writeText($('bridge-text').textContent);$('copy-message').textContent='Đã sao chép lời dẫn.';}catch{const selection=getSelection();const range=document.createRange();range.selectNodeContents($('bridge-text'));selection.removeAllRanges();selection.addRange(range);$('copy-message').textContent='Lời dẫn đã được chọn. Nhấn Ctrl+C để sao chép.';}};
  for(const name of ['game','score']) {
    $(name+'-tab').onclick=()=>setTab(name);
    $(name+'-tab').onkeydown=event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();
      const next=event.key==='Home'?'game':event.key==='End'?'score':name==='game'?'score':'game';
      setTab(next,true);
    };
  }
  renderBoard();
  if(!storageAvailable)$('notice').textContent='Trình duyệt đang giữ tiến độ trong phiên chơi này.';
})();
