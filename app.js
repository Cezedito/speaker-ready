/* Speaker Ready — application
   Le contenu des leçons est dans lessons-q1.js … lessons-q4.js */
(function(){
"use strict";

/* ===================== PRÉNOM =====================
   Le prénom de l'apprenante (réglable dans « Ma progression »). Les contenus utilisent le repère {name}. */
var NAME=(function(){try{var o=JSON.parse(localStorage.getItem("congress-english:v3")||"{}");if(o.profile&&o.profile.name)return String(o.profile.name).trim().slice(0,30);}catch(e){}return "Clara";})();
function personalize(v){
  if(typeof v==="string")return v.split("{name}").join(NAME);
  if(Array.isArray(v)){for(var i=0;i<v.length;i++)v[i]=personalize(v[i]);return v;}
  if(v&&typeof v==="object"){for(var k in v)v[k]=personalize(v[k]);return v;}
  return v;
}
personalize(window.LESSONS||[]);personalize(window.CALLS||[]);
/* dans Inbox Race, une question sur deux l'interpelle par son prénom */
(window.INBOX||[]).forEach(function(m,i){
  if(i%2===0&&/^(Can|Could|Did|Are|Is|Do|Where|When|Which|How|What|Would|Have)\b/.test(m[2])&&/\?\s*\S*$/.test(m[2]))m[2]=NAME+", "+m[2].charAt(0).toLowerCase()+m[2].slice(1);
});

/* ===================== DONNÉES ===================== */
var LESSONS=(window.LESSONS||[]).slice().sort(function(a,b){return a.w-b.w;});
var BYW={};LESSONS.forEach(function(l){BYW[l.w]=l;});
var WORDS=[],PHRASES=[];
LESSONS.forEach(function(l){
  l.v.forEach(function(v,i){WORDS.push({id:l.w+"-"+i,en:v[0],fr:v[1],ex:v[2],w:l.w});});
  l.p.forEach(function(p){PHRASES.push({en:p[0],fr:p[1],w:l.w});});
});
/* lexique thématique */
var BANK=[],seenEn={};WORDS.forEach(function(x){seenEn[x.en.toLowerCase()]=x;});
(window.VOCAB_BANK||[]).forEach(function(t,ti){
  var th={id:t.id,n:t.n,ic:t.ic,i:ti,words:[]};
  t.w.split("\n").forEach(function(line,i){
    var f=line.split("|");if(f.length<3)return;var en=f[0].trim(),ex0=seenEn[en.toLowerCase()];if(ex0){if(th.words.indexOf(ex0)<0)th.words.push(ex0);return;}
    var o={id:"b"+t.id+"-"+i,en:en,fr:f[1].trim(),ex:f.slice(2).join("|").trim(),w:1000+ti};seenEn[en.toLowerCase()]=o;th.words.push(o);WORDS.push(o);
  });
  BANK.push(th);
});
function wlabel(w){if(w.w>=1000){var t=BANK[w.w-1000];return t.ic+" "+t.n;}var l=BYW[w.w];return l?"Leçon "+lnum(l):"";}
function bankKnown(t){return t.words.filter(function(x){return S.known[x.id];}).length;}
function bankSeen(t){return t.words.filter(function(x){return S.srs[x.id];}).length;}
var QNAMES={1:"Les bases pro",2:"Partenaires et logistique",3:"Presse et médical",4:"Aisance et nuances",5:"Marketing",6:"Anglais du quotidien au bureau"};
var QSHORT={1:"Trimestre 1",2:"Trimestre 2",3:"Trimestre 3",4:"Trimestre 4",5:"Marketing",6:"Au quotidien"};
var MAIN=LESSONS.filter(function(l){return l.q<=4;});
function track(q){return LESSONS.filter(function(l){return l.q===q;});}
function lnum(l){return l.q<=4?l.w:track(l.q).indexOf(l)+1;}
function sibling(l,d){var t=track(l.q),k=t.indexOf(l)+d;return t[k]||null;}

/* ===================== OUTILS ===================== */
function $(s){return document.querySelector(s);}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c];});}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function pad(n){return String(n).padStart(2,"0");}
function dkey(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());}
function today(){return dkey(new Date());}
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function head(en){return en.split(" / ")[0].replace(/\s*\(.*\)$/,"").trim();}
var SVG={
 home:'<svg viewBox="0 0 24 24"><path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/></svg>',
 lessons:'<svg viewBox="0 0 24 24"><path d="M3 6.5C5.5 5 8.5 5 12 7c3.5-2 6.5-2 9-.5V19c-2.5-1.5-5.5-1.5-9 .5-3.5-2-6.5-2-9-.5z"/><path d="M12 7v12.5"/></svg>',
 review:'<svg viewBox="0 0 24 24"><rect x="3" y="6" width="14" height="14" rx="3"/><path d="M7 3h11a3 3 0 0 1 3 3v11"/></svg>',
 games:'<svg viewBox="0 0 24 24"><rect x="2.5" y="7" width="19" height="11" rx="5.5"/><path d="M7 11v3M5.5 12.5h3"/><circle cx="15.5" cy="11.5" r=".6" fill="currentColor"/><circle cx="17.5" cy="13.5" r=".6" fill="currentColor"/></svg>',
 oral:'<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>',
 play:'<svg viewBox="0 0 24 24"><path d="M8 5.5v13l10-6.5z" fill="currentColor" stroke="none"/></svg>',
 sound:'<svg viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
 slow:'<svg viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 12h4"/></svg>',
 fire:'<svg viewBox="0 0 24 24"><path d="M12 21c4 0 6.5-2.6 6.5-6.2 0-4.3-3.8-6.6-4.6-10.3-2.3 1.6-3.4 4-3 6.3-1.1-.6-1.9-1.7-2.1-2.9C7 9.4 5.5 11.8 5.5 14.8 5.5 18.4 8 21 12 21z"/></svg>',
 dice:'<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="15" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/><circle cx="9" cy="15" r="1" fill="currentColor"/></svg>'
};

/* ===================== ÉTAT ===================== */
var KEY="congress-english:v3";
var S={decks:[],known:{},done:{},best:null,days:[],start:today(),games:{},loop:{},inbox:{},srs:{},sess:{},calls:{},profile:{name:NAME}};
try{var raw=localStorage.getItem(KEY);if(raw){var o=JSON.parse(raw);if(o&&typeof o==="object"){for(var k in S){if(o[k]!==undefined)S[k]=o[k];}}}}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
save();
function markToday(){var t=today();if(S.days.indexOf(t)<0){S.days.push(t);save();}}
function streak(){var n=0,d=new Date();while(S.days.indexOf(dkey(d))>-1){n++;d.setDate(d.getDate()-1);}return n;}
function valid(w){return (S.done[w]||0)>=4;}
function doneCount(){return MAIN.filter(function(l){return valid(l.w);}).length;}
function knownCount(){return WORDS.filter(function(w){return S.known[w.id];}).length;}
function programWeek(){var s=new Date(S.start+"T00:00:00"),d=Math.floor((new Date()-s)/864e5);return Math.max(1,Math.min(52,Math.floor(d/7)+1));}
function nextLesson(){for(var i=0;i<MAIN.length;i++){if(!valid(MAIN[i].w))return MAIN[i];}return null;}
/* mots et phrases disponibles pour les jeux : leçons faites, sinon les premières leçons */
function reach(){var n=nextLesson();var m=0;Object.keys(S.done).forEach(function(w){if(+w<=52)m=Math.max(m,+w);});return Math.max(3,m,n?n.w:52);}
function poolWords(scope){
  if(scope==="all")return WORDS.slice();
  var d=WORDS.filter(function(w){return S.done[w.w]!==undefined;});
  if(scope==="done")return d;
  if(d.length>=12)return d;
  var r=reach();return WORDS.filter(function(w){return w.w<=r||S.done[w.w]!==undefined;});
}
function poolPhrases(){
  var d=PHRASES.filter(function(p){return S.done[p.w]!==undefined;});
  if(d.length>=8)return d;
  var r=reach();return PHRASES.filter(function(p){return p.w<=r||S.done[p.w]!==undefined;});
}

/* ===================== VOIX ===================== */
var enVoice=null,HAS_TTS="speechSynthesis" in window;
function pickVoice(){if(!HAS_TTS)return;var vs=speechSynthesis.getVoices();enVoice=vs.find(function(v){return /en-GB/i.test(v.lang);})||vs.find(function(v){return /^en/i.test(v.lang);})||null;}
if(HAS_TTS){pickVoice();speechSynthesis.onvoiceschanged=pickVoice;}
/* Voix naturelle « Heart » pré-enregistrée (dossier voices/), repli sur la synthèse du navigateur.
   Un seul son à la fois : chaque lecture coupe la précédente. */
var VOICE={},VPLAYER=null,VSEQ=0;
try{fetch("voices/index.json",{cache:"no-cache"}).then(function(r){return r.ok?r.json():[];}).then(function(j){(j||[]).forEach(function(k){VOICE[k]=1;});}).catch(function(){});}catch(e){}
function vnorm(t){return String(t).replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu,"").replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/\s+/g," ").trim().toLowerCase();}
function vkey(t){var s=vnorm(t),h1=0x811c9dc5,h2=5381;for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);h1^=c;h1=Math.imul(h1,16777619)>>>0;h2=(Math.imul(h2,33)+c)>>>0;}return h1.toString(36)+h2.toString(36);}
function stopAudio(){VSEQ++;if(VPLAYER){try{VPLAYER.onended=null;VPLAYER.onerror=null;VPLAYER.pause();}catch(e){}}if(HAS_TTS){try{speechSynthesis.cancel();}catch(e){}}}
function ttsSpeak(t,rate,cb){
  if(!HAS_TTS){if(cb)setTimeout(cb,300);return;}
  var u=new SpeechSynthesisUtterance(t);u.lang=enVoice?enVoice.lang:"en-GB";if(enVoice)u.voice=enVoice;u.rate=rate||.95;
  if(cb)u.onend=function(){cb();};speechSynthesis.speak(u);
}
function speak(t,rate,cb){
  if(!t){if(cb)cb();return;}
  stopAudio();var my=VSEQ,k=vkey(t),done=function(){if(my===VSEQ&&cb)cb();};
  if(VOICE[k]){
    var a=VPLAYER||(VPLAYER=new Audio());a.preload="auto";
    a.onended=done;a.onerror=function(){if(my===VSEQ)ttsSpeak(t,rate,done);};
    a.src="voices/"+k+".mp3";
    try{a.preservesPitch=true;a.webkitPreservesPitch=true;}catch(e){}
    a.playbackRate=Math.max(.5,Math.min(1.25,(rate||.95)/.95));a.defaultPlaybackRate=a.playbackRate;
    var p=a.play();if(p&&p.catch)p.catch(function(){if(my===VSEQ)ttsSpeak(t,rate,done);});
  }else ttsSpeak(t,rate,done);
}
window.__vkey=function(t){return vkey(t);};window.__hasVoice=function(t){return !!VOICE[vkey(t)];};
function speakSeq(list,rate){var i=0,next=function(){if(i<list.length)speak(list[i++],rate,function(){setTimeout(next,250);});};next();}
/* liste de tout ce que l'appli peut lire (sert à préparer les fichiers audio) */
window.__speechTexts=function(){
  var out={},add=function(t){if(t&&/[a-z]/i.test(t))out[vnorm(t)]=t;};
  WORDS.forEach(function(w){add(w.en);add(head(w.en));add(w.ex);});
  PHRASES.forEach(function(p){add(p.en);p.en.split(" ").forEach(function(x){add(tokClean(x));});});
  LESSONS.forEach(function(l){(l.g&&l.g.e||[]).forEach(function(e){add(e[0]);});});
  (window.INBOX||[]).forEach(function(m){add(m[2]);add(m[4]);});
  (window.CALLS||[]).forEach(function(c){c.turns.forEach(function(t){add(t.c[0]);t.o.forEach(function(o){add(o[0]);if(o[3])add(o[3][0]);});});["good","ok","bad"].forEach(function(k){add(c.end[k][0]);});});
  add("Hello? Are you still there?");
  return Object.keys(out).map(function(k){return {k:vkey(k),t:out[k]};});
};
function tokClean(x){return x.replace(/^[^A-Za-z0-9']+|[^A-Za-z0-9']+$/g,"");}
var SR=window.SpeechRecognition||window.webkitSpeechRecognition;

/* ===================== NAVIGATION ===================== */
var tab="home",route={lesson:null},quarterSel=null,overlay=null,timerId=null;
var TABS=[["home","Accueil"],["lessons","Leçons"],["review","Révision"],["games","Jeux"],["oral","Oral"]];
var TITLES={home:"Accueil",lessons:"Leçons",review:"Révision",games:"Mini-jeux",oral:"Expression orale"};
function renderTabs(){
  var box=$("#tabs");
  if(!box.dataset.built){box.innerHTML='<span class="ind" id="ind" aria-hidden="true"></span>'+TABS.map(function(t){return '<button class="tab" data-tab="'+t[0]+'">'+SVG[t[0]]+'<span>'+t[1]+'</span></button>';}).join("");box.dataset.built="1";}
  var idx=0;Array.prototype.forEach.call(box.querySelectorAll(".tab"),function(b,i){if(b.dataset.tab===tab){b.setAttribute("aria-current","page");idx=i;}else b.removeAttribute("aria-current");});
  $("#ind").style.transform="translateX("+(idx*100)+"%)";
}

/* ===================== ACCUEIL ===================== */
var GAMES=[
 {id:"memory",n:"Paires",s:"Associe chaque mot anglais à sa traduction",best:function(v){return v+" coups";}},
 {id:"chrono",n:"Vrai ou faux chrono",s:"60 secondes pour valider un max de traductions",best:function(v){return v+" points";}},
 {id:"scramble",n:"Phrase en désordre",s:"Remets les mots dans le bon ordre",best:function(v){return v+" / 5";}},
 {id:"dictee",n:"Dictée",s:"Écoute un mot et écris-le",best:function(v){return v+" / 8";}}
];
function gameOfDay(){var d=new Date(),start=new Date(d.getFullYear(),0,0);return GAMES[Math.floor((d-start)/864e5)%GAMES.length];}
var settingsOpen=false;
function renderHome(){
  if(settingsOpen)return renderSettings();
  var dc=doneCount(),wk=programWeek(),nx=nextLesson(),kc=knownCount(),st=streak();
  view.innerHTML=
   '<div class="bento">'+sessTile()+
    '<div class="tile span2 hstats">'+
      '<div><b id="cnt" data-to="'+dc+'">'+dc+'</b><span>/ 52 leçons</span></div>'+
      '<div><b>'+st+'</b><span>jour'+(st>1?"s":"")+' de suite</span></div>'+
      '<div><b>'+kc+'</b><span>mots acquis</span></div>'+
      '<div class="hmeter"><i style="width:'+Math.round(dc/52*100)+'%"></i></div>'+
    '</div>'+
    (nx?'<button class="tile cont span2" data-open="'+nx.w+'"><span class="ico cta">'+SVG.play+'</span><span class="txt"><span class="tag">Leçon '+nx.w+' · semaine '+wk+'</span><b>'+esc(nx.t)+'</b></span><span class="chev" aria-hidden="true"></span></button>':'')+
   '</div>'+
   '<h2>Jouer</h2><div class="qgrid">'+
    '<button class="qtile q1" data-loopmap="1"><span class="qe">🍲</span><b>Congress Loop</b><span>Niveau '+currentLevel().w+'-'+currentLevel().i+'</span></button>'+
    '<button class="qtile q2" data-inboxmap="1"><span class="qe">💬</span><b>Inbox Race</b><span>'+ibTotal()+' ★</span></button>'+
    '<button class="qtile q3" data-callsmap="1"><span class="qe">📞</span><b>Le Coup de fil</b><span>'+callStars()+' / 30 ★</span></button>'+
    '<button class="qtile q4" data-tab="oral"><span class="qe">🎙️</span><b>Oral</b><span>'+oralToday()+' / '+ORAL_GOAL+' aujourd’hui</span></button>'+
   '</div>';
  countUp();
}
function renderSettings(){
  view.innerHTML='<button class="backlink" data-settings="0">‹ Accueil</button><h1 class="stitle">Réglages</h1>'+backupHTML()+'<h2>Jeux</h2><div class="card"><p style="margin:0 0 12px">Les explications s’affichent au lancement de chaque jeu tant que tu n’as pas coché « ne plus afficher ».</p><button class="btn" data-tipsreset="1">Revoir les explications des jeux</button></div>';
}
function sessTile(){
  var p=sessPlan(),done=sessDoneToday(),parts=[];
  if(p.due.length)parts.push(p.due.length+" mot"+(p.due.length>1?"s":"")+" à revoir");
  if(p.nw.length)parts.push(p.nw.length+" nouveaux mots");
  parts.push("quiz","défi");
  return '<button class="tile cont span2 sesstile'+(done?" done":"")+'" data-session="1"><span class="ico cta">'+(done?"✓":SVG.play)+'</span><span class="txt"><span class="tag">'+(done?"Session du jour faite · série "+streak()+" 🔥":esc(NAME)+", ta session du jour · 10 min")+'</span><b>'+(done?"Refaire une session":parts.join(" · "))+'</b></span><span class="chev" aria-hidden="true"></span></button>';
}
function greet(){var h=new Date().getHours();return (h>=18||h<4?"Bonsoir ":"Bonjour ")+NAME+" 👋";}
function countUp(){
  var el=$("#cnt");if(!el)return;var to=+el.dataset.to;
  if(!to||(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches))return;
  var t0=null;function step(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/900);el.textContent=Math.round(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(step);}requestAnimationFrame(step);
}

