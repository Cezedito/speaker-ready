/* Speaker Ready — Inbox Race, version Phaser
   Des messages Teams et WhatsApp arrivent dans le fil, de plus en plus vite.
   Réponds au plus ancien en choisissant la bonne réponse anglaise.
   Si le fil déborde, la partie est perdue. Vide toute la journée pour gagner.
   L'appli fournit l'état G et une API : speak, muted, win, lose, showResult, quit, dayName. */
(function(){
"use strict";
var C={navy:0x00205B,teams:0x5B5FC7,teamsSoft:0xE8EBFA,wa:0x25D366,waDark:0x128C7E,waSoft:0xD9FDD3,cta:0xC2543E,good:0x2F9E66,bad:0xD1364A,gold:0xF7B733,white:0xffffff,paper:0xEFE7DE};
var FONT_D="Montserrat, 'Avenir Next', system-ui, sans-serif",FONT_B="-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
var PRAISE=[[3,"GREAT!"],[5,"AWESOME!"],[7,"ON FIRE!"],[10,"UNSTOPPABLE!"],[14,"LEGENDARY!"]];
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function buzz(p){try{if(navigator.vibrate)navigator.vibrate(p);}catch(e){}}

function Sfx(api){this.api=api;this.ac=null;}
Sfx.prototype.t=function(fs,dur,type,vol,gap,slide){
  if(this.api.muted())return;
  try{this.ac=this.ac||new (window.AudioContext||window.webkitAudioContext)();if(this.ac.state==="suspended")this.ac.resume();
    var ac=this.ac,t=ac.currentTime;fs.forEach(function(f,k){var o=ac.createOscillator(),g=ac.createGain(),st=t+k*(gap||dur);
      o.type=type||"sine";o.frequency.setValueAtTime(f,st);if(slide)o.frequency.exponentialRampToValueAtTime(f*slide,st+dur);
      g.gain.setValueAtTime(0,st);g.gain.linearRampToValueAtTime(vol||.12,st+.008);g.gain.exponentialRampToValueAtTime(.0001,st+dur);
      o.connect(g);g.connect(ac.destination);o.start(st);o.stop(st+dur+.03);});}catch(e){}
};
Sfx.prototype.teams=function(){this.t([784,659],.12,"sine",.1,.1);};
Sfx.prototype.wa=function(){this.t([1320,1760],.06,"sine",.09,.05);};
Sfx.prototype.send=function(c){var b=587*Math.pow(1.0595,Math.min(c,14)*2);this.t([b,b*1.5],.09,"triangle",.12,.06,1.2);};
Sfx.prototype.bad=function(){this.t([196,147],.14,"square",.05,.1);};
Sfx.prototype.tick=function(){this.t([1000],.04,"square",.03);};
Sfx.prototype.praise=function(){this.t([784,988,1175,1568],.1,"triangle",.12,.06);};
Sfx.prototype.zero=function(){this.t([523,659,784,1047,1319],.09,"triangle",.12,.06);};
Sfx.prototype.star=function(k){var b=[880,1109,1319][k]||1319;this.t([b,b*1.5],.16,"triangle",.14,.08);};
Sfx.prototype.coin=function(){this.t([1568,2093],.06,"square",.03,.05);};
Sfx.prototype.win=function(){this.t([523,659,784,1047,1319],.16,"triangle",.13,.1);};
Sfx.prototype.lose=function(){this.t([392,330,262,196],.22,"sawtooth",.05,.17);};
Sfx.prototype.blip=function(f){this.t([f||660],.12,"sine",.12);};

class InboxScene extends Phaser.Scene{
  constructor(){super("inbox");}
  init(d){this.G=d.G;this.api=d.api;this.W=d.W;this.H=d.H;this.dpr=d.dpr;this.sfx=new Sfx(d.api);}
  txt(x,y,s,size,color,o){
    o=o||{};var st={fontFamily:o.display?FONT_D:FONT_B,fontSize:size+"px",fontStyle:o.weight||"bold",color:color||"#00205B",align:o.align||"left",resolution:this.dpr};
    if(o.wrap)st.wordWrap={width:o.wrap,useAdvancedWrap:false};
    if(o.stroke){st.stroke=o.stroke;st.strokeThickness=o.sw||6;}
    var t=this.add.text(x,y,s,st);t.setOrigin(o.ox===undefined?.5:o.ox,o.oy===undefined?.5:o.oy);return t;
  }
  create(){
    var G=this.G,W=this.W,H=this.H;
    this.cameras.main.setZoom(this.dpr);this.cameras.main.centerOn(W/2,H/2);
    if(!this.textures.exists("dot")){var g=this.add.graphics();g.fillStyle(0xffffff,1);g.fillCircle(8,8,8);g.generateTexture("dot",16,16);g.clear();g.fillRect(0,0,10,14);g.generateTexture("conf",10,14);g.destroy();}
    this.ended=false;this.started=false;this.bubbles=[];this.optV=[];this.typing=null;this.lastWarn=0;
    var bg=this.add.graphics();bg.fillGradientStyle(0xF4F1FF,0xF4F1FF,0xE6F7EE,0xE6F7EE,1);bg.fillRect(0,0,W,H);
    this.panelH=Math.min(250,Math.round(H*.31));
    this.feedTop=98;this.feedBot=H-this.panelH-12;
    this.drawTop();this.drawFeed();this.drawPanel();
    this.fx=this.add.particles(0,0,"dot",{speed:{min:80,max:220},lifespan:550,scale:{start:.45,end:0},tint:[C.teams,C.wa,C.gold,0xffffff],emitting:false}).setDepth(30);
    this.redFx=this.add.particles(0,0,"dot",{speed:{min:60,max:160},lifespan:450,scale:{start:.4,end:0},tint:[C.bad,0xffffff],emitting:false}).setDepth(30);
    this.countdown();
  }

  /* ----- haut ----- */
  drawTop(){
    var W=this.W,G=this.G,self=this;
    var back=this.add.container(30,34),bb=this.add.graphics();bb.fillStyle(0xffffff,1);bb.fillCircle(0,0,19);
    back.add([bb,this.txt(0,-1,"‹",28,"#C2543E",{display:true,align:"center"})]);back.setSize(44,44).setInteractive({useHandCursor:true});
    back.on("pointerdown",function(){self.ended=true;self.api.quit();});
    this.txt(58,22,("INBOX RACE · "+this.api.dayName(G.i)).toUpperCase(),11,"#6A7590",{ox:0});
    this.scoreT=this.txt(58,42,"0",22,"#00205B",{ox:0,display:true});this.shown=0;
    var pill=this.add.graphics();pill.fillStyle(0xffffff,1);pill.fillRoundedRect(W-108,18,92,32,16);
    this.clockT=this.txt(W-62,34,"09:00",16,"#5B5FC7",{display:true,align:"center"});
    this.barBg=this.add.graphics();this.barBg.fillStyle(0x00205B,.08);this.barBg.fillRoundedRect(16,62,W-32,9,5);
    this.bar=this.add.graphics();
    this.progT=this.txt(16,82,"",12,"#6A7590",{ox:0});
    this.fullT=this.txt(W-16,82,"",12,"#6A7590",{ox:1});
    this.updateTop();
  }
  updateTop(){
    var G=this.G,W=this.W,f=G.answered/G.msgs.length;
    this.bar.clear();this.bar.fillStyle(C.teams,1);if(f>0)this.bar.fillRoundedRect(16,62,Math.max(10,(W-32)*f),9,5);
    var mins=9*60+Math.round(f*9*60),hh=Math.floor(mins/60),mm=mins%60;this.clockT.setText("🕘 "+(hh<10?"0":"")+hh+":"+(mm<10?"0":"")+mm);
    this.progT.setText(G.answered+" / "+G.msgs.length+" messages traités");
  }
  bumpScore(){var self=this,from=this.shown;this.tweens.addCounter({from:from,to:this.G.score,duration:350,onUpdate:function(t){self.shown=Math.round(t.getValue());self.scoreT.setText(String(self.shown));}});this.tweens.add({targets:this.scoreT,scale:{from:1.35,to:1},duration:300,ease:"Back.Out"});}

  /* ----- fil ----- */
  drawFeed(){
    var W=this.W,t=this.feedTop,b=this.feedBot;
    this.feedBg=this.add.graphics();
    this.feedBg.fillStyle(0x000000,.06);this.feedBg.fillRoundedRect(12,t+4,W-24,b-t,22);
    this.feedBg.fillStyle(C.paper,1);this.feedBg.fillRoundedRect(12,t,W-24,b-t,22);
    this.feedBg.fillStyle(0xffffff,.35);for(var y=t+20;y<b;y+=34)for(var x=30+(y%68?17:0);x<W-20;x+=34)this.feedBg.fillCircle(x,y,2);
    this.warnG=this.add.graphics();
    this.emptyT=this.txt(W/2,(t+b)/2,"",15,"#8A8F9E",{align:"center",weight:"bold"});
  }
  appIcon(app){
    var g=this.add.graphics();
    if(app==="t"){g.fillStyle(C.teams,1);g.fillRoundedRect(-14,-14,28,28,8);var t=this.txt(0,0,"T",17,"#ffffff",{display:true,align:"center"});return [g,t];}
    g.fillStyle(C.wa,1);g.fillCircle(0,0,14);g.lineStyle(2.5,0xffffff,1);g.strokeCircle(0,-1,7.5);g.fillStyle(0xffffff,1);g.fillTriangle(-7,4,-9,9,-3,6);
    return [g];
  }
  makeBubble(m){
    var W=this.W,app=m[0],c=this.add.container(0,0).setDepth(5),bw=W-24-24-40;
    var name=this.txt(0,0,m[1]+(app==="t"?" · Teams":" · WhatsApp"),11.5,app==="t"?"#5B5FC7":"#128C7E",{ox:0,oy:0});
    var body=this.txt(0,0,m[2],15,"#1B2340",{ox:0,oy:0,wrap:bw-24,weight:"normal"});
    var h=Math.max(52,body.height+name.height+20);
    var g=this.add.graphics();
    var icon=this.appIcon(app);icon.forEach(function(o){o.x+=32;o.y+=h/2;});
    var x0=52;
    g.fillStyle(0x000000,.07);g.fillRoundedRect(x0,3,bw,h,14);
    g.fillStyle(0xffffff,1);g.fillRoundedRect(x0,0,bw,h,{tl:4,tr:14,bl:14,br:14});
    g.fillStyle(app==="t"?C.teams:C.wa,1);g.fillRoundedRect(x0,0,4,h,{tl:4,tr:0,bl:4,br:0});
    name.setPosition(x0+14,8);body.setPosition(x0+14,8+name.height+2);
    var hl=this.add.graphics();hl.lineStyle(3,C.gold,1);hl.strokeRoundedRect(x0-3,-3,bw+6,h+6,16);hl.setVisible(false);
    var tag=this.txt(x0+bw-8,-1,"À TOI ↓",10,"#ffffff",{ox:1,oy:.5,display:true});var tagBg=this.add.graphics();
    tagBg.fillStyle(C.cta,1);tagBg.fillRoundedRect(x0+bw-8-tag.width-12,-10,tag.width+16,18,9);tag.setX(x0+bw-8-6);tag.setVisible(false);tagBg.setVisible(false);
    c.add([g].concat(icon).concat([name,body,hl,tagBg,tag]));
    c.m=m;c.h=h;c.hl=hl;c.tag=tag;c.tagBg=tagBg;c.x=12;
    return c;
  }
  layoutFeed(instant){
    var y=this.feedBot-12,self=this;
    for(var k=this.bubbles.length-1;k>=0;k--){
      var b=this.bubbles[k];y-=b.h;b.ty=y;
      if(instant)b.y=y;else this.tweens.add({targets:b,y:y,duration:260,ease:"Cubic.Out"});
      y-=10;
    }
    if(this.typing){/* l'indicateur de saisie se place sous le dernier message */}
    this.used=(this.feedBot-12)-(y+10);
    var cap=this.feedBot-this.feedTop-24,f=this.used/cap;
    this.fullT.setText("Fil "+Math.max(0,Math.min(100,Math.round(f*100)))+" %");this.fullT.setColor(f>.75?"#D1364A":"#6A7590");
    this.emptyT.setText(this.bubbles.length?"":"Inbox zero ✨");
    if(f>1&&!this.ended){this.ended=true;this.finishLose("overflow");}
    return f;
  }
  setActive(){
    var a=this.bubbles[0];this.bubbles.forEach(function(b,k){b.hl.setVisible(k===0);b.tag.setVisible(k===0);b.tagBg.setVisible(k===0);});
    if(!a){this.clearOptions("En attente du prochain message…");return;}
    if(this.activeM===a.m)return;
    this.activeM=a.m;this.activeSince=this.time.now;
    this.tweens.add({targets:a,scale:{from:1.04,to:1},duration:250,ease:"Back.Out"});
    this.showOptions(a.m);
    this.api.speak(a.m[2]);
  }

  /* ----- panneau de réponses ----- */
  drawPanel(){
    var W=this.W,H=this.H,top=H-this.panelH;
    var g=this.add.graphics();g.fillStyle(0x000000,.06);g.fillRoundedRect(0,top+2,W,this.panelH+40,26);g.fillStyle(0xffffff,1);g.fillRoundedRect(0,top+6,W,this.panelH+40,26);
    this.panelTop=top+6;
    this.askT=this.txt(18,this.panelTop+18,"",12,"#6A7590",{ox:0});
    this.frT=this.txt(W/2,this.feedTop+44,"",13,"#ffffff",{align:"center",weight:"bold",wrap:W-70}).setDepth(20).setAlpha(0);this.frBg=this.add.graphics().setDepth(19).setAlpha(0);
  }
  clearOptions(msg){this.optV.forEach(function(o){o.destroy();});this.optV=[];this.askT.setText(msg||"");}
  showOptions(m){
    var self=this,W=this.W;this.clearOptions("RÉPONDS À "+m[1].toUpperCase()+" ("+(m[0]==="t"?"TEAMS":"WHATSAPP")+")");
    var opts=shuffle([{t:m[4],ok:true},{t:m[5]},{t:m[6]}]);
    var avail=this.panelH-46,bh=Math.min(62,(avail-16)/3),y=this.panelTop+34;
    opts.forEach(function(o,k){
      var c=self.add.container(W/2,y+bh/2+k*(bh+8)).setDepth(10),bw=W-32;
      var g=self.add.graphics(),col=m[0]==="t"?C.teams:C.waDark;
      g.fillStyle(col,.12);g.fillRoundedRect(-bw/2,-bh/2+3,bw,bh,16);
      g.fillStyle(0xffffff,1);g.fillRoundedRect(-bw/2,-bh/2,bw,bh,16);
      g.lineStyle(2,col,.35);g.strokeRoundedRect(-bw/2,-bh/2,bw,bh,16);
      var t=self.txt(0,0,o.t,o.t.length>48?13:14.5,"#1B2340",{align:"center",wrap:bw-28});
      c.add([g,t]);c.g=g;c.ok=!!o.ok;c.bw=bw;c.bh=bh;c.col=col;
      c.setSize(bw,bh).setInteractive({useHandCursor:true});
      c.on("pointerdown",function(){self.answer(c,m);});
      c.setScale(.9).setAlpha(0);self.tweens.add({targets:c,scale:1,alpha:1,duration:220,delay:k*50,ease:"Back.Out"});
      self.optV.push(c);
    });
  }
  answer(c,m){
    if(!this.started||this.ended||c.used)return;
    var G=this.G,self=this,a=this.bubbles[0];if(!a||a.m!==m)return;
    if(!c.ok){
      c.used=true;G.mistakes++;G.missed.push(m);G.combo=0;this.showCombo();
      this.sfx.bad();buzz([30,40,30]);this.redFx.explode(12,c.x,c.y);
      c.g.clear();c.g.fillStyle(0xFDE8EB,1);c.g.fillRoundedRect(-c.bw/2,-c.bh/2,c.bw,c.bh,16);c.g.lineStyle(2,C.bad,.6);c.g.strokeRoundedRect(-c.bw/2,-c.bh/2,c.bw,c.bh,16);
      c.setAlpha(.55);this.tweens.add({targets:c,x:c.x+8,duration:45,yoyo:true,repeat:3});
      /* pénalité : le message suivant arrive tout de suite */
      this.spawnNow();
      return;
    }
    this.optV.forEach(function(o){o.disableInteractive();});
    var now=this.time.now,fast=now-this.activeSince<3500;
    G.combo=(now-(this.lastOk||-9999)<6000)?G.combo+1:1;this.lastOk=now;G.maxCombo=Math.max(G.maxCombo,G.combo);
    var pts=10*G.combo+(fast?5:0);G.score+=pts;G.answered++;
    c.g.clear();c.g.fillStyle(m[0]==="t"?C.teamsSoft:C.waSoft,1);c.g.fillRoundedRect(-c.bw/2,-c.bh/2,c.bw,c.bh,16);
    this.sfx.send(G.combo);buzz(14);
    /* bulle de réponse envoyée */
    var W=this.W,out=this.add.container(W-16,a.y+a.h+4).setDepth(6),rt=this.txt(0,0,m[4]+"  ✓✓",13.5,"#1B2340",{ox:1,oy:0,wrap:W*.6,weight:"normal"});
    var og=this.add.graphics(),ow=rt.width+22,oh=rt.height+14;og.fillStyle(m[0]==="t"?C.teamsSoft:C.waSoft,1);og.fillRoundedRect(-ow,0,ow,oh,{tl:14,tr:4,bl:14,br:14});
    rt.setPosition(-11,7);out.add([og,rt]);out.setScale(.6);this.tweens.add({targets:out,scale:1,duration:200,ease:"Back.Out"});
    this.frT.setText("💡 "+m[3]);var fw=this.frT.width+24,fh=this.frT.height+12;this.frBg.clear();this.frBg.fillStyle(0x3E41A8,.92);this.frBg.fillRoundedRect(W/2-fw/2,this.feedTop+44-fh/2,fw,fh,fh/2);
    this.frT.setAlpha(1);this.frBg.setAlpha(1);this.tweens.killTweensOf([this.frT,this.frBg]);this.tweens.add({targets:[this.frT,this.frBg],alpha:0,duration:400,delay:2000});
    this.float(a.x+W/2,a.y+a.h/2,"+"+pts+(fast?"  FAST!":""),20,"#1E7A4C");
    this.bumpScore();this.updateTop();this.showCombo();
    this.time.delayedCall(450,function(){
      self.fx.explode(18,W/2,a.y+a.h/2);
      self.tweens.add({targets:[a,out],x:"-="+(W+40),alpha:0,duration:280,ease:"Cubic.In",onComplete:function(){a.destroy();out.destroy();}});
      self.bubbles.shift();self.activeM=null;self.layoutFeed();
      if(G.answered>=G.msgs.length){self.finishWin();return;}
      if(!self.bubbles.length&&!self.typing){G.score+=30;self.bumpScore();self.banner("INBOX ZERO!","#25D366",G.combo>=3?80:0);self.sfx.zero();self.spawnNow();}
      self.setActive();
    });
  }
  showCombo(){
    var G=this.G,c=G.combo;
    for(var k=0;k<PRAISE.length;k++){if(PRAISE[k][0]===c){this.banner(PRAISE[k][1]);this.sfx.praise();this.fx.explode(30,this.W/2,(this.feedTop+this.feedBot)/2);buzz([20,30,20]);}}
    if(!this.comboT){this.comboT=this.txt(this.W/2,this.feedTop+16,"",13,"#ffffff",{display:true,align:"center",stroke:"#C2543E",sw:5}).setDepth(25);}
    this.comboT.setText(c>=2?"COMBO ×"+c:"");if(c>=2)this.tweens.add({targets:this.comboT,scale:{from:1.5,to:1},duration:250,ease:"Back.Out"});
  }

  /* ----- arrivée des messages ----- */
  spawnNow(){if(this.nextAt>this.time.now+250)this.nextAt=this.time.now+250;}
  startTyping(){
    var G=this.G,m=G.msgs[G.spawned],W=this.W;if(!m)return;
    var c=this.add.container(12,this.feedBot-12-34).setDepth(4),g=this.add.graphics();
    g.fillStyle(0xffffff,.9);g.fillRoundedRect(52,0,150,30,15);
    var t=this.txt(66,15,m[1].split(" ")[0]+" is typing",11.5,"#6A7590",{ox:0,weight:"normal"});
    var dots=this.txt(66+t.width+4,13,"•••",13,m[0]==="t"?"#5B5FC7":"#25D366",{ox:0});
    this.tweens.add({targets:dots,alpha:{from:1,to:.2},duration:300,yoyo:true,repeat:-1});
    c.add([g,t,dots]);this.typing=c;
  }
  spawn(){
    var G=this.G;if(G.spawned>=G.msgs.length)return;
    var m=G.msgs[G.spawned++];
    if(this.typing){this.typing.destroy();this.typing=null;}
    var b=this.makeBubble(m);b.y=this.feedBot-12-b.h;this.bubbles.push(b);
    b.setScale(.85);this.tweens.add({targets:b,scale:1,duration:260,ease:"Back.Out"});
    if(m[0]==="t")this.sfx.teams();else this.sfx.wa();buzz(10);
    var f=this.layoutFeed();
    if(f>.75&&!this.ended){this.warn();}
    this.setActive();
  }
  warn(){
    var g=this.warnG,W=this.W,self=this;g.clear();g.lineStyle(4,C.bad,1);g.strokeRoundedRect(12,this.feedTop,W-24,this.feedBot-this.feedTop,22);
    g.setAlpha(1);this.tweens.add({targets:g,alpha:0,duration:500,yoyo:true,repeat:1});this.sfx.tick();
  }
  update(time,delta){
    if(!this.started||this.ended)return;
    var G=this.G;
    if(time>=this.nextAt&&G.spawned<G.msgs.length){
      if(!this.typing){this.startTyping();this.typingAt=time;}
      if(time-this.typingAt>650){this.spawn();this.interval=Math.max(G.c.min,this.interval*G.c.acc);this.nextAt=time+this.interval;}
    }
  }

  /* ----- effets ----- */
  float(x,y,s,size,color){
    var t=this.txt(x,y,s,size||18,color||"#1E7A4C",{display:true,align:"center",stroke:"#ffffff",sw:5}).setDepth(40);
    this.tweens.add({targets:t,y:y-46,duration:900,ease:"Cubic.Out"});this.tweens.add({targets:t,alpha:0,duration:350,delay:600,onComplete:function(){t.destroy();}});
  }
  banner(s,col,dy){
    var W=this.W,t=this.txt(W/2,(this.feedTop+this.feedBot)/2+(dy||0),s,38,col||"#F7B733",{display:true,align:"center",stroke:"#00205B",sw:9}).setDepth(45);
    t.setScale(0).setAngle(-8);this.tweens.add({targets:t,scale:1,angle:0,duration:420,ease:"Back.Out"});
    this.tweens.add({targets:t,alpha:0,scale:1.4,duration:300,delay:850,onComplete:function(){t.destroy();}});
    this.cameras.main.flash(140,255,245,230);
  }
  countdown(){
    var self=this,W=this.W,seq=["3","2","1","GO!"],k=0,cy=(this.feedTop+this.feedBot)/2;
    var dim=this.add.rectangle(W/2,this.H/2,W,this.H,0x00205B,.25).setDepth(60);
    this.clearOptions("La journée commence…");
    var next=function(){
      if(k>=seq.length){dim.destroy();self.started=true;self.interval=self.G.c.start;self.nextAt=self.time.now;return;}
      var s=seq[k++],go=s==="GO!",t=self.txt(W/2,cy,s,go?72:96,go?"#F7B733":"#ffffff",{display:true,align:"center",stroke:"#00205B",sw:10}).setDepth(61);
      t.setScale(2.2).setAlpha(0);self.tweens.add({targets:t,scale:1,alpha:1,duration:300,ease:"Back.Out"});
      self.tweens.add({targets:t,alpha:0,scale:.6,duration:200,delay:450,onComplete:function(){t.destroy();}});
      if(go)self.sfx.zero();else self.sfx.blip(520+k*80);
      self.time.delayedCall(go?380:650,next);
    };
    this.time.delayedCall(250,next);
  }

  /* ----- fins ----- */
  finishWin(){
    var self=this,G=this.G;this.ended=true;
    this.time.delayedCall(400,function(){
      var r=self.api.win(G);self.sfx.win();buzz([20,40,20,40,80]);
      var W=self.W,H=self.H;
      var dim=self.add.rectangle(W/2,H/2,W,H,0x00205B,0).setDepth(70);self.tweens.add({targets:dim,fillAlpha:.55,duration:300});
      var conf=self.add.particles(0,0,"conf",{x:{min:0,max:W},y:-20,speedY:{min:160,max:320},speedX:{min:-70,max:70},rotate:{min:0,max:360},lifespan:2600,gravityY:140,quantity:3,frequency:40,tint:[C.teams,C.wa,C.gold,0xFF6A8B,0xffffff],scale:{min:.6,max:1}}).setDepth(72);
      self.time.delayedCall(1800,function(){conf.emitting=false;});
      var pw=Math.min(330,W-40),ph=360,panel=self.add.container(W/2,-ph).setDepth(71);
      var g=self.add.graphics();g.fillStyle(0x000000,.2);g.fillRoundedRect(-pw/2,-ph/2+8,pw,ph,30);g.fillStyle(C.teams,1);g.fillRoundedRect(-pw/2,-ph/2,pw,ph,30);
      panel.add(g);panel.add(self.txt(0,-ph/2+42,"INBOX ZERO !",28,"#ffffff",{display:true,align:"center"}));
      var stars=[];for(var k=0;k<3;k++){var sx=(k-1)*76,sy=-ph/2+112+(k===1?-12:0);panel.add(self.add.star(sx,sy,5,16,36,0xffffff,.18));var st=self.add.star(sx,sy,5,16,36,C.gold,1).setScale(0);panel.add(st);stars.push(st);}
      var scoreT=self.txt(0,-ph/2+190,"0",44,"#ffffff",{display:true,align:"center"});panel.add(scoreT);
      panel.add(self.txt(0,-ph/2+222,"points  ·  meilleur combo ×"+G.maxCombo,13,"#DCDDF7",{align:"center"}));
      var coinT=self.txt(0,-ph/2+262,"🪙 +0",22,"#F7B733",{display:true,align:"center"});panel.add(coinT);
      var btn=self.add.container(0,ph/2-46),bg=self.add.graphics();bg.fillStyle(0x3E41A8,1);bg.fillRoundedRect(-pw/2+28,-24+5,pw-56,50,18);bg.fillStyle(0xffffff,1);bg.fillRoundedRect(-pw/2+28,-24,pw-56,50,18);
      btn.add([bg,self.txt(0,0,"Continuer",18,"#5B5FC7",{display:true,align:"center"})]);btn.setSize(pw-56,50).setInteractive({useHandCursor:true}).setScale(0);
      btn.on("pointerdown",function(){self.api.showResult();});panel.add(btn);
      self.tweens.add({targets:panel,y:H/2,duration:600,ease:"Back.Out",onComplete:function(){
        stars.forEach(function(st,k){if(k<r.stars)self.time.delayedCall(250+k*380,function(){self.tweens.add({targets:st,scale:{from:0,to:1},angle:{from:-120,to:0},duration:450,ease:"Back.Out"});self.sfx.star(k);buzz(25);self.fx.explode(26,W/2+st.x,panel.y+st.y);});});
        var d=250+r.stars*380,last=-1;
        self.tweens.addCounter({from:0,to:G.score,duration:700,delay:d,onUpdate:function(t){scoreT.setText(String(Math.round(t.getValue())));}});
        self.tweens.addCounter({from:0,to:r.coins,duration:900,delay:d+500,onUpdate:function(t){var v=Math.round(t.getValue());coinT.setText("🪙 +"+v);if(v!==last&&v%4===0){last=v;self.sfx.coin();}}});
        self.tweens.add({targets:btn,scale:1,duration:350,delay:d+1300,ease:"Back.Out"});
      }});
    });
  }
  finishLose(reason){
    var self=this,G=this.G;this.ended=true;this.api.lose(G,reason);this.sfx.lose();buzz(220);this.cameras.main.shake(300,.012);
    var W=this.W,H=this.H;
    this.time.delayedCall(350,function(){
      var dim=self.add.rectangle(W/2,H/2,W,H,0x3A0A12,0).setDepth(70);self.tweens.add({targets:dim,fillAlpha:.55,duration:300});
      var t=self.txt(W/2,H/2-40,"INBOX DÉBORDÉE !",32,"#ffffff",{display:true,align:"center",stroke:"#D1364A",sw:10}).setDepth(71).setScale(0);
      self.tweens.add({targets:t,scale:1,duration:500,ease:"Bounce.Out"});
      var s=self.txt(W/2,H/2+6,G.answered+" / "+G.msgs.length+" messages traités",16,"#ffffff",{align:"center"}).setDepth(71).setAlpha(0);self.tweens.add({targets:s,alpha:1,duration:300,delay:400});
      var btn=self.add.container(W/2,H/2+70).setDepth(71),bg=self.add.graphics();bg.fillStyle(0xffffff,1);bg.fillRoundedRect(-110,-25,220,50,18);
      btn.add([bg,self.txt(0,0,"Continuer",18,"#C2543E",{display:true,align:"center"})]);btn.setSize(220,50).setInteractive({useHandCursor:true}).setScale(0);
      btn.on("pointerdown",function(){self.api.showResult();});self.tweens.add({targets:btn,scale:1,duration:350,delay:700,ease:"Back.Out"});
    });
  }
}

window.InboxRacePhaser={
  mount:function(parent,G,api){
    var r=parent.getBoundingClientRect(),W=Math.round(r.width),H=Math.round(r.height),dpr=Math.min(window.devicePixelRatio||1,3);
    var game=new Phaser.Game({type:Phaser.AUTO,parent:parent,backgroundColor:"#F4F1FF",banner:false,
      scale:{mode:Phaser.Scale.NONE,width:Math.round(W*dpr),height:Math.round(H*dpr),zoom:1/dpr},audio:{noAudio:true},input:{activePointers:2},render:{antialias:true}});
    game.scene.add("inbox",InboxScene,true,{G:G,api:api,W:W,H:H,dpr:dpr});
    window.__inboxGame=game;
    return game;
  }
};
})();
