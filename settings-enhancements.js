/* ojaajo Step 30: settings screen, draggable navigator and scroll preferences.
   Add after new-ui.js. No changes to Supabase tables. */
(() => {
'use strict';
const KEY='ojaajo-ui-preferences-v1';
const defaults={size:100,opacity:90,layout:'vertical',scroll:50,autoVoice:true,x:null,y:null,theme:'dark'};
let pref={...defaults};
try {const p=JSON.parse(localStorage.getItem(KEY)||'{}');if(p&&typeof p==='object')pref={...pref,...p};}catch(_){}
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(pref));}catch(_){}};
const $=id=>document.getElementById(id);
const css=document.createElement('style');
css.textContent=`
#settings .pref-demo{display:flex;align-items:center;justify-content:center;min-height:140px;border:1px solid var(--line);border-radius:15px;background:var(--bg);margin:14px 0;padding:14px;overflow:hidden}
#settings .pref-demo-nav{display:flex;align-items:center;gap:2px;background:var(--panel2);border:1px solid var(--line);border-radius:12px;padding:5px;transition:opacity .1s}
#settings .pref-demo-nav button{display:grid;place-items:center;background:transparent;border:0;color:var(--text);padding:0;line-height:1}
#settings .pref-demo-nav button:nth-child(2){color:var(--accent)}
#settings .pref-scroll-demo{position:relative;height:200px;background:var(--bg);border:1px solid var(--line);border-radius:14px;overflow:hidden;margin:12px 0}
#settings .pref-scroll-demo .pref-guide{position:absolute;left:10px;right:10px;transform:translateY(-50%);border:1px solid var(--accent);background:var(--panel2);padding:8px;border-radius:9px;text-align:center;color:var(--text);font-size:13px;font-weight:700;transition:top .12s}
#settings .pref-scroll-demo .pref-ghost{position:absolute;left:22px;right:22px;height:18px;border-radius:6px;background:var(--line)}
#settings .pref-scroll-demo .pref-top-label,#settings .pref-scroll-demo .pref-bottom-label{position:absolute;right:12px;font-size:11px;color:var(--muted)}
#settings .pref-scroll-demo .pref-top-label{top:6px}#settings .pref-scroll-demo .pref-bottom-label{bottom:6px}
#settings .pref-auth-fields{display:grid;gap:10px;margin-top:14px}#settings .pref-auth-fields input{min-width:0}
#settings .pref-auth-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}#settings .pref-auth-actions button{flex:1;min-width:125px}
#settings .pref-feedback{color:var(--muted);font-size:12px;min-height:1.5em;margin-top:8px;overflow-wrap:anywhere}
html[data-ojaajo-theme="light"]{color-scheme:light;--bg:#f5f6f8;--panel:#ffffff;--panel2:#e9edf2;--line:#d6dce4;--text:#202630;--muted:#596474;--accent:#548b20;--accent-ink:#ffffff;--red:#ba3434}
html[data-ojaajo-theme="light"] body{background:var(--bg);color:var(--text)}
html[data-ojaajo-theme="light"] .bottom-nav{background:rgba(249,250,252,.96)!important}
html[data-ojaajo-theme="light"] .hero,html[data-ojaajo-theme="light"] .cloud-panel{background:linear-gradient(135deg,#f1f5eb,#fff 72%)}
html[data-ojaajo-theme="light"] .stat,html[data-ojaajo-theme="light"] .example,html[data-ojaajo-theme="light"] .card-example,html[data-ojaajo-theme="light"] .detail-panel{background:#f2f4f7}
html[data-ojaajo-theme="light"] input,html[data-ojaajo-theme="light"] select,html[data-ojaajo-theme="light"] textarea{background:#fff;color:var(--text);border-color:var(--line)}
html[data-ojaajo-theme="light"] .meaning,html[data-ojaajo-theme="light"] .card-meaning{color:#4e5967}
html[data-ojaajo-theme="light"] .status{background:#e8ebef;color:#45515e}
html[data-ojaajo-theme="light"] .nav-btn.active{background:#e5efda;color:var(--accent)}
html[data-ojaajo-theme="light"] .choice-btn,html[data-ojaajo-theme="light"] .word-menu-trigger,html[data-ojaajo-theme="light"] .word-menu{background:var(--panel2);color:var(--text)}
html[data-ojaajo-theme="light"] .word-navigator{background:#edf1f5!important;border-color:#cbd3dd!important}
html[data-ojaajo-theme="light"] .word-navigator button{color:#29333f!important}
html[data-ojaajo-theme="light"] .word-navigator button:nth-child(3){color:var(--accent)!important}
html[data-ojaajo-theme="light"] #settings .pref-account-row .pref-value{color:var(--text)}
html[data-ojaajo-theme="light"] #settings .pref-control select{background:var(--panel2);color:var(--text);border-color:var(--line)}
html[data-ojaajo-theme="light"] #settings .pref-subtitle,html[data-ojaajo-theme="light"] #settings .pref-note{color:var(--muted)}
html[data-ojaajo-theme="light"] #sb-cloud-popup{background:#fff!important;color:#202630!important;border-color:#cbd3dd!important}
html[data-ojaajo-theme="light"] #sb-cloud-popup #sb-auth-status{color:#202630!important}
html[data-ojaajo-theme="light"] #sb-cloud-popup #sb-auth-status.cloud-signed-in{background:#eef2f5!important}
#settings .pref-account-row{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:13px 0;border-top:1px solid #333945}
#settings .pref-account-row .pref-label{color:#9fa8b7;font-size:13px}
#settings .pref-account-row .pref-value{color:#f0f2f4;font-size:13px;max-width:70%;overflow-wrap:anywhere;text-align:right}
#settings .pref-note{font-size:12px;color:#9fa8b7;margin:10px 0 0}
#settings .pref-control{display:grid;gap:9px;margin-top:20px}
#settings .pref-control label{display:flex;align-items:center;justify-content:space-between;gap:12px;font-weight:600}
#settings .pref-control output{color:#b7f36b;font-variant-numeric:tabular-nums}
#settings .pref-control input[type=range]{width:100%;accent-color:#b7f36b;min-height:30px}
#settings .pref-control select{width:100%;padding:12px;background:#232833;color:#f0f2f4;border:1px solid #414854;border-radius:10px;font:inherit}
#settings .pref-check{display:flex;gap:12px;align-items:center;justify-content:space-between;margin-top:18px}
#settings .pref-check input{width:22px;height:22px;accent-color:#b7f36b}
#settings .pref-subtitle{color:#aab3c0;font-size:13px;margin:8px 0}
#wordNavigator.ojaajo-custom-nav{right:auto!important;bottom:auto!important;left:var(--ojaajo-nav-x,auto)!important;top:var(--ojaajo-nav-y,auto)!important;flex-direction:var(--ojaajo-nav-direction,column)!important;opacity:var(--ojaajo-nav-opacity,1)!important;gap:0!important;touch-action:none}
#wordNavigator.ojaajo-custom-nav button{width:var(--ojaajo-nav-button,32px)!important;height:var(--ojaajo-nav-button,32px)!important;font-size:var(--ojaajo-nav-font,22px)!important;touch-action:none;user-select:none;-webkit-user-select:none}
#wordNavigator.ojaajo-custom-nav .nav-drag-handle{width:var(--ojaajo-nav-button,32px)!important;height:18px!important;font-size:12px!important;color:#9ba5b4!important;cursor:grab;touch-action:none;line-height:14px!important}
#wordNavigator.ojaajo-custom-nav .nav-drag-handle:active{cursor:grabbing}
#wordNavigator.ojaajo-custom-nav.is-dragging{outline:2px solid #b7f36b;outline-offset:2px}
`;
document.head.appendChild(css);
const getClient=()=>{try{return typeof supabaseClient!=='undefined'?supabaseClient:null;}catch(_){return null;}};
const settings=$('settings');
if(!settings)return;
settings.querySelectorAll(':scope > .panel').forEach(p=>p.remove());
const cloud=document.createElement('div');cloud.className='panel';cloud.innerHTML=`
<h2>クラウド同期</h2><p class="pref-subtitle">ログイン・ログアウトは右上の☁️ボタンから操作できます。</p>
<div class="pref-account-row"><span class="pref-label">ログイン状態</span><strong id="prefLoginStatus" class="pref-value">確認中…</strong></div>
<div class="pref-account-row"><span class="pref-label">アカウント</span><span id="prefAccount" class="pref-value">確認中…</span></div>
<div class="pref-account-row"><span class="pref-label">接続先</span><span class="pref-value">Supabase</span></div>
<div id="prefLoginFields" class="pref-auth-fields" hidden><input type="email" id="prefEmail" autocomplete="email" placeholder="メールアドレス" aria-label="メールアドレス"><input type="password" id="prefPassword" autocomplete="current-password" placeholder="パスワード" aria-label="パスワード"></div>
<div class="pref-auth-actions"><button class="btn primary" id="prefLogin" type="button" hidden>ログイン</button><button class="btn" id="prefLogout" type="button" hidden>ログアウト</button><button class="btn" id="prefOpenCloud" type="button">☁ クラウド設定を開く</button></div><p id="prefAuthFeedback" class="pref-feedback" role="status"></p>
<p class="pref-note">単語・リスト・暗記状況はクラウドで同期します。画面表示の設定はこの端末に保存されます。</p>`;
const nav=document.createElement('div');nav.className='panel';nav.innerHTML=`
<h2>ナビゲーションボタン</h2><p class="pref-subtitle">リスト画面でボタン上部の「⠿」をドラッグすると、好きな場所に移動できます。</p>
<div class="pref-demo" aria-label="ナビゲーションボタンの大きさと透明度のプレビュー"><div id="prefDemoNav" class="pref-demo-nav"><button type="button" tabindex="-1">⌃</button><button type="button" tabindex="-1">↻</button><button type="button" tabindex="-1">⌄</button></div></div>
<div class="pref-control"><label for="prefNavSize">ボタンの大きさ <output id="prefNavSizeValue"></output></label><input id="prefNavSize" type="range" min="70" max="150" step="5"></div>
<div class="pref-control"><label for="prefNavOpacity">透明度 <output id="prefNavOpacityValue"></output></label><input id="prefNavOpacity" type="range" min="30" max="100" step="5"></div>
<div class="pref-control"><label for="prefNavLayout">並び方</label><select id="prefNavLayout"><option value="vertical">縦並び</option><option value="horizontal">横並び</option></select></div>
<button class="btn full" id="prefResetNav" type="button" style="margin-top:18px">ボタンの位置を初期化</button>`;
const study=document.createElement('div');study.className='panel';study.innerHTML=`
<h2>スクロール・音声</h2><p class="pref-subtitle">矢印で単語を移動したときの表示位置を調整します。</p>
<div class="pref-scroll-demo" aria-label="スクロール位置のプレビュー"><div class="pref-ghost" style="top:24%"></div><div class="pref-ghost" style="top:73%"></div><span class="pref-top-label">画面上部 ↑</span><span class="pref-bottom-label">画面下部 ↓</span><div class="pref-guide" id="prefScrollGuide">選択中の単語</div></div>
<div class="pref-control"><label for="prefScroll">自動スクロール位置 <output id="prefScrollValue"></output></label><input id="prefScroll" type="range" min="10" max="90" step="5"><div style="display:flex;justify-content:space-between;color:#9fa8b7;font-size:12px"><span>画面上部</span><span>画面下部</span></div></div>
<label class="pref-check" for="prefAutoVoice"><span>矢印移動時に音声を自動再生</span><input type="checkbox" id="prefAutoVoice"></label>
<div class="pref-control"><label for="prefTheme">画面のテーマ</label><select id="prefTheme"><option value="dark">ダーク（黒基調）</option><option value="light">ライト（白基調）</option></select></div>
<button class="btn full" id="prefResetAll" type="button" style="margin-top:22px">表示・操作設定をすべて初期化</button>`;
settings.append(cloud,nav,study);
$('prefOpenCloud').addEventListener('click',()=>$('sb-cloud-toggle')?.click());
function applyNavigator(){
 const n=$('wordNavigator');if(!n)return;
 n.classList.add('ojaajo-custom-nav');
 n.style.setProperty('--ojaajo-nav-direction',pref.layout==='horizontal'?'row':'column');
 n.style.setProperty('--ojaajo-nav-button',Math.round(32*pref.size/100)+'px');
 n.style.setProperty('--ojaajo-nav-font',Math.round(22*pref.size/100)+'px');
 n.style.setProperty('--ojaajo-nav-opacity',clamp(pref.opacity,30,100)/100);
 if(Number.isFinite(pref.x)&&Number.isFinite(pref.y)){
  const rect=n.getBoundingClientRect();const width=n.offsetWidth||40,height=n.offsetHeight||120;
  pref.x=clamp(pref.x,0,Math.max(0,innerWidth-width));pref.y=clamp(pref.y,0,Math.max(0,innerHeight-height));
 }else{
  const width=n.offsetWidth||45,height=n.offsetHeight||130;
  pref.x=Math.max(0,innerWidth-width-10);
  pref.y=Math.max(0,innerHeight-height-105);
 }
 n.style.setProperty('--ojaajo-nav-x',pref.x+'px');n.style.setProperty('--ojaajo-nav-y',pref.y+'px');
}
function reflect(){
 for(const [id,key,suffix] of [['prefNavSize','size','%'],['prefNavOpacity','opacity','%'],['prefScroll','scroll','%']]){$(id).value=pref[key];$(id+'Value').textContent=pref[key]+suffix;}
 $('prefNavLayout').value=pref.layout;
 $('prefAutoVoice').checked=!!pref.autoVoice;
 $('prefTheme').value=pref.theme==='light'?'light':'dark';
 document.documentElement.dataset.ojaajoTheme=pref.theme==='light'?'light':'dark';
 const preview=$('prefDemoNav');preview.style.flexDirection=pref.layout==='horizontal'?'row':'column';preview.style.opacity=clamp(pref.opacity,30,100)/100;
 preview.querySelectorAll('button').forEach((b,i)=>{b.style.width=Math.round(32*pref.size/100)+'px';b.style.height=Math.round(32*pref.size/100)+'px';b.style.fontSize=Math.round((i===1?21:22)*pref.size/100)+'px';});
 $('prefScrollGuide').style.top=pref.scroll+'%';
 $('prefScrollValue').textContent=pref.scroll+'% ・ '+(pref.scroll<40?'上寄り':pref.scroll>60?'下寄り':'中央付近');
 applyNavigator();
}
for(const [id,key] of [['prefNavSize','size'],['prefNavOpacity','opacity'],['prefScroll','scroll']]){
 $(id).addEventListener('input',e=>{pref[key]=Number(e.target.value);save();reflect();});
}
$('prefNavLayout').addEventListener('change',e=>{pref.layout=e.target.value;save();reflect();});
$('prefTheme').addEventListener('change',e=>{pref.theme=e.target.value;save();reflect();});
$('prefAutoVoice').addEventListener('change',e=>{pref.autoVoice=e.target.checked;save();});
$('prefResetNav').addEventListener('click',()=>{pref.x=null;pref.y=null;save();reflect();});
$('prefResetAll').addEventListener('click',()=>{pref={...defaults};save();reflect();});
const n=$('wordNavigator');
if(n){
 const handle=document.createElement('button');handle.type='button';handle.className='nav-drag-handle';handle.textContent='⠿';handle.title='ここをドラッグして位置を変更';handle.setAttribute('aria-label','ナビゲーションボタンを移動');
 n.prepend(handle);
 let drag=null;
 handle.addEventListener('pointerdown',e=>{
  if(e.button!==0)return;e.preventDefault();
  drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,x:pref.x,y:pref.y};
  handle.setPointerCapture(e.pointerId);n.classList.add('is-dragging');
 });
 handle.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id)return;
  pref.x=clamp(drag.x+e.clientX-drag.startX,0,Math.max(0,innerWidth-n.offsetWidth));
  pref.y=clamp(drag.y+e.clientY-drag.startY,0,Math.max(0,innerHeight-n.offsetHeight));
  n.style.setProperty('--ojaajo-nav-x',pref.x+'px');n.style.setProperty('--ojaajo-nav-y',pref.y+'px');
 });
 const finish=()=>{if(!drag)return;drag=null;n.classList.remove('is-dragging');save();};
 handle.addEventListener('pointerup',finish);handle.addEventListener('pointercancel',finish);
 window.addEventListener('resize',()=>{applyNavigator();save();});
}
// The original navigation function is used by the arrow buttons.
// Override only the scroll placement and auto-voice preference.
if(typeof window.focusSelectedWord==='function'){
 window.focusSelectedWord=function(shouldPlay){
  if(!Array.isArray(visibleWordRows)||!visibleWordRows.length)return;
  visibleWordRows.forEach((item,i)=>item.node.classList.toggle('selected-word',i===selectedWordIndex));
  const item=visibleWordRows[selectedWordIndex];if(!item)return;
  const container=$('appRoot');
  if(container){
   const cr=container.getBoundingClientRect(),wr=item.node.getBoundingClientRect();
   const target=cr.top+cr.height*(pref.scroll/100);
   const desired=container.scrollTop+(wr.top+wr.height/2-target);
   container.scrollTo({top:clamp(desired,0,container.scrollHeight-container.clientHeight),behavior:'smooth'});
  }else item.node.scrollIntoView({behavior:'smooth',block:'center'});
  if(shouldPlay&&pref.autoVoice&&typeof window.voiceFromOldApp==='function')window.voiceFromOldApp(item.word.ko);
 };
}
let authToken=0;
const authFeedback=text=>{$('prefAuthFeedback').textContent=text;};
async function updateAccount(){
 const token=++authToken,client=getClient();
 if(!client){$('prefLoginStatus').textContent='接続を確認できません';$('prefAccount').textContent='—';return;}
 try{
  // getSession reads the same authenticated session used by the existing cloud popup.
  const {data,error}=await client.auth.getSession();if(token!==authToken)return;
  if(error)throw error;
  const user=data?.session?.user;
  $('prefLoginStatus').textContent=user?'● ログイン中':'○ 未ログイン';
  $('prefAccount').textContent=user?.email||'ログインしていません';
  $('prefLoginFields').hidden=!!user;$('prefLogin').hidden=!!user;$('prefLogout').hidden=!user;
 }catch(e){if(token!==authToken)return;$('prefLoginStatus').textContent='接続状態を確認できません';$('prefAccount').textContent='—';authFeedback('状態の取得に失敗しました。');}
}
$('prefLogin').addEventListener('click',async()=>{
 const client=getClient();if(!client)return;
 const email=$('prefEmail').value.trim(),password=$('prefPassword').value;
 if(!email||!password){authFeedback('メールアドレスとパスワードを入力してください。');return;}
 $('prefLogin').disabled=true;authFeedback('ログインしています…');
 try{const {error}=await client.auth.signInWithPassword({email,password});if(error)throw error;$('prefPassword').value='';authFeedback('ログインしました。');await updateAccount();}
 catch(e){authFeedback('ログインに失敗しました：'+e.message);}
 finally{$('prefLogin').disabled=false;}
});
$('prefLogout').addEventListener('click',async()=>{
 const client=getClient();if(!client)return;
 $('prefLogout').disabled=true;authFeedback('ログアウトしています…');
 try{const {error}=await client.auth.signOut();if(error)throw error;authFeedback('ログアウトしました。');await updateAccount();}
 catch(e){authFeedback('ログアウトに失敗しました：'+e.message);}
 finally{$('prefLogout').disabled=false;}
});
const client=getClient();if(client)client.auth.onAuthStateChange(()=>setTimeout(updateAccount,0));
// Refresh when returning to settings, without relying on a separate window property.
document.querySelector('.nav-btn[data-page="settings"]')?.addEventListener('click',()=>setTimeout(updateAccount,0));
updateAccount();reflect();
})();