/* ===================== LEÇONS ===================== */
function scorePill(w){var s=S.done[w];if(s===undefined)return "";return '<span class="pill '+(s>=4?"good":"warn")+'">'+s+' / 6</span>';}
function lessonList(q){
  var nx=nextLesson();
  return '<div class="stack list">'+LESSONS.filter(function(l){return l.q===q;}).map(function(l){
    var cls="les small nav"+(valid(l.w)?" done":"")+(nx&&nx.w===l.w?" cur":"");
    return '<button class="'+cls+'" data-open="'+l.w+'"><span class="dot">'+lnum(l)+'</span><span><b>'+esc(l.t)+'</b><span class="fr">'+l.lv+' · '+esc(l.g.t)+'</span></span>'+(scorePill(l.w)||'<span></span>')+'</button>';
  }).join("")+'</div>';
}
function renderLessons(){
  if(route.lesson)return renderReader(BYW[route.lesson]);
  var nx=nextLesson();if(!quarterSel)quarterSel=nx?nx.q:1;
  var q=quarterSel,dq=LESSONS.filter(function(l){return l.q===q&&valid(l.w);}).length,tq=LESSONS.filter(function(l){return l.q===q;}).length;
  view.innerHTML='<div class="chips">'+[5,6,1,2,3,4].map(function(i){return '<button class="chip'+(i===q?" on":"")+'" data-quarter="'+i+'">'+QSHORT[i]+'</button>';}).join("")+'</div>'+
   '<div class="card" style="margin-bottom:14px"><div class="tag">'+QNAMES[q]+'</div><div style="display:flex;justify-content:space-between;align-items:baseline;margin:6px 0 10px"><b style="font-family:var(--f-display);font-size:22px">'+dq+' / '+tq+' leçons</b><span class="tag">'+LESSONS.filter(function(l){return l.q===q;})[0].lv+' → '+LESSONS.filter(function(l){return l.q===q;})[tq-1].lv+'</span></div><div class="prog"><i style="width:'+Math.round(dq/tq*100)+'%"></i></div></div>'+
   lessonList(q);
}
function renderReader(l){
  var prev=sibling(l,-1),next=sibling(l,1);
  view.innerHTML='<div class="reader"><button class="back" data-back="1">‹ Leçons</button>'+
   '<div class="kick">'+(l.q<=4?'Semaine '+l.w+' · Niveau '+l.lv+' · Trimestre '+l.q:'Parcours '+QNAMES[l.q]+' · Leçon '+lnum(l)+' · '+l.lv)+'</div><h1>'+esc(l.t)+'</h1>'+(scorePill(l.w)?'<div style="margin-top:6px">'+scorePill(l.w)+'</div>':'')+
   '<h2>Vocabulaire</h2><div class="stack list">'+l.v.map(function(v,i){var id=l.w+"-"+i;
     return '<button class="les" data-say="'+esc(v[0])+'"><span class="ico">'+SVG.sound+'</span><span><b>'+esc(v[0])+'</b><span class="fr">'+esc(v[1])+'</span><span class="ex">'+esc(v[2])+'</span></span>'+(S.known[id]?'<span class="pill good">Su</span>':'<span></span>')+'</button>';}).join("")+'</div>'+
   '<h2>Grammaire</h2><div class="box key"><span class="lab">Point de grammaire</span><h3>'+esc(l.g.t)+'</h3><p>'+esc(l.g.x)+'</p>'+
     l.g.e.map(function(e){return '<button class="gex" data-say="'+esc(e[0])+'"><span class="ico">'+SVG.sound+'</span><span><b>'+esc(e[0])+'</b><span class="fr">'+esc(e[1])+'</span></span></button>';}).join("")+'</div>'+
   '<h2>Phrases utiles</h2><div class="stack list">'+l.p.map(function(p){
     return '<button class="les" data-say="'+esc(p[0])+'"><span class="ico">'+SVG.sound+'</span><span><b>'+esc(p[0])+'</b><span class="fr">'+esc(p[1])+'</span></span><span></span></button>';}).join("")+'</div>'+
   '<div class="box ex" style="margin-top:20px"><span class="lab">Astuce métier</span><p>'+esc(l.tip)+'</p></div>'+
   '<div class="actions"><button class="btn primary" data-lquiz="'+l.w+'">'+(S.done[l.w]!==undefined?"Refaire le quiz de la leçon":"Valider la leçon")+' · 6 questions</button></div>'+
   '<div class="readnav"><button class="btn" data-open="'+(prev?prev.w:"")+'"'+(prev?"":" disabled")+'>‹ Leçon '+(prev?lnum(prev):"")+'</button><button class="btn" data-open="'+(next?next.w:"")+'"'+(next?"":" disabled")+'>Leçon '+(next?lnum(next):"")+' ›</button></div></div>';
}

/* ===================== MOTEUR DE QUIZ ===================== */
function others(list,item,key,n){var seen={};seen[item[key].toLowerCase()]=1;var out=[];shuffle(list).forEach(function(x){var t=x[key].toLowerCase();if(out.length<n&&!seen[t]){seen[t]=1;out.push(x);}});return out;}
function mcq(prompt,hint,item,list,key,say,explain){
  var opts=shuffle([item].concat(others(list,item,key,3)));
  return {p:prompt,h:hint,o:opts.map(function(x){return x[key];}),a:opts.indexOf(item),say:say,ex:explain};
}
function qEnFr(w,list){return mcq("Que veut dire « "+w.en+" » ?","Choisis la bonne traduction.",w,list,"fr",w.en,'<b>'+esc(w.en)+'</b> : '+esc(w.fr)+'<br><i class="muted">« '+esc(w.ex)+' »</i>');}
function qFrEn(w,list){return mcq("Comment dit-on « "+w.fr+" » ?","Choisis le mot anglais.",w,list,"en",w.en,'<b>'+esc(w.en)+'</b> : '+esc(w.fr)+'<br><i class="muted">« '+esc(w.ex)+' »</i>');}
function qBlank(w,list){
  var h=head(w.en).replace(/^to /,"");var re=new RegExp("\\b"+h.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"\\b","i");
  if(!re.test(w.ex))return null;
  var item={t:h},cands=list.map(function(x){return {t:head(x.en).replace(/^to /,"")};});
  var opts=shuffle([item].concat(others(cands,item,"t",3)));
  return {p:w.ex.replace(re,"_____"),h:"Complète la phrase.",o:opts.map(function(x){return x.t;}),a:opts.indexOf(item),say:w.ex,ex:'<b>'+esc(w.ex)+'</b><br><span class="muted">'+esc(h)+' = '+esc(w.fr)+'</span>'};
}
function qPhrase(p,list){return mcq("Comment dire : « "+p.fr+" » ?","Choisis la bonne phrase.",p,list,"en",p.en,'<b>'+esc(p.en)+'</b>');}
function lessonQuiz(w){
  var l=BYW[w],ws=WORDS.filter(function(x){return x.w===w;}),sw=shuffle(ws);
  var qs=[qEnFr(sw[0],WORDS),qEnFr(sw[1],WORDS),qFrEn(sw[2],WORDS),qFrEn(sw[3],WORDS)];
  var b=null;for(var i=4;i<sw.length&&!b;i++)b=qBlank(sw[i],WORDS);
  qs.push(b||qEnFr(sw[4],WORDS));
  var ps=PHRASES.filter(function(p){return p.w===w;});qs.push(qPhrase(pick(ps),PHRASES));
  return {kind:"lesson",w:w,title:"Leçon "+lnum(l),qs:shuffle(qs),pos:0,res:[],locked:false,picked:null,done:false};
}
function reviewQuiz(){
  var pool=poolWords(),sw=shuffle(pool).slice(0,10);
  var qs=sw.map(function(w,i){if(i%3===2){var b=qBlank(w,WORDS);if(b)return b;}return i%2?qFrEn(w,WORDS):qEnFr(w,WORDS);});
  return {kind:"review",title:"Révision",qs:qs,pos:0,res:[],locked:false,picked:null,done:false};
}
function renderQuiz(){
  var z=overlay.q;if(z.done)return renderQuizResult();
  var q=z.qs[z.pos],L="ABCD",n=z.qs.length;
  var segs='<div class="segs">'+z.qs.map(function(_,i){var c=i<z.res.length?(z.res[i]?"ok":"ko"):(i===z.pos?"cur":"");return '<i class="'+c+'"></i>';}).join("")+'</div>';
  var opts=q.o.map(function(o,i){var cls="opt",dis="";
    if(z.locked){dis=" disabled";if(i===q.a)cls+=" ok";else if(i===z.picked)cls+=" ko";}
    return '<button class="'+cls+'" data-opt="'+i+'"'+dis+'><span class="l">'+L[i]+'</span><span>'+esc(o)+'</span></button>';}).join("");
  var fb="";
  if(z.locked){var ok=z.picked===q.a;
    fb='<div class="feedback '+(ok?"good":"bad")+'"><b class="v">'+(ok?"Exact !":"Pas tout à fait")+'</b><p>'+q.ex+'</p></div>'+
       '<div class="actions"><button class="btn primary" data-qnext="1">'+(z.pos<n-1?"Question suivante":"Voir mon score")+'</button></div>';}
  view.innerHTML='<div class="qbar"><button class="back" data-quit="1">‹ Quitter</button><span class="tag">'+esc(z.title)+' · '+(z.pos+1)+' / '+n+'</span></div>'+segs+
    '<div class="qtext">'+esc(q.p)+'</div><div class="qhint">'+esc(q.h)+'</div><div class="opts">'+opts+'</div>'+fb;
}
function renderQuizResult(){
  var z=overlay.q,n=z.qs.length,s=z.res.filter(Boolean).length,pct=Math.round(s/n*100);
  var msg=pct>=80?"Excellent, c'est acquis.":pct>=60?"C'est validé. Repasse sur les points ratés quand tu veux.":pct>=50?"Bonne base. Relis la leçon et refais le quiz.":"On s'accroche : relis la leçon, puis réessaie.";
  var wrong=z.qs.filter(function(_,i){return !z.res[i];});
  var nx=z.kind==="lesson"?sibling(BYW[z.w],1):null;
  view.innerHTML='<div class="qbar"><button class="back" data-quit="1">‹ Terminer</button><span class="tag">'+esc(z.title)+'</span></div>'+
   '<div class="card score" style="margin-top:8px"><div class="tag">'+(z.kind==="lesson"?(s>=4?"Leçon validée":"Pas encore validée · 4 / 6 pour valider"):"Révision terminée")+'</div><div class="big"><b>'+s+'</b><small>/ '+n+'</small></div>'+
   '<div class="meter"><i style="width:'+pct+'%"></i></div><p style="margin:10px 0 0">'+msg+'</p></div>'+
   (wrong.length?'<h2>À retravailler</h2><div class="stack list">'+wrong.map(function(q){return '<button class="les" data-say="'+esc(q.say)+'"><span class="ico">'+SVG.sound+'</span><span><b>'+esc(q.o[q.a])+'</b><span class="fr">'+esc(q.p)+'</span></span><span></span></button>';}).join("")+'</div>':'')+
   '<div class="actions">'+(nx&&s>=4&&z.kind==="lesson"?'<button class="btn primary" data-open="'+nx.w+'">Leçon suivante : '+esc(nx.t)+'</button>':'')+
   '<button class="btn'+(nx&&s>=4&&z.kind==="lesson"?"":" primary")+'" data-again="1">Recommencer</button><button class="btn" data-quit="1">Retour</button></div>';
}
function finishQuiz(){
  var z=overlay.q,s=z.res.filter(Boolean).length;z.done=true;markToday();
  if(z.kind==="lesson"){S.done[z.w]=Math.max(S.done[z.w]===undefined?0:S.done[z.w],s);srsAddLesson(z.w);}
  else if(S.best===null||s>S.best)S.best=s;
  save();
}

/* ===================== RÉVISION ===================== */
var R={scope:"auto",onlyNew:false,deck:[],pos:0,flipped:false};
function buildDeck(){
  var th=R.scope.indexOf("t:")===0?BANK.filter(function(t){return t.id===R.scope.slice(2);})[0]:null;
  var base=th?th.words.slice():R.scope==="all"?poolWords("all"):poolWords();
  R.deck=shuffle(base.filter(function(w){return !R.onlyNew||!S.known[w.id];}));R.pos=0;R.flipped=false;
}
function renderLexicon(){
  var seg='<div class="seg2"><button data-rview="cards">Cartes</button><button class="on" data-rview="lex">Lexique</button></div>';
  if(R.lexT===null||R.lexT===undefined){
    var tot=BANK.reduce(function(a,t){return a+t.words.length;},0),kn=BANK.reduce(function(a,t){return a+bankKnown(t);},0);
    view.innerHTML=seg+'<p class="lexintro"><b>'+tot+' mots et expressions</b> classés par thème, en plus des leçons. Les thèmes cochés alimentent ta session du jour (6 nouveaux mots quand la leçon est déjà vue). '+kn+' maîtrisés.</p>'+
      '<div class="lexgrid">'+BANK.map(function(t){var k=bankKnown(t),n=t.words.length,on=deckOn(t.id);
        return '<button class="lext" data-lext="'+t.i+'"><span class="le">'+t.ic+'</span><b>'+esc(t.n)+'</b><span class="ln">'+k+' / '+n+' maîtrisés</span><span class="lbar"><i style="width:'+Math.round(k/n*100)+'%"></i></span>'+(on&&S.decks&&S.decks.length?'<span class="lon">✓ session</span>':'')+'</button>';}).join("")+'</div>';
    return;
  }
  var t=BANK[R.lexT],on=deckOn(t.id),k=bankKnown(t);
  view.innerHTML='<button class="backlink" data-lext="-1">‹ Tous les thèmes</button><div class="lexhd"><span class="le">'+t.ic+'</span><div><h2 style="margin:0">'+esc(t.n)+'</h2><span class="tag">'+t.words.length+' mots · '+k+' maîtrisés · '+bankSeen(t)+' déjà vus</span></div></div>'+
    '<div class="row2"><button class="btn primary" data-scope="t:'+t.id+'" data-rview="cards">Réviser en cartes</button><button class="btn'+(on&&S.decks&&S.decks.length?" on":"")+'" data-deck="'+t.id+'">'+(S.decks&&S.decks.indexOf(t.id)>-1?"✓ Dans ma session":"Ajouter à ma session")+'</button></div>'+
    '<div class="lexlist">'+t.words.map(function(w){var kw=S.known[w.id];
      return '<div class="lexw'+(kw?" kn":"")+'"><div class="lwt"><b>'+esc(w.en)+'</b><span>'+esc(w.fr)+'</span><i>'+esc(w.ex)+'</i></div><button class="lsay" data-sayseq="'+esc(w.en+"||"+w.ex)+'" aria-label="Écouter">'+SVG.sound+'</button></div>';}).join("")+'</div>';
}
function deckOn(id){return !S.decks||!S.decks.length||S.decks.indexOf(id)>-1;}
function renderReview(){
  if(R.view==="lex")return renderLexicon();
  var dc=doneCount();
  var thR=R.scope.indexOf("t:")===0?BANK.filter(function(t){return t.id===R.scope.slice(2);})[0]:null;
  var chips='<div class="seg2"><button class="on" data-rview="cards">Cartes</button><button data-rview="lex">Lexique</button></div><div class="chips">'+(thR?'<button class="chip on" data-scope="'+R.scope+'">'+thR.ic+' '+esc(thR.n)+'</button>':'')+'<button class="chip'+(R.scope==="auto"?" on":"")+'" data-scope="auto">'+(dc?"Mes leçons":"Premières leçons")+'</button><button class="chip'+(R.scope==="all"?" on":"")+'" data-scope="all">Tout le programme</button><button class="chip'+(R.onlyNew?" on":"")+'" data-onlynew="1">À revoir</button></div>';
  var quizBtn='<div class="actions"><button class="btn primary" data-rquiz="1">Quiz de révision · 10 questions</button>'+(S.best!==null?'<p class="tag center" style="margin:0">Meilleur score : '+S.best+' / 10</p>':'')+'</div>';
  if(!R.deck.length){view.innerHTML=chips+'<div class="card center" style="padding:40px 20px"><div class="qtext" style="margin-top:0">Bravo !</div><p class="muted">Tous les mots de cette sélection sont maîtrisés.</p></div>'+quizBtn;return;}
  var w=R.deck[R.pos%R.deck.length],known=S.known[w.id];
  var face=R.flipped
    ?'<button class="flash navy flip" data-flip="1"><span class="lab">'+esc(wlabel(w))+'</span><span class="term">'+esc(w.fr)+'</span><span class="en">'+esc(w.en)+'</span><span class="ex">« '+esc(w.ex)+' »</span></button>'
    :'<button class="card flash" data-flip="1"><span class="pill '+(known?"good":"neutral")+'">'+(known?"Maîtrisé":esc(wlabel(w)))+'</span><span class="term">'+esc(w.en)+'</span><span class="fhint">Touche pour voir la traduction</span></button>';
  view.innerHTML=chips+face+
    '<div class="counter">Carte '+(R.pos%R.deck.length+1)+' / '+R.deck.length+'</div>'+
    '<div class="row3"><button class="btn" data-say="'+esc(w.en)+'" aria-label="Écouter">'+SVG.sound+'</button><button class="btn" data-mark="0">À revoir</button><button class="btn primary" data-mark="1">Je connais</button></div>'+quizBtn;
}

