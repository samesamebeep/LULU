(async function(){
  const BUILD = 'lulu-v9-ending-state-fix-20261008';
  const G = globalThis;

  try{
    if(typeof waitGlobalInitialized === 'function'){
      await waitGlobalInitialized('Mvu');
    }

    const state = G.__LULU_V7_WRITE_STATE || (G.__LULU_V7_WRITE_STATE = {
      build: BUILD,
      manualDepth: 0,
      manualUntil: 0,
      generationActive: false,
      generationStartedAt: 0,
      generationTimer: null
    });
    state.build = BUILD;
    state.repairing = false;

    const SECRET_ITEMS = ['item1','item2','item3','item4','item5','item6','item7'];
    const SECRET_LAST_ITEMS = ['item1','item2','item3','item4','item5','item6'];
    const EXPOSURE_RANK = {保守:0, 正常:1, 清凉:2, 暴露:3, 极度暴露:4};

    function floorNow(){
      try{return Number(G.SillyTavern?.chat?.length ?? 0);}catch(_){return 0;}
    }

    function statFromMvuData(data){
      return data && typeof data==='object' ? data.stat_data : null;
    }

    function ensureSecretShape(sys){
      if(!sys.秘密统计 || typeof sys.秘密统计!=='object') sys.秘密统计={};
      if(!sys.秘密最后状态 || typeof sys.秘密最后状态!=='object') sys.秘密最后状态={};
      if(!sys.本轮秘密事件 || typeof sys.本轮秘密事件!=='object') sys.本轮秘密事件={};

      for(const who of ['秦璐','秦曼华']){
        if(!sys.秘密统计[who] || typeof sys.秘密统计[who]!=='object') sys.秘密统计[who]={};
        if(!sys.秘密最后状态[who] || typeof sys.秘密最后状态[who]!=='object') sys.秘密最后状态[who]={};
        if(!sys.本轮秘密事件[who] || typeof sys.本轮秘密事件[who]!=='object') sys.本轮秘密事件[who]={};

        for(const actor of ['主角','阿伟']){
          if(!sys.秘密统计[who][actor] || typeof sys.秘密统计[who][actor]!=='object') sys.秘密统计[who][actor]={};
          if(!sys.秘密最后状态[who][actor] || typeof sys.秘密最后状态[who][actor]!=='object') sys.秘密最后状态[who][actor]={};
          if(!Array.isArray(sys.本轮秘密事件[who][actor])) sys.本轮秘密事件[who][actor]=[];

          for(const item of ['item1','item2','item3','item4','item5','item6','item7','item8']){
            const n=Number(sys.秘密统计[who][actor][item]);
            sys.秘密统计[who][actor][item]=Number.isFinite(n)?Math.max(0,Math.floor(n)):0;
          }
          for(const item of SECRET_LAST_ITEMS){
            if(typeof sys.秘密最后状态[who][actor][item]!=='string') sys.秘密最后状态[who][actor][item]='';
          }
        }
      }
    }

    function hasPendingSecretEvents(sys){
      const ev=sys?.本轮秘密事件;
      if(!ev || typeof ev!=='object') return false;
      for(const who of ['秦璐','秦曼华']){
        for(const actor of ['主角','阿伟']){
          if(Array.isArray(ev?.[who]?.[actor]) && ev[who][actor].length) return true;
        }
      }
      return false;
    }

    function settlePendingSecrets(stat, floor){
      const sys=stat?.系统;
      if(!sys || !hasPendingSecretEvents(sys)) return false;
      ensureSecretShape(sys);

      for(const who of ['秦璐','秦曼华']){
        for(const actor of ['主角','阿伟']){
          const raw=Array.isArray(sys.本轮秘密事件[who][actor]) ? sys.本轮秘密事件[who][actor] : [];
          const byItem=new Map();

          for(const ev of raw){
            const item=String(ev?.项目 ?? '');
            if(!SECRET_ITEMS.includes(item)) continue;
            byItem.set(item, {项目:item, 描述:typeof ev?.描述==='string'?ev.描述.trim():''});
          }

          if(byItem.has('item7') && !byItem.has('item6')){
            byItem.set('item6',{项目:'item6',描述:''});
          }

          for(const [item,ev] of byItem){
            const bucket=sys.秘密统计[who][actor];
            bucket[item]=Math.max(0,Math.floor(Number(bucket[item])||0))+1;

            if(item==='item7'){
              bucket.item8=Math.max(0,Math.floor(Number(bucket.item8)||0)) + 3 + Math.floor(Math.random()*3);
            }

            if(SECRET_LAST_ITEMS.includes(item) && ev.描述){
              sys.秘密最后状态[who][actor][item]=ev.描述.slice(0,40);
            }
          }

          sys.本轮秘密事件[who][actor]=[];
        }
      }

      sys._秘密统计上次处理楼层=floor;
      console.info('[秦璐重置版·v9] 秘密事件兜底结算完成 @'+floor);
      return true;
    }

    function outfitText(charState){
      const f=charState?.服装细节;
      if(!f || typeof f!=='object') return '';
      return [
        f.头部,f.上装,f.下装,f.内衣?.上,f.内衣?.下,
        f.袜裤,f.鞋子,f.外套,f.配饰,f.特殊装饰
      ].filter(Boolean).join(' ');
    }

    function inferMinExposure(charState){
      const text=outfitText(charState);
      if(!text) return null;

      if(/(一丝不挂|全裸|裸体|裸身|真空围裙|全透|彻底透光|关键处无遮挡|无遮挡|只贴.{0,4}乳贴|开裆|开档|情趣三点式|镂空连体网衣)/.test(text)){
        return '极度暴露';
      }
      if(/(情趣|内衣套装|半罩杯|丁字裤|吊袜带|珍珠链内裤|透视|薄纱|超深V|极低领|大面积露背|高开衩|超短|镂空|乳贴|身体链|束环)/.test(text)){
        return '暴露';
      }
      if(/(低胸|深V|露脐|露背|开衩|包臀热裤|吊带|短裙|丝袜|贴身显曲线)/.test(text)){
        return '清凉';
      }
      return null;
    }

    function repairAppearance(stat){
      let changed=false;
      for(const key of ['秦璐状态','秦曼华状态']){
        const ch=stat?.[key];
        const f=ch?.服装细节;
        if(!f || typeof f!=='object') continue;

        const inferred=inferMinExposure(ch);
        if(inferred){
          const cur=String(f.暴露程度 ?? '正常');
          const cr=EXPOSURE_RANK[cur] ?? 1;
          const ir=EXPOSURE_RANK[inferred] ?? cr;
          const shouldUpgrade = ir>cr && (inferred!=='清凉' || cur==='保守');
          if(shouldUpgrade){
            f.暴露程度=inferred;
            changed=true;
            console.info(`[秦璐重置版·v9] ${key} 暴露程度自检 ${cur} → ${inferred}`);
          }
        }

        const txt=outfitText(ch);
        if(/衣不蔽体/.test(txt) && f.整洁度!=='衣不蔽体'){
          f.整洁度='衣不蔽体'; changed=true;
        }else if(/破损|撕裂/.test(txt) && ['整洁','略显凌乱'].includes(f.整洁度)){
          f.整洁度='破损'; changed=true;
        }else if(/凌乱|散乱/.test(txt) && f.整洁度==='整洁'){
          f.整洁度='凌乱'; changed=true;
        }
      }
      return changed;
    }

    async function runPostRepair(reason){
      if(state.repairing) return;
      try{
        const mvu=G.Mvu;
        if(!mvu || typeof mvu.getMvuData!=='function' || typeof mvu.replaceMvuData!=='function') return;

        const data=mvu.getMvuData({type:'message',message_id:-1});
        const stat=statFromMvuData(data);
        if(!stat?.系统) return;

        const floor=floorNow();
        let changed=false;
        changed = settlePendingSecrets(stat,floor) || changed;
        changed = repairAppearance(stat) || changed;

        if(!changed) return;

        state.repairing=true;
        try{
          await mvu.replaceMvuData(data,{type:'message',message_id:-1});
          console.info('[秦璐重置版·v9] 结尾变量自检写回：'+reason);
        }finally{
          state.repairing=false;
        }
      }catch(err){
        state.repairing=false;
        console.warn('[秦璐重置版·v9] 结尾变量自检失败',err);
      }
    }

    try{
      const mvu = G.Mvu;
      if(mvu && typeof mvu.replaceMvuData === 'function' && !mvu.replaceMvuData.__luluV7UiWriteGuard){
        const originalReplace = mvu.replaceMvuData;

        const guardedReplace = async function(){
          const args = Array.from(arguments);
          state.manualDepth += 1;
          state.manualUntil = Math.max(state.manualUntil || 0, Date.now() + 1000);

          try{ repairAppearance(statFromMvuData(args[0])); }catch(_){}

          try{
            return await originalReplace.apply(this, args);
          }finally{
            state.manualDepth = Math.max(0, state.manualDepth - 1);
            state.manualUntil = Math.max(state.manualUntil || 0, Date.now() + 450);
          }
        };

        guardedReplace.__luluV7UiWriteGuard = true;
        guardedReplace.__luluV7Original = originalReplace;
        mvu.replaceMvuData = guardedReplace;

        console.info('[秦璐重置版·v9] 已安装 UI 写入保护');
      }
    }catch(err){
      console.warn('[秦璐重置版·v9] Mvu.replaceMvuData 包装失败，将继续加载主逻辑', err);
    }

    const originalEventOn = G.eventOn;
    const promptEvent = G.tavern_events?.CHAT_COMPLETION_PROMPT_READY;
    const variableEvent = G.Mvu?.events?.VARIABLE_UPDATE_ENDED;

    if(typeof originalEventOn === 'function' && promptEvent && variableEvent){
      let gotPrompt = false;
      let gotVariable = false;
      let restored = false;

      const restoreEventOn = () => {
        if(restored) return;
        if(G.eventOn === patchedEventOn){
          G.eventOn = originalEventOn;
        }
        restored = true;
      };

      const looksLikeLuluHandler = (fn) => {
        try{
          const src = Function.prototype.toString.call(fn);
          return src.includes('秦璐重置版') ||
                 src.includes('PROMPT_READY') ||
                 src.includes('VARIABLE_UPDATE_ENDED');
        }catch(_){
          return true;
        }
      };

      function patchedEventOn(eventName, callback){
        const rest = Array.prototype.slice.call(arguments, 2);
        let wrapped = callback;

        if(!gotPrompt && eventName === promptEvent && typeof callback === 'function' && looksLikeLuluHandler(callback)){
          gotPrompt = true;
          wrapped = function(payload){
            const args = Array.prototype.slice.call(arguments, 1);
            state.generationActive = !(payload && payload.dryRun);
            state.generationStartedAt = state.generationActive ? Date.now() : 0;

            if(state.generationTimer){
              clearTimeout(state.generationTimer);
              state.generationTimer = null;
            }

            if(state.generationActive){
              state.generationTimer = setTimeout(() => {
                state.generationActive = false;
                state.generationStartedAt = 0;
                state.generationTimer = null;
              }, 120000);
            }

            try{
              return callback.apply(this, [payload].concat(args));
            }catch(err){
              state.generationActive = false;
              state.generationStartedAt = 0;
              if(state.generationTimer){
                clearTimeout(state.generationTimer);
                state.generationTimer = null;
              }
              throw err;
            }
          };
        }
        else if(!gotVariable && eventName === variableEvent && typeof callback === 'function' && looksLikeLuluHandler(callback)){
          gotVariable = true;
          wrapped = function(){
            const args = Array.from(arguments);
            const manualWrite = state.manualDepth > 0 || (!state.generationActive && Date.now() < (state.manualUntil || 0));

            if(manualWrite){
              console.info('[秦璐重置版·v9] UI 变量写入已保留，跳过旧快照回滚');
              return;
            }

            try{
              return callback.apply(this, args);
            }finally{
              if(state.generationActive){
                state.generationActive = false;
                state.generationStartedAt = 0;
                if(state.generationTimer){
                  clearTimeout(state.generationTimer);
                  state.generationTimer = null;
                }
              }
              setTimeout(()=>runPostRepair('VARIABLE_UPDATE_ENDED'),80);
            }
          };
        }

        const result = originalEventOn.apply(this, [eventName, wrapped].concat(rest));
        if(gotPrompt && gotVariable){
          setTimeout(restoreEventOn, 0);
        }
        return result;
      }

      G.eventOn = patchedEventOn;
      setTimeout(restoreEventOn, 15000);
    }

    await import('https://testingcf.jsdelivr.net/gh/samesamebeep/LULU@855a2f2ad250ad5b13482e1b3e9c2781a96e74a6/dist/秦璐重置版/脚本/游戏逻辑/index.js?v=20261008-v9');

    try{
      if(typeof G.eventOn==='function' && G.Mvu?.events?.VARIABLE_UPDATE_ENDED){
        G.eventOn(G.Mvu.events.VARIABLE_UPDATE_ENDED,()=>{
          if(!state.repairing) setTimeout(()=>runPostRepair('fallback-event'),140);
        });
      }
    }catch(err){
      console.warn('[秦璐重置版·v9] 自检监听注册失败',err);
    }

    setTimeout(()=>runPostRepair('initial-load'),500);
    console.info('[秦璐重置版·v9] 游戏逻辑加载完成');
  }catch(err){
    console.error('[秦璐重置版·v9] 游戏逻辑启动失败', err);
    const host = window.parent ?? window;
    host.toastr?.error?.(
      '游戏逻辑加载失败：' + (err?.message ?? String(err)) + '\n请 F12 查看控制台',
      '秦璐重置版 v9',
      {timeOut:0, extendedTimeOut:0}
    );
  }
})();
