/* Speaker Ready — Inbox Race v3 (interface Teams + WhatsApp, en HTML)
   Deux applis en onglets, des messages qui arrivent des deux côtés, de plus en plus vite.
   Réponds au plus ancien message de chaque appli. S'il attend trop, tu perds un cœur.
   API fournie par l'appli : name, speak, tone, muted, win, lose, showResult, quit, dayName. */
(function(){
"use strict";
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function initials(n){n=n.replace(/\(.*?\)/g,"").split(/[–-]/).pop().trim();var p=n.split(/\s+/);return ((p[0]||"")[0]+((p[1]||"")[0]||"")).toUpperCase();}
function short(n){return n.replace(/\s*\(.*?\)/,"");}
var WA_COLS=["#E5427E","#1F8FD8","#D97706","#7C3AED","#059669","#DC2626","#0E7490","#9D174D"];
var T_COLS=["#C239B3","#0078D4","#CA5010","#038387","#8764B8","#498205","#986F0B","#E3008C"];
function hcol(n,arr){var h=0;for(var i=0;i<n.length;i++)h=(h*31+n.charCodeAt(i))>>>0;return arr[h%arr.length];}
function buzz(p){try{if(navigator.vibrate)navigator.vibrate(p);}catch(e){}}
var I={
 back:'<svg viewBox="0 0 24 24"><path d="M15 4l-8 8 8 8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 video:'<svg viewBox="0 0 24 24"><rect x="2.5" y="6" width="13" height="12" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M15.5 10.5l6-3.5v10l-6-3.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
 call:'<svg viewBox="0 0 24 24"><path d="M6.6 3.3c.6-.5 1.5-.4 2 .2l2 2.7c.4.5.4 1.2 0 1.7l-1.3 1.6c1 2 2.6 3.7 4.6 4.7l1.6-1.3c.5-.4 1.2-.4 1.7 0l2.7 2c.6.5.7 1.4.2 2l-1.4 1.6c-.8.9-2 1.3-3.2 1C9.9 18.3 5.7 14.1 4.4 8.5c-.3-1.2.1-2.4 1-3.2z" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
 plus:'<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
 cam:'<svg viewBox="0 0 24 24"><path d="M4 8h3l1.6-2.2h6.8L17 8h3v11H4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
 mic:'<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
 send:'<svg viewBox="0 0 24 24"><path d="M3.5 20.5l17-8.5-17-8.5 2.5 8.5z" fill="currentColor"/></svg>',
 sticker:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="9" cy="10.5" r="1.1" fill="currentColor"/><circle cx="15" cy="10.5" r="1.1" fill="currentColor"/><path d="M8.5 14.5c1.8 2 5.2 2 7 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
 teams:'<svg viewBox="0 0 40 40"><rect width="40" height="40" rx="9" fill="#5B5FC7"/><circle cx="28" cy="13" r="4" fill="#C5C7F2"/><rect x="23" y="18" width="11" height="12" rx="4" fill="#9A9DE6"/><rect x="6" y="11" width="19" height="19" rx="3" fill="#4B4FB3"/><path d="M11 16h9M15.5 16v10" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></svg>',
 wa:'<svg viewBox="0 0 40 40"><rect width="40" height="40" rx="9" fill="#25D366"/><path d="M20 8.5a11.4 11.4 0 0 0-9.8 17.2L8.6 31.5l6-1.6A11.4 11.4 0 1 0 20 8.5z" fill="#fff"/><path d="M16.2 14.2c.3-.6.6-.6 1-.6h.7c.2 0 .5 0 .7.6l1 2.4c.1.3 0 .6-.1.8l-.7.8c-.2.2-.2.4 0 .7.6 1 1.6 2 2.7 2.6.3.1.5.1.7-.1l.9-1c.2-.3.5-.3.8-.2l2.3 1.1c.3.2.5.3.5.5 0 .5-.1 1.6-1 2.2-.7.5-1.8.9-3.6.2-2.6-1-4.4-3.4-5-4.4-.6-1-1.5-2.8-.4-4.8z" fill="#25D366"/></svg>',
 tick:'<svg viewBox="0 0 18 12"><path d="M1 6.5l3 3 6.5-8M7.5 9.5l1 1 6.5-9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 warn:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#FF3B30"/><path d="M12 7v6" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="16.6" r="1.4" fill="#fff"/></svg>'
};

function mount(root,G,api){
  var c=G.c,NAME=api.name();
  var A={t:{items:[],pend:[]},w:{items:[],pend:[]}};
  var active=G.msgs[0]&&G.msgs[0][0]==="w"?"w":"t",lives=3,combo=0,ended=false,timer=null,started=false;
  var arriving=0,nextAt=0,k=0,gap=c.gap,clock=9*60+2,lastTick=0,bannerT=null,busy=false;
  G.score=0;G.maxCombo=0;G.mistakes=0;G.answered=0;G.missed=[];G.spawned=0;G.lostLives=0;

  function hhmm(){var h=Math.floor(clock/60)%24,m=clock%60;return (h<10?"0":"")+h+":"+(m<10?"0":"")+m;}
  function now(){return Date.now();}

  root.className="ibx";
  root.innerHTML=
   '<div class="ibhud"><button class="ibq" data-ibquit="1">'+I.back+'Quitter</button><div class="ibday">'+esc(api.dayName(G.i))+'</div>'+
     '<div class="ibhearts" id="ibh"></div><div class="ibsc"><b id="ibscore">0</b><span id="ibcombo"></span></div></div>'+
   '<div class="ibprog"><i id="ibprog"></i></div>'+
   '<div class="ibapps">'+
    '<section class="scr teams" data-app="t">'+
      '<header class="thd"><button class="tbk">'+I.back+'</button><span class="tav sq">EC</span><div class="tti"><b>Congrès ESC 2027</b><span>Général · 14 membres</span></div><button class="tic">'+I.video+'</button><button class="tic">'+I.call+'</button></header>'+
      '<div class="tthread thread" id="thr-t"><div class="tday">Aujourd’hui</div></div>'+
      '<div class="tcomp comp" id="cmp-t"></div>'+
    '</section>'+
    '<section class="scr wa" data-app="w">'+
      '<header class="whd"><button class="wbk">'+I.back+'<span id="wunread"></span></button><span class="wav">🎪</span><div class="wti"><b>Team on-site 🎪</b><span id="wsub">Hostess team, Dr Lee, Ben, toi</span></div><button class="wic">'+I.video+'</button><button class="wic">'+I.call+'</button></header>'+
      '<div class="wthread thread" id="thr-w"><div class="wday"><span>Aujourd’hui</span></div><div class="wsys"><span>🔒 Les messages sont chiffrés de bout en bout.</span></div></div>'+
      '<div class="wcomp comp" id="cmp-w"></div>'+
    '</section>'+
   '</div>'+
   '<div class="ibdock"><button class="dk" data-ibapp="t"><span class="dkic">'+I.teams+'<em class="bdg" id="bdg-t"></em></span><span>Teams</span></button>'+
     '<button class="dk" data-ibapp="w"><span class="dkic">'+I.wa+'<em class="bdg" id="bdg-w"></em></span><span>WhatsApp</span></button></div>'+
   '<div class="ibban" id="ibban"></div>'+
   '<div class="ibcd" id="ibcd"></div>';

  var $=function(s){return root.querySelector(s);};
  function hearts(){$("#ibh").innerHTML=[0,1,2].map(function(k){return '<span class="'+(k<lives?"on":"")+'">♥</span>';}).join("");}
  function hud(){
    $("#ibscore").textContent=G.score;$("#ibcombo").textContent=combo>=2?"×"+combo:"";
    var done=G.answered+G.missed.length;$("#ibprog").style.width=Math.round(done/G.msgs.length*100)+"%";
    ["t","w"].forEach(function(a){var n=A[a].pend.length,b=$("#bdg-"+a);b.textContent=n||"";b.className="bdg"+(n?" on":"")+(urgent(a)?" hot":"");});
    var wu=$("#wunread");wu.textContent=A.t.pend.length?A.t.pend.length:"";
  }
  function urgent(a){var t=now();return A[a].pend.some(function(it){return (t-it.t0)/it.pat>.65;});}
  function setApp(a){
    if(active===a&&started)return;active=a;
    root.querySelectorAll(".scr").forEach(function(s){s.classList.toggle("on",s.getAttribute("data-app")===a);});
    root.querySelectorAll(".dk").forEach(function(d){d.classList.toggle("on",d.getAttribute("data-ibapp")===a);});
    compose(a);scrollEnd(a,true);hud();
    if(api.tone)api.tone([520],.04,"sine",.05);
  }
  function scrollEnd(a,instant){var th=$("#thr-"+a);if(!th)return;if(instant)th.scrollTop=th.scrollHeight;else th.scrollTo({top:th.scrollHeight,behavior:"smooth"});}

  /* ---------- bulles ---------- */
  function inBubble(it){
    var m=it.m,a=it.app,el=document.createElement("div"),tr=c.showFr?'<div class="btr">'+esc(m[3])+'</div>':'<div class="btr hid">'+esc(m[3])+'</div>';
    if(a==="w"){
      el.className="wrow in new";
      el.innerHTML='<div class="wb"><b class="wn" style="color:'+hcol(m[1],WA_COLS)+'">'+esc(short(m[1]))+'</b><div class="wtx">'+esc(m[2])+'</div>'+tr+'<span class="wt">'+hhmm()+'</span><i class="pat"><i></i></i></div>';
    }else{
      el.className="trow in new";
      el.innerHTML='<span class="tav" style="background:'+hcol(m[1],T_COLS)+'">'+esc(initials(m[1]))+'</span><div class="tbw"><div class="tmeta"><b>'+esc(m[1])+'</b> '+hhmm()+'</div><div class="tb"><div class="ttx">'+esc(m[2])+'</div>'+tr+'<i class="pat"><i></i></i></div></div>';
    }
    el.addEventListener("click",function(){var t=el.querySelector(".btr");if(t&&t.classList.contains("hid")){t.classList.remove("hid");G.score=Math.max(0,G.score-5);hud();}api.speak(m[2]);});
    return el;
  }
  function outBubble(a,text,quote,ok){
    var el=document.createElement("div");
    if(a==="w"){
      el.className="wrow out new";
      el.innerHTML='<div class="wb"><div class="wq" style="border-color:'+hcol(quote[1],WA_COLS)+'"><b style="color:'+hcol(quote[1],WA_COLS)+'">'+esc(short(quote[1]))+'</b><span>'+esc(quote[2])+'</span></div><div class="wtx">'+esc(text)+'</div><span class="wt">'+hhmm()+' <span class="tk'+(ok?"":" gray")+'">'+I.tick+'</span></span></div>'+(ok?'':'<span class="fail">'+I.warn+'</span>');
    }else{
      el.className="trow out new";
      el.innerHTML='<div class="tbw"><div class="tmeta">'+hhmm()+(ok?' · <span class="seen">Vu</span>':'')+'</div><div class="tb"><div class="tq"><b>'+esc(quote[1])+'</b><span>'+esc(quote[2])+'</span></div><div class="ttx">'+esc(text)+'</div></div></div>'+(ok?'':'<span class="fail">'+I.warn+'</span>');
    }
    return el;
  }
  function typing(a){
    var el=document.createElement("div");el.className=a==="w"?"wrow in typ":"trow in typ";
    el.innerHTML=a==="w"?'<div class="wb"><span class="dots"><i></i><i></i><i></i></span></div>':'<span class="tav ghost"></span><div class="tbw"><div class="tb"><span class="dots"><i></i><i></i><i></i></span></div></div>';
    return el;
  }

  /* ---------- zone de réponse ---------- */
  function compose(a){
    var box=$("#cmp-"+a),it=A[a].pend[0];
    var bar=a==="w"
      ?'<div class="wbar"><span class="wpl">'+I.plus+'</span><div class="win" id="win-'+a+'"><span class="ph">Message</span><span class="wst">'+I.sticker+'</span></div><span class="wpl">'+I.cam+'</span><span class="wpl">'+I.mic+'</span></div>'
      :'<div class="tmsbar"><span class="tpl">'+I.plus+'</span><div class="tin" id="win-'+a+'"><span class="ph">Type a message</span></div><span class="tsend">'+I.send+'</span></div>';
    if(!it){box.innerHTML=bar;box.classList.remove("open");return;}
    var m=it.m;
    if(!it.opts)it.opts=shuffle([m[4],m[5],m[6]]);
    box.innerHTML=
      (a==="w"
        ?'<div class="wrep"><div class="wq" style="border-color:'+hcol(m[1],WA_COLS)+'"><b style="color:'+hcol(m[1],WA_COLS)+'">'+esc(short(m[1]))+'</b><span>'+esc(m[2])+'</span></div><span class="rx">Répondre</span></div>'
        :'<div class="trep"><div class="tq"><b>Réponse à '+esc(m[1])+'</b><span>'+esc(m[2])+'</span></div></div>')+
      '<div class="sugg">'+it.opts.map(function(o,j){return '<button class="sg" data-ibpick="'+j+'">'+esc(o)+'</button>';}).join("")+'</div>'+bar;
    box.classList.add("open");
  }
  function pick(a,j){
    if(busy||ended)return;var it=A[a].pend[0];if(!it)return;var txt=it.opts[j],ok=txt===it.m[4];busy=true;
    var inp=$("#win-"+a);if(inp)inp.innerHTML='<span class="typed">'+esc(txt)+'</span>';
    root.querySelectorAll("#cmp-"+a+" .sg").forEach(function(b,k){b.disabled=true;if(k===j)b.classList.add("sel");});
    setTimeout(function(){
      busy=false;if(ended)return;
      var th=$("#thr-"+a),el=outBubble(a,txt,it.m,ok);th.appendChild(el);scrollEnd(a);clock++;
      if(ok){
        A[a].pend.shift();it.el.classList.add("done");it.el.querySelector(".pat").remove();
        combo++;G.maxCombo=Math.max(G.maxCombo,combo);G.answered++;
        var left=1-(now()-it.t0)/it.pat,pts=10+Math.round(left*10)+Math.min(combo,10)*2;G.score+=pts;
        if(api.tone){api.tone(a==="w"?[880,1320]:[660,990],.07,"triangle",.09,.05);}
        setTimeout(function(){var tk=el.querySelector(".tk");if(tk)tk.classList.add("blue");},500);
        floatTxt("+"+pts+(combo>=3?" · ×"+combo:""),a);
        if(Math.random()<.35)setTimeout(function(){react(it);},700);
        if(combo===5||combo===10)praise(combo===5?"Inbox ninja 🥷":"Unstoppable 🔥");
      }else{
        combo=0;G.mistakes++;if(G.missed.indexOf(it.m)<0)G.missed.push(it.m);it.wrong=(it.wrong||0)+1;
        it.t0-=it.pat*.25;nextAt=Math.min(nextAt,now()+600);
        if(api.tone)api.tone([220,165],.14,"square",.05,.1);buzz(80);
        var tr=it.el.querySelector(".btr");if(tr)tr.classList.remove("hid");
        setTimeout(function(){if(ended)return;var q=document.createElement("div");q.className=(a==="w"?"wrow":"trow")+" in new";
          q.innerHTML=a==="w"?'<div class="wb"><b class="wn" style="color:'+hcol(it.m[1],WA_COLS)+'">'+esc(short(it.m[1]))+'</b><div class="wtx">Sorry? 🤔</div><span class="wt">'+hhmm()+'</span></div>':'<span class="tav" style="background:'+hcol(it.m[1],T_COLS)+'">'+esc(initials(it.m[1]))+'</span><div class="tbw"><div class="tb"><div class="ttx">Sorry, what do you mean? 🤔</div></div></div>';
          $("#thr-"+a).appendChild(q);scrollEnd(a);},450);
        root.classList.add("shake");setTimeout(function(){root.classList.remove("shake");},350);
      }
      compose(a);hud();checkEnd();
    },260);
  }
  function react(it){var r=it.el.querySelector(it.app==="w"?".wb":".tb");if(!r||r.querySelector(".rct"))return;var e=document.createElement("span");e.className="rct";e.textContent=["👍","❤️","🙏","😂","👏"][Math.floor(Math.random()*5)];r.appendChild(e);}
  function floatTxt(t,a){var f=document.createElement("div");f.className="ibfl "+a;f.textContent=t;root.appendChild(f);setTimeout(function(){f.remove();},900);}
  function praise(t){var f=document.createElement("div");f.className="ibpr";f.textContent=t;root.appendChild(f);if(api.tone)api.tone([784,988,1175,1568],.09,"triangle",.1,.06);setTimeout(function(){f.remove();},1400);}

  /* ---------- notification ---------- */
  function banner(it){
    var b=$("#ibban"),m=it.m;clearTimeout(bannerT);
    b.innerHTML='<button class="bn" data-ibapp="'+it.app+'"><span class="bic">'+(it.app==="w"?I.wa:I.teams)+'</span><span class="btx"><span class="bapp">'+(it.app==="w"?"WHATSAPP":"TEAMS")+'<i>maintenant</i></span><b>'+esc(it.app==="w"?short(m[1])+" @ Team on-site":m[1])+'</b><span>'+esc(m[2])+'</span></span></button>';
    b.classList.remove("show");void b.offsetWidth;b.classList.add("show");
    bannerT=setTimeout(function(){b.classList.remove("show");},2600);
  }

  /* ---------- arrivée des messages ---------- */
  function spawn(){
    if(k>=G.msgs.length)return;
    var m=G.msgs[k++],a=m[0]==="w"?"w":"t";G.spawned=k;arriving++;
    var t0=now(),ty=typing(a),th=$("#thr-"+a);th.appendChild(ty);if(a===active)scrollEnd(a);
    setTimeout(function(){
      arriving--;if(ended)return;ty.remove();clock+=1+Math.floor(Math.random()*2);
      var it={m:m,app:a,t0:now(),pat:c.pat};it.el=inBubble(it);th.appendChild(it.el);A[a].items.push(it);A[a].pend.push(it);
      if(a===active){scrollEnd(a);if(A[a].pend.length===1)compose(a);}
      else banner(it);
      if(api.tone){if(a==="w")api.tone([1320,1760],.06,"sine",.08,.05);else api.tone([784,659],.12,"sine",.08,.1);}
      hud();
    },c.typing);
  }
  function tick(){
    if(ended||!started)return;var t=now();
    if(t>=nextAt&&k<G.msgs.length){
      spawn();
      if(Math.random()<c.burst&&k<G.msgs.length)setTimeout(spawn,500);
      gap=Math.max(c.gapMin,gap*c.acc);nextAt=t+gap*(0.85+Math.random()*.3);
    }
    ["t","w"].forEach(function(a){
      A[a].pend.slice().forEach(function(it){
        var r=(t-it.t0)/it.pat,bar=it.el.querySelector(".pat i");
        if(bar){bar.style.width=Math.max(0,(1-r)*100)+"%";bar.parentNode.className="pat"+(r>.65?" hot":r>.4?" mid":"");}
        if(r>=1)expire(it);
      });
    });
    if(t-lastTick>1000){lastTick=t;if(urgent(active==="t"?"w":"t")&&api.tone)api.tone([1200],.03,"square",.02);}
    hud();
  }
  function expire(it){
    var a=it.app;A[a].pend.splice(A[a].pend.indexOf(it),1);lives--;G.lostLives++;combo=0;
    if(G.missed.indexOf(it.m)<0)G.missed.push(it.m);
    it.el.classList.add("expired");var p=it.el.querySelector(".pat");if(p)p.remove();
    var n=document.createElement("div");n.className=a==="w"?"wsys":"tsys";n.innerHTML='<span>⏰ '+esc(short(it.m[1]))+' attendait une réponse… Bonne réponse : « '+esc(it.m[4])+' »</span>';
    $("#thr-"+a).appendChild(n);scrollEnd(a);
    if(api.tone)api.tone([300,200],.18,"sawtooth",.05,.12);buzz([60,40,60]);
    root.classList.add("flashred");setTimeout(function(){root.classList.remove("flashred");},400);
    if(a===active)compose(a);hearts();hud();checkEnd();
  }
  function checkEnd(){
    if(ended)return;
    if(lives<=0){finish(false,"lives");return;}
    if(k>=G.msgs.length&&!arriving&&!A.t.pend.length&&!A.w.pend.length){
      setTimeout(function(){if(!ended&&!arriving&&!A.t.pend.length&&!A.w.pend.length)finish(true);},700);
    }
  }
  function finish(won,reason){
    if(ended)return;ended=true;clearInterval(timer);
    var cd=$("#ibcd");
    if(won){var r=api.win(G);cd.innerHTML='<div class="cdw"><div class="cz">Inbox zero ✨</div><div class="cs">'+[0,1,2].map(function(k){return '<span class="'+(k<r.stars?"on":"")+'">★</span>';}).join("")+'</div></div>';if(api.tone)api.tone([523,659,784,1047,1319],.12,"triangle",.12,.08);}
    else{api.lose(G,reason);cd.innerHTML='<div class="cdw lost"><div class="cz">Inbox débordée 😵</div></div>';if(api.tone)api.tone([392,330,262,196],.2,"sawtooth",.05,.16);}
    cd.classList.add("show");setTimeout(function(){api.showResult();},1700);
  }

  /* ---------- clics ---------- */
  root.addEventListener("click",function(e){
    var b=e.target.closest("[data-ibapp],[data-ibpick],[data-ibquit]");if(!b)return;
    if(b.hasAttribute("data-ibquit")){destroy();api.quit();return;}
    if(b.hasAttribute("data-ibapp")){$("#ibban").classList.remove("show");setApp(b.getAttribute("data-ibapp"));return;}
    if(b.hasAttribute("data-ibpick")){pick(b.closest(".scr").getAttribute("data-app"),+b.getAttribute("data-ibpick"));}
  });

  /* ---------- départ ---------- */
  hearts();setApp(active);compose("t");compose("w");started=false;
  var cd=$("#ibcd");cd.innerHTML='<div class="cdw"><div class="cz">'+esc(api.dayName(G.i))+'</div><div class="cs2">Teams et WhatsApp vont sonner.<br>Réponds au plus ancien message de chaque appli.</div><div class="cn" id="cn">3</div></div>';cd.classList.add("show");
  var n=3,cdT=setInterval(function(){n--;var el=$("#cn");if(n>0){if(el)el.textContent=n;if(api.tone)api.tone([660],.08,"sine",.08);}
    else{clearInterval(cdT);if(api.tone)api.tone([990],.15,"triangle",.1);cd.classList.remove("show");started=true;nextAt=now()+300;}},700);
  if(api.tone)api.tone([660],.08,"sine",.08);
  timer=setInterval(tick,100);
  function destroy(){ended=true;clearInterval(timer);clearInterval(cdT);clearTimeout(bannerT);}
  return {destroy:destroy};
}
window.InboxRaceUI={mount:mount};
})();