/* ===================== MINI-JEUX ===================== */
function renderGames(){
  var src=doneCount()?"Les jeux piochent dans les mots des leçons que tu as faites.":"Les jeux piochent d'abord dans les premières leçons, puis suivent ta progression.";
  var cl=currentLevel(),ts=totalStars();
  view.innerHTML='<button class="tile navy loopcard" data-loopmap="1"><span class="tag">Jeu à niveaux · '+(WORLDS.length*LV_PER_WORLD)+' niveaux</span><span class="lt">Congress Loop</span><span class="ld">Sers les bonnes commandes avant que le plateau déborde.</span>'+
   '<span class="lstats"><span><b>'+cl.w+'-'+cl.i+'</b><span>niveau</span></span><span><b>'+ts+'</b><span>étoiles</span></span><span><b>'+S.loop.coins+'</b><span>pièces</span></span></span><span class="btn primary">'+SVG.play+' Jouer</span></button>'+
   '<button class="tile navy loopcard ibcard" data-inboxmap="1"><span class="tag">Jeu à niveaux · Teams & WhatsApp</span><span class="lt">Inbox Race</span><span class="ld">Réponds aux messages avant que ton fil déborde.</span>'+
   '<span class="lstats"><span><b>S'+Math.ceil(ibCurrent()/5)+' · '+DAYS[(ibCurrent()-1)%5].slice(0,3)+'.</b><span>journée</span></span><span><b>'+ibTotal()+'</b><span>étoiles</span></span><span><b>'+S.loop.coins+'</b><span>pièces</span></span></span><span class="btn primary">'+SVG.play+' Jouer</span></button>'+
'<button class="tile navy loopcard callcard" data-callsmap="1"><span class="tag">Jeu de rôle · 10 appels</span><span class="lt">Le Coup de fil</span><span class="ld">Décroche, réponds… et dis-le à voix haute.</span>'+
   '<span class="lstats"><span><b>'+callStars()+'</b><span>étoiles / 30</span></span><span><b>'+Object.keys(S.calls).length+'</b><span>appels réussis</span></span><span><b>'+S.loop.coins+'</b><span>pièces</span></span></span><span class="btn primary">✆ Appeler</span></button>'+
   '<h2>Jeux rapides</h2><div class="card" style="margin-bottom:12px"><p style="margin:0">'+src+'</p></div><div class="stack">'+GAMES.map(function(g,i){
    var b=S.games[g.id];
    return '<button class="mod" data-game="'+g.id+'"><span class="num">'+(i+1)+'</span><span><b>'+g.n+'</b><span class="sub">'+g.s+'</span>'+(b!==undefined?'<span style="display:block;margin-top:8px"><span class="pill good">Record : '+g.best(b)+'</span></span>':'')+'</span></button>';}).join("")+'</div>';
}
function startGame(id){
  stopTimer();
  if(id==="memory"){
    var ws=shuffle(poolWords()).slice(0,6),cards=[];
    ws.forEach(function(w){cards.push({id:w.id,t:head(w.en),fr:false,w:w});cards.push({id:w.id,t:w.fr,fr:true,w:w});});
    overlay={type:"game",g:{id:id,cards:shuffle(cards),up:[],matched:{},moves:0,busy:false,done:false}};
  }else if(id==="chrono"){
    overlay={type:"game",g:{id:id,score:0,total:0,end:Date.now()+60000,cur:null,flash:null,done:false}};
    chronoNext();startTimer();
  }else if(id==="scramble"){
    var ps=shuffle(poolPhrases().filter(function(p){return p.en.split(" ").length<=12;})).slice(0,5);
    overlay={type:"game",g:{id:id,list:ps,pos:0,score:0,built:[],bank:[],checked:null,done:false}};
    scrambleSetup();
  }else if(id==="dictee"){
    var dw=shuffle(poolWords().filter(function(w){var h=head(w.en);return h.length>=3&&h.split(" ").length<=2&&!/[()]/.test(h);})).slice(0,8);
    overlay={type:"game",g:{id:id,list:dw,pos:0,score:0,checked:null,hint:false,val:"",done:false}};
    setTimeout(function(){if(overlay&&overlay.g&&overlay.g.id==="dictee")speak(head(dw[0].en),.85);},400);
  }
}
function stopTimer(){if(timerId){clearInterval(timerId);timerId=null;}}
function startTimer(){timerId=setInterval(function(){
  if(!overlay||!overlay.g||overlay.g.id!=="chrono"){stopTimer();return;}
  var g=overlay.g,left=Math.max(0,Math.ceil((g.end-Date.now())/1000));
  if(left<=0){stopTimer();g.done=true;gameRecord("chrono",g.score,true);render();return;}
  var el=$("#tleft");if(el){el.textContent=left+" s";el.classList.toggle("low",left<=10);}
},250);}
function gameRecord(id,v,higher){
  markToday();var b=S.games[id];
  var better=b===undefined||(higher?v>b:v<b);
  if(better){S.games[id]=v;save();}
  overlay.g.record=better;
}
function gameHeader(g,extra){
  var name=GAMES.filter(function(x){return x.id===g.id;})[0].n;
  return '<div class="gamebar"><button class="back" data-quit="1">‹ Quitter</button><div class="gstat">'+extra+'</div></div><div class="qtext" style="margin-top:4px">'+name+'</div>';
}
function gameEnd(g,big,small,msg){
  var gm=GAMES.filter(function(x){return x.id===g.id;})[0];
  view.innerHTML='<div class="gamebar"><button class="back" data-quit="1">‹ Terminer</button><span class="tag">'+gm.n+'</span></div>'+
   '<div class="card score" style="margin-top:8px"><div class="tag">'+(g.record?"Nouveau record !":"Partie terminée")+'</div><div class="big"><b>'+big+'</b><small>'+small+'</small></div><p style="margin:10px 0 0">'+msg+'</p>'+
   (S.games[g.id]!==undefined?'<p class="tag" style="margin:6px 0 0">Record : '+gm.best(S.games[g.id])+'</p>':'')+'</div>'+
   '<div class="actions"><button class="btn primary" data-game="'+g.id+'">Rejouer</button><button class="btn" data-quit="1">Retour aux jeux</button></div>';
}
/* Paires */
function renderMemory(g){
  if(g.done)return gameEnd(g,g.moves,"coups","6 paires trouvées. Moins de coups = meilleur score.");
  var found=Object.keys(g.matched).length;
  view.innerHTML=gameHeader(g,'<span class="pill">'+found+' / 6 paires</span><span class="pill neutral">'+g.moves+' coups</span>')+
   '<div class="qhint">Retourne deux cartes : un mot anglais et sa traduction.</div>'+
   '<div class="memgrid">'+g.cards.map(function(c,i){
     var up=g.up.indexOf(i)>-1,m=g.matched[c.id],cls="mc"+(m?" ok":up?" up"+(c.fr?" fr":""):"")+(g.wrong&&up?" no":"");
     return '<button class="'+cls+'" data-mc="'+i+'"'+(m?" disabled":"")+'>'+(up||m?esc(c.t):'<span class="q">?</span>')+'</button>';}).join("")+'</div>';
}
function memoryTap(i){
  var g=overlay.g;if(g.busy||g.up.indexOf(i)>-1||g.matched[g.cards[i].id])return;
  var c=g.cards[i];if(!c.fr)speak(c.t);
  g.up.push(i);
  if(g.up.length===2){
    g.moves++;var a=g.cards[g.up[0]],b=g.cards[g.up[1]];
    if(a.id===b.id&&a.fr!==b.fr){g.matched[a.id]=1;g.up=[];if(Object.keys(g.matched).length===6){g.done=true;gameRecord("memory",g.moves,false);}}
    else{g.busy=true;g.wrong=true;setTimeout(function(){if(!overlay||overlay.g!==g)return;g.up=[];g.busy=false;g.wrong=false;render();},850);}
  }
  render();
}
/* Vrai ou faux chrono */
function chronoNext(){
  var g=overlay.g,pool=poolWords(),w=pick(pool),truth=Math.random()<.5,shown=w.fr;
  if(!truth){var o=others(pool.length>4?pool:WORDS,w,"fr",1)[0];shown=o.fr;}
  g.cur={w:w,fr:shown,truth:truth};
}
function renderChrono(g){
  if(g.done)return gameEnd(g,g.score,"points",g.total?(g.score+" bonnes réponses sur "+g.total+"."):"Le temps est écoulé !");
  var left=Math.max(0,Math.ceil((g.end-Date.now())/1000));
  view.innerHTML=gameHeader(g,'<span class="pill good">'+g.score+' pts</span><span class="timer'+(left<=10?" low":"")+'" id="tleft">'+left+' s</span>')+
   '<div class="qhint">La traduction est-elle correcte ?</div>'+
   '<div class="card chrono-card'+(g.flash?" flash-"+g.flash:"")+'"><div class="w1">'+esc(g.cur.w.en)+'</div><div class="eq">veut dire</div><div class="w2">'+esc(g.cur.fr)+'</div></div>'+
   '<div class="row2" style="margin-top:16px"><button class="btn" data-tf="0" style="min-height:64px">✗ Faux</button><button class="btn primary" data-tf="1" style="min-height:64px">✓ Vrai</button></div>';
}
function chronoAnswer(v){
  var g=overlay.g;if(g.done)return;g.total++;
  var ok=(v===1)===g.cur.truth;if(ok)g.score++;
  g.flash=ok?"ok":"ko";chronoNext();render();
  setTimeout(function(){if(overlay&&overlay.g===g){g.flash=null;var c=$(".chrono-card");if(c)c.classList.remove("flash-ok","flash-ko");}},300);
}
/* Phrase en désordre */
function toks(s){return s.split(" ");}
function scrambleSetup(){
  var g=overlay.g,p=g.list[g.pos],t=toks(p.en),b;
  var tries=0;do{b=shuffle(t.map(function(x,i){return {t:x,i:i};}));tries++;}while(tries<10&&b.map(function(x){return x.t;}).join(" ")===p.en);
  g.bank=b;g.built=[];g.checked=null;
}
function renderScramble(g){
  if(g.done)return gameEnd(g,g.score,"/ 5","Phrases reconstituées sans erreur.");
  var p=g.list[g.pos];
  var built=g.built.map(function(k,j){return '<button class="tok in" data-unb="'+j+'"'+(g.checked?" disabled":"")+'>'+esc(g.bank[k].t)+'</button>';}).join("");
  var bank=g.bank.map(function(x,k){return g.built.indexOf(k)>-1?'':'<button class="tok" data-tok="'+k+'">'+esc(x.t)+'</button>';}).join("");
  var fb="";
  if(g.checked){var ok=g.checked==="ok";fb='<div class="feedback '+(ok?"good":"bad")+'"><b class="v">'+(ok?"Parfait !":"Presque…")+'</b><p><b>'+esc(p.en)+'</b></p></div><div class="actions"><button class="btn primary" data-snext="1">'+(g.pos<g.list.length-1?"Phrase suivante":"Voir mon score")+'</button></div>';}
  view.innerHTML=gameHeader(g,'<span class="pill">'+(g.pos+1)+' / '+g.list.length+'</span><span class="pill good">'+g.score+' ✓</span>')+
   '<div class="qhint">« '+esc(p.fr)+' »</div><div class="build">'+built+'</div><div class="bank">'+bank+'</div>'+
   (g.checked?fb:'<div class="actions"><button class="btn primary" data-scheck="1"'+(g.built.length===g.bank.length?"":" disabled")+'>Vérifier</button></div>');
}
/* Dictée */
function normW(s){return s.toLowerCase().replace(/[’']/g,"'").replace(/[^a-z0-9' -]/g,"").replace(/\s+/g," ").trim();}
function renderDictee(g){
  if(g.done)return gameEnd(g,g.score,"/ "+g.list.length,"Mots écrits sans faute.");
  var w=g.list[g.pos],h=head(w.en),fb="";
  if(g.checked){var ok=g.checked==="ok";fb='<div class="feedback '+(ok?"good":"bad")+'"><b class="v">'+(ok?"Bien joué !":"Ce n'est pas ça")+'</b><p><b>'+esc(h)+'</b> : '+esc(w.fr)+'</p></div><div class="actions"><button class="btn primary" data-dnext="1">'+(g.pos<g.list.length-1?"Mot suivant":"Voir mon score")+'</button></div>';}
  view.innerHTML=gameHeader(g,'<span class="pill">'+(g.pos+1)+' / '+g.list.length+'</span><span class="pill good">'+g.score+' ✓</span>')+
   (HAS_TTS?'':'<div class="note">La lecture audio n’est pas disponible sur ce navigateur : écris le mot anglais qui correspond à la traduction.</div>')+
   '<div class="card center" style="margin-top:10px">'+(HAS_TTS?'<button class="bigplay" data-dsay="1" aria-label="Écouter le mot">'+SVG.sound+'</button><div class="row2" style="margin:10px 0 0"><button class="btn" data-dslow="1">'+SVG.slow+' Lentement</button><button class="btn" data-dhint="1">Indice</button></div>':'')+
   ((g.hint||!HAS_TTS)?'<p class="muted" style="margin:14px 0 0">Traduction : <b>'+esc(w.fr)+'</b></p>':'')+'</div>'+
   '<form id="dform" style="margin-top:14px"><input class="field" id="dinput" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Écris ce que tu entends" value="'+esc(g.val)+'"'+(g.checked?" disabled":"")+'>'+
   (g.checked?'':'<div class="actions"><button class="btn primary" type="submit">Vérifier</button></div>')+'</form>'+fb;
  if(!g.checked){var inp=$("#dinput");if(inp&&!("ontouchstart" in window))inp.focus();}
}

/* ===================== ORAL =====================
   La reconnaissance vocale du navigateur ne marche pas dans une web app installée sur iPhone.
   On enregistre donc la voix (MediaRecorder), on la fait écouter à côté du modèle, et elle s'auto-évalue.
   Les phrases travaillées reviennent ensuite en révision espacée. */
var ORAL_GOAL=10;
if(!S.oral||typeof S.oral!=="object")S.oral={};
if(!S.oral.srs)S.oral.srs={};
var O={mode:"repeat",item:null,phase:"prompt",url:null,blob:null,judge:null,err:null,stream:null,rec:null,chunks:[],t0:0,tick:null};
var ORAL_MODES=[["repeat","Répéter","Écoute la phrase, puis répète-la à voix haute."],["translate","Traduire à l'oral","Lis la phrase en français et dis-la en anglais."],["respond","Répondre","Un collègue t'écrit : réponds à voix haute, comme en vrai."]];
var CAN_REC=!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder);
function oralToday(){if(S.oral.d!==today()){S.oral.d=today();S.oral.n=0;}return S.oral.n||0;}
function oralKey(it){return O.mode+":"+it.en;}
function oralPool(){
  if(O.mode==="respond")return (window.INBOX||[]).filter(function(m){return m[7]<=2||Math.random()<.5;}).map(function(m){return {en:m[4],fr:m[3],prompt:m[2],from:m[1],app:m[0]};});
  return poolPhrases().map(function(p){return {en:p.en,fr:p.fr,w:p.w};});
}
function nextOral(){
  var pool=oralPool(),t=today(),due=pool.filter(function(it){var c=S.oral.srs[oralKey(it)];return c&&c.due<=t;});
  var src=due.length?due:pool,c;do{c=pick(src);}while(O.item&&c.en===O.item.en&&src.length>1);
  O.item=c;O.phase="prompt";O.err=null;O.judge=null;O.blob=null;if(O.url){try{URL.revokeObjectURL(O.url);}catch(e){}}O.url=null;
}
function stopStream(){if(O.rec&&O.rec.state==="recording"){try{O.rec.stop();}catch(e){}}if(O.stream){O.stream.getTracks().forEach(function(t){t.stop();});O.stream=null;}clearInterval(O.tick);}
function micError(e){
  var n=(e&&e.name)||"";
  if(n==="NotAllowedError"||n==="SecurityError")return "L’accès au micro a été refusé. Sur iPhone : Réglages › Safari › Micro, choisis « Demander » ou « Autoriser », puis réessaie.";
  if(n==="NotFoundError")return "Aucun micro détecté sur cet appareil.";
  return "Impossible de démarrer le micro ("+(n||"erreur")+"). Ferme puis rouvre l’appli et réessaie.";
}
function recStart(){
  if(!CAN_REC){O.phase="review";render();return;}
  stopAudio();
  var go2=function(stream){
    O.stream=stream;O.chunks=[];
    var types=["audio/mp4","audio/webm;codecs=opus","audio/webm","audio/ogg"],mt=null;
    for(var k=0;k<types.length;k++){try{if(MediaRecorder.isTypeSupported(types[k])){mt=types[k];break;}}catch(e){}}
    try{O.rec=mt?new MediaRecorder(stream,{mimeType:mt}):new MediaRecorder(stream);}catch(e){O.err=micError(e);render();return;}
    O.rec.ondataavailable=function(ev){if(ev.data&&ev.data.size)O.chunks.push(ev.data);};
    O.rec.onstop=function(){clearInterval(O.tick);var blob=new Blob(O.chunks,{type:(O.rec&&O.rec.mimeType)||mt||"audio/mp4"});O.url=URL.createObjectURL(blob);O.blob=blob;O.judge=null;O.phase="review";render();if(S.oral.asr)runJudge();};
    O.rec.start();O.phase="rec";O.t0=Date.now();render();
    O.tick=setInterval(function(){var el=$("#rect");var sec=Math.floor((Date.now()-O.t0)/1000);if(el)el.textContent="0:"+(sec<10?"0":"")+sec;if(sec>=20)recStop();},250);
  };
  if(O.stream&&O.stream.active)go2(O.stream);
  else navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}}).then(go2,function(e){O.err=micError(e);O.phase="prompt";render();});
}
function recStop(){if(O.rec&&O.rec.state==="recording"){try{O.rec.stop();}catch(e){}}}
function runJudge(){
  if(!window.SRJudge||!O.blob)return;
  var it=O.item,files={};
  O.judge={state:SRJudge.ready()?"run":"load",pct:0};render();
  SRJudge.transcribe(O.blob,function(e){
    if(!e)return;
    if(e.status==="progress"&&e.total){files[e.file]=[e.loaded,e.total];var L=0,T=0;for(var f in files){L+=files[f][0];T+=files[f][1];}O.judge.pct=Math.round(L/T*100);var el=$("#asrp");if(el)el.textContent=O.judge.pct+" %";}
    if(e.status==="ready"){O.judge.state="run";var el2=$("#asrs");if(el2)el2.textContent="J’écoute ta réponse…";}
  }).then(function(txt){if(O.item!==it||!O.judge)return;O.judge={state:"done",heard:txt,res:SRJudge.judge(it.en,txt)};render();},
    function(e){if(O.item!==it)return;O.judge={state:"err",msg:String((e&&e.message)||e)};render();});
}
function judgeHTML(){
  var j=O.judge,m=O.mode;
  if(!window.SRJudge)return "";
  if(!S.oral.asr)return '<div class="card ojudge"><span class="lab">🤖 Avis de l’appli</span><p>Active l’écoute automatique : l’appli transcrit ta voix et note ta prononciation, pour un avis neutre en plus du tien.</p><p class="tag" style="margin:0 0 12px">Premier usage : environ 70 Mo à télécharger une seule fois (en Wi-Fi de préférence). Ensuite tout se passe sur ton téléphone.</p><button class="btn primary" data-asron="1">Activer l’écoute automatique</button></div>';
  if(!j)return '<div class="card ojudge"><span class="lab">🤖 Avis de l’appli</span><button class="btn" data-asrrun="1">Analyser mon enregistrement</button></div>';
  if(j.state==="load")return '<div class="card ojudge"><span class="lab">🤖 Avis de l’appli</span><p id="asrs">Téléchargement du modèle d’écoute (une seule fois)… <b id="asrp">'+(j.pct||0)+' %</b></p><div class="spin"></div></div>';
  if(j.state==="run")return '<div class="card ojudge"><span class="lab">🤖 Avis de l’appli</span><p id="asrs">J’écoute ta réponse…</p><div class="spin"></div></div>';
  if(j.state==="err")return '<div class="card ojudge"><span class="lab">🤖 Avis de l’appli</span><p>L’analyse n’a pas pu se faire. Vérifie ta connexion pour le premier téléchargement, puis réessaie.</p><p class="tag" style="margin:0 0 10px">'+esc(j.msg)+'</p><button class="btn" data-asrrun="1">Réessayer</button></div>';
  var r=j.res,col=r.score>=85?"good":r.score>=55?"warn":"bad";
  return '<div class="card ojudge"><span class="lab">🤖 Avis de l’appli'+(m==="respond"?" · indicatif":"")+'</span>'+
    '<div class="jrow"><div class="jscore '+col+'"><b>'+r.score+'</b><small>/100</small></div><div><b class="jverdict">'+r.verdict+'</b>'+
    '<div class="jwords">'+r.tw.map(function(x){return '<span class="'+(x.ok?"hit":"miss")+'">'+esc(x.w)+'</span>';}).join(" ")+'</div></div></div>'+
    '<p class="jheard">Entendu : « '+esc(j.heard||"…")+' »</p>'+
    (m==="respond"?'<p class="tag" style="margin:6px 0 0">Réponse libre : le score mesure la proximité avec l’exemple, pas la justesse de ta réponse.</p>':(m==="translate"?'<p class="tag" style="margin:6px 0 0">Une autre formulation correcte peut avoir un score plus bas : fie-toi aussi à ton jugement.</p>':''))+'</div>';
}
function playUrl(u){stopAudio();var a=VPLAYER||(VPLAYER=new Audio());a.onended=null;a.onerror=null;a.playbackRate=1;a.src=u;a.play().catch(function(){});}
function playMine(){if(!O.url)return;playUrl(O.url);}
function oralGrade(g){
  var key=oralKey(O.item),c=S.oral.srs[key]||{b:0,due:today()};
  c.b=g===2?Math.min(5,c.b+2):g===1?Math.max(1,c.b):0;c.due=addDays(g===0?1:SRS_INT[Math.max(1,c.b)]);
  S.oral.srs[key]=c;oralToday();S.oral.n=(S.oral.n||0)+1;markToday();save();nextOral();
}
function renderOral(){
  if(!O.item)nextOral();
  var it=O.item,m=O.mode,n=oralToday(),pct=Math.min(100,Math.round(n/ORAL_GOAL*100)),desc=ORAL_MODES.filter(function(x){return x[0]===m;})[0][2];
  var chips='<div class="chips">'+ORAL_MODES.map(function(x){return '<button class="chip'+(x[0]===m?" on":"")+'" data-omode="'+x[0]+'">'+x[1]+'</button>';}).join("")+'</div>';
  var goal='<div class="card ogoal"><div class="ogoal-h"><span class="tag">Objectif du jour</span><b>'+n+' / '+ORAL_GOAL+' phrases dites'+(n>=ORAL_GOAL?" · bravo "+esc(NAME)+" 🎉":"")+'</b></div><div class="prog"><i style="width:'+pct+'%"></i></div></div>';
  var prompt;
  if(m==="repeat")prompt='<span class="pill">Leçon '+lnum(BYW[it.w])+' · '+esc(BYW[it.w].t)+'</span><div class="phrase">'+esc(it.en)+'</div><p class="muted" style="margin:0">'+esc(it.fr)+'</p>';
  else if(m==="translate")prompt='<span class="pill">Dis-le en anglais</span><div class="phrase fr">'+esc(it.fr)+'</div>';
  else prompt='<div class="omsg"><span class="oapp '+(it.app==="t"?"t":"w")+'">'+(it.app==="t"?"T":"✆")+'</span><div><span class="ofrom">'+esc(it.from)+(it.app==="t"?" · Teams":" · WhatsApp")+'</span><div class="otext">'+esc(it.prompt)+'</div></div></div>';
  var listenBtn=(m!=="translate"||O.phase==="review")?'<button class="btn" data-say="'+esc(m==="respond"&&O.phase!=="review"?it.prompt:it.en)+'">'+SVG.sound+' Écouter</button>':'';
  var body="";
  if(O.phase==="prompt"){
    body='<div class="micwrap"><button class="micbtn" data-recstart="1" aria-label="Enregistrer">'+SVG.oral+'</button><span class="tag">'+(CAN_REC?"Appuie et parle":"Dis-le à voix haute, puis touche le micro")+'</span></div>'+
      '<div class="row2">'+(listenBtn||'<button class="btn" data-ohint="1">Un indice</button>')+'<button class="btn" data-onext="1">Passer</button></div>';
  }else if(O.phase==="rec"){
    body='<div class="micwrap"><button class="micbtn on" data-recstop="1" aria-label="Arrêter">■</button><span class="rectime"><i></i><b id="rect">0:00</b> · touche pour arrêter</span></div>';
  }else{
    var modelLab=m==="repeat"?"La phrase":m==="translate"?"Réponse attendue":"Exemple de réponse";
    body=(m==="repeat"?'':'<div class="box key omodel"><span class="lab">'+modelLab+'</span><b>'+esc(it.en)+'</b>'+(m!=="repeat"?'<span class="muted">'+(m==="respond"?"":esc(it.fr))+'</span>':'')+
      (m==="respond"?'<span class="muted" style="font-size:13px">D’autres réponses sont possibles : compare le sens, pas mot pour mot.</span>':'')+'</div>')+
      '<div class="row3"><button class="btn" data-say="'+esc(it.en)+'">'+SVG.sound+' Modèle</button><button class="btn" data-oslow="1">'+SVG.slow+' Lent</button><button class="btn" data-omine="1"'+(O.url?"":" disabled")+'>🎙️ Ma voix</button></div>'+
      judgeHTML()+
      '<p class="qhint center" style="margin:16px 0 8px">Compare les deux. Comment c’était ?</p>'+
      '<div class="row3 ograde">'+[["0","😕","À revoir"],["1","🙂","Presque"],["2","😎","Parfait"]].map(function(g){var sug=O.judge&&O.judge.state==="done"&&O.judge.res.grade===+g[0];return '<button class="btn'+(g[0]==="2"?" primary":"")+(sug?" sugg":"")+'" data-ograde="'+g[0]+'">'+g[1]+'<span>'+g[2]+'</span>'+(sug?'<em>avis de l’appli</em>':'')+'</button>';}).join("")+'</div>'+
      '<div class="actions" style="margin-top:10px"><button class="btn" data-orestart="1">↺ Réessayer</button></div>';
  }
  view.innerHTML=chips+goal+(O.err?'<div class="note">'+esc(O.err)+'</div>':'')+
    '<p class="qhint" style="margin:4px 4px 10px">'+desc+'</p><div class="card speak">'+prompt+(O.ohint&&O.phase==="prompt"?'<p class="muted" style="margin:10px 0 0">Commence par : <b>'+esc(it.en.split(" ").slice(0,3).join(" "))+'…</b></p>':'')+'</div>'+body;
  if(O.phase==="review"&&O.autoplay){O.autoplay=false;setTimeout(function(){speak(it.en,.95);},250);}
}

