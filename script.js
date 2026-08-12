/* ---------- HERO text reveal ---------- */
window.addEventListener('load',()=>{
  const seq=[['hello',100],['heroTitle',500],['hashtags',900],['signpost',1000]];
  seq.forEach(([id,delay])=>{
    setTimeout(()=>{
      const el=document.getElementById(id);
      el.style.transition='opacity .8s ease, transform .8s ease';
      el.style.opacity='1';
    },delay);
  });
  buildDots();
  loadContent();
});

/* ---------- Content from content.json ---------- */
/* 四個區塊（我的工作 / 工作經歷 / 重要榮譽 / 能力認證）的文字都放在 content.json，
   之後只要編輯那個檔案即可，不需要動 HTML。
   注意：透過 fetch 讀取，需在伺服器或 GitHub Pages 上開啟；
   直接以 file:// 雙擊開啟時瀏覽器會擋下讀取，此時會顯示提示文字。 */
function escapeHTML(str){
  return String(str).replace(/[&<>"']/g,c=>(
    {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]
  ));
}
function renderSection(section,data){
  if(!data) return;
  const titleEl=section.querySelector('[data-role="title"]');
  const listEl=section.querySelector('[data-role="list"]');
  if(titleEl && data.title) titleEl.textContent=data.title;
  if(!listEl) return;
  const items=Array.isArray(data.items)?data.items:[];
  if(items.length===0){
    listEl.innerHTML='<p class="placeholder">（內容待補）</p>';
    return;
  }
  // My Jobs 的容器本身就是 <ul>；摺疊區塊則需自行建立 <ul>
  if(listEl.tagName==='UL'){
    listEl.innerHTML=items.map(it=>`<li>${escapeHTML(it)}</li>`).join('');
  }else{
    listEl.innerHTML='<ul>'+items.map(it=>`<li>${escapeHTML(it)}</li>`).join('')+'</ul>';
  }
}
function loadContent(){
  fetch('content.json')
    .then(res=>{if(!res.ok)throw new Error('HTTP '+res.status);return res.json();})
    .then(data=>{
      document.querySelectorAll('[data-content]').forEach(section=>{
        renderSection(section,data[section.dataset.content]);
      });
    })
    .catch(err=>{
      console.error('無法載入 content.json：',err);
      document.querySelectorAll('[data-content] [data-role="list"]').forEach(el=>{
        el.innerHTML='<p class="placeholder">（無法載入 content.json，請在伺服器或 GitHub Pages 上開啟）</p>';
      });
    });
}

/* ---------- Skill dots ---------- */
/* NOTE: 使用者稍後會提供正式技能清單與 icon，此處先用內文五種身份作為佔位。 */
const skills=[
  {label:'資料整理',   icon:'', size:5},
  {label:'系統思考', icon:'', size:10},
  {label:'程式設計', icon:'', size:20},
  {label:'自主學習', icon:'', size:30},
  {label:'溝通表達', icon:'', size:20},
  {label:'專案管理',   icon:'', size:10},
  {label:'組織領導',   icon:'', size:5},
];
function buildDots(){
  const row=document.getElementById('dotsRow');
  skills.forEach(s=>{
    const d=document.createElement('div');
    d.className='dot';
    d.style.width=s.size+'px';
    d.style.height=s.size+'px';
    d.innerHTML=`<span class="icon">${s.icon}</span><span class="label">${s.label}</span>`;
    row.appendChild(d);
  });
}

/* ---------- Meteor shower (top-right -> bottom-left) ---------- */
const canvas=document.getElementById('meteor-canvas');
const ctx=canvas.getContext('2d');
let W,H,meteors=[];
function resize(){W=canvas.width=canvas.offsetWidth;H=canvas.height=canvas.offsetHeight;}
resize();window.addEventListener('resize',resize);
function spawn(){
  meteors.push({
    x:W*(0.5+Math.random()*0.6),
    y:-20-Math.random()*80,
    len:60+Math.random()*80,
    speed:4+Math.random()*4,
    alpha:0.5+Math.random()*0.5
  });
}
function drawMeteors(){
  ctx.clearRect(0,0,W,H);
  for(let i=meteors.length-1;i>=0;i--){
    const m=meteors[i];
    // direction: down-left (dx negative, dy positive)
    const dx=-1,dy=1;
    const tailX=m.x-dx*m.len, tailY=m.y-dy*m.len;
    const grad=ctx.createLinearGradient(m.x,m.y,tailX,tailY);
    grad.addColorStop(0,`rgba(160,160,160,${m.alpha})`);
    grad.addColorStop(1,'rgba(160,160,160,0)');
    ctx.strokeStyle=grad;ctx.lineWidth=1.6;
    ctx.beginPath();ctx.moveTo(m.x,m.y);ctx.lineTo(tailX,tailY);ctx.stroke();
    m.x+=dx*m.speed;m.y+=dy*m.speed;
    if(m.x<-100||m.y>H+100)meteors.splice(i,1);
  }
  requestAnimationFrame(drawMeteors);
}
drawMeteors();
setInterval(()=>{if(meteors.length<14&&Math.random()<0.7)spawn();},420);

/* ---------- Rotating typing label (delete + retype) with glow ---------- */
const roles=['科學人','音樂人','登山者','資訊人','童軍','議題關注者'];
const rotEl=document.getElementById('rotating');
let rIdx=0,cIdx=0,deleting=false;
function typeLoop(){
  const word=roles[rIdx];
  if(!deleting){
    cIdx++;
    rotEl.textContent=word.slice(0,cIdx);
    if(cIdx===word.length){deleting=true;return setTimeout(typeLoop,1500);}
    setTimeout(typeLoop,160);
  }else{
    cIdx--;
    rotEl.textContent=word.slice(0,cIdx);
    if(cIdx===0){deleting=false;rIdx=(rIdx+1)%roles.length;return setTimeout(typeLoop,300);}
    setTimeout(typeLoop,90);
  }
}
setTimeout(typeLoop,1000);

/* ---------- Accordions ---------- */
document.querySelectorAll('.acc-head').forEach(head=>{
  head.addEventListener('click',()=>{
    const item=head.closest('.acc-item');
    const body=head.nextElementSibling;
    const open=item.classList.contains('open');
    if(open){
      body.style.maxHeight='0';item.classList.remove('open');
    }else{
      item.classList.add('open');
      body.style.maxHeight=body.scrollHeight+'px';
    }
  });
});

/* ---------- Bridge dot animation on scroll ---------- */
const bridge=document.getElementById('bridgeDot');
const hero=document.getElementById('hero');
window.addEventListener('scroll',()=>{
  const rect=hero.getBoundingClientRect();
  const progress=Math.min(1,Math.max(0,-rect.top/(rect.height*0.6)));
  const scale=progress*14; // grows large enough to fill bridge into dark section
  bridge.style.transform=`translateX(-50%) scale(${scale})`;
},{passive:true});