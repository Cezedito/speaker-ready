/* Speaker Ready — écoute automatique (Whisper, directement sur l'appareil)
   La reconnaissance vocale du navigateur n'existe pas dans une web app installée sur iPhone.
   On fait donc tourner le petit modèle Whisper (open source) dans la page, avec transformers.js.
   Premier usage : téléchargement unique (~70 Mo, gardé en cache par le navigateur), ensuite tout reste sur le téléphone.
   Configuration surchargeable par window.SR_ASR_CFG (utilisée pour les tests hors ligne). */
window.SRJudge=(function(){
  "use strict";
  var cfg=Object.assign({
    lib:"https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.2/dist/transformers.min.js", // transformers.js, chargé à l’activation
    model:"Xenova/whisper-tiny.en",       // modèle anglais, téléchargé depuis Hugging Face au premier usage
    localPath:null,                       // tests : dossier local des modèles
    wasmPaths:"ortwasm/"                  // moteur ONNX (WebAssembly) servi depuis le dépôt
  },window.SR_ASR_CFG||{});
  var pipe=null,loading=null,T=null;

  /* Chargement en plusieurs tentatives : si une configuration échoue sur l'appareil
     (moteur WebAssembly, cache du navigateur…), on réessaie automatiquement avec la suivante. */
  var lastErrors=[];
  function attempt(n,onProgress){
    var o=T.env.backends.onnx.wasm;
    try{o.numThreads=1;o.proxy=false;}catch(e){}
    if(cfg.localPath){T.env.allowLocalModels=true;T.env.allowRemoteModels=false;T.env.localModelPath=cfg.localPath;}
    else{T.env.allowLocalModels=false;T.env.allowRemoteModels=true;}
    if(n===0&&cfg.wasmPaths)o.wasmPaths=new URL(cfg.wasmPaths,document.baseURI).href;
    else{try{delete o.wasmPaths;}catch(e){o.wasmPaths=undefined;}}
    T.env.useBrowserCache=n<2;
    if("useWasmCache" in T.env)T.env.useWasmCache=n<2;
    return T.pipeline("automatic-speech-recognition",cfg.model,{dtype:"q8",device:"wasm",progress_callback:onProgress||null});
  }
  function load(onProgress){
    if(pipe)return Promise.resolve(pipe);
    if(loading)return loading;
    lastErrors=[];
    loading=import(new URL(cfg.lib,document.baseURI).href).then(function(mod){
      T=mod;
      var tries=cfg.localPath?[0]:[0,1,2];
      var run=function(k){
        return attempt(tries[k],onProgress).catch(function(e){
          lastErrors.push("essai "+(k+1)+" : "+((e&&e.message)||e));
          try{console.warn("SRJudge",e);}catch(x){}
          if(k+1<tries.length)return run(k+1);
          throw new Error(lastErrors.join(" · "));
        });
      };
      return run(0);
    },function(e){throw new Error("bibliothèque introuvable ("+((e&&e.message)||e)+")");}).then(function(p){pipe=p;loading=null;return p;},function(e){loading=null;throw e;});
    return loading;
  }

  /* enregistrement (mp4/webm) → échantillons mono 16 kHz */
  function toPCM(blob){
    return blob.arrayBuffer().then(function(ab){
      var AC=window.AudioContext||window.webkitAudioContext,ac=new AC();
      return new Promise(function(res,rej){
        var p=ac.decodeAudioData(ab.slice(0),res,rej);if(p&&p.then)p.then(res,rej);
      }).then(function(buf){
        try{ac.close();}catch(e){}
        var len=Math.max(1,Math.ceil(buf.duration*16000)),off=new (window.OfflineAudioContext||window.webkitOfflineAudioContext)(1,len,16000);
        var src=off.createBufferSource();src.buffer=buf;src.connect(off.destination);src.start(0);
        return off.startRendering();
      }).then(function(r){return r.getChannelData(0);});
    });
  }

  function transcribe(blob,onProgress){
    return load(onProgress).then(function(p){
      return toPCM(blob).then(function(pcm){
        var opts=/\.en$/.test(cfg.model)?{}:{language:"english",task:"transcribe"};
        return p(pcm,opts);
      });
    }).then(function(out){return ((out&&out.text)||"").trim();});
  }

  /* ---------- comparaison avec la phrase attendue ---------- */
  var NUM={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20,thirty:30,forty:40,fifty:50,hundred:100};
  var CONTR=[[/\bwon't\b/g,"will not"],[/\bcan't\b/g,"can not"],[/\bcannot\b/g,"can not"],[/n't\b/g," not"],[/'re\b/g," are"],[/'m\b/g," am"],[/'ll\b/g," will"],[/'ve\b/g," have"],[/'d\b/g," would"],[/\blet's\b/g,"let us"],[/\b(it|that|there|here|what|who|where|how|he|she)'s\b/g,"$1 is"]];
  function words(s){
    s=" "+String(s).toLowerCase().replace(/[’‘]/g,"'")+" ";
    s=s.replace(/\ba\.m\./g,"am").replace(/\bp\.m\./g,"pm").replace(/(\d),(\d{3})/g,"$1$2").replace(/%/g," percent").replace(/&/g," and ");
    CONTR.forEach(function(c){s=s.replace(c[0],c[1]);});
    s=s.replace(/[^a-z0-9' ]+/g," ").replace(/'/g,"");
    return s.split(/\s+/).filter(Boolean).map(function(w){return NUM[w]!==undefined?String(NUM[w]):w;});
  }
  function lcs(a,b){
    var n=a.length,m=b.length,dp=[],i,j;
    for(i=0;i<=n;i++){dp.push(new Array(m+1).fill(0));}
    for(i=n-1;i>=0;i--)for(j=m-1;j>=0;j--)dp[i][j]=a[i]===b[j]?dp[i+1][j+1]+1:Math.max(dp[i+1][j],dp[i][j+1]);
    var hit=new Array(n).fill(false);i=0;j=0;
    while(i<n&&j<m){if(a[i]===b[j]){hit[i]=true;i++;j++;}else if(dp[i+1][j]>=dp[i][j+1])i++;else j++;}
    return {k:dp[0][0],hit:hit};
  }
  /* renvoie le score (0-100), les mots attendus marqués trouvés / manqués, et un verdict */
  function judge(target,heard){
    var t=words(target),h=words(heard);
    if(!h.length)return {score:0,tw:t.map(function(w){return {w:w,ok:false};}),verdict:"Je n’ai rien entendu",grade:0};
    var r=lcs(t,h),rec=r.k/Math.max(1,t.length),prec=r.k/Math.max(1,h.length),f=rec+prec?2*rec*prec/(rec+prec):0,score=Math.round(f*100);
    var v=score>=90?"Excellent":score>=75?"Très bien":score>=55?"Pas mal":score>=35?"À retravailler":"Très éloigné";
    return {score:score,tw:t.map(function(w,i){return {w:w,ok:r.hit[i]};}),verdict:v,grade:score>=85?2:score>=55?1:0};
  }

  return {load:load,transcribe:transcribe,judge:judge,ready:function(){return !!pipe;},model:cfg.model};
})();