/* ===================== CONGRESS LOOP (jeu à niveaux) =====================
   Des mots anglais défilent sur un tapis roulant. Chaque marmite affiche une commande
   en français : touche le bon mot pour la servir. Un mot touché sans marmite
   correspondante part sur le plateau d'attente. Plateau plein ou temps écoulé : perdu. */
var WORLDS=[
 {n:"Accueil & inscriptions",s:"Monde 1"},
 {n:"Expo & partenaires",s:"Monde 2"},
 {n:"Salle de presse",s:"Monde 3"},
 {n:"Grande plénière",s:"Monde 4"},
 {n:"Agence marketing",s:"Monde Marketing",bonus:true},
 {n:"Open space",s:"Monde Bureau",bonus:true}
];
var LV_PER_WORLD=15;
if(!S.loop||typeof S.loop!=="object")S.loop={};
if(!S.loop.lv)S.loop.lv={};
if(S.loop.coins===undefined)S.loop.coins=0;
if(!S.loop.b)S.loop.b={hint:2,freeze:2,slot:2};
if(S.loop.mute===undefined)S.loop.mute=false;
var loopWorld=null,loopMap=false,rafId=null;
var BOOST={hint:{n:"Indice",p:30,d:"Montre le bon mot"},freeze:{n:"Gel",p:40,d:"Stoppe le tapis et la patience des clients 6 s"},slot:{n:"Case",p:50,d:"Une case de plus sur le plateau"}};
var BSVG={
 hint:'<svg viewBox="0 0 24 24"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/></svg>',
 freeze:'<svg viewBox="0 0 24 24"><path d="M12 2v20M4.5 6.5l15 11M19.5 6.5l-15 11M9 4l3 2 3-2M9 20l3-2 3 2"/></svg>',
 slot:'<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="3"/><path d="M12 9.5v5M9.5 12h5"/></svg>',
 sound:'<svg viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
 mute:'<svg viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>',
 lock:'<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
 coin:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v9M14.5 9.5c-.4-.9-1.4-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1 1.6 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1.2 0-2.2-.6-2.6-1.6"/></svg>'
};
var POT='<svg class="potsvg" viewBox="0 0 64 46" aria-hidden="true"><path class="steam" d="M22 10c-3-3 3-5 0-9M32 10c-3-3 3-5 0-9M42 10c-3-3 3-5 0-9"/><rect x="6" y="15" width="52" height="6" rx="3" class="rim"/><path d="M10 21h44v9c0 8-6 13-14 13H24c-8 0-14-5-14-13z" class="body"/><path d="M4 24h6M54 24h6" class="rim-s"/></svg>';

function lvKey(w,i){return w+"-"+i;}
function lvStars(w,i){return S.loop.lv[lvKey(w,i)]||0;}
function lvUnlocked(w,i){if((w===1||w>=5)&&i===1)return true;if(i>1)return lvStars(w,i-1)>0;return lvStars(w-1,LV_PER_WORLD)>0;}
function totalStars(){var t=0;for(var k in S.loop.lv)t+=S.loop.lv[k];return t;}
function currentLevel(){for(var w=1;w<=4;w++)for(var i=1;i<=LV_PER_WORLD;i++){if(!lvStars(w,i))return {w:w,i:i};}return {w:4,i:LV_PER_WORLD};}
function lvCfg(w,i){
  var ls=LESSONS.filter(function(l){return l.q===w;});
  var upto=Math.max(2,Math.ceil(i*ls.length/LV_PER_WORLD));
  var weeks=ls.slice(0,upto).map(function(l){return l.w;});
  var mode=(i%5===0)?"reverse":(i%5===3&&i>3&&HAS_TTS)?"audio":"normal";
  var d=w>=5?2:w;
  var orders=6+Math.floor(i/2)+(d-1);
  var pots=d===1?(i<5?2:3):d===2?3:d===3?(i<8?3:4):4;
  var distract=d===1?(i<6?0:2):d+1;
  var per=d===1?10:d===2?8.5:d===3?7.5:6.5;
  return {w:w,i:i,weeks:weeks,mode:mode,orders:orders,pots:pots,distract:distract,
    speed:70+i*4+(d-1)*18,patience:Math.max(6,(d===1?16:d===2?13:d===3?11:9.5)-i*.25+(mode==="audio"?4:0)+(mode==="reverse"?2.5:0)),tray:d>=3?4:5,time:Math.round(orders*per+(mode==="audio"?orders*2.5:0)+(mode==="reverse"?orders*1.5:0))};
}
function pickDistinct(pool,n,avoid){
  var seenE={},seenF={},out=[];
  (avoid||[]).forEach(function(x){seenE[head(x.en).toLowerCase()]=1;seenF[x.fr.toLowerCase()]=1;});
  shuffle(pool).forEach(function(x){var e=head(x.en).toLowerCase(),f=x.fr.toLowerCase();if(out.length<n&&!seenE[e]&&!seenF[f]){seenE[e]=seenF[f]=1;out.push(x);}});
  return out;
}
function startLoop(w,i){
  stopRaf();
  var c=lvCfg(w,i),pool=WORDS.filter(function(x){return c.weeks.indexOf(x.w)>-1;});
  var orders=pickDistinct(pool,c.orders);
  if(orders.length<c.orders)orders=orders.concat(pickDistinct(WORDS,c.orders-orders.length,orders));
  var dis=pickDistinct(WORDS.filter(function(x){return w>=5?track(w).some(function(l){return l.w===x.w;}):x.w<=Math.max.apply(null,c.weeks)+3;}),c.distract,orders);
  var items=shuffle(orders.map(function(x){return {word:x,order:true};}).concat(dis.map(function(x){return {word:x,order:false};})));
  items.forEach(function(it,k){it.id=k;it.state="queue";});
  var G={w:w,i:i,c:c,orders:orders,q:0,pots:[],items:items,tray:[],cap:c.tray,mistakes:0,combo:0,maxCombo:0,score:0,
    served:0,missed:{},status:"play",reason:"",tLeft:0,hearts:3,expired:0,bonusCoins:0,begun:false};
  overlay={type:"loop",G:G};
}

/* sons */
var AC=null;
function tone(fs,dur,type,vol,gap){
  if(S.loop.mute)return;
  try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume();
    var t=AC.currentTime;fs.forEach(function(f,k){var o=AC.createOscillator(),g=AC.createGain();o.type=type||"sine";o.frequency.value=f;
      var st=t+k*(gap||dur);g.gain.setValueAtTime(0,st);g.gain.linearRampToValueAtTime(vol||.12,st+.01);g.gain.exponentialRampToValueAtTime(.0001,st+dur);
      o.connect(g);g.connect(AC.destination);o.start(st);o.stop(st+dur+.02);});}catch(e){}
}
var sfx={
  ok:function(c){tone([587+c*45,880+c*55],.09,"sine",.14);},
  store:function(){tone([392],.08,"triangle",.08);},
  bad:function(){tone([196,147],.12,"square",.05);},
  win:function(){tone([523,659,784,1047],.14,"triangle",.14,.11);},
  lose:function(){tone([392,311,233],.18,"sawtooth",.05,.15);},
  pop:function(){tone([1200],.05,"sine",.06);}
};
function buzz(p){try{if(navigator.vibrate)navigator.vibrate(p);}catch(e){}}

/* pont entre l'appli et la scène Phaser (loop-phaser.js) */
var loopGame=null;
var ibUI=null;
function stopRaf(){if(ibUI){try{ibUI.destroy();}catch(e){}ibUI=null;}var ibr=document.getElementById("ibroot");if(ibr)ibr.remove();if(loopGame){try{loopGame.destroy(true);}catch(e){}loopGame=null;}var st=document.getElementById("loopstage");if(st)st.remove();}
var loopApi={
  name:function(){return NAME;},
  speak:function(w,r){var audio=overlay&&overlay.G&&overlay.G.c.mode==="audio";if(!S.loop.mute||audio)speak(head(w.en),r||1);},
  head:function(w){return head(w.en);},
  muted:function(){return !!S.loop.mute;},
  worldName:function(w){return WORLDS[w-1].s;},
  boostCount:function(b){return S.loop.b[b]||0;},
  boost:function(b){if((S.loop.b[b]||0)<=0)return false;S.loop.b[b]--;save();return true;},
  win:function(G){
    G.status="won";
    var stars=G.mistakes===0?3:G.mistakes<=2?2:1,prev=lvStars(G.w,G.i);
    G.stars=stars;G.newBest=stars>prev;if(stars>prev)S.loop.lv[lvKey(G.w,G.i)]=stars;
    G.coins=10+stars*10+G.maxCombo*2+(G.bonusCoins||0);S.loop.coins+=G.coins;
    markToday();save();return {stars:stars,coins:G.coins};
  },
  lose:function(G,reason){G.status="lost";G.reason=reason;markToday();save();},
  showResult:function(){stopRaf();render();window.scrollTo(0,0);},
  quit:function(){stopRaf();overlay=null;tab="games";loopMap=true;render();window.scrollTo(0,0);}
};
function renderLoop(){
  var G=overlay.G;
  if(G.status==="won")return renderLoopWin(G);
  if(G.status==="lost")return renderLoopLose(G);
  mountStage(G,window.CongressLoopPhaser,loopApi);
}
function starsHTML(n,big){var s="";for(var k=1;k<=3;k++)s+='<span class="st'+(k<=n?" on":"")+(big?" big":"")+'" style="animation-delay:'+(k*.15)+'s">★</span>';return s;}
function recapList(G){
  return '<div class="stack list">'+G.orders.map(function(w){var bad=G.missed[w.id];
    return '<button class="les" data-say="'+esc(head(w.en))+'"><span class="ico">'+SVG.sound+'</span><span><b>'+esc(head(w.en))+'</b><span class="fr">'+esc(w.fr)+'</span></span>'+(bad?'<span class="pill warn">À revoir</span>':'<span></span>')+'</button>';}).join("")+'</div>';
}
function renderLoopWin(G){
  var nx=G.i<LV_PER_WORLD?{w:G.w,i:G.i+1}:(G.w<4?{w:G.w+1,i:1}:null);var allDone=G.w<=4?"Tu as terminé les 60 niveaux du programme !":"Monde terminé, bravo !";
  view.innerHTML='<div class="gamebar"><button class="back" data-loopmap="1">‹ Carte</button><span class="tag">'+WORLDS[G.w-1].s+' · Niveau '+G.i+'</span></div>'+
   '<div class="tile navy span2 lwin"><div class="tag">'+(G.newBest?"Niveau réussi · nouveau record":"Niveau réussi")+'</div><div class="stars">'+starsHTML(G.stars,true)+'</div>'+
   '<div class="lstats"><div><b>'+G.score+'</b><span>points</span></div><div><b>×'+G.maxCombo+'</b><span>meilleur combo</span></div><div><b>+'+G.coins+'</b><span>pièces</span></div></div>'+
   '<p>'+(G.stars===3?"Sans faute, parfait !":G.mistakes+" erreur"+(G.mistakes>1?"s":"")+". Rejoue sans faute pour 3 étoiles.")+'</p></div>'+
   '<div class="actions">'+(nx?'<button class="btn primary" data-loopplay="'+nx.w+'-'+nx.i+'">Niveau suivant</button>':'<div class="card center"><b>'+allDone+'</b></div>')+'<button class="btn" data-loopplay="'+G.w+'-'+G.i+'">Rejouer</button></div>'+
   '<h2>Les mots du niveau</h2>'+recapList(G);
}
function renderLoopLose(G){
  var canSlot=G.reason==="tray"&&(S.loop.b.slot||0)>0;
  view.innerHTML='<div class="gamebar"><button class="back" data-loopmap="1">‹ Carte</button><span class="tag">'+WORLDS[G.w-1].s+' · Niveau '+G.i+'</span></div>'+
   '<div class="card score"><div class="tag">'+(G.reason==="tray"?"Plateau plein !":G.reason==="hearts"?"Trop de clients sont partis !":"Temps écoulé !")+'</div><div class="big"><b>'+G.served+'</b><small>/ '+G.orders.length+' commandes</small></div>'+
   '<p style="margin:8px 0 0">'+(G.reason==="tray"?"Astuce : ne touche que les mots dont tu vois la commande, et garde des cases libres.":"Astuce : sers d’abord les clients dont la jauge est rouge. Le bonus Gel met leur patience en pause 6 secondes.")+'</p></div>'+
   '<div class="actions">'+(canSlot?'<button class="btn primary" data-loopcont="1">'+BSVG.slot+' Continuer avec une case de plus ('+S.loop.b.slot+')</button>':'')+
   '<button class="btn'+(canSlot?"":" primary")+'" data-loopplay="'+G.w+'-'+G.i+'">Réessayer</button><button class="btn" data-loopmap="1">Retour à la carte</button></div>'+
   '<h2>Les mots du niveau</h2>'+recapList(G);
}
function loopContinue(){var G=overlay.G;if((S.loop.b.slot||0)<=0)return;S.loop.b.slot--;save();G.cap++;G.status="play";render();}

