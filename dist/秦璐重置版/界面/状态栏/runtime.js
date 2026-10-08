export function installStatusPatch(){
  const BUILD='lulu-stable-v9-status-20261008';
  if(window.__LULU_STABLE_V9_STATUS===BUILD)return;
  window.__LULU_STABLE_V9_STATUS=BUILD;
  const H=(()=>{try{return window.parent&&window.parent!==window?window.parent:window}catch{return window}})();
  const TAB_KEY='秦璐重置版:status_bar:active_tab';
  const LAST_KEY='秦璐重置版:status_bar:last_theme_character';
  let nativeMid=null,lastChar='秦璐',queued=false,observer=null,timer=null;

  const chatLen=()=>{try{return Number((window.SillyTavern||H.SillyTavern)?.chat?.length||0)}catch{return 0}};
  const storedTab=()=>{try{const v=localStorage.getItem(TAB_KEY);if(!v)return'';try{return JSON.parse(v)}catch{return String(v).replace(/^"|"$/g,'')}}catch{return''}};
  const activeTab=()=>{const t=(document.querySelector('.tab-btn.active .tab-label')?.textContent||'').trim();return t||storedTab()};
  const isShop=()=>activeTab()==='网店';
  function installMidProxy(){
    if(nativeMid)return;
    const src=typeof window.getCurrentMessageId==='function'?window.getCurrentMessageId:(typeof H.getCurrentMessageId==='function'?H.getCurrentMessageId:null);
    if(!src)return;
    nativeMid=()=>{try{return Number(src.call(typeof window.getCurrentMessageId==='function'?window:H))}catch{return-1}};
    const proxy=()=>isShop()&&chatLen()>0?chatLen()-1:nativeMid();
    try{Object.defineProperty(window,'getCurrentMessageId',{configurable:true,writable:true,value:proxy})}catch{try{window.getCurrentMessageId=proxy}catch{}}
  }
  const mid=()=>{try{const f=window.getCurrentMessageId||H.getCurrentMessageId;return typeof f==='function'?Number(f()):-1}catch{return-1}};
  const latest=()=>{const m=mid(),n=chatLen();return m<0||n<=0||m>=n-1};
  function statAt(id){
    const M=window.Mvu||H.Mvu,_=window._||H._;
    try{const d=M?.getMvuData?.({type:'message',message_id:id});const s=_?.get?_.get(d,'stat_data'):d?.stat_data;if(s)return s}catch{}
    try{const g=window.getVariables||H.getVariables,d=g?.({type:'message',message_id:id});const s=_?.get?_.get(d,'stat_data'):d?.stat_data;if(s)return s}catch{}
    return null;
  }
  const visibleStat=()=>latest()?(statAt(-1)||statAt(mid())):statAt(mid());
  function themeChar(){
    const t=activeTab();if(t==='秦璐'||t==='秦曼华'){lastChar=t;try{localStorage.setItem(LAST_KEY,t)}catch{};return t}
    try{const s=localStorage.getItem(LAST_KEY);if(s==='秦璐'||s==='秦曼华')lastChar=s}catch{}
    return lastChar;
  }
  const stage=()=>Math.max(1,Math.min(5,Math.floor(Number(visibleStat()?.[themeChar()+'状态']?.当前阶段)||1)));
  function syncTheme(){
    const root=document.querySelector('.frost-root');if(!root)return;
    for(let i=1;i<=5;i++)root.classList.toggle('th-stage-'+i,i===stage());
    const cs=getComputedStyle(root),vars=['--acc','--acc2','--bg1','--bg2','--line','--panel','--glow','--glow2'];
    for(const p of [document.getElementById('awei-pov-panel'),document.getElementById('secret-stats-panel')].filter(Boolean))for(const k of vars){const v=cs.getPropertyValue(k).trim();if(v)p.style.setProperty(k,v)}
  }
  function css(){
    if(document.getElementById('lulu-stable-v9-css'))return;
    const s=document.createElement('style');s.id='lulu-stable-v9-css';s.textContent=`
    body.shop-live-bridge .panel-host.readonly{pointer-events:auto!important;opacity:1!important;filter:none!important}
    #awei-pov-panel,#secret-stats-panel{border-color:var(--line)!important;background:linear-gradient(165deg,var(--bg1),var(--bg2) 55%,var(--bg1))!important;box-shadow:0 0 22px color-mix(in srgb,var(--acc) 4%,transparent)!important}
    #awei-pov-panel .awei-pov-head,#secret-stats-panel summary{background:linear-gradient(90deg,color-mix(in srgb,var(--acc) 9%,transparent),rgba(0,0,0,.1))!important;border-color:color-mix(in srgb,var(--acc) 16%,transparent)!important}
    #awei-pov-panel .awei-pov-title,#awei-pov-panel .awei-pov-tag,#secret-stats-panel summary,#secret-stats-panel .secret-person-title,#secret-stats-panel .secret-metric.rival .secret-count,#secret-stats-panel .secret-branch-value.rival{color:var(--acc)!important;text-shadow:0 0 7px var(--glow)}
    #awei-pov-panel .awei-pov-item,#secret-stats-panel .secret-person{border-color:color-mix(in srgb,var(--acc) 15%,transparent)!important;background:color-mix(in srgb,var(--acc) 3%,rgba(0,0,0,.12))!important}
    .awei-thought-panel{margin-top:10px;padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:linear-gradient(160deg,color-mix(in srgb,var(--acc) 8%,transparent),rgba(0,0,0,.22) 62%)}
    .awei-thought-head{display:flex;gap:8px;align-items:center;margin-bottom:7px}.awei-thought-name{font-weight:800;letter-spacing:2px;color:var(--acc);text-shadow:0 0 8px var(--glow)}.awei-thought-chip{margin-left:auto;font-size:10px;padding:1px 8px;border:1px solid var(--line);border-radius:10px}.awei-thought-chip.present{color:var(--acc);box-shadow:0 0 8px var(--glow)}
    .awei-thought-body{margin:0;padding:8px 11px;border-left:2px solid color-mix(in srgb,var(--acc) 58%,transparent);background:rgba(0,0,0,.22);color:#cbbfaf;font-size:12px;font-style:italic}.awei-thought-body.empty{opacity:.55}
    .awei-hat-icon{display:none;position:relative;width:14px;height:11px;margin-left:2px;filter:drop-shadow(0 0 3px rgba(96,255,135,.65))}.awei-hat-icon:before{content:"";position:absolute;left:4px;top:0;width:7px;height:7px;border-radius:2px;background:linear-gradient(#a4ffb7,#36c965)}.awei-hat-icon:after{content:"";position:absolute;left:1px;bottom:0;width:12px;height:3px;border-radius:50%;background:#3ed36b}.bar.awei-hat-active .awei-hat-icon{display:inline-block}
    `;document.head.appendChild(s);
  }
  function thought(){
    const m=mid(),pick=id=>{const v=statAt(id)?.系统?.阿伟本轮心思;return v&&typeof v==='object'?{在场:v.在场===true||v.在场==='true',内容:typeof v.内容==='string'?v.内容.trim():''}:null};
    if(latest()){const a=pick(-1),b=m>=0?pick(m):null;return(a&&(a.在场||a.内容)?a:null)||(b&&(b.在场||b.内容)?b:null)||a||b||{在场:false,内容:''}}
    return(m>=0?pick(m):null)||{在场:false,内容:''};
  }
  function thoughtPanel(){
    const sec=[...document.querySelectorAll('section')].find(x=>(x.querySelector('h3')?.textContent||'').trim().startsWith('苏文'));if(!sec)return;
    let p=document.getElementById('awei-thought-panel');if(!p){p=document.createElement('section');p.id='awei-thought-panel';p.className='awei-thought-panel';p.innerHTML='<div class="awei-thought-head"><span class="awei-thought-name">阿伟</span><span>本轮心思</span><span class="awei-thought-chip">未在场</span></div><blockquote class="awei-thought-body empty">暂无本轮心思</blockquote>';sec.insertAdjacentElement('afterend',p)}
    const v=thought(),chip=p.querySelector('.awei-thought-chip'),body=p.querySelector('.awei-thought-body');chip.textContent=v.在场?'在场':'未在场';chip.classList.toggle('present',v.在场);body.textContent=v.内容||'暂无本轮心思';body.classList.toggle('empty',!v.内容);
  }
  function aweiBars(){
    for(const row of document.querySelectorAll('.bar')){const lab=row.querySelector('.bl');if((lab?.textContent||'').trim()!=='阿伟')continue;const val=Math.max(0,Math.min(100,Number((row.querySelector('.bv')?.textContent||'').trim())||15)),p=val/100,t=Math.max(0,Math.min(1,(val-20)/80)),mix=(a,b)=>Math.round(a+(b-a)*t),c=[mix(139,78),mix(98,235),mix(63,116)],c2=[mix(105,44),mix(76,181),mix(53,82)],rgb=x=>`rgb(${x.join(',')})`,rgba=(x,a)=>`rgba(${x.join(',')},${a})`,fill=row.querySelector('.fill.f-awei')||row.querySelector('.fill');if(fill){fill.style.background=`linear-gradient(90deg,${rgb(c2)},${rgb(c)})`;fill.style.boxShadow=`0 0 ${Math.round(3+15*Math.pow(p,1.5))}px ${rgba(c,(.08+.64*Math.pow(p,1.65)).toFixed(3))}`}
      let h=row.querySelector('.awei-hat-icon');if(!h&&lab){h=document.createElement('span');h.className='awei-hat-icon';h.title='阿伟依存度达到 80+';lab.insertAdjacentElement('afterend',h)}row.classList.toggle('awei-hat-active',val>=80);
    }
  }
  function shop(){const on=isShop();document.body.classList.toggle('shop-live-bridge',on);if(!on)return;for(const el of document.querySelectorAll('.panel-host.readonly')){el.classList.remove('readonly');el.style.pointerEvents='auto';el.style.opacity='1';el.style.filter='none'}const g=document.querySelector('.stale-guard');if(g)g.textContent='🛒 网店已连接最新存档 · 购买/装备/活动操作会写入最新楼层'}
  function refresh(){queued=false;css();shop();syncTheme();thoughtPanel();aweiBars()}
  function queue(){if(queued)return;queued=true;requestAnimationFrame(refresh)}
  installMidProxy();css();queue();document.addEventListener('click',e=>{if(e.target?.closest?.('.tab-btn')){setTimeout(queue,0);setTimeout(queue,100);setTimeout(queue,600)}},true);
  observer=new MutationObserver(queue);observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});timer=setInterval(queue,1200);
}
