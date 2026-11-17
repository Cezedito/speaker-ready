/* Speaker Ready — Congress Loop, version Phaser
   Les mots anglais tournent sur un tapis en boucle. Chaque marmite affiche une commande :
   touche le bon mot pour la servir. Sans marmite correspondante, le mot part sur le
   plateau d'attente. Plateau plein ou chrono à zéro : partie perdue.
   L'appli (app.js) prépare l'état du niveau (G) et fournit une petite API :
   speak, head, muted, boost, win, lose, showResult, quit. */
(function(){
"use strict";

var PAL=[0xFFD86B,0x8EE3C8,0xFFB4C6,0x9ED8FF,0xC9B6FF,0xFFC49B,0xB5E48C];
var C={navy:0x00205B,navy2:0x0B2C6E,terra:0xE2725B,cta:0xC2543E,cream:0xFFF6EA,good:0x2F9E66,bad:0xD1364A,gold:0xF7B733,broth:0xF39B4A,white:0xFFFFFF,ice:0x5AA9E6};
var FONT_D="Montserrat, 'Avenir Next', system-ui, sans-serif",FONT_B="-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
var AVATARS=["👩‍⚕️","👨‍⚕️","🧑‍💼","👩‍💼","🧑‍🔬","👨‍🏫","👩‍🔬","🧑‍⚕️","👩‍🏫","🧑‍💻"];
var PRAISE=[[3,"GREAT!"],[5,"AWESOME!"],[7,"INCREDIBLE!"],[10,"UNSTOPPABLE!"],[14,"LEGENDARY!"]];
function shade(c,f){var r=Math.min(255,Math.round((c>>16&255)*f)),g=Math.min(255,Math.round((c>>8&255)*f)),b=Math.min(255,Math.round((c&255)*f));return (r<<16)|(g<<8)|b;}
function hex(c){return "#"+("000000"+c.toString(16)).slice(-6);}

/* ---------- sons synthétisés (aucun fichier à charger) ---------- */
function Sfx(api){this.api=api;this.ac=null;}
Sfx.prototype.t=function(fs,dur,type,vol,gap,slide){
  if(this.api.muted())return;
  try{
    this.ac=this.ac||new (window.AudioContext||window.webkitAudioContext)();
    if(this.ac.state==="suspended")this.ac.resume();
    var ac=this.ac,t=ac.currentTime;
    fs.forEach(function(f,k){
      var o=ac.createOscillator(),g=ac.createGain(),st=t+k*(gap||dur);
      o.type=type||"sine";o.frequency.setValueAtTime(f,st);
      if(slide)o.frequency.exponentialRampToValueAtTime(f*slide,st+dur);
      g.gain.setValueAtTime(0,st);g.gain.linearRampToValueAtTime(vol||.12,st+.008);g.gain.exponentialRampToValueAtTime(.0001,st+dur);
      o.connect(g);g.connect(ac.destination);o.start(st);o.stop(st+dur+.03);
    });
  }catch(e){}
};
Sfx.prototype.tap=function(){this.t([880],.05,"sine",.07,0,1.6);};
Sfx.prototype.serve=function(c){var b=523*Math.pow(1.0595,Math.min(c,16)*2);this.t([b,b*1.25,b*1.5],.11,"triangle",.13,.06);};
Sfx.prototype.splash=function(){this.t([300],.18,"sine",.08,0,.4);};
Sfx.prototype.store=function(){this.t([330,262],.09,"triangle",.09,.07);};
Sfx.prototype.bad=function(){this.t([180,140],.14,"square",.05,.1);};
Sfx.prototype.blip=function(f){this.t([f||660],.12,"sine",.12);};
Sfx.prototype.go=function(){this.t([523,784,1047],.12,"triangle",.14,.07);};
Sfx.prototype.tick=function(){this.t([1200],.04,"square",.035);};
Sfx.prototype.praise=function(){this.t([784,988,1175,1568],.1,"triangle",.12,.06);};
Sfx.prototype.star=function(k){var b=[880,1109,1319][k]||1319;this.t([b,b*1.5],.16,"triangle",.14,.08);};
Sfx.prototype.coin=function(){this.t([1568,2093],.06,"square",.03,.05);};
Sfx.prototype.win=function(){this.t([523,659,784,1047,1319],.16,"triangle",.13,.1);};
Sfx.prototype.lose=function(){this.t([392,330,262,196],.22,"sawtooth",.05,.17);};
Sfx.prototype.boost=function(){this.t([660,990],.1,"sine",.1,.06,1.3);};
function buzz(p){try{if(navigator.vibrate)navigator.vibrate(p);}catch(e){}}

/* ---------- la scène ---------- */
class LoopScene extends Phaser.Scene{
  constructor(){super("loop");}
  init(d){this.G=d.G;this.api=d.api;this.W=d.W;this.H=d.H;this.T=d.T||0;this.B=d.B||0;this.dpr=d.dpr;this.sfx=new Sfx(d.api);}

  txt(x,y,s,size,color,o){
    o=o||{};
    var st={fontFamily:o.display?FONT_D:FONT_B,fontSize:size+"px",fontStyle:o.weight||"bold",color:color||"#00205B",align:o.align||"center",resolution:this.dpr};
    if(o.wrap)st.wordWrap={width:o.wrap,useAdvancedWrap:false};
    if(o.stroke){st.stroke=o.stroke;st.strokeThickness=o.sw||6;}
    var t=this.add.text(x,y,s,st);t.setOrigin(o.ox===undefined?.5:o.ox,o.oy===undefined?.5:o.oy);return t;
  }

  create(){
    var G=this.G,W=this.W,H=this.H,self=this;
    this.cameras.main.setZoom(this.dpr);this.cameras.main.centerOn(W/2,H/2+(this.B-this.T)/2);
    this.makeTextures();
    /* état restauré (reprise après défaite) */
    G.items.forEach(function(it){if(it.state==="belt")it.state="queue";});
    if(!G.pots.length){for(var p=0;p<G.c.pots;p++)G.pots.push(this.nextPot(false));}
    this.chips={};this.potV=[];this.trayV=[];this.slots=[];this.boostV={};
    this.off=0;this.freezeUntil=0;this.hintUntil=0;this.feverUntil=0;this.lastUrg=0;this.ended=false;
    if(G.hearts===undefined)G.hearts=3;if(!G.expired)G.expired=0;if(!G.bonusCoins)G.bonusCoins=0;
    this.drawBackground();
    this.layout();
    this.drawTop();
    this.drawPots();
    this.drawBelt();
    this.drawTray();
    this.drawBoosts();
    this.makeFx();
    this.initSlots();
    this.countdown(G.begun?["GO!"]:["3","2","1","GO!"]);
  }

  makeTextures(){
    if(this.textures.exists("dot"))return;
    var g=this.add.graphics();
    g.fillStyle(0xffffff,1);g.fillCircle(8,8,8);g.generateTexture("dot",16,16);g.clear();
    g.fillStyle(0xffffff,1);g.fillRect(0,0,10,14);g.generateTexture("conf",10,14);g.clear();
    g.fillStyle(0xffffff,1);g.fillCircle(16,16,16);g.generateTexture("puff",32,32);g.destroy();
  }

  drawBackground(){
    var W=this.W,H=this.H,g=this.add.graphics();
    g.fillGradientStyle(0xFFF3E2,0xFFF3E2,0xFFD9C4,0xFFC9B5,1);g.fillRect(0,-this.T,W,H+this.T+this.B);
    g.fillStyle(0xffffff,.35);g.fillCircle(W*.85,H*.12,90);g.fillCircle(W*.1,H*.55,70);g.fillCircle(W*.8,H*.85,60);
    this.bgFx=g;
  }

  layout(){
    var W=this.W,H=this.H,c=this.G.c;
    this.P=c.pots;this.cols=this.P===4?2:this.P;this.rows=this.P===4?2:1;
    this.potTop=96;this.potH=this.rows===2?(H<720?92:104):(H<720?128:142);
    this.potW=(W-32-(this.cols-1)*10)/this.cols;
    this.potsBottom=this.potTop+this.rows*this.potH+(this.rows-1)*10;
    this.boostY=H-36;this.trayH=56;this.trayY=this.boostY-26-14-this.trayH/2;
    var beltTop=this.potsBottom+18,beltBot=this.trayY-this.trayH/2-30,Hb=beltBot-beltTop;
    this.chipW=c.mode==="reverse"?124:114;this.chipH=46;
    var cx=W/2,cy=beltTop+Hb/2;
    var Rv=(W-28-this.chipW)/2,Lv=Hb-this.chipH-2*Rv-6;
    if(Lv>=30){this.path={vert:true,cx:cx,cy:cy,R:Rv,L:Lv};}
    else{var R=Math.max(40,(Hb-this.chipH-8)/2),L=Math.max(0,W-28-this.chipW-2*R);this.path={vert:false,cx:cx,cy:cy,R:R,L:L};}
    var p=this.path;this.per=2*p.L+2*Math.PI*p.R;
    this.N=Math.max(5,Math.floor(this.per/(this.chipW+14)));this.sp=this.per/this.N;
  }
  pt(s){
    var p=this.path,L=p.L,R=p.R,cx=p.cx,cy=p.cy,per=this.per;s=((s%per)+per)%per;
    var a;
    if(p.vert){
      if(s<L)return {x:cx+R,y:cy-L/2+s};s-=L;
      if(s<Math.PI*R){a=s/R;return {x:cx+R*Math.cos(a),y:cy+L/2+R*Math.sin(a)};}s-=Math.PI*R;
      if(s<L)return {x:cx-R,y:cy+L/2-s};s-=L;
      a=Math.PI+s/R;return {x:cx+R*Math.cos(a),y:cy-L/2+R*Math.sin(a)};
    }else{
      if(s<L)return {x:cx-L/2+s,y:cy-R};s-=L;
      if(s<Math.PI*R){a=-Math.PI/2+s/R;return {x:cx+L/2+R*Math.cos(a),y:cy+R*Math.sin(a)};}s-=Math.PI*R;
      if(s<L)return {x:cx+L/2-s,y:cy+R};s-=L;
      a=Math.PI/2+s/R;return {x:cx-L/2+R*Math.cos(a),y:cy+R*Math.sin(a)};
    }
  }

  /* ----- barre du haut ----- */
  drawTop(){
    var W=this.W,G=this.G,self=this;
    var back=this.add.container(60,34);
    var bb=this.add.graphics();bb.fillStyle(0xffffff,1);bb.fillRoundedRect(-44,-17,88,34,17);bb.lineStyle(1.5,C.navy,.1);bb.strokeRoundedRect(-44,-17,88,34,17);
    back.add([bb,this.txt(0,0,"✕ Quitter",14,"#C2543E",{display:true})]);
    back.setSize(96,44).setInteractive({useHandCursor:true});
    back.on("pointerdown",function(){self.sfx.tap();self.cleanup();self.api.quit();});
    var wname=this.api.worldName(G.w);
    this.txt(116,22,(wname+" · NIVEAU "+G.i).toUpperCase(),11,"#6A7590",{ox:0,display:false});
    this.scoreT=this.txt(116,42,String(G.score),22,"#00205B",{ox:0,display:true});
    this.shownScore=G.score;
    var pill=this.add.graphics();pill.fillStyle(0xffffff,1);pill.fillRoundedRect(W-112,18,96,32,16);
    this.timeT=this.txt(W-64,35,"",17,"#00205B",{display:true});
    this.barBg=this.add.graphics();this.barBg.fillStyle(0x00205B,.08);this.barBg.fillRoundedRect(16,62,W-32,9,5);
    this.bar=this.add.graphics();
    this.progT=this.txt(16,84,"",12,"#6A7590",{ox:0});
    if(G.c.mode!=="normal"){
      var lab=G.c.mode==="reverse"?"INVERSÉ · trouve le français":"ÉCOUTE · touche la marmite";
      this.txt(W-16,84,lab,11,"#B94E39",{ox:1});
    }
    this.updateTop();
  }
  updateTop(){
    var G=this.G,W=this.W,frac=Math.min(1,(G.served+G.expired)/G.orders.length),fever=this.time.now<this.feverUntil,col=this.time.now<this.freezeUntil?C.ice:fever?0xFF4F8B:C.good;
    this.bar.clear();this.bar.fillStyle(col,1);if(frac>0)this.bar.fillRoundedRect(16,62,Math.max(10,(W-32)*frac),9,5);
    var hs="";for(var k=0;k<3;k++)hs+=k<G.hearts?"❤️":"🤍";
    if(this.timeT.text!==hs)this.timeT.setText(hs);
    this.progT.setText(G.served+" / "+G.orders.length+(G.c.mode==="normal"?" commandes servies":" servies"));
  }
  bumpScore(){
    var self=this,from=this.shownScore,to=this.G.score;
    this.tweens.addCounter({from:from,to:to,duration:350,onUpdate:function(t){self.shownScore=Math.round(t.getValue());self.scoreT.setText(String(self.shownScore));}});
    this.tweens.add({targets:this.scoreT,scale:{from:1.35,to:1},duration:300,ease:"Back.Out"});
  }

  /* ----- marmites ----- */
  drawPots(){for(var p=0;p<this.P;p++)this.potV.push(this.makePot(p));}
  potXY(p){var col=p%this.cols,row=Math.floor(p/this.cols);return {x:16+col*(this.potW+10)+this.potW/2,y:this.potTop+row*(this.potH+10)+this.potH/2};}
  makePot(p){
    var pos=this.potXY(p),w=this.potW,h=this.potH,self=this,horiz=this.rows===2;
    var c=this.add.container(pos.x,pos.y);
    var card=this.add.graphics();
    var potG=this.add.graphics();
    var px=horiz?w/2-34:0,py=horiz?6:h/2-24;
    this.drawPotShape(potG,px,py,horiz?.82:.8);
    var label=this.txt(horiz?-6:0,horiz?2:-h/2+56,"",horiz?14:15,"#00205B",{wrap:horiz?w-104:w-14,display:false});
    var sub=this.txt(horiz?-6:0,horiz?22:-h/2+76,"",11,"#1E7A4C",{wrap:horiz?w-104:w-14});
    var ax=-w/2+22,ay=-h/2+22,ring=this.add.graphics(),avBg=this.add.graphics();
    avBg.fillStyle(0xFFF1E6,1);avBg.fillCircle(ax,ay,15);
    var av=this.txt(ax,ay+1,"",18,"#000000");
    var steam=this.add.particles(0,0,"puff",{x:pos.x+px,y:pos.y+py-16,lifespan:1600,speedY:{min:-22,max:-12},speedX:{min:-6,max:6},scale:{start:.18,end:.55},alpha:{start:.35,end:0},frequency:420,tint:0xffffff});
    steam.setDepth(2);
    c.add([card,potG,label,sub,avBg,ring,av]);
    c.setSize(w,h).setInteractive();
    c.on("pointerdown",function(){var o=self.G.pots[p];if(o&&!o.done&&self.G.c.mode==="audio"){self.api.speak(o.word,.85);self.tweens.add({targets:c,scale:{from:.95,to:1},duration:250,ease:"Back.Out"});}});
    var v={c:c,card:card,pot:potG,label:label,sub:sub,steam:steam,ring:ring,av:av,ax:ax,ay:ay,x:pos.x,y:pos.y,mouth:{x:pos.x+px,y:pos.y+py-12},w:w,h:h,horiz:horiz,px:px,py:py};
    this.paintPot(p,v);
    return v;
  }
  drawPotShape(g,x,y,s){
    g.fillStyle(0x000000,.12);g.fillEllipse(x,y+30*s,70*s,12*s);
    g.fillStyle(shade(C.terra,.75),1);g.fillRoundedRect(x-38*s,y-6*s,10*s,8*s,3);g.fillRoundedRect(x+28*s,y-6*s,10*s,8*s,3);
    g.fillStyle(C.terra,1);g.fillRoundedRect(x-30*s,y-10*s,60*s,38*s,{tl:6,tr:6,bl:18*s,br:18*s});
    g.fillStyle(shade(C.terra,1.15),1);g.fillRoundedRect(x-26*s,y-4*s,8*s,22*s,4);
    g.fillStyle(shade(C.terra,.8),1);g.fillEllipse(x,y-10*s,64*s,14*s);
    g.fillStyle(C.broth,1);g.fillEllipse(x,y-10*s,54*s,10*s);
    g.fillStyle(0xffffff,.45);g.fillCircle(x-10*s,y-11*s,2.5*s);g.fillCircle(x+8*s,y-9*s,2*s);g.fillCircle(x+16*s,y-12*s,1.5*s);
  }
  paintPot(p,v){
    var o=this.G.pots[p],mode=this.G.c.mode,w=v.w,h=v.h;
    v.card.clear();
    var col=!o?0xffffff:o.done?0xDDF5E8:0xffffff;
    v.card.fillStyle(0x00205B,.08);v.card.fillRoundedRect(-w/2,-h/2+3,w,h,20);
    v.card.fillStyle(col,1);v.card.fillRoundedRect(-w/2,-h/2,w,h,20);
    if(o&&!o.done){v.card.lineStyle(2,C.terra,.25);v.card.strokeRoundedRect(-w/2+1,-h/2+1,w-2,h-2,19);}
    v.c.setAlpha(o?1:.35);v.steam.emitting=!!o&&!o.done;
    v.ring.clear();
    if(!o){v.label.setText("—");v.sub.setText("");v.av.setText("");return;}
    if(o.gone){v.av.setText("😤");v.label.setFontSize(13);v.label.setText("Client parti…");v.label.setColor("#B02236");v.sub.setText(this.api.head(o.word)+" = "+o.word.fr);v.sub.setColor("#B02236");return;}
    v.sub.setColor("#1E7A4C");
    if(o.done){v.av.setText("😍");v.label.setFontSize(v.horiz?12.5:14);v.label.setText("✓ "+this.api.head(o.word));v.label.setColor("#1E7A4C");v.sub.setText(o.word.fr);return;}
    v.label.setColor("#00205B");v.sub.setText("");v.av.setText(o.av);this.drawRing(v,o);
    var txt=mode==="reverse"?this.api.head(o.word):mode==="audio"?"🔊  Écoute":o.word.fr,len=txt.length;
    v.label.setFontSize(v.horiz?(len>22?11.5:len>11?12.5:14):(len>24?12:len>14?13:15));
    v.label.setText(txt);
  }
  nextPot(speakIt){
    var G=this.G;if(G.q>=G.orders.length)return null;
    var pat=G.c.patience*1000,o={word:G.orders[G.q++],done:false,pat:pat,max:pat,av:Phaser.Utils.Array.GetRandom(AVATARS)};
    if(speakIt&&G.c.mode==="audio"){var self=this;this.time.delayedCall(450,function(){if(!self.ended)self.api.speak(o.word,.9);});}
    return o;
  }
  drawRing(v,o){
    var g=v.ring;g.clear();if(!o||o.done||o.gone)return;
    var f=Math.max(0,o.pat/o.max),col=f>.5?C.good:f>.25?0xF2A33A:C.bad;
    g.lineStyle(4,0x00205B,.08);g.strokeCircle(v.ax,v.ay,17);
    g.lineStyle(4,col,1);g.beginPath();g.arc(v.ax,v.ay,17,-Math.PI/2,-Math.PI/2+Math.PI*2*f,false);g.strokePath();
  }
  potIndex(word){var P=this.G.pots;for(var p=0;p<P.length;p++){if(P[p]&&!P[p].done&&P[p].word.id===word.id)return p;}return -1;}

  /* ----- tapis ----- */
  drawBelt(){
    var p=this.path,self=this;
    this.beltShadow=this.add.graphics();this.beltG=this.add.graphics();this.feverG=this.add.graphics();this.rollers=this.add.graphics();
    var draw=function(g,w,col,a,dy){g.lineStyle(w,col,a);g.beginPath();for(var k=0;k<=160;k++){var q=self.pt(self.per*k/160);if(k===0)g.moveTo(q.x,q.y+dy);else g.lineTo(q.x,q.y+dy);}g.closePath();g.strokePath();};
    draw(this.beltShadow,this.chipH+22,0x000000,.12,7);
    draw(this.beltG,this.chipH+22,C.navy,1,0);
    draw(this.beltG,this.chipH+8,C.navy2,1,0);
    /* trappe d'arrivée des mots */
    var s0=this.pt(0);this.spawn=s0;
    var hatch=this.add.graphics();hatch.fillStyle(C.terra,1);hatch.fillRoundedRect(s0.x-26,s0.y-this.chipH/2-22,52,16,6);
    this.txt(s0.x,s0.y-this.chipH/2-14,"NEW",9,"#ffffff",{display:true});
    /* centre de la boucle : combo */
    var cx=p.cx,cy=p.cy;
    this.comboC=this.add.container(cx,cy).setDepth(5);
    this.comboN=this.txt(0,-4,"",44,"#C2543E",{display:true,stroke:"#ffffff",sw:7});
    this.comboL=this.txt(0,30,"",12,"#00205B",{display:true});
    this.comboC.add([this.comboN,this.comboL]);this.comboC.setAlpha(0);
    this.freezeG=this.add.graphics().setDepth(6);this.freezeT=this.txt(cx,cy,"❄",54,"#ffffff").setDepth(6).setAlpha(0);
  }
  drawFever(time){
    var g=this.feverG;g.clear();if(time>=this.feverUntil)return;
    var self=this,col=Phaser.Display.Color.HSVToRGB((time/1400)%1,.55,1).color,a=.35+.15*Math.sin(time/90);
    g.lineStyle(this.chipH+22,col,a);g.beginPath();
    for(var k=0;k<=120;k++){var q=self.pt(self.per*k/120);if(k===0)g.moveTo(q.x,q.y);else g.lineTo(q.x,q.y);}
    g.closePath();g.strokePath();
  }
  drawRollers(){
    var g=this.rollers;g.clear();g.fillStyle(0xffffff,.16);
    var step=26,n=Math.floor(this.per/step),o=this.off%step;
    for(var k=0;k<n;k++){var q=this.pt(k*step+o);g.fillCircle(q.x,q.y,2);}
  }
  initSlots(){
    for(var k=0;k<this.N;k++)this.slots.push({item:null,prev:this.slotS(k)});
    /* remplissage initial : N-1 mots, en priorité ceux des commandes visibles */
    var self=this;
    for(var k2=1;k2<this.N;k2++){(function(k){var it=self.pickSpawn();if(it){self.placeOn(k,it,k*70);}})(k2);}
  }
  slotS(k){return (k*this.sp+this.off)%this.per;}
  onBelt(){var n=0;this.slots.forEach(function(s){if(s.item!==null)n++;});return n;}
  pickSpawn(){
    var G=this.G,self=this,q=G.items.filter(function(it){return it.state==="queue";});
    if(!q.length)return null;
    var need=q.filter(function(it){return self.potIndex(it.word)>-1;});
    if(need.length)return need[0];
    var disOnBelt=G.items.filter(function(it){return it.state==="belt"&&!it.order;}).length;
    var ords=q.filter(function(it){return it.order;}),dis=q.filter(function(it){return !it.order;});
    if(dis.length&&disOnBelt<2&&(Math.random()<.3||!ords.length))return Phaser.Utils.Array.GetRandom(dis);
    if(!ords.length)return null;
    /* les commandes à venir d'abord */
    ords.sort(function(a,b){return G.orders.indexOf(a.word)-G.orders.indexOf(b.word);});
    return Math.random()<.6?ords[0]:Phaser.Utils.Array.GetRandom(ords);
  }
  placeOn(k,it,delay){
    if(it.order&&it.gold===undefined)it.gold=Math.random()<.15;
    it.state="belt";this.slots[k].item=it.id;
    var chip=this.makeChip(it),self=this,q=this.pt(this.slotS(k));chip.setPosition(q.x,q.y);
    chip.setScale(0);this.tweens.add({targets:chip,scale:1,duration:380,delay:delay||0,ease:"Back.Out"});
    this.chips[it.id]=chip;
  }
  chipLabel(it){return this.G.c.mode==="reverse"?it.word.fr:this.api.head(it.word);}
  makeChip(it,small){
    var self=this,w=small?this.trayW-6:this.chipW,h=small?this.trayH-8:this.chipH,col=it.gold?0xFFC93C:PAL[it.id%PAL.length];
    var c=this.add.container(0,0).setDepth(small?8:4);
    var g=this.add.graphics();
    g.fillStyle(shade(col,.72),1);g.fillRoundedRect(-w/2,-h/2+4,w,h,14);
    g.fillStyle(col,1);g.fillRoundedRect(-w/2,-h/2,w,h,14);
    g.fillStyle(0xffffff,.35);g.fillRoundedRect(-w/2+6,-h/2+4,w-12,8,4);
    var label=this.chipLabel(it),fs=small?(label.length>16?10:11.5):(label.length>22?11.5:label.length>13?13:15);
    var t=this.txt(0,1,label,fs,"#00205B",{wrap:w-12});
    var glow=this.add.graphics();glow.lineStyle(4,C.gold,1);glow.strokeRoundedRect(-w/2-4,-h/2-4,w+8,h+12,17);glow.setVisible(false);
    c.add([glow,g,t]);c.glow=glow;c.itemId=it.id;
    if(it.gold){var st=this.txt(w/2-9,-h/2+9,"★",14,"#ffffff",{display:true,stroke:"#C98A00",sw:3});c.add(st);this.tweens.add({targets:st,scale:{from:.8,to:1.3},angle:{from:-15,to:15},duration:500,yoyo:true,repeat:-1});}
    c.setSize(w,h+4).setInteractive({useHandCursor:true});
    c.on("pointerdown",function(){if(small)self.tapTray(it.id);else self.tapBelt(it.id);});
    return c;
  }

  /* ----- plateau ----- */
  drawTray(){
    this.trayLabel=this.txt(16,this.trayY-this.trayH/2-12,"",11,"#6A7590",{ox:0});
    this.trayBg=this.add.graphics();this.layoutTray();
  }
  layoutTray(){
    var G=this.G,W=this.W,cap=G.cap,gap=6;
    this.trayW=Math.min(72,(W-32-(cap-1)*gap)/cap);
    var total=cap*this.trayW+(cap-1)*gap,x0=W/2-total/2+this.trayW/2;
    this.traySlots=[];var g=this.trayBg;g.clear();
    for(var k=0;k<cap;k++){var x=x0+k*(this.trayW+gap);this.traySlots.push({x:x,y:this.trayY});
      g.fillStyle(0x00205B,.07);g.fillRoundedRect(x-this.trayW/2,this.trayY-this.trayH/2,this.trayW,this.trayH,14);
      g.lineStyle(1.5,0x00205B,.12);g.strokeRoundedRect(x-this.trayW/2,this.trayY-this.trayH/2,this.trayW,this.trayH,14);}
    var self=this;
    /* reconstruire les jetons du plateau */
    this.trayV.forEach(function(c){c.destroy();});this.trayV=[];
    G.tray.forEach(function(id,k){var it=self.item(id),c=self.makeChip(it,true);c.setPosition(self.traySlots[k].x,self.traySlots[k].y);self.trayV.push(c);});
    this.updateTrayLabel();
  }
  updateTrayLabel(){
    var G=this.G,left=G.cap-G.tray.length;
    this.trayLabel.setText("PLATEAU D'ATTENTE · "+G.tray.length+" / "+G.cap+(left===1?"  ⚠ dernière case !":""));
    this.trayLabel.setColor(left===1?"#D1364A":"#6A7590");
  }
  reflowTray(){
    var self=this;this.trayV.forEach(function(c,k){self.tweens.add({targets:c,x:self.traySlots[k].x,duration:220,ease:"Cubic.Out"});});
    this.updateTrayLabel();
  }

  /* ----- bonus ----- */
  drawBoosts(){
    var W=this.W,self=this,defs=[["hint","💡","Indice"],["freeze","❄️","Gel"],["slot","➕","Case"]],bw=(W-32-16)/3;
    defs.forEach(function(d,k){
      var x=16+bw/2+k*(bw+8),y=self.boostY,c=self.add.container(x,y);
      var g=self.add.graphics();g.fillStyle(0x00205B,.1);g.fillRoundedRect(-bw/2,-22+4,bw,44,16);g.fillStyle(0xffffff,1);g.fillRoundedRect(-bw/2,-22,bw,44,16);
      var t=self.txt(0,0,d[1]+"  "+d[2],14,"#00205B");
      var badge=self.add.graphics(),bt=self.txt(bw/2-6,-20,"",11,"#ffffff",{display:true});
      c.add([g,t,badge,bt]);c.setSize(bw,44).setInteractive({useHandCursor:true});
      c.on("pointerdown",function(){self.useBoost(d[0],c);});
      self.boostV[d[0]]={c:c,badge:badge,bt:bt,bw:bw};self.paintBoost(d[0]);
    });
  }
  paintBoost(b){var v=this.boostV[b],n=this.api.boostCount(b);v.badge.clear();v.badge.fillStyle(n>0?C.cta:0x9AA3B5,1);v.badge.fillCircle(v.bw/2-6,-20,10);v.bt.setText(String(n));}
  useBoost(b,btn){
    if(!this.playing())return;
    if(!this.api.boost(b)){this.float(btn.x,btn.y-40,"Plus de bonus : achète-en sur la carte",13,"#B94E39");this.tweens.add({targets:btn,x:btn.x+6,duration:50,yoyo:true,repeat:3});this.sfx.bad();return;}
    this.sfx.boost();buzz(15);this.paintBoost(b);
    this.tweens.add({targets:btn,scale:{from:1.15,to:1},duration:300,ease:"Back.Out"});
    var self=this,G=this.G;
    if(b==="freeze"){
      this.freezeUntil=this.time.now+6000;
      var p=this.path;this.freezeG.clear();this.freezeG.fillStyle(C.ice,.18);this.freezeG.fillRoundedRect(p.cx-p.R-this.chipW/2-12,p.cy-(p.vert?p.L/2:0)-p.R-this.chipH/2-12,2*p.R+this.chipW+24,(p.vert?p.L:0)+2*p.R+this.chipH+24,30);
      this.freezeT.setAlpha(.9);this.tweens.add({targets:this.freezeT,scale:{from:2,to:1},duration:400,ease:"Back.Out"});
      this.float(p.cx,p.cy+50,"Tapis et clients gelés 6 s",15,"#1D4E7A");
    }
    if(b==="slot"){G.cap++;this.layoutTray();this.float(this.W/2,this.trayY-46,"+1 case",16,"#1E7A4C");}
    if(b==="hint"){
      this.hintUntil=this.time.now+5000;var found=false;
      Object.keys(this.chips).forEach(function(id){var c=self.chips[id];if(self.potIndex(self.item(+id).word)>-1){c.glow.setVisible(true);found=true;}});
      this.trayV.forEach(function(c){if(self.potIndex(self.item(c.itemId).word)>-1){c.glow.setVisible(true);found=true;}});
      if(!found)this.float(this.path.cx,this.path.cy,"Le bon mot arrive par la trappe !",14,"#B94E39");
    }
  }

  /* ----- effets ----- */
  makeFx(){
    this.splash=this.add.particles(0,0,"dot",{speed:{min:90,max:240},angle:{min:200,max:340},gravityY:520,lifespan:650,scale:{start:.55,end:.1},tint:[C.broth,0xFFD86B,0xffffff],emitting:false}).setDepth(9);
    this.sparks=this.add.particles(0,0,"dot",{speed:{min:60,max:200},lifespan:500,scale:{start:.45,end:0},tint:[C.gold,0xffffff,C.terra],emitting:false}).setDepth(9);
    this.redFx=this.add.particles(0,0,"dot",{speed:{min:60,max:160},lifespan:450,scale:{start:.4,end:0},tint:[C.bad,0xffffff],emitting:false}).setDepth(9);
    this.coinFx=this.add.particles(0,0,"dot",{speed:{min:120,max:260},angle:{min:240,max:300},gravityY:600,lifespan:800,scale:{start:.5,end:.2},tint:[C.gold,0xFFE08A],emitting:false}).setDepth(9);
  }
  float(x,y,s,size,color,o){
    var t=this.txt(x,y,s,size||18,color||"#1E7A4C",Object.assign({display:true,stroke:"#ffffff",sw:5},o||{})).setDepth(20);
    this.tweens.add({targets:t,y:y-46,duration:900,ease:"Cubic.Out"});
    this.tweens.add({targets:t,alpha:0,duration:350,delay:600,onComplete:function(){t.destroy();}});
    t.setScale(.6);this.tweens.add({targets:t,scale:1,duration:260,ease:"Back.Out"});
    return t;
  }
  banner(s,col){
    var W=this.W,p=this.path,t=this.txt(W/2,p.cy-58,s,40,col||"#F7B733",{display:true,stroke:"#00205B",sw:9}).setDepth(30);
    t.setScale(0).setAngle(-8);
    this.tweens.add({targets:t,scale:1,angle:0,duration:420,ease:"Back.Out"});
    this.tweens.add({targets:t,alpha:0,scale:1.4,duration:300,delay:850,onComplete:function(){t.destroy();}});
    this.cameras.main.flash(140,255,240,210);
  }
  fly(obj,to,dur,cb){
    var from={x:obj.x,y:obj.y},ctrl={x:(from.x+to.x)/2,y:Math.min(from.y,to.y)-90},self=this;
    obj.setDepth(15);obj.disableInteractive();
    this.tweens.add({targets:obj,angle:Phaser.Math.Between(-25,25),duration:dur});
    this.tweens.addCounter({from:0,to:1,duration:dur,ease:"Quad.In",onUpdate:function(tw){var t=tw.getValue(),u=1-t;obj.x=u*u*from.x+2*u*t*ctrl.x+t*t*to.x;obj.y=u*u*from.y+2*u*t*ctrl.y+t*t*to.y;},onComplete:cb});
  }

  /* ----- logique ----- */
  item(id){return this.G.items[id];}
  playing(){return this.G.status==="play"&&this.started&&!this.ended;}
  freeSlotOf(id){for(var k=0;k<this.slots.length;k++){if(this.slots[k].item===id){this.slots[k].item=null;return;}}}
  tapBelt(id){
    if(!this.playing())return;
    var it=this.item(id),chip=this.chips[id];if(!chip||it.state!=="belt")return;
    delete this.chips[id];this.freeSlotOf(id);this.sfx.tap();
    var p=this.potIndex(it.word);
    if(p>-1)this.serve(it,chip,p);else this.store(it,chip);
  }
  tapTray(id){
    if(!this.playing())return;
    var it=this.item(id),k=this.G.tray.indexOf(id),chip=this.trayV[k];if(k<0||!chip)return;
    var p=this.potIndex(it.word);
    if(p>-1){this.G.tray.splice(k,1);this.trayV.splice(k,1);this.reflowTray();this.serve(it,chip,p);}
    else{
      this.G.mistakes++;this.G.missed[it.word.id]=1;this.breakCombo();this.sfx.bad();buzz([30,40,30]);
      this.tweens.add({targets:chip,x:chip.x+7,duration:45,yoyo:true,repeat:3});
      this.redFx.explode(10,chip.x,chip.y);this.float(chip.x,chip.y-34,"Pas cette marmite",13,"#B02236");
    }
  }
  serve(it,chip,p){
    var G=this.G,self=this,o=G.pots[p],v=this.potV[p];
    o.done=true;it.state="served";G.served++;
    var now=this.time.now;G.combo=(now-(this.lastOk||-9999)<3500)?G.combo+1:1;this.lastOk=now;G.maxCombo=Math.max(G.maxCombo,G.combo);
    var fever=now<this.feverUntil,fast=o.pat/o.max>.65,pts=10*G.combo*(fever?2:1)+(fast?5:0);G.score+=pts;
    if(it.gold)G.bonusCoins+=5;
    this.fly(chip,v.mouth,330,function(){
      chip.destroy();
      self.sfx.serve(G.combo);self.sfx.splash();buzz(14);self.api.speak(it.word,1);
      self.splash.explode(18,v.mouth.x,v.mouth.y);
      self.tweens.add({targets:v.c,scaleY:{from:.86,to:1},scaleX:{from:1.08,to:1},duration:380,ease:"Back.Out"});
      self.paintPot(p,v);
      self.float(v.x,v.y-v.h/2+6,"+"+pts+(fever?" ×2":""),22,fever?"#FF4F8B":"#1E7A4C");
      if(fast)self.time.delayedCall(140,function(){self.float(v.x,v.y+4,"FAST!",15,"#E2725B");});
      if(it.gold){self.coinFx.explode(16,v.mouth.x,v.mouth.y);self.sfx.coin();self.time.delayedCall(260,function(){self.float(v.x,v.y+24,"+5 🪙",15,"#C98A00");});}
      self.bumpScore();self.updateTop();self.showCombo();
      if(G.served+G.expired>=G.orders.length){self.finishWin();return;}
      self.time.delayedCall(520,function(){
        if(self.ended)return;
        self.tweens.add({targets:v.c,scaleX:0,duration:140,ease:"Quad.In",onComplete:function(){
          G.pots[p]=self.nextPot(true);self.paintPot(p,v);
          self.tweens.add({targets:v.c,scaleX:1,duration:220,ease:"Back.Out"});
        }});
      });
    });
  }
  store(it,chip){
    var G=this.G,self=this,k=G.tray.length;
    it.state="tray";G.tray.push(it.id);
    var dest=this.traySlots[Math.min(k,this.traySlots.length-1)];
    if(!it.order){G.mistakes++;G.missed[it.word.id]=1;}
    this.breakCombo();
    var full=G.tray.length>=G.cap;if(full)this.ended=true;
    this.fly(chip,dest,300,function(){
      chip.destroy();
      var c=self.makeChip(it,true);c.setPosition(dest.x,dest.y);self.trayV.push(c);
      c.setScale(1.25);self.tweens.add({targets:c,scale:1,duration:260,ease:"Back.Out"});
      self.updateTrayLabel();
      if(!it.order){self.sfx.bad();buzz([30,40,30]);self.cameras.main.shake(160,.006);self.redFx.explode(14,dest.x,dest.y);self.float(dest.x,dest.y-40,"Intrus !",17,"#B02236");}
      else{self.sfx.store();self.float(dest.x,dest.y-40,"En attente",13,"#B94E39");}
      if(G.cap-G.tray.length===1&&!full){self.tweens.add({targets:self.trayLabel,scale:{from:1.2,to:1},duration:300,yoyo:false});}
      if(full)self.finishLose("tray");
    });
  }
  startFever(){
    this.feverUntil=this.time.now+7000;var self=this;
    this.time.delayedCall(500,function(){if(!self.ended){self.banner("FEVER ×2!","#FF4F8B");self.sfx.t([523,659,784,1047,1319,1568],.09,"square",.05,.05);}});
    buzz([30,30,30,30,60]);
  }
  expire(p){
    var G=this.G,self=this,o=G.pots[p],v=this.potV[p];if(!o||o.done)return;
    o.done=true;o.gone=true;G.expired++;G.hearts--;G.mistakes++;G.missed[o.word.id]=1;
    G.items.forEach(function(it){
      if(it.order&&it.word.id===o.word.id&&it.state!=="served"){
        if(it.state==="belt"){var ch=self.chips[it.id];if(ch){self.redFx.explode(10,ch.x,ch.y);ch.destroy();}delete self.chips[it.id];self.freeSlotOf(it.id);}
        if(it.state==="tray"){var k=G.tray.indexOf(it.id);if(k>-1){G.tray.splice(k,1);var c=self.trayV.splice(k,1)[0];if(c){self.redFx.explode(10,c.x,c.y);c.destroy();}self.reflowTray();}}
        it.state="gone";
      }});
    this.breakCombo();this.sfx.bad();this.sfx.lose();buzz([60,40,60]);this.cameras.main.shake(220,.008);
    this.paintPot(p,v);this.tweens.add({targets:v.c,x:v.x+8,duration:50,yoyo:true,repeat:4,onComplete:function(){v.c.x=v.x;}});
    this.float(v.x,v.y,"−1 ❤️",22,"#D1364A");this.updateTop();
    this.tweens.add({targets:this.timeT,scale:{from:1.5,to:1},duration:400,ease:"Back.Out"});
    if(G.hearts<=0){this.ended=true;this.finishLose("hearts");return;}
    if(G.served+G.expired>=G.orders.length){this.finishWin();return;}
    this.time.delayedCall(700,function(){
      if(self.ended)return;
      self.tweens.add({targets:v.c,scaleX:0,duration:140,ease:"Quad.In",onComplete:function(){
        G.pots[p]=self.nextPot(true);self.paintPot(p,v);
        self.tweens.add({targets:v.c,scaleX:1,duration:220,ease:"Back.Out"});
      }});
    });
  }
  breakCombo(){var G=this.G;if(G.combo>=3)this.float(this.path.cx,this.path.cy+40,"Combo perdu",13,"#6A7590");G.combo=0;this.showCombo();}
  showCombo(){
    var G=this.G,c=G.combo;
    if(c<2){this.tweens.add({targets:this.comboC,alpha:0,duration:200});return;}
    if(c%5===0)this.startFever();
    this.comboN.setText("×"+c);this.comboL.setText(this.time.now<this.feverUntil?"FEVER ×2 🔥":c>=10?"EN FEU 🔥":"COMBO");
    this.comboN.setColor(c>=10?"#D1364A":c>=5?"#E2725B":"#C2543E");
    this.comboC.setAlpha(1);this.comboC.setScale(1.6);this.tweens.add({targets:this.comboC,scale:1,duration:320,ease:"Back.Out"});
    for(var k=0;k<PRAISE.length;k++){if(PRAISE[k][0]===c){this.banner(PRAISE[k][1]);this.sfx.praise();this.sparks.explode(30,this.path.cx,this.path.cy);buzz([20,30,20]);}}
  }

  /* ----- boucle ----- */
  update(time,delta){
    if(!this.started||this.ended)return;
    var G=this.G,dt=Math.min(.05,delta/1000),frozen=time<this.freezeUntil;
    var fever=time<this.feverUntil,speed=G.c.speed*Math.min(1.6,1+.035*G.served)*(fever?1.2:1);
    if(!frozen){this.off+=speed*dt;}
    else if(this.freezeT.alpha>0&&this.freezeUntil-time<400){this.freezeT.setAlpha(0);this.freezeG.clear();}
    if(this.hintUntil&&time>this.hintUntil){this.hintUntil=0;var self=this;Object.keys(this.chips).forEach(function(id){self.chips[id].glow.setVisible(false);});this.trayV.forEach(function(c){c.glow.setVisible(false);});}
    this.drawRollers();this.drawFever(time);
    if(!fever&&this.comboL.text.indexOf("FEVER")===0)this.comboL.setText("COMBO");
    /* patience des clients */
    var urgent=false;
    for(var p=0;p<G.pots.length;p++){
      var o=G.pots[p];if(!o||o.done)continue;
      if(!frozen)o.pat-=delta;
      this.drawRing(this.potV[p],o);
      if(o.pat/o.max<.25)urgent=true;
      if(o.pat<=0){this.expire(p);if(this.ended)return;}
    }
    if(urgent&&time-this.lastUrg>900){this.lastUrg=time;this.sfx.tick();}
    /* déplacer les mots et alimenter le tapis */
    for(var k=0;k<this.slots.length;k++){
      var sl=this.slots[k],s=this.slotS(k);
      if(sl.item!==null){var ch=this.chips[sl.item];if(ch){var q=this.pt(s);ch.x=q.x;ch.y=q.y;}}
      else if(s<sl.prev&&this.onBelt()<this.N-1){var it=this.pickSpawn();if(it){this.placeOn(k,it,0);this.sfx.t([520],.04,"sine",.03);}}
      sl.prev=s;
    }
    if(this.hintUntil){var self2=this;Object.keys(this.chips).forEach(function(id){var c=self2.chips[id];if(self2.potIndex(self2.item(+id).word)>-1)c.glow.setVisible(true);});}
    this.updateTop();
  }

  countdown(seq){
    var self=this,W=this.W,cy=this.path.cy,k=0;
    this.started=false;
    var dim=this.add.rectangle(W/2,this.H/2+(this.B-this.T)/2,W,this.H+this.T+this.B,0x00205B,.25).setDepth(40);
    var next=function(){
      if(k>=seq.length){dim.destroy();self.started=true;self.G.begun=true;self.G.status="play";
        if(self.G.c.mode==="audio"){var o=self.G.pots.find(function(x){return x&&!x.done;});if(o)self.api.speak(o.word,.9);}
        return;}
      var s=seq[k++],go=s==="GO!";
      var t=self.txt(W/2,cy,s,go?72:96,go?"#F7B733":"#ffffff",{display:true,stroke:"#00205B",sw:10}).setDepth(41);
      t.setScale(2.2).setAlpha(0);
      self.tweens.add({targets:t,scale:1,alpha:1,duration:300,ease:"Back.Out"});
      self.tweens.add({targets:t,alpha:0,scale:.6,duration:200,delay:450,onComplete:function(){t.destroy();}});
      if(go)self.sfx.go();else self.sfx.blip(520+k*80);
      self.time.delayedCall(go?380:650,next);
    };
    this.time.delayedCall(250,next);
  }

  /* ----- fins de partie ----- */
  finishWin(){
    var self=this,G=this.G;this.ended=true;
    this.time.delayedCall(450,function(){
      var r=self.api.win(G);
      self.sfx.win();buzz([20,40,20,40,80]);
      var W=self.W,H=self.H;
      var dim=self.add.rectangle(W/2,H/2+(self.B-self.T)/2,W,H+self.T+self.B,0x00205B,0).setDepth(50);self.tweens.add({targets:dim,fillAlpha:.55,duration:300});
      var conf=self.add.particles(0,0,"conf",{x:{min:0,max:W},y:-20,speedY:{min:160,max:320},speedX:{min:-70,max:70},rotate:{min:0,max:360},lifespan:2600,gravityY:140,quantity:3,frequency:40,tint:PAL.concat([C.terra,C.gold]),scale:{min:.6,max:1}}).setDepth(52);
      self.time.delayedCall(1800,function(){conf.emitting=false;});
      var pw=Math.min(330,W-40),ph=360,panel=self.add.container(W/2,-ph).setDepth(51);
      var g=self.add.graphics();g.fillStyle(0x000000,.2);g.fillRoundedRect(-pw/2,-ph/2+8,pw,ph,30);g.fillStyle(C.navy,1);g.fillRoundedRect(-pw/2,-ph/2,pw,ph,30);
      panel.add(g);
      panel.add(self.txt(0,-ph/2+42,self.api.name?("BRAVO "+self.api.name().toUpperCase()+" !"):"NIVEAU RÉUSSI !",26,"#F7B733",{display:true}));
      var stars=[];for(var k=0;k<3;k++){var sx=(k-1)*76,sy=-ph/2+112+(k===1?-12:0);
        panel.add(self.add.star(sx,sy,5,16,36,0xffffff,.15));var st=self.add.star(sx,sy,5,16,36,C.gold,1).setScale(0);panel.add(st);stars.push(st);}
      var scoreT=self.txt(0,-ph/2+190,"0",44,"#ffffff",{display:true});panel.add(scoreT);
      panel.add(self.txt(0,-ph/2+222,"points  ·  meilleur combo ×"+G.maxCombo,13,"#C9D2E6"));
      var coinT=self.txt(0,-ph/2+262,"🪙 +0",22,"#F7B733",{display:true});panel.add(coinT);
      var btn=self.add.container(0,ph/2-46);var bg=self.add.graphics();bg.fillStyle(shade(C.cta,.7),1);bg.fillRoundedRect(-pw/2+28,-24+5,pw-56,50,18);bg.fillStyle(C.cta,1);bg.fillRoundedRect(-pw/2+28,-24,pw-56,50,18);
      btn.add([bg,self.txt(0,0,"Continuer",18,"#ffffff",{display:true})]);btn.setSize(pw-56,50).setInteractive({useHandCursor:true}).setScale(0);
      btn.on("pointerdown",function(){self.sfx.tap();self.cleanup();self.api.showResult();});
      panel.add(btn);
      self.tweens.add({targets:panel,y:H/2,duration:600,ease:"Back.Out",onComplete:function(){
        stars.forEach(function(st,k){if(k<r.stars)self.time.delayedCall(250+k*380,function(){
          self.tweens.add({targets:st,scale:{from:0,to:1},angle:{from:-120,to:0},duration:450,ease:"Back.Out"});
          self.sfx.star(k);buzz(25);self.sparks.explode(26,W/2+st.x,panel.y+st.y);});});
        var d=250+r.stars*380;
        self.tweens.addCounter({from:0,to:G.score,duration:700,delay:d,onUpdate:function(t){scoreT.setText(String(Math.round(t.getValue())));}});
        var last=-1;
        self.tweens.addCounter({from:0,to:r.coins,duration:900,delay:d+500,onUpdate:function(t){var v=Math.round(t.getValue());coinT.setText("🪙 +"+v);if(v!==last&&v%4===0){last=v;self.sfx.coin();}},
          onComplete:function(){self.coinFx.explode(24,W/2,panel.y+coinT.y);self.tweens.add({targets:coinT,scale:{from:1.4,to:1},duration:300,ease:"Back.Out"});}});
        self.tweens.add({targets:btn,scale:1,duration:350,delay:d+1300,ease:"Back.Out"});
      }});
    });
  }
  finishLose(reason){
    var self=this,G=this.G;this.ended=true;
    this.api.lose(G,reason);
    this.sfx.lose();buzz(220);this.cameras.main.shake(300,.012);
    var W=this.W,H=this.H;
    this.time.delayedCall(350,function(){
      var dim=self.add.rectangle(W/2,H/2+(self.B-self.T)/2,W,H+self.T+self.B,0x3A0A12,0).setDepth(50);self.tweens.add({targets:dim,fillAlpha:.55,duration:300});
      var t=self.txt(W/2,H/2-40,reason==="tray"?"PLATEAU PLEIN !":reason==="hearts"?"PLUS DE VIES !":"TEMPS ÉCOULÉ !",34,"#ffffff",{display:true,stroke:"#D1364A",sw:10}).setDepth(51).setScale(0);
      self.tweens.add({targets:t,scale:1,duration:500,ease:"Bounce.Out"});
      var s=self.txt(W/2,H/2+6,G.served+" / "+G.orders.length+" commandes servies",16,"#ffffff").setDepth(51).setAlpha(0);
      self.tweens.add({targets:s,alpha:1,duration:300,delay:400});
      var btn=self.add.container(W/2,H/2+70).setDepth(51);var bg=self.add.graphics();bg.fillStyle(0xffffff,1);bg.fillRoundedRect(-110,-25,220,50,18);
      btn.add([bg,self.txt(0,0,"Continuer",18,"#C2543E",{display:true})]);btn.setSize(220,50).setInteractive({useHandCursor:true}).setScale(0);
      btn.on("pointerdown",function(){self.sfx.tap();self.cleanup();self.api.showResult();});
      self.tweens.add({targets:btn,scale:1,duration:350,delay:700,ease:"Back.Out"});
    });
  }
  cleanup(){this.ended=true;var G=this.G;G.items.forEach(function(it){if(it.state==="belt")it.state="queue";});}
}

/* ---------- montage ---------- */
window.CongressLoopPhaser={
  mount:function(parent,G,api){
    var r=parent.getBoundingClientRect(),W=Math.round(r.width),FH=Math.round(r.height),dpr=Math.min(window.devicePixelRatio||1,3);
    var pr=document.createElement("div");pr.style.cssText="position:fixed;top:0;left:0;visibility:hidden;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)";document.body.appendChild(pr);
    var cs=getComputedStyle(pr),T=Math.round(parseFloat(cs.paddingTop)||0),B=Math.round(parseFloat(cs.paddingBottom)||0);pr.remove();
    var H=FH-T-B;
    var game=new Phaser.Game({type:Phaser.AUTO,parent:parent,backgroundColor:"#FFF3E2",banner:false,
      scale:{mode:Phaser.Scale.NONE,width:Math.round(W*dpr),height:Math.round(FH*dpr),zoom:1/dpr},
      audio:{noAudio:true},input:{activePointers:2},render:{antialias:true}});
    game.scene.add("loop",LoopScene,true,{G:G,api:api,W:W,H:H,T:T,B:B,dpr:dpr});
    window.__loopGame=game;
    return game;
  }
};
})();