/* carte des niveaux */
function renderLoopMap(){
  var cur=currentLevel();if(!loopWorld)loopWorld=cur.w;
  var w=loopWorld,ts=totalStars();
  var nodes="";
  for(var i=1;i<=LV_PER_WORLD;i++){
    var row=Math.floor((i-1)/3),col=(i-1)%3;if(row%2)col=2-col;
    var st=lvStars(w,i),un=lvUnlocked(w,i),isCur=cur.w===w&&cur.i===i&&!st;
    var c=lvCfg(w,i),badge=c.mode==="reverse"?"FR":c.mode==="audio"?"♪":"";
    nodes+='<button class="node'+(st?" won":"")+(isCur?" cur":"")+(un?"":" locked")+'" style="grid-row:'+(row+1)+';grid-column:'+(col+1)+'" '+(un?'data-loopplay="'+w+'-'+i+'"':'disabled')+'>'+
      '<span class="nd">'+(un?i:BSVG.lock)+(badge&&un?'<em>'+badge+'</em>':'')+'</span><span class="ns">'+starsHTML(st)+'</span></button>';
  }
  view.innerHTML='<div class="gamebar"><button class="back" data-loopback="1">‹ Jeux</button><button class="mutebtn" data-loopmute="1" aria-label="Son">'+(S.loop.mute?BSVG.mute:BSVG.sound)+'</button></div>'+
   '<div class="qtext" style="margin-top:0">Congress Loop</div>'+
   '<div class="bento"><div class="tile navy span2"><div class="tag">Ta progression</div>'+
    '<div class="lstats"><div><b>'+ts+'</b><span>étoiles / '+(WORLDS.length*45)+'</span></div><div><b>'+S.loop.coins+'</b><span>pièces</span></div><div><b>'+cur.w+'-'+cur.i+'</b><span>niveau en cours</span></div></div>'+
    '<button class="btn primary" data-loopplay="'+cur.w+'-'+cur.i+'">'+SVG.play+' Jouer le niveau '+cur.i+' du monde '+cur.w+'</button></div></div>'+
   '<div class="chips" style="margin-top:16px">'+WORLDS.map(function(x,k){var open=lvUnlocked(k+1,1);return '<button class="chip'+(w===k+1?" on":"")+'" data-loopworld="'+(k+1)+'"'+(open?"":" disabled")+'>'+(open?"":"🔒 ")+x.s+'</button>';}).join("")+'</div>'+
   '<div class="card" style="padding:16px 18px"><div class="tag">'+WORLDS[w-1].s+' · '+(w<=4?'leçons '+track(w)[0].w+' à '+track(w).slice(-1)[0].w:'parcours '+QNAMES[w]+' · débloqué d’office')+'</div><b style="font-family:var(--f-display);font-size:20px">'+WORLDS[w-1].n+'</b></div>'+
   '<div class="lvpath">'+nodes+'</div>'+
   '<p class="tag center" style="margin:4px 0 0">♪ = niveau à l’écoute · FR = niveau inversé</p>'+
   '<h2>Bonus</h2><div class="stack list">'+["hint","freeze","slot"].map(function(b){
     return '<div class="les shoprow"><span class="ico">'+BSVG[b]+'</span><span><b>'+BOOST[b].n+' · '+(S.loop.b[b]||0)+' en stock</b><span class="fr">'+BOOST[b].d+'</span></span><button class="pill'+(S.loop.coins>=BOOST[b].p?" good":" neutral")+' buy" data-buy="'+b+'"'+(S.loop.coins>=BOOST[b].p?"":" disabled")+'>'+BOOST[b].p+' pièces</button></div>';}).join("")+'</div>'+
   '<h2>Comment jouer</h2><div class="card"><p>Chaque client attend sa commande en français au-dessus de sa marmite. Touche sur le tapis le mot anglais qui correspond pour la servir.</p><p>La <b>jauge de patience</b> autour du client se vide : s’il part, tu perds un ❤️. Trois cœurs perdus, c’est perdu.</p><p>Un mot touché sans marmite correspondante part sur le <b>plateau d’attente</b>. Plateau plein : perdu aussi. Les <b>intrus</b> ne correspondent à aucune commande.</p><p style="margin:0">Enchaîne pour les <b>combos</b>, déclenche la <b>FEVER</b> à ×5 (points doublés), attrape les <b>mots dorés ★</b> (+5 pièces) et sers vite pour le bonus <b>FAST!</b>. Le tapis accélère au fil de la partie et des niveaux.</p></div>';
}

/* ===================== INBOX RACE (Teams / WhatsApp) ===================== */
if(!S.inbox||typeof S.inbox!=="object")S.inbox={};
if(!S.inbox.lv)S.inbox.lv={};
var INBOX_N=20,inboxMap=false,inboxWeek=null;
var DAYS=["Lundi","Mardi","Mercredi","Jeudi","Vendredi"];
function ibStars(i){return S.inbox.lv[i]||0;}
function ibUnlocked(i){return i===1||ibStars(i-1)>0;}
function ibCurrent(){for(var i=1;i<=INBOX_N;i++)if(!ibStars(i))return i;return INBOX_N;}
function ibTotal(){var t=0;for(var k in S.inbox.lv)t+=S.inbox.lv[k];return t;}
function ibDay(i){return "Semaine "+Math.ceil(i/5)+" · "+DAYS[(i-1)%5];}
function ibCfg(i){
  /* tout se durcit au fil des 20 journées : nombre de messages, cadence, patience, niveau, part de WhatsApp, rafales, traduction */
  var lvls=i<=4?[1,1,1]:i<=8?[1,1,2]:i<=12?[1,2,2]:i<=16?[2,2,3]:[2,3,3];
  var d=i-1;
  return {n:7+Math.round(d*.6),gap:Math.max(2600,11000-d*440),gapMin:Math.max(1500,6000-d*235),acc:i<=5?.97:.95,
    pat:Math.max(10000,36000-d*1370),typing:Math.max(450,1200-d*40),burst:i<7?0:Math.min(.35,(i-6)*.035),
    waShare:i<=2?.3:i<=6?.4:.5,showFr:i<=4,lvls:lvls};
}
function startInbox(i){
  stopRaf();
  var c=ibCfg(i),all=window.INBOX||[],used={},msgs=[];
  for(var k=0;k<c.n;k++){
    var want=c.lvls[k%c.lvls.length],app=k===0?"t":(Math.random()<c.waShare?"w":"t");
    var tries=[function(m){return m[7]===want&&m[0]===app;},function(m){return m[0]===app&&Math.abs(m[7]-want)<=1;},function(m){return m[7]===want;},function(){return true;}];
    var pool=[];for(var t=0;t<tries.length&&!pool.length;t++)pool=all.filter(function(m,idx){return !used[idx]&&tries[t](m);});
    var m=pick(pool);used[all.indexOf(m)]=1;msgs.push(m);
  }
  overlay={type:"inbox",G:{i:i,c:c,msgs:msgs,spawned:0,answered:0,mistakes:0,missed:[],combo:0,maxCombo:0,score:0,status:"play",reason:""}};
}
var inboxApi={
  name:function(){return NAME;},
  speak:function(t){if(!S.loop.mute)speak(t,1);},
  muted:function(){return !!S.loop.mute;},
  tone:function(a,b,c,d,e){tone(a,b,c,d,e);},
  dayName:ibDay,
  win:function(G){
    G.status="won";var stars=(G.mistakes===0&&!G.lostLives)?3:(G.mistakes+G.lostLives<=2)?2:1,prev=ibStars(G.i);
    G.stars=stars;G.newBest=stars>prev;if(stars>prev)S.inbox.lv[G.i]=stars;
    G.coins=10+stars*10+G.maxCombo*2;S.loop.coins+=G.coins;markToday();save();return {stars:stars,coins:G.coins};
  },
  lose:function(G,reason){G.status="lost";G.reason=reason;markToday();save();},
  showResult:function(){stopRaf();render();window.scrollTo(0,0);},
  quit:function(){stopRaf();overlay=null;tab="games";inboxMap=true;render();window.scrollTo(0,0);}
};
function mountStage(G,factory,api){
  if(loopGame&&loopGame.__G===G&&document.getElementById("lpwrap"))return;
  stopRaf();view.innerHTML='';
  if(!window.Phaser||!factory){view.innerHTML='<div class="card">Le moteur de jeu n’a pas pu se charger.</div>';return;}
  var st=document.createElement("div");st.id="loopstage";st.className="loopstage";st.innerHTML='<div id="lpwrap"></div>';document.body.appendChild(st);
  loopGame=factory.mount(document.getElementById("lpwrap"),G,api);loopGame.__G=G;
}
function renderInbox(){
  var G=overlay.G;
  if(G.status==="won")return renderInboxEnd(G,true);
  if(G.status==="lost")return renderInboxEnd(G,false);
  if(ibUI&&ibUI.__G===G&&document.getElementById("ibroot"))return;
  stopRaf();view.innerHTML="";
  var r=document.createElement("div");r.id="ibroot";document.body.appendChild(r);
  ibUI=window.InboxRaceUI.mount(r,G,inboxApi);ibUI.__G=G;
}
function ibRecap(G){
  var miss=G.missed,list=G.msgs.slice(0,Math.max(G.answered,1)+ (G.status==="lost"?2:0));
  return '<div class="stack list">'+G.msgs.filter(function(m,k){return k<G.spawned;}).map(function(m){var bad=miss.indexOf(m)>-1;
    return '<button class="les" data-say="'+esc(m[2])+'"><span class="ico">'+SVG.sound+'</span><span><b>'+esc(m[2])+'</b><span class="fr">'+esc(m[3])+'</span><span class="ex">↳ '+esc(m[4])+'</span></span>'+(bad?'<span class="pill warn">À revoir</span>':'<span></span>')+'</button>';}).join("")+'</div>';
}
function renderInboxEnd(G,won){
  var nx=G.i<INBOX_N?G.i+1:null;
  view.innerHTML='<div class="gamebar"><button class="back" data-inboxmap="1">‹ Carte</button><span class="tag">Inbox Race · '+ibDay(G.i)+'</span></div>'+
   (won?'<div class="tile navy span2 lwin ibwin"><div class="tag">'+(G.newBest?"Journée bouclée · nouveau record":"Journée bouclée")+'</div><div class="stars">'+starsHTML(G.stars,true)+'</div>'+
     '<div class="lstats"><div><b>'+G.score+'</b><span>points</span></div><div><b>×'+G.maxCombo+'</b><span>meilleur combo</span></div><div><b>+'+G.coins+'</b><span>pièces</span></div></div>'+
     '<p>'+(G.stars===3?"Inbox zero sans faute !":G.mistakes+" mauvaise"+(G.mistakes>1?"s":"")+" réponse"+(G.mistakes>1?"s":"")+". Rejoue sans faute pour 3 étoiles.")+'</p></div>'+
     '<div class="actions">'+(nx?'<button class="btn primary" data-inboxplay="'+nx+'">Journée suivante</button>':'<div class="card center"><b>Les 4 semaines sont bouclées, bravo !</b></div>')+'<button class="btn" data-inboxplay="'+G.i+'">Rejouer</button></div>'
   :'<div class="card score"><div class="tag">Trois messages restés sans réponse…</div><div class="big"><b>'+G.answered+'</b><small>/ '+G.msgs.length+' messages</small></div><p style="margin:8px 0 0">Astuce : surveille la pastille rouge de l’autre appli et les barres de patience. Réponds d’abord au message dont la barre est orange ou rouge.</p></div>'+
     '<div class="actions"><button class="btn primary" data-inboxplay="'+G.i+'">Réessayer</button><button class="btn" data-inboxmap="1">Retour à la carte</button></div>')+
   '<h2>Les messages de la journée</h2>'+ibRecap(G);
}
function renderInboxMap(){
  var cur=ibCurrent();if(!inboxWeek)inboxWeek=Math.ceil(cur/5);
  var wk=inboxWeek,nodes="";
  for(var d=0;d<5;d++){var i=(wk-1)*5+d+1,st=ibStars(i),un=ibUnlocked(i),isCur=i===cur&&!st;
    nodes+='<button class="node'+(st?" won":"")+(isCur?" cur":"")+(un?"":" locked")+'" '+(un?'data-inboxplay="'+i+'"':'disabled')+'><span class="nd ibnd">'+(un?DAYS[d].slice(0,3):'<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>')+'</span><span class="ns">'+starsHTML(st)+'</span></button>';}
  view.innerHTML='<div class="gamebar"><button class="back" data-inboxback="1">‹ Jeux</button><button class="mutebtn" data-loopmute="1" aria-label="Son">'+(S.loop.mute?BSVG.mute:BSVG.sound)+'</button></div>'+
   '<div class="qtext" style="margin-top:0">Inbox Race</div>'+
   '<div class="bento"><div class="tile navy span2 ibtile"><div class="tag">Messages Teams et WhatsApp</div>'+
    '<div class="lstats"><div><b>'+ibTotal()+'</b><span>étoiles / 60</span></div><div><b>'+S.loop.coins+'</b><span>pièces</span></div><div><b>'+DAYS[(cur-1)%5].slice(0,3)+'.</b><span>semaine '+Math.ceil(cur/5)+'</span></div></div>'+
    '<button class="btn primary" data-inboxplay="'+cur+'">'+SVG.play+' Jouer : '+ibDay(cur)+'</button></div></div>'+
   '<div class="chips" style="margin-top:16px">'+[1,2,3,4].map(function(w){var open=ibUnlocked((w-1)*5+1);return '<button class="chip'+(wk===w?" on":"")+'" data-inboxweek="'+w+'"'+(open?"":" disabled")+'>'+(open?"":"🔒 ")+'Semaine '+w+'</button>';}).join("")+'</div>'+
   '<div class="ibpath">'+nodes+'</div>'+
   '<h2>Comment jouer</h2><div class="card"><p>Tu jongles entre <b>Teams</b> et <b>WhatsApp</b> avec les onglets en bas. Une notification apparaît quand un message arrive dans l’autre appli, et la pastille rouge compte les messages en attente.</p><p>Choisis la bonne réponse : elle part en bulle dans la conversation. Une mauvaise réponse fait réagir ton interlocuteur et accélère l’arrivée du message suivant.</p><p>Chaque message a une <b>barre de patience</b>. Si elle se vide, tu perds un ❤️ ; trois cœurs perdus, la journée est perdue.</p><p style="margin:0">Plus tu avances, plus c’est dur : messages plus nombreux et plus rapides, patience plus courte, anglais plus avancé, rafales sur les deux applis, et la traduction n’est plus affichée (touche un message pour la voir, −5 points).</p></div>';
}

/* ===================== RÉVISION ESPACÉE + SESSION DU JOUR ===================== */
/* Chaque mot étudié entre dans une « boîte ». Bonne réponse : il monte d'une boîte et revient plus tard.
   Erreur : il redescend et revient dès le lendemain. Intervalles en jours par boîte : */
