/* ===================================================================
   $CALLSCAT — Cat Sales Office
   Sound is synthesized live via the Web Audio API (meows + cash-register
   blips) — no mp3 files were provided, so nothing external is loaded.
=================================================================== */

(() => {
  "use strict";

  /* ---------------------------------------------------------------
     0. AUDIO ENGINE (synthesized, no external files)
  --------------------------------------------------------------- */
  let audioCtx = null;
  let soundOn = false;
  let officeLoopTimer = null;

  function getCtx(){
    if(!audioCtx){
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if(audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  // One "meow": pitch glides up, then drops hard, with vibrato
  function playMeow(pitch = 1, vol = 0.18){
    const ctx = getCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const vibrato = ctx.createOscillator();
    const vibratoGain = ctx.createGain();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sawtooth";
    filter.type = "lowpass";
    filter.frequency.value = 1800 * pitch;

    vibrato.frequency.value = 11;
    vibratoGain.gain.value = 18 * pitch;
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);

    const base = 480 * pitch;
    osc.frequency.setValueAtTime(base * 0.7, now);
    osc.frequency.linearRampToValueAtTime(base * 1.35, now + 0.11);
    osc.frequency.linearRampToValueAtTime(base * 0.55, now + 0.32);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    vibrato.start(now);
    osc.stop(now + 0.4);
    vibrato.stop(now + 0.4);
  }

  // Short "cash register" blip for the BUY button / big toasts
  function playCashBlip(){
    const ctx = getCtx();
    const now = ctx.currentTime;
    [880, 1320, 1760].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.0001, now + i * 0.05);
      gain.gain.linearRampToValueAtTime(0.06, now + i * 0.05 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.16);
    });
  }

  // Background "office hum": random meows at varying pitch/volume
  function startOfficeLoop(){
    stopOfficeLoop();
    const tick = () => {
      if(!soundOn) return;
      const n = 1 + Math.floor(Math.random() * 2);
      for(let i = 0; i < n; i++){
        setTimeout(() => {
          if(soundOn) playMeow(0.7 + Math.random() * 0.9, 0.05 + Math.random() * 0.09);
        }, Math.random() * 500);
      }
      officeLoopTimer = setTimeout(tick, 550 + Math.random() * 900);
    };
    tick();
  }
  function stopOfficeLoop(){
    if(officeLoopTimer) clearTimeout(officeLoopTimer);
    officeLoopTimer = null;
  }

  const soundBtn = document.getElementById("soundToggle");
  soundBtn.addEventListener("click", () => {
    soundOn = !soundOn;
    soundBtn.setAttribute("aria-pressed", String(soundOn));
    soundBtn.querySelector(".sound-icon").textContent = soundOn ? "🔊" : "🔇";
    soundBtn.querySelector(".sound-label").textContent = soundOn
      ? "OFFICE IS LIVE"
      : "UNMUTE THE OFFICE";
    if(soundOn){
      getCtx();
      playCashBlip();
      startOfficeLoop();
    } else {
      stopOfficeLoop();
    }
  });

  /* ---------------------------------------------------------------
     1. FLOATING EMOJI IN HERO (money bags, dollars, rockets)
  --------------------------------------------------------------- */
  const floaterEmojis = ["💰","💵","🐱","📈","🚀","💸","😼"];
  const floatersWrap = document.getElementById("floaters");

  function spawnFloater(){
    const el = document.createElement("div");
    el.className = "floater";
    el.textContent = floaterEmojis[Math.floor(Math.random() * floaterEmojis.length)];
    el.style.left = Math.random() * 100 + "%";
    const duration = 6 + Math.random() * 6;
    el.style.animationDuration = duration + "s";
    el.style.fontSize = (1.1 + Math.random() * 1.6) + "rem";
    floatersWrap.appendChild(el);
    setTimeout(() => el.remove(), duration * 1000 + 200);
  }
  setInterval(spawnFloater, 650);
  for(let i=0;i<6;i++) setTimeout(spawnFloater, i*250);

  /* ---------------------------------------------------------------
     2. CA COPY
  --------------------------------------------------------------- */
  const caCopyBtn = document.getElementById("caCopy");
  const caValue = document.getElementById("caValue");
  caCopyBtn.addEventListener("click", () => {
    // Contract hasn't minted yet — once it does, replace caValue.textContent
    // with the real address and enable navigator.clipboard.writeText(realCA).
    caCopyBtn.textContent = "HOLD ON!";
    caValue.style.color = "var(--gold)";
    setTimeout(() => {
      caCopyBtn.textContent = "COPY";
      caValue.style.color = "";
    }, 1400);
  });

  /* ---------------------------------------------------------------
     3. LIVE CALLS FEED (inline section)
  --------------------------------------------------------------- */
  const catNames = [
    "Whiskers K.", "Sir Biggles", "Cash Cat", "Snowball Wall St.", "Peaches V.",
    "Tiger McBuy", "Ginger Alpha", "Sleepy Downpour", "Felix Munn", "Simba Rekt",
    "Luna Pumpington", "Vinnie Trader", "Georgie Fomo", "Inkblot Chart", "Boss Cat",
    "Puffy Degen", "Kuzya Signal", "Momo Bullrun"
  ];
  const actions = [
    { type:"buy", verbs:["bought","aped into","loaded up on","grabbed more"] },
    { type:"sell", verbs:["sold","took profits on","paper-handed"] }
  ];

  function randomAmount(){
    const v = (Math.random() * 4.8 + 0.2);
    return v.toFixed(2) + " SOL";
  }

  function makeCallLine(){
    const cat = catNames[Math.floor(Math.random() * catNames.length)];
    const act = actions[Math.random() < 0.78 ? 0 : 1]; // BUY more often than SELL — bullish office vibe
    const verb = act.verbs[Math.floor(Math.random() * act.verbs.length)];
    const amt = randomAmount();
    return { cat, act, verb, amt };
  }

  const callsFeed = document.getElementById("callsFeed");
  let callsCount = 0;
  const statCallsEl = document.getElementById("statCalls");
  const statCatsEl = document.getElementById("statCats");
  const statWaterEl = document.getElementById("statWater");

  function pushCallLine(){
    const { cat, act, verb, amt } = makeCallLine();
    const line = document.createElement("div");
    line.className = "call-line";
    line.innerHTML = `
      <span class="who">🐾 ${cat}</span>
      <span class="action ${act.type}">${verb.toUpperCase()} $CALLSCAT</span>
      <span class="amt">${amt}</span>
    `;
    callsFeed.prepend(line);
    while(callsFeed.children.length > 40) callsFeed.removeChild(callsFeed.lastChild);

    callsCount++;
    statCallsEl.textContent = callsCount;
    statCatsEl.textContent = 4 + Math.floor(Math.random() * 6);
    statWaterEl.textContent = (callsCount * 0.3).toFixed(1) + " L";

    return act.type;
  }

  for(let i=0;i<8;i++) pushCallLine();
  setInterval(pushCallLine, 1400);

  /* ---------------------------------------------------------------
     4. POPUP TRADE TOASTS (corner of the screen)
  --------------------------------------------------------------- */
  const toastStack = document.getElementById("toastStack");
  const heroFlash = document.getElementById("heroFlash");

  function spawnToast(){
    const { cat, act, verb, amt } = makeCallLine();
    const toast = document.createElement("div");
    toast.className = "toast" + (act.type === "sell" ? " sell" : "");
    toast.innerHTML = `
      <span class="toast-emoji">${act.type === "buy" ? "📈" : "📉"}</span>
      <span class="toast-text">
        <b>${cat}</b> <span class="${act.type}">${verb}</span> $CALLSCAT
        <span class="toast-sub">${amt} · just now · alpha call 🐱</span>
      </span>
    `;
    toastStack.appendChild(toast);
    setTimeout(() => toast.remove(), 5100);

    // rare "big" trades trigger a flash + screen shake + cash sound
    const big = parseFloat(amt) > 4;
    if(big){
      heroFlash.classList.add("flash");
      setTimeout(() => heroFlash.classList.remove("flash"), 520);
      document.body.classList.add("shake");
      setTimeout(() => document.body.classList.remove("shake"), 400);
      if(soundOn) playCashBlip();
    } else if(soundOn && Math.random() < 0.35){
      playMeow(0.9 + Math.random() * 0.6, 0.07);
    }
  }

  function scheduleToast(){
    spawnToast();
    setTimeout(scheduleToast, 900 + Math.random() * 1600);
  }
  setTimeout(scheduleToast, 800);

  /* ---------------------------------------------------------------
     5. BUY BUTTON: big response (sound + flash)
  --------------------------------------------------------------- */
  document.querySelector(".btn-buy").addEventListener("click", () => {
    getCtx();
    playCashBlip();
    if(!soundOn){
      soundOn = true;
      soundBtn.setAttribute("aria-pressed", "true");
      soundBtn.querySelector(".sound-icon").textContent = "🔊";
      soundBtn.querySelector(".sound-label").textContent = "OFFICE IS LIVE";
      startOfficeLoop();
    }
    heroFlash.classList.add("flash");
    setTimeout(() => heroFlash.classList.remove("flash"), 520);
  });

  /* ---------------------------------------------------------------
     6. LIVE (demo) SOL PRICE ON THE DASHBOARD — a gentle jitter
  --------------------------------------------------------------- */
  const statPrice = document.getElementById("statPrice");
  let basePrice = 259.98;
  setInterval(() => {
    basePrice += (Math.random() - 0.5) * 1.4;
    statPrice.textContent = "$" + basePrice.toFixed(2);
  }, 2200);

})();
