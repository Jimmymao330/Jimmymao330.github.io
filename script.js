/* ---------- HERO text reveal ---------- */
function revealHero(){
  const seq=[['hello',100],['heroTitle',300],['hashtags',600],['signpost',800]];
  seq.forEach(([id,delay])=>{
    setTimeout(()=>{
      const el=document.getElementById(id);
      el.style.transition='opacity .8s ease, transform .8s ease';
      el.style.opacity='1';
    },delay);
  });
}
document.addEventListener('DOMContentLoaded',()=>{
  buildDots();
  loadContent();
  revealHero();
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


/* ---------- Meteor shower (top-right -> bottom-left) ---------- */
const canvas=document.getElementById('meteor-canvas');
const ctx=canvas.getContext('2d');
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let W,H,meteors=[];
let meteorRafId=null,spawnTimer=null,heroVisible=true,meteorsReady=false;

function resize(){W=canvas.width=canvas.offsetWidth;H=canvas.height=canvas.offsetHeight;}
resize();
let resizeRaf;
window.addEventListener('resize',()=>{cancelAnimationFrame(resizeRaf);resizeRaf=requestAnimationFrame(resize);});

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
  meteorRafId=requestAnimationFrame(drawMeteors);
}
function startMeteors(){
  if(meteorRafId!==null) return;
  spawnTimer=setInterval(()=>{if(meteors.length<14&&Math.random()<0.7)spawn();},420);
  meteorRafId=requestAnimationFrame(drawMeteors);
}
function stopMeteors(){
  if(meteorRafId!==null){cancelAnimationFrame(meteorRafId);meteorRafId=null;}
  clearInterval(spawnTimer);
}
function updateMeteors(){
  (meteorsReady && heroVisible && !document.hidden && !reduceMotion) ? startMeteors() : stopMeteors();
}
new IntersectionObserver(([entry])=>{heroVisible=entry.isIntersecting;updateMeteors();}).observe(canvas);
document.addEventListener('visibilitychange',updateMeteors);
window.addEventListener('load',()=>{meteorsReady=true;updateMeteors();});
drawMeteors();
setInterval(()=>{if(meteors.length<14&&Math.random()<0.7)spawn();},420);

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
let heroH=hero.offsetHeight,bridgeTicking=false;
window.addEventListener('resize',()=>{heroH=hero.offsetHeight;},{passive:true});
window.addEventListener('scroll',()=>{
  if(bridgeTicking) return;
  bridgeTicking=true;
  requestAnimationFrame(()=>{
    const progress=Math.min(1,Math.max(0,window.scrollY/(heroH*0.6)));
    bridge.style.transform=`translateX(-50%) scale(${progress*14})`;
    bridgeTicking=false;
  });
},{passive:true});

/* ---------- Accordions: 視窗大小改變時重新計算展開高度 ---------- */
let accResizeTimer;
window.addEventListener('resize',()=>{
  clearTimeout(accResizeTimer);
  accResizeTimer=setTimeout(()=>{
    document.querySelectorAll('.acc-item.open .acc-body').forEach(body=>{
      body.style.maxHeight=body.scrollHeight+'px';
    });
  },150);
});

/* ---------- Gallery lightbox ---------- */
(function(){
  const photos=document.querySelectorAll('#gallery .photo');
  if(!photos.length||!window.HTMLDialogElement) return;
  const box=document.createElement('dialog');
  box.className='lightbox';
  box.innerHTML='<button class="lightbox-close" type="button" aria-label="關閉">×</button><img alt=""><p class="lightbox-caption"></p>';
  document.body.appendChild(box);
  const bImg=box.querySelector('img'),bCap=box.querySelector('.lightbox-caption');
  photos.forEach(p=>{
    const img=p.querySelector('img');
    if(!img) return;
    p.setAttribute('role','button');
    p.tabIndex=0;
    const open=()=>{
      bImg.src=img.currentSrc||img.src;
      bImg.alt=img.alt;
      bCap.textContent=p.querySelector('.caption')?.textContent||'';
      box.showModal();
    };
    p.addEventListener('click',open);
    p.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
  });
  box.addEventListener('click',()=>box.close());
})();