var SRS_INT=[0,1,3,7,14,30];
function addDays(n){var d=new Date();d.setDate(d.getDate()+n);return dkey(d);}
function srsAdd(ids){var t=today();ids.forEach(function(id){if(!S.srs[id])S.srs[id]={b:0,due:t};});}
function srsAddLesson(w){srsAdd(WORDS.filter(function(x){return x.w===w;}).map(function(x){return x.id;}));}
function srsDue(){var t=today();return Object.keys(S.srs).filter(function(id){return S.srs[id].due<=t&&BYID[id];}).sort(function(a,b){return S.srs[a].b-S.srs[b].b;});}
function srsGrade(id,ok){
  var c=S.srs[id]||(S.srs[id]={b:0,due:today()});
  c.b=ok?Math.min(5,c.b+1):1;c.due=addDays(ok?SRS_INT[c.b]:1);
  S.known[id]=ok&&c.b>=2?true:(ok?S.known[id]:false);
}
var BYID={};WORDS.forEach(function(x){BYID[x.id]=x;});
Object.keys(S.done).forEach(function(w){srsAddLesson(+w);});
function sessDoneToday(){return S.sess&&S.sess.date===today()&&S.sess.done;}
function sessPlan(){
  var due=srsDue().slice(0,12),nl=nextLesson(),nw=[];
  if(nl){var ws=WORDS.filter(function(x){return x.w===nl.w;});if(ws.some(function(x){return !S.srs[x.id];}))nw=ws;}
  var lexT=null;
  if(!nw.length){
    var dk=(S.decks&&S.decks.length)?S.decks:BANK.map(function(t){return t.id;});
    for(var k=0;k<dk.length&&!lexT;k++){var t=BANK.filter(function(b){return b.id===dk[k];})[0];if(!t)continue;var fresh=t.words.filter(function(x){return !S.srs[x.id];});if(fresh.length){lexT=t;nw=fresh.slice(0,6);}}
  }
  return {due:due,nl:nl,nw:nw,lexT:lexT};
}
function startSession(){
  var p=sessPlan(),steps=[];
  if(p.due.length)steps.push("review");
  if(p.nw.length)steps.push("learn");
  var qpool=p.nw.concat(p.due.map(function(id){return BYID[id];}));
  if(qpool.length<4)qpool=qpool.concat(shuffle(poolWords()).slice(0,6));
  steps.push("quiz");steps.push("game");
  var sw=shuffle(qpool).slice(0,5),qs=sw.map(function(w,i){return i%2?qFrEn(w,WORDS):qEnFr(w,WORDS);});
  overlay={type:"session",s:{steps:steps,k:0,due:p.due,nw:p.nw,nl:p.nl,lexT:p.lexT,pos:0,flipped:false,ok:0,
    quiz:{qs:qs,pos:0,res:[],locked:false,picked:null},learned:0}};
}
function sessStep(){var s=overlay.s;return s.steps[s.k];}
function sessNext(){var s=overlay.s;s.k++;s.pos=0;s.flipped=false;if(sessStep()==="game"){S.sess={date:today(),done:true};markToday();save();}}
function sessHeader(title){
  var s=overlay.s,names={review:"Révision",learn:"Nouveaux mots",quiz:"Quiz",game:"Défi"};
  return '<div class="qbar"><button class="back" data-quit="1">‹ Quitter</button><span class="tag">Session du jour</span></div>'+
    '<div class="segs">'+s.steps.map(function(x,i){return '<i class="'+(i<s.k?"ok":i===s.k?"cur":"")+'"></i>';}).join("")+'</div>'+
    '<div class="sesslab">'+s.steps.map(function(x,i){return '<span class="'+(i===s.k?"on":"")+'">'+names[x]+'</span>';}).join("")+'</div>'+
    '<div class="qtext" style="margin-top:6px">'+title+'</div>';
}
function renderSession(){
  var s=overlay.s,st=sessStep();
  if(st==="review"){
    var id=s.due[s.pos],w=BYID[id],box=(S.srs[id]||{}).b||0;
    view.innerHTML=sessHeader("Révision · "+(s.pos+1)+" / "+s.due.length)+
     '<p class="qhint">Ces mots reviennent aujourd’hui. Dis-toi la traduction, puis vérifie.</p>'+
     (s.flipped?'<button class="flash navy flip" data-sflip="1"><span class="lab">'+esc(wlabel(w))+' · boîte '+box+'</span><span class="term">'+esc(w.fr)+'</span><span class="en">'+esc(w.en)+'</span><span class="ex">« '+esc(w.ex)+' »</span></button>'
       :'<button class="card flash" data-sflip="1"><span class="pill neutral">Boîte '+box+' / 5</span><span class="term">'+esc(w.en)+'</span><span class="fhint">Touche pour voir la traduction</span></button>')+
     (s.flipped?'<div class="row2" style="margin-top:14px"><button class="btn" data-sgrade="0">Je ne savais pas</button><button class="btn primary" data-sgrade="1">Je savais ✓</button></div>'
       :'<div class="actions"><button class="btn" data-say="'+esc(w.en)+'">'+SVG.sound+' Écouter</button><button class="btn primary" data-sflip="1">Voir la réponse</button></div>');
    if(!s.flipped)speak(w.en);
    return;
  }
  if(st==="learn"){
    var w2=s.nw[s.pos];
    view.innerHTML=sessHeader("Nouveaux mots · "+(s.pos+1)+" / "+s.nw.length)+
     '<p class="qhint">'+(s.lexT?'Lexique · '+s.lexT.ic+' '+esc(s.lexT.n):'Leçon '+lnum(s.nl)+' : '+esc(s.nl.t))+'</p>'+
     '<div class="card flash learn"><span class="term">'+esc(w2.en)+'</span><span class="fr2">'+esc(w2.fr)+'</span><span class="ex2">« '+esc(w2.ex)+' »</span></div>'+
     '<div class="row2" style="margin-top:14px"><button class="btn" data-say="'+esc(w2.ex)+'">'+SVG.sound+' La phrase</button><button class="btn primary" data-slearn="1">'+(s.pos<s.nw.length-1?"Mot suivant":"J’ai vu les "+s.nw.length+" mots")+'</button></div>';
    speak(w2.en);
    return;
  }
  if(st==="quiz"){
    var z=s.quiz,q=z.qs[z.pos],L="ABCD";
    var opts=q.o.map(function(o,i){var cls="opt",dis="";if(z.locked){dis=" disabled";if(i===q.a)cls+=" ok";else if(i===z.picked)cls+=" ko";}
      return '<button class="'+cls+'" data-sopt="'+i+'"'+dis+'><span class="l">'+L[i]+'</span><span>'+esc(o)+'</span></button>';}).join("");
    var fb=z.locked?'<div class="feedback '+(z.picked===q.a?"good":"bad")+'"><b class="v">'+(z.picked===q.a?"Exact !":"Pas tout à fait")+'</b><p>'+q.ex+'</p></div><div class="actions"><button class="btn primary" data-sqnext="1">'+(z.pos<z.qs.length-1?"Question suivante":"Continuer")+'</button></div>':'';
    view.innerHTML=sessHeader("Quiz · "+(z.pos+1)+" / "+z.qs.length)+'<div class="qtext" style="font-size:20px;margin-top:4px">'+esc(q.p)+'</div><div class="qhint">'+esc(q.h)+'</div><div class="opts">'+opts+'</div>'+fb;
    return;
  }
  /* défi final */
  var cl=currentLevel(),ib=ibCurrent(),rev=s.due.length,okq=s.quiz.res.filter(Boolean).length;
  view.innerHTML=sessHeader("Session bouclée !")+
   '<div class="tile navy span2" style="margin-top:6px"><div class="tag">Bravo '+esc(NAME)+', c’est fait pour aujourd’hui</div>'+
   '<div class="lstats"><div><b>'+rev+'</b><span>mots révisés</span></div><div><b>'+s.nw.length+'</b><span>nouveaux mots</span></div><div><b>'+okq+'/'+s.quiz.qs.length+'</b><span>au quiz</span></div></div>'+
   '<p>Série : '+streak()+' jour'+(streak()>1?"s":"")+' 🔥 · Prochaine révision : '+srsNextLabel()+'</p></div>'+
   '<h2>Défi du jour (facultatif)</h2><div class="stack">'+
   '<button class="mod" data-sgame="loop"><span class="num">🍲</span><span><b>Congress Loop</b><span class="sub">Monde '+cl.w+', niveau '+cl.i+'</span></span></button>'+
   '<button class="mod" data-tab="oral"><span class="num">🎙️</span><span><b>Expression orale</b><span class="sub">'+oralToday()+' / '+ORAL_GOAL+' phrases dites aujourd’hui</span></span></button>'+
   '<button class="mod" data-callplay="'+callNext()+'"><span class="num">📞</span><span><b>Le Coup de fil</b><span class="sub">'+esc(callList()[callNext()].name+" · "+callList()[callNext()].title)+'</span></span></button>'+
   '<button class="mod" data-sgame="inbox"><span class="num">💬</span><span><b>Inbox Race</b><span class="sub">'+ibDay(ib)+'</span></span></button>'+
   (s.nl&&!valid(s.nl.w)?'<button class="mod" data-open="'+s.nl.w+'"><span class="num">📖</span><span><b>Valider la leçon '+lnum(s.nl)+'</b><span class="sub">'+esc(s.nl.t)+' · la valider débloque les 6 mots suivants</span></span></button>':'')+
   '</div><div class="actions"><button class="btn" data-quit="1">Terminer</button></div>';
}
function srsNextLabel(){
  var t=today(),next=null;Object.keys(S.srs).forEach(function(id){var d=S.srs[id].due;if(d>t&&(!next||d<next))next=d;});
  if(!next)return "demain";var days=Math.round((new Date(next+"T00:00:00")-new Date(t+"T00:00:00"))/864e5);
  return days<=1?"demain":"dans "+days+" jours";
}

/* ===================== SAUVEGARDE DE LA PROGRESSION ===================== */
var backupMode=null,backupMsg="";
function exportCode(){return "SR1:"+btoa(unescape(encodeURIComponent(JSON.stringify(S))));}
function importCode(code){
  code=(code||"").trim();if(code.indexOf("SR1:")!==0)throw new Error("format");
  var o=JSON.parse(decodeURIComponent(escape(atob(code.slice(4)))));
  if(!o||typeof o!=="object"||!o.done)throw new Error("contenu");
  for(var k in o)S[k]=o[k];save();
}
function backupHTML(){
  var out='<h2>Mon profil</h2><div class="card"><div class="oform pform"><input id="pname" value="'+esc(NAME)+'" maxlength="30" aria-label="Prénom"><button class="btn primary" data-pname="1">Enregistrer</button></div><p class="tag" style="margin:8px 0 0">Ton prénom apparaît dans l’appli, les messages et les appels.</p></div>'+
    '<h2>Ma progression</h2><div class="card"><p style="margin:0 0 12px">Ta progression est enregistrée sur cet appareil. Sauvegarde-la de temps en temps pour la retrouver si tu changes de téléphone.</p>'+
    '<div class="row2"><button class="btn" data-backup="export">Exporter</button><button class="btn" data-backup="import">Importer</button></div>';
  if(backupMode==="export")out+='<textarea class="codebox" id="bcode" readonly>'+exportCode()+'</textarea><div class="row2"><button class="btn primary" data-backup="copy">Copier le code</button><button class="btn" data-backup="file">Télécharger</button></div>';
  if(backupMode==="import")out+='<textarea class="codebox" id="bin" placeholder="Colle ici ton code de sauvegarde (il commence par SR1:)"></textarea><div class="actions" style="margin-top:10px"><button class="btn primary" data-backup="restore">Restaurer</button></div>';
  if(backupMsg)out+='<p class="tag" style="margin:10px 0 0">'+esc(backupMsg)+'</p>';
  return out+'</div>';
}


