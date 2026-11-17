/* Speaker Ready — application
   Le contenu des leçons est dans lessons-q1.js … lessons-q4.js */
(function(){
"use strict";

/* ===================== DONNÉES ===================== */
var LESSONS=(window.LESSONS||[]).slice().sort(function(a,b){return a.w-b.w;});
var BYW={};LESSONS.forEach(function(l){BYW[l.w]=l;});
var WORDS=[],PHRASES=[];
LESSONS.forEach(function(l){
  l.v.forEach(function(v,i){WORDS.push({id:l.w+"-"+i,en:v[0],fr:v[1],ex:v[2],w:l.w});});
  l.p.forEach(function(p){PHRASES.push({en:p[0],fr:p[1],w:l.w});});
});
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
var S={known:{},done:{},best:null,days:[],start:today(),games:{},loop:{},inbox:{},srs:{},sess:{}};
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
function speak(t,rate){if(!HAS_TTS)return;speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(t);u.lang=enVoice?enVoice.lang:"en-GB";if(enVoice)u.voice=enVoice;u.rate=rate||.95;speechSynthesis.speak(u);}
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
function renderHome(){
  var dc=doneCount(),pct=Math.round(dc/52*100),wk=programWeek(),nx=nextLesson(),kc=knownCount(),st=streak(),gd=gameOfDay();
  var pace=dc>wk?"Tu es en avance sur le programme. Bravo !":dc===wk?"Leçon de la semaine faite, tu es à jour.":(dc===wk-1?"Tu es pile dans le rythme : une leçon cette semaine.":"Tu as "+(wk-1-dc)+" leçon"+(wk-1-dc>1?"s":"")+" de retard, rien de grave : avance à ton rythme.");
  var cq=nx?nx.q:4;
  view.innerHTML=
   '<div class="bento">'+sessTile()+
    '<div class="tile navy span2"><div class="tag">Programme annuel · semaine '+wk+' / 52</div>'+
      '<div class="hero-num"><b id="cnt" data-to="'+dc+'">'+dc+'</b><small>/ 52 leçons</small></div>'+
      '<div><div class="meter"><i style="width:'+pct+'%"></i></div><div class="meter-legend"><span>Semaine 1</span><span>Semaine 52</span></div></div>'+
      '<p>'+pace+'</p></div>'+
    (nx?'<button class="tile cont span2" data-open="'+nx.w+'"><span class="ico cta">'+SVG.play+'</span><span class="txt"><span class="tag">Leçon '+nx.w+' · '+nx.lv+'</span><b>'+esc(nx.t)+'</b></span><span class="chev" aria-hidden="true"></span></button>'
       :'<div class="tile span2"><b>Programme terminé !</b><span class="tag">Continue avec les jeux et la révision pour garder le niveau.</span></div>')+
    '<div class="tile"><span class="ico">'+SVG.fire+'</span><div class="kpi">'+st+'<small>jour'+(st>1?"s":"")+'</small></div><div class="tag">Série en cours</div></div>'+
    '<div class="tile"><span class="ico">'+SVG.review+'</span><div class="kpi">'+kc+'<small>/ '+WORDS.length+'</small></div><div class="tag">Mots maîtrisés</div></div>'+
    '<button class="tile cont span2" data-loopmap="1"><span class="ico">'+SVG.dice+'</span><span class="txt"><span class="tag">Congress Loop · '+totalStars()+' ★</span><b>Continuer : monde '+currentLevel().w+', niveau '+currentLevel().i+'</b></span><span class="chev" aria-hidden="true"></span></button>'+
    '<button class="tile cont span2" data-inboxmap="1"><span class="ico ibico">💬</span><span class="txt"><span class="tag">Inbox Race · '+ibTotal()+' ★</span><b>Continuer : '+ibDay(ibCurrent())+'</b></span><span class="chev" aria-hidden="true"></span></button>'+
   '</div>'+
   '<h2>Parcours thématiques</h2><div class="stack">'+[5,6].map(function(q){var t=track(q),dn=t.filter(function(l){return valid(l.w);}).length,nx2=t.filter(function(l){return !valid(l.w);})[0];return '<button class="mod" data-quarter-open="'+q+'"><span class="num" style="font-size:13px">'+(q===5?'Mkt':'Bureau')+'</span><span><b>'+QNAMES[q]+'</b><span class="sub">'+(nx2?'Prochaine : '+esc(nx2.t):'Parcours terminé !')+'</span><span class="prog" style="display:block;margin-top:10px"><i style="width:'+Math.round(dn/t.length*100)+'%"></i></span><span class="sub" style="display:block;margin-top:6px;font-size:13px">'+dn+' / '+t.length+' leçons</span></span></button>';}).join('')+'</div>'+
   '<h2>Trimestre '+cq+' · '+QNAMES[cq]+'</h2>'+lessonList(cq)+backupHTML();
  countUp();
}
function sessTile(){
  var p=sessPlan(),done=sessDoneToday(),parts=[];
  if(p.due.length)parts.push(p.due.length+" mot"+(p.due.length>1?"s":"")+" à revoir");
  if(p.nw.length)parts.push(p.nw.length+" nouveaux mots");
  parts.push("quiz","défi");
  return '<button class="tile cont span2 sesstile'+(done?" done":"")+'" data-session="1"><span class="ico cta">'+(done?"✓":SVG.play)+'</span><span class="txt"><span class="tag">'+(done?"Session du jour faite · série "+streak()+" 🔥":"Ma session du jour · 10 min")+'</span><b>'+(done?"Refaire une session":parts.join(" · "))+'</b></span><span class="chev" aria-hidden="true"></span></button>';
}
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
  var base=R.scope==="all"?poolWords("all"):poolWords();
  R.deck=shuffle(base.filter(function(w){return !R.onlyNew||!S.known[w.id];}));R.pos=0;R.flipped=false;
}
function renderReview(){
  var dc=doneCount();
  var chips='<div class="chips"><button class="chip'+(R.scope==="auto"?" on":"")+'" data-scope="auto">'+(dc?"Mes leçons":"Premières leçons")+'</button><button class="chip'+(R.scope==="all"?" on":"")+'" data-scope="all">Tout le programme</button><button class="chip'+(R.onlyNew?" on":"")+'" data-onlynew="1">À revoir</button></div>';
  var quizBtn='<div class="actions"><button class="btn primary" data-rquiz="1">Quiz de révision · 10 questions</button>'+(S.best!==null?'<p class="tag center" style="margin:0">Meilleur score : '+S.best+' / 10</p>':'')+'</div>';
  if(!R.deck.length){view.innerHTML=chips+'<div class="card center" style="padding:40px 20px"><div class="qtext" style="margin-top:0">Bravo !</div><p class="muted">Tous les mots de cette sélection sont maîtrisés.</p></div>'+quizBtn;return;}
  var w=R.deck[R.pos%R.deck.length],known=S.known[w.id];
  var face=R.flipped
    ?'<button class="flash navy flip" data-flip="1"><span class="lab">Leçon '+w.w+'</span><span class="term">'+esc(w.fr)+'</span><span class="en">'+esc(w.en)+'</span><span class="ex">« '+esc(w.ex)+' »</span></button>'
    :'<button class="card flash" data-flip="1"><span class="pill '+(known?"good":"neutral")+'">'+(known?"Maîtrisé":"Leçon "+w.w)+'</span><span class="term">'+esc(w.en)+'</span><span class="hint">Touche pour voir la traduction</span></button>';
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
var O={mode:"repeat",item:null,phase:"prompt",url:null,err:null,stream:null,rec:null,chunks:[],t0:0,tick:null};
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
  O.item=c;O.phase="prompt";O.err=null;if(O.url){try{URL.revokeObjectURL(O.url);}catch(e){}}O.url=null;
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
  if(window.speechSynthesis)speechSynthesis.cancel();
  var go2=function(stream){
    O.stream=stream;O.chunks=[];
    var types=["audio/mp4","audio/webm;codecs=opus","audio/webm","audio/ogg"],mt=null;
    for(var k=0;k<types.length;k++){try{if(MediaRecorder.isTypeSupported(types[k])){mt=types[k];break;}}catch(e){}}
    try{O.rec=mt?new MediaRecorder(stream,{mimeType:mt}):new MediaRecorder(stream);}catch(e){O.err=micError(e);render();return;}
    O.rec.ondataavailable=function(ev){if(ev.data&&ev.data.size)O.chunks.push(ev.data);};
    O.rec.onstop=function(){clearInterval(O.tick);var blob=new Blob(O.chunks,{type:(O.rec&&O.rec.mimeType)||mt||"audio/mp4"});O.url=URL.createObjectURL(blob);O.phase="review";render();};
    O.rec.start();O.phase="rec";O.t0=Date.now();render();
    O.tick=setInterval(function(){var el=$("#rect");var sec=Math.floor((Date.now()-O.t0)/1000);if(el)el.textContent="0:"+(sec<10?"0":"")+sec;if(sec>=20)recStop();},250);
  };
  if(O.stream&&O.stream.active)go2(O.stream);
  else navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}}).then(go2,function(e){O.err=micError(e);O.phase="prompt";render();});
}
function recStop(){if(O.rec&&O.rec.state==="recording"){try{O.rec.stop();}catch(e){}}}
function playMine(){if(!O.url)return;if(window.speechSynthesis)speechSynthesis.cancel();var a=new Audio(O.url);a.play().catch(function(){});}
function oralGrade(g){
  var key=oralKey(O.item),c=S.oral.srs[key]||{b:0,due:today()};
  c.b=g===2?Math.min(5,c.b+2):g===1?Math.max(1,c.b):0;c.due=addDays(g===0?1:SRS_INT[Math.max(1,c.b)]);
  S.oral.srs[key]=c;oralToday();S.oral.n=(S.oral.n||0)+1;markToday();save();nextOral();
}
function renderOral(){
  if(!O.item)nextOral();
  var it=O.item,m=O.mode,n=oralToday(),pct=Math.min(100,Math.round(n/ORAL_GOAL*100)),desc=ORAL_MODES.filter(function(x){return x[0]===m;})[0][2];
  var chips='<div class="chips">'+ORAL_MODES.map(function(x){return '<button class="chip'+(x[0]===m?" on":"")+'" data-omode="'+x[0]+'">'+x[1]+'</button>';}).join("")+'</div>';
  var goal='<div class="card ogoal"><div class="ogoal-h"><span class="tag">Objectif du jour</span><b>'+n+' / '+ORAL_GOAL+' phrases dites'+(n>=ORAL_GOAL?" 🎉":"")+'</b></div><div class="prog"><i style="width:'+pct+'%"></i></div></div>';
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
      '<p class="qhint center" style="margin:16px 0 8px">Compare les deux. Comment c’était ?</p>'+
      '<div class="row3 ograde"><button class="btn" data-ograde="0">😕<span>À revoir</span></button><button class="btn" data-ograde="1">🙂<span>Presque</span></button><button class="btn primary" data-ograde="2">😎<span>Parfait</span></button></div>'+
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
function stopRaf(){if(loopGame){try{loopGame.destroy(true);}catch(e){}loopGame=null;}var st=document.getElementById("loopstage");if(st)st.remove();}
var loopApi={
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
  var lvls=i<=5?[1,1,1]:i<=10?[1,2,2]:i<=15?[2,2,3]:[2,3,3];
  return {n:8+Math.floor(i/2),start:Math.max(3200,8000-i*230),min:Math.max(1800,4200-i*120),acc:.95,lvls:lvls};
}
function startInbox(i){
  stopRaf();
  var c=ibCfg(i),all=window.INBOX||[],used={},msgs=[];
  for(var k=0;k<c.n;k++){
    var want=c.lvls[k%c.lvls.length],pool=all.filter(function(m,idx){return m[7]===want&&!used[idx];});
    if(!pool.length)pool=all.filter(function(m,idx){return !used[idx];});
    var m=pick(pool);used[all.indexOf(m)]=1;msgs.push(m);
  }
  overlay={type:"inbox",G:{i:i,c:c,msgs:msgs,spawned:0,answered:0,mistakes:0,missed:[],combo:0,maxCombo:0,score:0,status:"play",reason:""}};
}
var inboxApi={
  speak:function(t){if(!S.loop.mute)speak(t,1);},
  muted:function(){return !!S.loop.mute;},
  dayName:ibDay,
  win:function(G){
    G.status="won";var stars=G.mistakes===0?3:G.mistakes<=2?2:1,prev=ibStars(G.i);
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
  mountStage(G,window.InboxRacePhaser,inboxApi);
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
   :'<div class="card score"><div class="tag">Inbox débordée !</div><div class="big"><b>'+G.answered+'</b><small>/ '+G.msgs.length+' messages</small></div><p style="margin:8px 0 0">Astuce : réponds vite au message surligné. Une mauvaise réponse fait arriver le message suivant tout de suite.</p></div>'+
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
   '<h2>Comment jouer</h2><div class="card"><p>Les messages de tes collègues, de l’agence, des sponsors ou des hôtesses arrivent sur Teams et WhatsApp, de plus en plus vite.</p><p>Réponds au message surligné en choisissant la bonne réponse anglaise. Une mauvaise réponse fait arriver le message suivant aussitôt.</p><p style="margin:0">Si le fil déborde, la journée est perdue. Vide-le pour un bonus <b>Inbox zero</b>, enchaîne pour les combos, et réponds en moins de 3 secondes pour le bonus <b>FAST!</b></p></div>';
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
  return {due:due,nl:nl,nw:nw};
}
function startSession(){
  var p=sessPlan(),steps=[];
  if(p.due.length)steps.push("review");
  if(p.nw.length)steps.push("learn");
  var qpool=p.nw.concat(p.due.map(function(id){return BYID[id];}));
  if(qpool.length<4)qpool=qpool.concat(shuffle(poolWords()).slice(0,6));
  steps.push("quiz");steps.push("game");
  var sw=shuffle(qpool).slice(0,5),qs=sw.map(function(w,i){return i%2?qFrEn(w,WORDS):qEnFr(w,WORDS);});
  overlay={type:"session",s:{steps:steps,k:0,due:p.due,nw:p.nw,nl:p.nl,pos:0,flipped:false,ok:0,
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
     (s.flipped?'<button class="flash navy flip" data-sflip="1"><span class="lab">Leçon '+lnum(BYW[w.w])+' · boîte '+box+'</span><span class="term">'+esc(w.fr)+'</span><span class="en">'+esc(w.en)+'</span><span class="ex">« '+esc(w.ex)+' »</span></button>'
       :'<button class="card flash" data-sflip="1"><span class="pill neutral">Boîte '+box+' / 5</span><span class="term">'+esc(w.en)+'</span><span class="hint">Touche pour voir la traduction</span></button>')+
     (s.flipped?'<div class="row2" style="margin-top:14px"><button class="btn" data-sgrade="0">Je ne savais pas</button><button class="btn primary" data-sgrade="1">Je savais ✓</button></div>'
       :'<div class="actions"><button class="btn" data-say="'+esc(w.en)+'">'+SVG.sound+' Écouter</button><button class="btn primary" data-sflip="1">Voir la réponse</button></div>');
    if(!s.flipped)speak(w.en);
    return;
  }
  if(st==="learn"){
    var w2=s.nw[s.pos];
    view.innerHTML=sessHeader("Nouveaux mots · "+(s.pos+1)+" / "+s.nw.length)+
     '<p class="qhint">Leçon '+lnum(s.nl)+' : '+esc(s.nl.t)+'</p>'+
     '<div class="card flash learn"><span class="term">'+esc(w2.en)+'</span><span class="fr2">'+esc(w2.fr)+'</span><span class="ex2">« '+esc(w2.ex)+' »</span></div>'+
     '<div class="row2" style="margin-top:14px"><button class="btn" data-say="'+esc(w2.ex)+'">'+SVG.sound+' La phrase</button><button class="btn primary" data-slearn="1">'+(s.pos<s.nw.length-1?"Mot suivant":"J’ai vu les 6 mots")+'</button></div>';
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
   '<div class="tile navy span2" style="margin-top:6px"><div class="tag">Bravo, c’est fait pour aujourd’hui</div>'+
   '<div class="lstats"><div><b>'+rev+'</b><span>mots révisés</span></div><div><b>'+s.nw.length+'</b><span>nouveaux mots</span></div><div><b>'+okq+'/'+s.quiz.qs.length+'</b><span>au quiz</span></div></div>'+
   '<p>Série : '+streak()+' jour'+(streak()>1?"s":"")+' 🔥 · Prochaine révision : '+srsNextLabel()+'</p></div>'+
   '<h2>Défi du jour (facultatif)</h2><div class="stack">'+
   '<button class="mod" data-sgame="loop"><span class="num">🍲</span><span><b>Congress Loop</b><span class="sub">Monde '+cl.w+', niveau '+cl.i+'</span></span></button>'+
   '<button class="mod" data-tab="oral"><span class="num">🎙️</span><span><b>Expression orale</b><span class="sub">'+oralToday()+' / '+ORAL_GOAL+' phrases dites aujourd’hui</span></span></button>'+
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
  var out='<h2>Ma progression</h2><div class="card"><p style="margin:0 0 12px">Ta progression est enregistrée sur cet appareil. Sauvegarde-la de temps en temps pour la retrouver si tu changes de téléphone.</p>'+
    '<div class="row2"><button class="btn" data-backup="export">Exporter</button><button class="btn" data-backup="import">Importer</button></div>';
  if(backupMode==="export")out+='<textarea class="codebox" id="bcode" readonly>'+exportCode()+'</textarea><div class="row2"><button class="btn primary" data-backup="copy">Copier le code</button><button class="btn" data-backup="file">Télécharger</button></div>';
  if(backupMode==="import")out+='<textarea class="codebox" id="bin" placeholder="Colle ici ton code de sauvegarde (il commence par SR1:)"></textarea><div class="actions" style="margin-top:10px"><button class="btn primary" data-backup="restore">Restaurer</button></div>';
  if(backupMsg)out+='<p class="tag" style="margin:10px 0 0">'+esc(backupMsg)+'</p>';
  return out+'</div>';
}

/* ===================== RENDU ===================== */
var view=$("#view"),prevKey=null;
function render(){
  var inov=!!overlay;
  document.body.classList.toggle("inquiz",inov);
  $("#hdr").style.display=(inov||(tab==="lessons"&&route.lesson)||(tab==="games"&&(loopMap||inboxMap)))?"none":"";
  renderTabs();$("#htitle").textContent=TITLES[tab];
  if(overlay){
    if(overlay.type==="quiz")renderQuiz();
    else if(overlay.type==="session")renderSession();
    else if(overlay.type==="loop")renderLoop();
    else if(overlay.type==="inbox")renderInbox();
    else{var g=overlay.g;({memory:renderMemory,chrono:renderChrono,scramble:renderScramble,dictee:renderDictee})[g.id](g);}
  }
  else if(tab==="home")renderHome();
  else if(tab==="lessons")renderLessons();
  else if(tab==="review")renderReview();
  else if(tab==="games")(loopMap?renderLoopMap():inboxMap?renderInboxMap():renderGames());
  else renderOral();
  var key=overlay?(overlay.type==="session"?"S"+overlay.s.k+"-"+overlay.s.pos+"-"+(overlay.s.quiz.pos):overlay.type==="inbox"?"I"+overlay.G.i+overlay.G.status:overlay.type==="loop"?"L"+overlay.G.w+"-"+overlay.G.i+overlay.G.status+(overlay.G.status==="play"?"":"x"):overlay.type==="quiz"?"q"+overlay.q.pos+(overlay.q.done?"d":""):"g"+overlay.g.id+(overlay.g.pos||0)+(overlay.g.done?"d":"")):tab+(route.lesson||"")+(loopMap?"map"+loopWorld:"")+(inboxMap?"ib"+inboxWeek:"");
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
document.addEventListener("input",function(e){if(e.target.id==="dinput"&&overlay&&overlay.g)overlay.g.val=e.target.value;});

document.addEventListener("click",function(e){
  var el=e.target.closest("button");if(!el||el.disabled)return;var d=el.dataset;
  if(el.form&&el.type==="submit")return;
  if(d.tab)return go(function(){stopTimer();stopRaf();overlay=null;loopMap=false;inboxMap=false;if(d.tab!=="oral")stopStream();tab=d.tab;if(tab==="lessons")route.lesson=null;if(tab==="review")buildDeck();});
  if(d.say!==undefined){speak(d.say);return;}
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
  if(d.quit)return go(function(){stopTimer();var t0=overlay&&overlay.type;stopRaf();overlay=null;if(t0==="loop"){tab="games";loopMap=true;}if(t0==="inbox"){tab="games";inboxMap=true;}});
  if(d.inboxmap)return go(function(){stopRaf();overlay=null;tab="games";loopMap=false;inboxMap=true;});
  if(d.inboxback)return go(function(){inboxMap=false;});
  if(d.inboxweek)return go(function(){inboxWeek=+d.inboxweek;});
  if(d.inboxplay)return go(function(){tab="games";loopMap=false;inboxMap=true;inboxWeek=Math.ceil(+d.inboxplay/5);startInbox(+d.inboxplay);});
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
  /* sauvegarde */
  if(d.backup){
    var bm=d.backup;
    if(bm==="export"||bm==="import"){backupMode=backupMode===bm?null:bm;backupMsg="";render();return;}
    if(bm==="copy"){var ta=$("#bcode");try{navigator.clipboard.writeText(ta.value).then(function(){backupMsg="Code copié. Garde-le dans tes notes ou envoie-le-toi par message.";render();},function(){ta.select();backupMsg="Sélectionne le code et copie-le.";render();});}catch(e){ta.select();}return;}
    if(bm==="file"){var blob=new Blob([exportCode()],{type:"text/plain"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="speaker-ready-sauvegarde-"+today()+".txt";document.body.appendChild(a);a.click();a.remove();backupMsg="Fichier téléchargé.";render();return;}
    if(bm==="restore"){try{importCode($("#bin").value);backupMode=null;backupMsg="Progression restaurée ✓";buildDeck();}catch(e){backupMsg="Ce code n’est pas valide. Vérifie qu’il est complet et commence par SR1:.";}render();return;}
  }
  /* révision */
  if(d.scope)return go(function(){R.scope=d.scope;buildDeck();});
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
  if(d.tok!==undefined){var g1=overlay.g;g1.built.push(+d.tok);speak(g1.bank[+d.tok].t,1);render();return;}
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
  if(d.orestart){O.phase="prompt";render();return;}
  if(d.onext)return go(function(){O.ohint=false;nextOral();});
  if(d.ohint){O.ohint=true;render();return;}
});

buildDeck();render();
})();