/* ===================== EXPLICATIONS DES JEUX ===================== */
if(!S.tips||typeof S.tips!=="object")S.tips={};
var TIPS_SEEN={};
var TIPS={
 loop:{t:"Congress Loop",ic:"🍲",steps:[
   ["👀","Chaque client attend un mot <b>en français</b> au-dessus de sa marmite."],
   ["👆","Touche sur le tapis le mot <b>anglais</b> qui correspond : il file dans la bonne marmite."],
   ["⏳","La jauge autour du client se vide. S’il part, tu perds un ❤️. Trois cœurs perdus = perdu."],
   ["🧺","Un mot sans marmite va sur le <b>plateau d’attente</b>. Plateau plein = perdu aussi."],
   ["🔥","Enchaîne pour les combos et la <b>FEVER</b>. Les bonus Indice, Gel et Case te sauvent la mise."]]},
 inbox:{t:"Inbox Race",ic:"💬",steps:[
   ["📱","Tes collègues t’écrivent sur <b>Teams</b> et <b>WhatsApp</b>. Passe d’une appli à l’autre avec les onglets en bas."],
   ["🔴","La pastille rouge compte les messages en attente. Une notification s’affiche quand l’autre appli sonne."],
   ["💬","Choisis la bonne réponse anglaise : elle part en bulle dans la conversation."],
   ["⏳","Chaque message a une barre de patience. Si elle se vide, tu perds un ❤️."],
   ["🌐","Touche un message pour lire sa traduction (−5 points)."]]},
 call:{t:"Le Coup de fil",ic:"📞",steps:[
   ["📲","Ton téléphone sonne : décroche avec le bouton vert."],
   ["👂","Écoute ton interlocuteur. Les sous-titres et la traduction s’activent avec les boutons de l’écran d’appel."],
   ["✅","Choisis ta réponse avant la fin du chrono, puis <b>dis-la à voix haute</b> : l’appli t’écoute."],
   ["😀","Chaque réponse fait monter ou baisser la satisfaction du client. Vise 3 étoiles !"]]},
 memory:{t:"Paires",ic:"🃏",steps:[["🃏","Retourne deux cartes à la fois."],["🔗","Trouve chaque mot anglais et sa traduction française."],["🏆","Termine en un minimum de coups."]]},
 chrono:{t:"Vrai ou faux chrono",ic:"⏱️",steps:[["👀","Un mot anglais et une traduction s’affichent."],["✅","Réponds Vrai ou Faux le plus vite possible."],["⏱️","Tu as 60 secondes pour marquer un max de points."]]},
 scramble:{t:"Phrase en désordre",ic:"🧩",steps:[["🧩","Les mots d’une phrase sont mélangés."],["👆","Touche-les dans le bon ordre pour reconstruire la phrase."],["✅","Vérifie, puis passe à la suivante."]]},
 dictee:{t:"Dictée",ic:"✍️",steps:[["🔊","Écoute le mot (tu peux le réécouter, même lentement)."],["⌨️","Écris-le en anglais."],["✅","Valide pour voir si c’est juste."]]}
};
function tipFor(d){
  if(d.loopplay||d.sgame==="loop")return "loop";
  if(d.inboxplay||d.sgame==="inbox")return "inbox";
  if(d.callplay!==undefined)return "call";
  if(d.game&&TIPS[d.game])return d.game;
  return null;
}
function showTip(id,el){
  var T=TIPS[id],m=document.createElement("div");m.className="tipm";
  m.innerHTML='<div class="tipc" role="dialog" aria-modal="true"><div class="tiph"><span class="tipi">'+T.ic+'</span><div><span class="tag">Comment jouer</span><b>'+T.t+'</b></div></div>'+
    '<ol class="tips">'+T.steps.map(function(x){return '<li><span>'+x[0]+'</span><p>'+x[1]+'</p></li>';}).join("")+'</ol>'+
    '<label class="tipchk"><input type="checkbox" id="tipno"><span>J’ai compris, ne plus afficher</span></label>'+
    '<div class="row2"><button class="btn" data-tipclose="0">Annuler</button><button class="btn primary" data-tipclose="1">C’est parti !</button></div></div>';
  document.body.appendChild(m);
  m.addEventListener("click",function(e){
    var b=e.target.closest("[data-tipclose]");if(!b&&e.target!==m)return;
    e.stopPropagation();
    var go1=b&&b.getAttribute("data-tipclose")==="1";
    if(m.querySelector("#tipno").checked){S.tips[id]=1;save();}
    TIPS_SEEN[id]=1;m.classList.add("out");setTimeout(function(){m.remove();},200);
    if(go1)el.click();
  });
}
/* ===================== LE COUP DE FIL ===================== */
if(!S.calls||typeof S.calls!=="object")S.calls={};
var callsMap=false,callTimer=null,ringTimer=null;
var CALL_TIME={1:15,2:12,3:10},LVNAME={1:"Facile",2:"Moyen",3:"Difficile"},SATD={2:20,1:8,0:0,"-1":-12,"-2":-22};
function callList(){return window.CALLS||[];}
function callUnlocked(k){return k===0||(S.calls[callList()[k-1].id]||0)>0;}
function callNext(){var L=callList();for(var k=0;k<L.length;k++)if(!S.calls[L[k].id])return k;return 0;}
function callStars(){var t=0;for(var k in S.calls)t+=S.calls[k];return t;}
function satFace(v){return v>=75?"😀":v>=55?"🙂":v>=35?"😐":"😠";}
function callRoot(){var el=document.getElementById("callroot");if(!el){el=document.createElement("div");el.id="callroot";document.body.appendChild(el);}return el;}
function callClose(){clearInterval(window.__durT);window.__durT=null;clearInterval(callTimer);clearInterval(ringTimer);callTimer=ringTimer=null;stopAudio();var el=document.getElementById("callroot");if(el)el.remove();}
function speakThen(text,cb,rate){
  var done=false,fin=function(){if(done)return;done=true;cb&&cb();};
  var est=900+text.split(/\s+/).length*330/(rate||.95);
  speak(text,rate,function(){setTimeout(fin,250);});
  setTimeout(fin,est+2500);
}
function startCall(k){
  callClose();var sc=callList()[k];
  overlay={type:"call",C:{k:k,sc:sc,phase:"ring",t:0,sat:50,log:[],cc:sc.lv<3,timeouts:0,start:0,speaking:false}};
  ringTimer=setInterval(function(){tone([440,480],.35,"sine",.06,.0);setTimeout(function(){tone([440,480],.35,"sine",.06,0);},450);},2200);
  tone([440,480],.35,"sine",.06,0);
}
function callAccept(){var C=overlay.C;clearInterval(ringTimer);ringTimer=null;C.start=Date.now();callSay(C.sc.turns[0].c,function(){callChoose();});}
function callSay(line,cb){var C=overlay.C;C.phase="talk";C.line=line;C.speaking=true;render();speakThen(line[0],function(){if(!overlay||overlay.C!==C)return;C.speaking=false;cb&&cb();},Math.min(1.08,.9+C.k*.02));}
function callChoose(){
  var C=overlay.C,turn=C.sc.turns[C.t];C.phase="choose";C.opts=shuffle(turn.o.map(function(o,i){return {o:o,i:i};}));C.left=Math.max(7,CALL_TIME[C.sc.lv]-Math.floor(C.k/3));C.tmax=C.left;render();
  clearInterval(callTimer);
  callTimer=setInterval(function(){
    if(!overlay||overlay.type!=="call"||overlay.C!==C||C.phase!=="choose"){clearInterval(callTimer);return;}
    C.left-=.1;var b=document.getElementById("ctbar");if(b)b.style.width=Math.max(0,C.left/C.tmax*100)+"%";
    if(C.left<=0){clearInterval(callTimer);C.timeouts++;C.sat=Math.max(0,C.sat-15);C.log.push({t:C.t,timeout:true});tone([200,160],.15,"square",.05,.12);
      callSay(["Hello? Are you still there?","Allô ? Vous êtes toujours là ?"],function(){if(C.timeouts>=2){C.timeouts=0;callAdvance();}else callChoose();});}
  },100);
}
function callPick(j){
  var C=overlay.C;if(C.phase!=="choose")return;clearInterval(callTimer);
  var pick=C.opts[j],o=pick.o,turn=C.sc.turns[C.t];C.timeouts=0;
  C.sat=Math.max(0,Math.min(100,C.sat+(SATD[o[2]]||0)));
  var entry={t:C.t,c:turn.c,o:o,best:turn.o.filter(function(x){return x[2]===2;})[0]};C.log.push(entry);C.cur=entry;
  tone(o[2]>=1?[660,880]:o[2]===0?[520]:[220,180],.1,o[2]>=1?"triangle":"square",.06,.08);
  if(CAN_REC&&!S.oral.callSkip){C.phase="speak";render();callRecStart(entry);}
  else callReact();
}
function callRecStart(entry){
  var C=overlay.C,go2=function(stream){
    O.stream=stream;var chunks=[],types=["audio/mp4","audio/webm;codecs=opus","audio/webm"],mt=null;
    for(var k=0;k<types.length;k++){try{if(MediaRecorder.isTypeSupported(types[k])){mt=types[k];break;}}catch(e){}}
    var rec;try{rec=mt?new MediaRecorder(stream,{mimeType:mt}):new MediaRecorder(stream);}catch(e){callReact();return;}
    C.rec=rec;rec.ondataavailable=function(ev){if(ev.data&&ev.data.size)chunks.push(ev.data);};
    rec.onstop=function(){var blob=new Blob(chunks,{type:rec.mimeType||mt||"audio/mp4"});entry.blob=blob;entry.url=URL.createObjectURL(blob);callJudge(entry);callReact();};
    rec.start();C.recAt=Date.now();
    C.recTo=setTimeout(function(){if(rec.state==="recording")rec.stop();},12000);
  };
  stopAudio();
  if(O.stream&&O.stream.active)go2(O.stream);
  else navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}}).then(go2,function(e){entry.micErr=micError(e);callReact();});
}
function callRecStop(skip){var C=overlay.C;clearTimeout(C.recTo);if(skip)C.cur.skipped=true;if(C.rec&&C.rec.state==="recording")C.rec.stop();else callReact();}
function callJudge(entry){
  if(!S.oral.asr||!window.SRJudge||!entry.blob||entry.skipped)return;
  var C=overlay.C;
  SRJudge.transcribe(entry.blob).then(function(txt){
    entry.heard=txt;entry.judge=SRJudge.judge(entry.o[0],txt);
    if(!overlay||overlay.C!==C)return;
    var sc=entry.judge.score;
    if(sc>=75){C.sat=Math.min(100,C.sat+5);callToast("Prononciation claire · "+sc+"/100 · +5 😀");}
    else if(sc<40)callToast("Pas très clair · "+sc+"/100");
    else callToast("Prononciation · "+sc+"/100");
    var m=document.getElementById("csat");if(m)m.outerHTML=satHTML(C.sat);
  },function(){});
}
function callToast(t){var el=document.createElement("div");el.className="ctoast";el.textContent=t;var root=document.getElementById("callroot");if(root){root.appendChild(el);setTimeout(function(){el.remove();},2600);}}
function callReact(){
  var C=overlay.C;if(!C||C.phase==="end"||C.phase==="done")return;
  var o=C.cur&&C.cur.o;
  if(o&&o[3]){callSay(o[3],function(){callAdvance();});}
  else{C.phase="talk";C.line=null;render();setTimeout(function(){if(overlay&&overlay.C===C)callAdvance();},500);}
}
function callAdvance(){
  var C=overlay.C;C.t++;
  if(C.t>=C.sc.turns.length){callFinish(false);return;}
  callSay(C.sc.turns[C.t].c,function(){callChoose();});
}
function callFinish(hung){
  var C=overlay.C;clearInterval(callTimer);
  var stars=hung?0:C.sat>=80?3:C.sat>=55?2:C.sat>=30?1:0;
  C.stars=stars;C.hung=hung;C.dur=Math.round((Date.now()-(C.start||Date.now()))/1000);
  var prev=S.calls[C.sc.id]||0;C.newBest=stars>prev;if(stars>prev)S.calls[C.sc.id]=stars;
  C.coins=stars?10+stars*10:0;S.loop.coins+=C.coins;markToday();save();
  var toDone=function(){C.phase="ended";render();tone([480,360],.18,"sine",.06,.12);setTimeout(function(){if(overlay&&overlay.C===C){C.phase="done";render();}},1300);};
  if(hung){toDone();return;}
  var e=C.sat>=75?C.sc.end.good:C.sat>=45?C.sc.end.ok:C.sc.end.bad;
  C.endLine=e;callSay(e,function(){toDone();});
  C.phase="end";
}
function satHTML(v){return '<span class="csat" id="csat">'+satFace(v)+' '+v+'%</span>';}
function fmtDur(s){var m=Math.floor(s/60),x=s%60;return m+":"+(x<10?"0":"")+x;}
var IC={
 spk:'<svg viewBox="0 0 24 24"><path d="M3.5 9.2h3.6L12 5v14l-4.9-4.2H3.5z" fill="currentColor"/><path d="M15.3 9a4.2 4.2 0 0 1 0 6M17.9 6.4a7.8 7.8 0 0 1 0 11.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
 cc:'<svg viewBox="0 0 24 24"><rect x="2.5" y="5" width="19" height="14" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10.4 10.2a2.4 2.4 0 1 0 0 3.6M17 10.2a2.4 2.4 0 1 0 0 3.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
 mic:'<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
 micoff:'<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4 3.5l16 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
 more:'<svg viewBox="0 0 24 24"><circle cx="5.5" cy="12" r="1.9" fill="currentColor"/><circle cx="12" cy="12" r="1.9" fill="currentColor"/><circle cx="18.5" cy="12" r="1.9" fill="currentColor"/></svg>',
 end:'<svg viewBox="0 0 24 24"><path d="M2.2 13.6c5.6-4.6 14-4.6 19.6 0 .6.5.7 1.4.2 2l-1.6 1.9c-.4.5-1.2.6-1.8.3l-2.7-1.4c-.5-.3-.8-.8-.7-1.4l.2-1.6c-2.2-.8-4.6-.8-6.8 0l.2 1.6c.1.6-.2 1.1-.7 1.4l-2.7 1.4c-.6.3-1.3.2-1.8-.3L2 15.6c-.5-.6-.4-1.5.2-2z" fill="currentColor"/></svg>',
 phone:'<svg viewBox="0 0 24 24"><path d="M6.6 3.3c.6-.5 1.5-.4 2 .2l2 2.7c.4.5.4 1.2 0 1.7l-1.3 1.6c1 2 2.6 3.7 4.6 4.7l1.6-1.3c.5-.4 1.2-.4 1.7 0l2.7 2c.6.5.7 1.4.2 2l-1.4 1.6c-.8.9-2 1.3-3.2 1C9.9 18.3 5.7 14.1 4.4 8.5c-.3-1.2.1-2.4 1-3.2z" fill="currentColor"/></svg>',
 pad:'<svg viewBox="0 0 24 24">'+[6,12,18].map(function(y){return [6,12,18].map(function(x){return '<circle cx="'+x+'" cy="'+(y-1.5)+'" r="1.9" fill="currentColor"/>';}).join("");}).join("")+'<circle cx="12" cy="22" r="1.9" fill="currentColor"/></svg>',
 alarm:'<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="7.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 9.5V13l2.3 1.6M4 5.5l3-2.5M20 5.5l-3-2.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
 msg:'<svg viewBox="0 0 24 24"><path d="M12 4c5 0 9 3.2 9 7.2s-4 7.2-9 7.2c-1 0-2-.1-2.9-.4L4.6 20l1.2-3.6C4.1 15 3 13.2 3 11.2 3 7.2 7 4 12 4z" fill="currentColor"/></svg>'
};
function callDurTick(){var C=overlay&&overlay.type==="call"&&overlay.C;var el=document.getElementById("cdur");if(C&&el&&C.start&&C.phase!=="done"&&C.phase!=="ended")el.textContent=fmtDur(Math.round((Date.now()-C.start)/1000));}
function cbtn(ic,lab,attr,on,extra){return '<button class="ib'+(on?" on":"")+(extra||"")+'" '+attr+'><span class="ibc">'+ic+'</span><span class="ibl">'+lab+'</span></button>';}
function renderCall(){
  var C=overlay.C,sc=C.sc,root=callRoot();view.innerHTML="";
  root.setAttribute("data-av",sc.av);root.style.setProperty("--cc",sc.col);
  if(!window.__durT)window.__durT=setInterval(callDurTick,1000);
  if(C.phase==="ring"){
    root.className="callscr ring";
    root.innerHTML='<div class="ihead"><div class="isub">mobile</div><div class="iname">'+esc(sc.name)+'</div><div class="isub2">'+esc(sc.role)+'</div></div>'+
      '<div class="iav">'+sc.av+'</div>'+
      '<div class="igoal"><span>Objectif de l’appel</span><b>'+esc(sc.title)+'</b><i>'+esc(sc.goal)+'</i></div>'+
      '<div class="iring"><div class="ismall"><button class="isb" data-quit="1"><span>'+IC.alarm+'</span>Me le rappeler</button><button class="isb" data-quit="1"><span>'+IC.msg+'</span>Message</button></div>'+
      '<div class="ibig"><button class="ibtn red" data-quit="1"><span class="ibc">'+IC.end+'</span><span class="ibl">Refuser</span></button><button class="ibtn green" data-cacc="1"><span class="ibc wig">'+IC.phone+'</span><span class="ibl">Accepter</span></button></div></div>';
    return;
  }
  if(C.phase==="ended"){
    root.className="callscr ended";
    root.innerHTML='<div class="ihead"><div class="iname">'+esc(sc.name)+'</div><div class="idur">Appel terminé</div></div><div class="iav">'+sc.av+'</div>';
    return;
  }
  if(C.phase==="done"){
    root.className="callscr done";
    var res=C.hung?"Appel raccroché":C.stars>=3?"Appel parfait, "+esc(NAME)+" !":C.stars===2?"Bon appel":C.stars===1?"Appel moyen":"Client mécontent";
    root.innerHTML='<button class="cclose" data-callsmap="1">‹ Appels</button><div class="cdone"><div class="cav sm" style="background:'+sc.col+'">'+sc.av+'</div><div class="ctitle">'+res+'</div>'+
      '<div class="cstars">'+[1,2,3].map(function(k){return '<span class="'+(k<=C.stars?"on":"")+'">★</span>';}).join("")+'</div>'+
      '<div class="lstats"><div><b>'+satFace(C.sat)+' '+C.sat+'%</b><span>satisfaction</span></div><div><b>'+fmtDur(C.dur)+'</b><span>durée</span></div><div><b>+'+C.coins+'</b><span>pièces</span></div></div>'+
      (C.endLine?'<p class="cend">« '+esc(C.endLine[0])+' »<br><i>'+esc(C.endLine[1])+'</i></p>':'')+
      '<div class="cact"><button class="btn primary" data-callplay="'+C.k+'">Rappeler</button>'+(C.k<callList().length-1&&C.stars?'<button class="btn" data-callplay="'+(C.k+1)+'">Appel suivant</button>':'')+'<button class="btn" data-callsmap="1">Répertoire</button></div>'+
      '<h2>Transcription de l’appel</h2><div class="ctrans">'+C.log.map(function(e,i){
        if(e.timeout)return '<div class="tl miss">⏱ Silence… le client a dû relancer.</div>';
        var q=e.o[2],cls=q>=2?"best":q>=1?"ok":"bad";
        return '<div class="tl"><div class="tc"><b>'+esc(sc.name)+'</b> '+esc(e.c[0])+'<i>'+esc(e.c[1])+'</i></div>'+
          '<div class="tm '+cls+'"><b>Toi</b> '+esc(e.o[0])+'<i>'+esc(e.o[1])+'</i>'+
          (e.url?'<button class="cplay" data-cplay="'+i+'">▶ ma voix</button>':'')+(e.judge?'<span class="cjs">🤖 '+e.judge.score+'/100</span>':'')+'</div>'+
          (q<2&&e.best?'<div class="tbest">💡 Mieux : '+esc(e.best[0])+'<button class="cplay" data-say="'+esc(e.best[0])+'">🔊</button></div>':'')+'</div>';}).join("")+'</div></div>';
    return;
  }
  root.className="callscr live";
  var dur=C.start?fmtDur(Math.round((Date.now()-C.start)/1000)):"0:00";
  var line=C.phase==="choose"?C.sc.turns[C.t].c:C.line;
  var cap="";
  if(line){
    cap='<div class="lcap"><div class="lch"><span class="lcdot'+(C.speaking?" on":"")+'"></span>Sous-titres en direct</div>'+
      (C.cc?'<b>'+esc(line[0])+'</b>':'<b class="hidden-cc">Sous-titres masqués · écoute bien</b>')+
      (C.fr?'<i>'+esc(line[1])+'</i>':'')+'</div>';
  }else if(C.speaking||C.phase==="talk"){cap='<div class="lcap dim"><div class="lch"><span class="lcdot"></span>…</div></div>';}
  var bottom="";
  if(C.phase==="choose"){
    bottom='<div class="sheet"><div class="sgrab"></div><div class="shd"><b>Ta réponse</b><span class="ctimer"><i id="ctbar" style="width:'+Math.max(0,C.left/C.tmax*100)+'%"></i></span></div>'+
      '<div class="copts">'+C.opts.map(function(p,j){return '<button class="copt" data-cpick="'+j+'">'+esc(p.o[0])+(C.fr?'<i>'+esc(p.o[1])+'</i>':'')+'</button>';}).join("")+'</div>'+
      '<div class="smini">'+cbtn(IC.spk,"Réécouter",'data-say="'+esc(line[0])+'"')+cbtn(IC.cc,"Sous-titres",'data-ccc="1"',C.cc)+cbtn(IC.pad,"Traduction",'data-cfr="1"',C.fr)+'</div></div>'+
      '<div class="iend"><button class="ibtn red sm" data-chang="1"><span class="ibc">'+IC.end+'</span></button></div>';
  }else if(C.phase==="speak"){
    bottom='<div class="sheet speak"><div class="sgrab"></div><span class="stag">À toi de le dire !</span><b class="sphr">'+esc(C.cur.o[0])+'</b>'+
      '<div class="smic"><span class="ibc">'+IC.mic+'</span></div><span class="rectime"><i></i>Je t’écoute…</span>'+
      '<div class="cact row"><button class="btn primary" data-cdone="1">J’ai fini</button><button class="btn ghost" data-cskip="1">Passer</button></div></div>';
  }else{
    var muted=!!S.oral.callSkip;
    bottom=(C.goalOpen?'<div class="igoal live"><span>Objectif</span><b>'+esc(sc.title)+'</b><i>'+esc(sc.goal)+'</i></div>':'')+
      '<div class="igrid">'+
      cbtn(IC.spk,"haut-parleur",line?'data-say="'+esc(line[0])+'"':'disabled')+cbtn(IC.cc,"sous-titres",'data-ccc="1"',C.cc)+cbtn(muted?IC.micoff:IC.mic,"silence",'data-cmute="1"',muted)+
      cbtn(IC.more,"objectif",'data-cgoal="1"',C.goalOpen)+'<button class="ibtn red" data-chang="1"><span class="ibc">'+IC.end+'</span><span class="ibl">fin</span></button>'+cbtn(IC.pad,"traduction",'data-cfr="1"',C.fr)+
      '</div>';
  }
  root.innerHTML='<div class="ihead"><div class="iname">'+esc(sc.name)+'</div><div class="idur"><span id="cdur">'+dur+'</span> · '+satHTML(C.sat)+'</div></div>'+
    '<div class="imid">'+cap+'</div>'+bottom;
}
function renderCallsMap(){
  var L=callList(),nx=callNext(),groups=[1,2,3];
  view.innerHTML='<div class="gamebar"><button class="back" data-callsback="1">‹ Jeux</button><span class="tag">'+callStars()+' / '+(L.length*3)+' ★</span></div>'+
   '<div class="qtext" style="margin-top:0">Le Coup de fil</div>'+
   '<div class="card" style="margin-bottom:6px"><p style="margin:0">Décroche, écoute ton interlocuteur et choisis ta réponse avant la fin du chrono. Puis <b>dis-la à voix haute</b> : avec l’écoute automatique activée, une prononciation claire rend le client plus content.</p>'+
   '<label class="cskiptog"><input type="checkbox" data-skiporal="1"'+(S.oral.callSkip?" checked":"")+'> Mode discret : ne pas parler (dans le métro…)</label></div>'+
   groups.map(function(g){return '<h2>'+LVNAME[g]+(g===3?" · sans sous-titres":"")+'</h2><div class="stack list">'+L.map(function(c,k){if(c.lv!==g)return "";var un=callUnlocked(k),st=S.calls[c.id]||0;
     return '<button class="les ccontact'+(un?"":" locked")+(k===nx&&!st?" cur":"")+'" '+(un?'data-callplay="'+k+'"':'disabled')+'><span class="cav xs" style="background:'+c.col+'">'+(un?c.av:"🔒")+'</span><span><b>'+esc(c.name)+'</b><span class="fr">'+esc(c.title)+'</span></span><span class="ns">'+starsHTML(st)+'</span></button>';}).join("")+'</div>';}).join("");
}

/* ===================== RENDU ===================== */
var view=$("#view"),prevKey=null;
function render(){
  var inov=!!overlay;
  document.body.classList.toggle("inquiz",inov);
  $("#hdr").style.display=(inov||(tab==="lessons"&&route.lesson)||(tab==="games"&&(loopMap||inboxMap||callsMap)))?"none":"";
  renderTabs();$("#htitle").textContent=tab==="home"?greet():TITLES[tab];$("#hset").style.display=(tab==="home"&&!settingsOpen&&!inov)?"":"none";if(tab==="home"&&settingsOpen)$("#hdr").style.display="none";
  if(overlay){
    if(overlay.type==="quiz")renderQuiz();
    else if(overlay.type==="session")renderSession();
    else if(overlay.type==="call")renderCall();
    else if(overlay.type==="loop")renderLoop();
    else if(overlay.type==="inbox")renderInbox();
    else{var g=overlay.g;({memory:renderMemory,chrono:renderChrono,scramble:renderScramble,dictee:renderDictee})[g.id](g);}
  }
  else if(tab==="home")renderHome();
  else if(tab==="lessons")renderLessons();
  else if(tab==="review")renderReview();
  else if(tab==="games")(loopMap?renderLoopMap():inboxMap?renderInboxMap():callsMap?renderCallsMap():renderGames());
  else renderOral();
  var key=overlay?(overlay.type==="call"?"C"+overlay.C.k:overlay.type==="session"?"S"+overlay.s.k+"-"+overlay.s.pos+"-"+(overlay.s.quiz.pos):overlay.type==="inbox"?"I"+overlay.G.i+overlay.G.status:overlay.type==="loop"?"L"+overlay.G.w+"-"+overlay.G.i+overlay.G.status+(overlay.G.status==="play"?"":"x"):overlay.type==="quiz"?"q"+overlay.q.pos+(overlay.q.done?"d":""):"g"+overlay.g.id+(overlay.g.pos||0)+(overlay.g.done?"d":"")):tab+(route.lesson||"")+(loopMap?"map"+loopWorld:"")+(inboxMap?"ib"+inboxWeek:"")+(callsMap?"calls":"")+(settingsOpen?"set":"")+(tab==="review"?(R.view||"")+(R.lexT==null?"":R.lexT):"");
  if(key!==prevKey){view.classList.remove("v-fade","v-up");void view.offsetWidth;view.classList.add(overlay?"v-up":"v-fade");}
  prevKey=key;
}
function go(fn){fn();render();window.scrollTo(0,0);}

document.addEventListener("submit",function(e){
  if(e.target.id!=="dform")return;e.preventDefault();
  var g=overlay&&overlay.g;if(!g||g.id!=="dictee"||g.checked)return;
  var v=$("#dinput").value;g.val=v;
  var ok=normW(v)===normW(head(g.list[g.pos].en));if(ok)g.score++;g.checked=ok?"ok":"ko";render();
});
document.addEventListener("change",function(e){if(e.target&&e.target.dataset&&e.target.dataset.skiporal){S.oral.callSkip=e.target.checked;save();}});
document.addEventListener("input",function(e){if(e.target.id==="dinput"&&overlay&&overlay.g)overlay.g.val=e.target.value;});


/* geste « retour » façon iPhone : la page suit le doigt et découvre la page précédente en dessous */
(function(){
  var st=null;
  function target(){
    if(overlay||document.getElementById("loopstage")||document.getElementById("ibroot")||document.getElementById("callroot"))return null;
    var c=[].slice.call(document.querySelectorAll(".app .back,.app .backlink")).filter(function(e){var r=e.getBoundingClientRect();return r.width>0&&!e.disabled;});
    if(c.length)return c[0];
    if(tab!=="home")return document.querySelector('[data-tab="home"]');
    return null;
  }
  function navState(){return {tab:tab,lesson:route.lesson,q:quarterSel,lm:loopMap,im:inboxMap,cm:callsMap,so:settingsOpen,rv:R.view,rl:R.lexT,rs:R.scope,lw:loopWorld,iw:inboxWeek};}
  function restore(n){tab=n.tab;route.lesson=n.lesson;quarterSel=n.q;loopMap=n.lm;inboxMap=n.im;callsMap=n.cm;settingsOpen=n.so;R.view=n.rv;R.lexT=n.rl;if(R.scope!==n.rs){R.scope=n.rs;buildDeck();}loopWorld=n.lw;inboxWeek=n.iw;}
  var app=document.querySelector(".app"),W=function(){return window.innerWidth;};
  function begin(){
    var y=window.scrollY,top=document.createElement("div");top.className="swtop";
    var cl=app.cloneNode(true);cl.removeAttribute("id");cl.querySelectorAll("[id]").forEach(function(e){e.removeAttribute("id");});
    cl.style.marginTop=(-y)+"px";top.appendChild(cl);top.style.background=getComputedStyle(document.documentElement).background;
    var dim=document.createElement("div");dim.className="swdim";
    document.body.appendChild(dim);document.body.appendChild(top);
    st.top=top;st.dim=dim;st.y=y;st.nav=navState();
    st.t.click();
    view.classList.remove("v-fade","v-up");
    app.style.transition="none";app.style.transform="translateX(-30%)";
  }
  function set(dx){
    var w=W(),p=Math.max(0,Math.min(1,dx/w));
    st.top.style.transform="translateX("+(p*w)+"px)";
    app.style.transform="translateX("+(-30*(1-p))+"%)";
    st.dim.style.opacity=(1-p)*.12;
  }
  function finish(ok){
    var w=W(),T="transform .32s cubic-bezier(.2,.8,.25,1)",top=st.top,dim=st.dim,nav=st.nav,y=st.y;
    top.style.transition=T;app.style.transition=T;dim.style.transition="opacity .32s";
    requestAnimationFrame(function(){
      if(ok){top.style.transform="translateX("+w+"px)";app.style.transform="translateX(0)";dim.style.opacity=0;}
      else{top.style.transform="translateX(0)";app.style.transform="translateX(-30%)";dim.style.opacity=.12;}
    });
    setTimeout(function(){
      if(!ok){restore(nav);render();view.classList.remove("v-fade","v-up");window.scrollTo(0,y);}
      app.style.transition="";app.style.transform="";top.remove();dim.remove();
    },340);
    st=null;
  }
  document.addEventListener("touchstart",function(e){
    var t=e.touches[0];if(st&&st.top)return;st=null;if(e.touches.length>1||t.clientX>24)return;
    var tg=target();if(!tg)return;st={t:tg,x:t.clientX,y0:t.clientY,dx:0,lt:Date.now(),lx:t.clientX,v:0,started:false};
  },{passive:true});
  document.addEventListener("touchmove",function(e){
    if(!st)return;var t=e.touches[0],dx=t.clientX-st.x,dy=Math.abs(t.clientY-st.y0);
    if(!st.started){if(dy>12&&dy>dx){st=null;return;}if(dx<10)return;st.started=true;begin();}
    var now=Date.now();st.v=(t.clientX-st.lx)/Math.max(1,now-st.lt);st.lx=t.clientX;st.lt=now;st.dx=dx;set(dx);
  },{passive:true});
  function end(){if(!st)return;if(!st.started){st=null;return;}finish(st.dx>W()*.35||st.v>.45);}
  document.addEventListener("touchend",end,{passive:true});
  document.addEventListener("touchcancel",function(){if(st&&st.started)finish(false);else st=null;},{passive:true});
})();
/* pas de zoom (pincement ou double tap) */
document.addEventListener("gesturestart",function(e){e.preventDefault();},{passive:false});
document.addEventListener("click",function(e){
  var el=e.target.closest("button");if(!el||el.disabled)return;var d=el.dataset;
  if(el.form&&el.type==="submit")return;
  var tipId=tipFor(d);if(tipId&&!S.tips[tipId]&&!TIPS_SEEN[tipId]){showTip(tipId,el);return;}
  if(d.tipsreset)return go(function(){S.tips={};TIPS_SEEN={};save();backupMsg="Les explications des jeux s’afficheront de nouveau.";});
  if(d.settings!==undefined)return go(function(){settingsOpen=d.settings==="1";});
  if(d.tab)return go(function(){settingsOpen=false;stopTimer();stopRaf();callClose();overlay=null;loopMap=false;inboxMap=false;callsMap=false;if(d.tab!=="oral")stopStream();tab=d.tab;if(tab==="lessons")route.lesson=null;if(tab==="review")buildDeck();});
  if(d.say!==undefined){speak(d.say);return;}
  if(d.sayseq!==undefined){speakSeq(d.sayseq.split("||"));return;}
  if(d.open!==undefined){if(!d.open)return;return go(function(){overlay=null;tab="lessons";route.lesson=+d.open;quarterSel=BYW[+d.open].q;});}
  if(d.back)return go(function(){route.lesson=null;});
  if(d.quarter)return go(function(){quarterSel=+d.quarter;});
  if(d.quarterOpen)return go(function(){tab="lessons";route.lesson=null;quarterSel=+d.quarterOpen;});
  if(d.lquiz)return go(function(){overlay={type:"quiz",q:lessonQuiz(+d.lquiz)};});
  if(d.rquiz)return go(function(){overlay={type:"quiz",q:reviewQuiz()};});
  if(d.opt!==undefined&&overlay&&overlay.type==="quiz"){
    var z=overlay.q;if(z.locked)return;var q=z.qs[z.pos],i=+d.opt;z.locked=true;z.picked=i;z.res.push(i===q.a);speak(q.say);render();return;}
  if(d.qnext){var zq=overlay.q;if(zq.pos<zq.qs.length-1)return go(function(){zq.pos++;zq.locked=false;zq.picked=null;});return go(finishQuiz);}
  if(d.again)return go(function(){var z=overlay.q;overlay={type:"quiz",q:z.kind==="lesson"?lessonQuiz(z.w):reviewQuiz()};});
  if(d.quit)return go(function(){stopTimer();var t0=overlay&&overlay.type;stopRaf();callClose();overlay=null;if(t0==="call"){tab="games";callsMap=true;}if(t0==="loop"){tab="games";loopMap=true;}if(t0==="inbox"){tab="games";inboxMap=true;}});
  if(d.inboxmap)return go(function(){stopRaf();overlay=null;tab="games";loopMap=false;inboxMap=true;});
  if(d.inboxback)return go(function(){inboxMap=false;});
  if(d.inboxweek)return go(function(){inboxWeek=+d.inboxweek;});
  if(d.inboxplay)return go(function(){tab="games";loopMap=false;inboxMap=true;inboxWeek=Math.ceil(+d.inboxplay/5);startInbox(+d.inboxplay);});
  /* le coup de fil */
  if(d.callsmap)return go(function(){callClose();stopRaf();overlay=null;tab="games";loopMap=false;inboxMap=false;callsMap=true;});
  if(d.callsback)return go(function(){callsMap=false;});
  if(d.callplay!==undefined)return go(function(){tab="games";loopMap=false;inboxMap=false;callsMap=true;startCall(+d.callplay);});
  if(d.cacc){callAccept();return;}
  if(d.cpick!==undefined){callPick(+d.cpick);return;}
  if(d.cdone){callRecStop(false);return;}
  if(d.cskip){callRecStop(true);return;}
  if(d.chang){stopAudio();callFinish(true);return;}
  if(d.ccc){overlay.C.cc=!overlay.C.cc;render();return;}
  if(d.cfr){overlay.C.fr=!overlay.C.fr;render();return;}
  if(d.cgoal){overlay.C.goalOpen=!overlay.C.goalOpen;render();return;}
  if(d.cmute){S.oral.callSkip=!S.oral.callSkip;save();render();return;}
  if(d.cplay!==undefined){var en=overlay.C.log[+d.cplay];if(en&&en.url){playUrl(en.url);}return;}
  /* congress loop */
  if(d.loopmap)return go(function(){stopRaf();overlay=null;tab="games";inboxMap=false;loopMap=true;});
  if(d.loopback)return go(function(){loopMap=false;});
  if(d.loopworld)return go(function(){loopWorld=+d.loopworld;});
  if(d.loopplay){var pr=d.loopplay.split("-");return go(function(){tab="games";loopMap=true;loopWorld=+pr[0];startLoop(+pr[0],+pr[1]);});}
  if(d.loopcont){loopContinue();return;}
  if(d.loopmute){S.loop.mute=!S.loop.mute;save();render();return;}
  if(d.buy){var bb=d.buy;if(S.loop.coins>=BOOST[bb].p){S.loop.coins-=BOOST[bb].p;S.loop.b[bb]=(S.loop.b[bb]||0)+1;save();sfx.pop();render();}return;}
  /* session du jour */
  if(d.session)return go(function(){tab="home";startSession();});
  if(d.sflip){overlay.s.flipped=!overlay.s.flipped;render();return;}
  if(d.sgrade!==undefined){var ss=overlay.s,gid=ss.due[ss.pos];srsGrade(gid,d.sgrade==="1");if(d.sgrade==="1")ss.ok++;save();
    return go(function(){ss.pos++;ss.flipped=false;if(ss.pos>=ss.due.length)sessNext();});}
  if(d.slearn){var sl=overlay.s;return go(function(){sl.pos++;if(sl.pos>=sl.nw.length){srsAdd(sl.nw.map(function(x){return x.id;}));save();sessNext();}});}
  if(d.sopt!==undefined){var sz=overlay.s.quiz;if(sz.locked)return;var sq=sz.qs[sz.pos],si=+d.sopt;sz.locked=true;sz.picked=si;sz.res.push(si===sq.a);speak(sq.say);render();return;}
  if(d.sqnext){var sq2=overlay.s.quiz;return go(function(){if(sq2.pos<sq2.qs.length-1){sq2.pos++;sq2.locked=false;sq2.picked=null;}else sessNext();});}
  if(d.sgame==="loop"){var c0=currentLevel();return go(function(){tab="games";loopMap=true;loopWorld=c0.w;startLoop(c0.w,c0.i);});}
  if(d.sgame==="inbox"){var i0=ibCurrent();return go(function(){tab="games";inboxMap=true;inboxWeek=Math.ceil(i0/5);startInbox(i0);});}
  if(d.pname){var nv=($("#pname").value||"").trim().slice(0,30);if(nv){S.profile={name:nv};save();location.reload();}return;}
  /* sauvegarde */
  if(d.backup){
    var bm=d.backup;
    if(bm==="export"||bm==="import"){backupMode=backupMode===bm?null:bm;backupMsg="";render();return;}
    if(bm==="copy"){var ta=$("#bcode");try{navigator.clipboard.writeText(ta.value).then(function(){backupMsg="Code copié. Garde-le dans tes notes ou envoie-le-toi par message.";render();},function(){ta.select();backupMsg="Sélectionne le code et copie-le.";render();});}catch(e){ta.select();}return;}
    if(bm==="file"){var blob=new Blob([exportCode()],{type:"text/plain"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="speaker-ready-sauvegarde-"+today()+".txt";document.body.appendChild(a);a.click();a.remove();backupMsg="Fichier téléchargé.";render();return;}
    if(bm==="restore"){try{importCode($("#bin").value);backupMode=null;backupMsg="Progression restaurée ✓";buildDeck();}catch(e){backupMsg="Ce code n’est pas valide. Vérifie qu’il est complet et commence par SR1:.";}render();return;}
  }
  /* révision */
  if(d.rview&&!d.scope)return go(function(){R.view=d.rview;});
  if(d.scope)return go(function(){R.scope=d.scope;if(d.rview)R.view=d.rview;buildDeck();});
  if(d.lext!==undefined)return go(function(){R.lexT=+d.lext<0?null:+d.lext;window.scrollTo(0,0);});
  if(d.deck)return go(function(){if(!S.decks)S.decks=[];var i=S.decks.indexOf(d.deck);if(i>-1)S.decks.splice(i,1);else S.decks.push(d.deck);save();});
  if(d.onlynew)return go(function(){R.onlyNew=!R.onlyNew;buildDeck();});
  if(d.flip){R.flipped=!R.flipped;render();return;}
  if(d.mark!==undefined){
    var w=R.deck[R.pos%R.deck.length];if(!w)return;S.known[w.id]=d.mark==="1";if(S.srs[w.id])srsGrade(w.id,d.mark==="1");else if(d.mark==="0")srsAdd([w.id]);markToday();save();
    if(R.onlyNew&&d.mark==="1"){R.deck.splice(R.pos%R.deck.length,1);if(R.deck.length)R.pos=R.pos%R.deck.length;}else R.pos++;
    R.flipped=false;render();return;}
  /* jeux */
  if(d.game)return go(function(){tab=tab==="home"?"games":tab==="games"?"games":tab;startGame(d.game);});
  if(d.mc!==undefined){memoryTap(+d.mc);return;}
  if(d.tf!==undefined){chronoAnswer(+d.tf);return;}
  if(d.tok!==undefined){var g1=overlay.g;g1.built.push(+d.tok);speak(tokClean(g1.bank[+d.tok].t),1);render();return;}
  if(d.unb!==undefined){overlay.g.built.splice(+d.unb,1);render();return;}
  if(d.scheck){var g2=overlay.g,p=g2.list[g2.pos],ans=g2.built.map(function(k){return g2.bank[k].t;}).join(" ");var ok=ans===p.en;if(ok)g2.score++;g2.checked=ok?"ok":"ko";speak(p.en);render();return;}
  if(d.snext){var g3=overlay.g;if(g3.pos<g3.list.length-1)return go(function(){g3.pos++;scrambleSetup();});return go(function(){g3.done=true;gameRecord("scramble",g3.score,true);});}
  if(d.dsay){speak(head(overlay.g.list[overlay.g.pos].en),.85);return;}
  if(d.dslow){speak(head(overlay.g.list[overlay.g.pos].en),.6);return;}
  if(d.dhint){overlay.g.hint=true;render();return;}
  if(d.dnext){var g4=overlay.g;if(g4.pos<g4.list.length-1)return go(function(){g4.pos++;g4.checked=null;g4.hint=false;g4.val="";setTimeout(function(){speak(head(g4.list[g4.pos].en),.85);},300);});return go(function(){g4.done=true;gameRecord("dictee",g4.score,true);});}
  /* oral */
  if(d.oslow){speak(O.item.en,.7);return;}
  if(d.omode)return go(function(){O.mode=d.omode;O.item=null;O.ohint=false;nextOral();});
  if(d.recstart){O.ohint=false;O.autoplay=true;recStart();return;}
  if(d.recstop){recStop();return;}
  if(d.omine){playMine();return;}
  if(d.ograde!==undefined){var gg=+d.ograde;return go(function(){O.ohint=false;oralGrade(gg);});}
  if(d.orestart){O.phase="prompt";O.judge=null;render();return;}
  if(d.asron){S.oral.asr=true;save();runJudge();return;}
  if(d.asrrun){runJudge();return;}
  if(d.onext)return go(function(){O.ohint=false;nextOral();});
  if(d.ohint){O.ohint=true;render();return;}
});

buildDeck();render();
})();
