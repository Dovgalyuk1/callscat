/* ===================================================================
   $CALLSCAT — Cat Sales Office
   Синтезированный звук (мяу + гул колл-центра) через Web Audio API —
   отдельных mp3 не было прислано, поэтому звук генерируется на лету.
=================================================================== */

(() => {
  "use strict";

  /* ---------------------------------------------------------------
     0. AUDIO ENGINE (синтез, без внешних файлов)
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

  // Один "мяу": частота едет вверх, потом резко вниз, с вибрато
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

  // Короткий "клик кассы" под BUY-кнопку / крупные тосты
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

  // Фоновый "гул опенспейса": рандомные мяуканья с разным питчем/громкостью
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
      ? "ОТДЕЛ ПРОДАЖ ГРЕМИТ"
      : "ВКЛ. ОТДЕЛ ПРОДАЖ";
    if(soundOn){
      getCtx();
      playCashBlip();
      startOfficeLoop();
    } else {
      stopOfficeLoop();
    }
  });

  /* ---------------------------------------------------------------
     1. ЛЕТАЮЩИЕ ЭМОДЗИ В HERO (мешки денег, доллары, MOON)
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
    // Контракт ещё не заминчен — как только появится, замени caValue.textContent
    // на реальный адрес и включи navigator.clipboard.writeText(realCA).
    caCopyBtn.textContent = "СКОРО!";
    caValue.style.color = "var(--gold)";
    setTimeout(() => {
      caCopyBtn.textContent = "COPY";
      caValue.style.color = "";
    }, 1400);
  });

  /* ---------------------------------------------------------------
     3. ЖИВАЯ ЛЕНТА ЗВОНКОВ (инлайн-секция)
  --------------------------------------------------------------- */
  const catNames = [
    "Мурзик К.", "Барсик Т.", "Кекс Дью", "Снежок Уолл-стрит", "Персик V.",
    "Тигра McBuy", "Рыжик Alpha", "Соня Ливень", "Феликс Munn", "Симба Rekt",
    "Луна Пампов", "Васька Trader", "Жора Fomo", "Клякса Chart", "Босс Кот",
    "Пуффи Degen", "Кузя Signal", "Мася Bullrun"
  ];
  const actions = [
    { type:"buy", verbs:["купил","закупился","затарился","взял ещё"] },
    { type:"sell", verbs:["продал","зафиксировал","слился"] }
  ];

  function randomAmount(){
    const v = (Math.random() * 4.8 + 0.2);
    return v.toFixed(2) + " SOL";
  }

  function makeCallLine(){
    const cat = catNames[Math.floor(Math.random() * catNames.length)];
    const act = actions[Math.random() < 0.78 ? 0 : 1]; // BUY чаще, чем SELL — вайб бычьего офиса
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
    statWaterEl.textContent = (callsCount * 0.3).toFixed(1) + " л";

    return act.type;
  }

  for(let i=0;i<8;i++) pushCallLine();
  setInterval(pushCallLine, 1400);

  /* ---------------------------------------------------------------
     4. ВСПЛЫВАЮЩИЕ TOAST-УВЕДОМЛЕНИЯ О СДЕЛКАХ (угол экрана)
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
        <span class="toast-sub">${amt} · только что · alpha call 🐱</span>
      </span>
    `;
    toastStack.appendChild(toast);
    setTimeout(() => toast.remove(), 5100);

    // редкие "крупные" сделки — вспышка + тряска экрана + звук кассы
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
     5. BUY-КНОПКА: большой отклик (звук + вспышка)
  --------------------------------------------------------------- */
  document.querySelector(".btn-buy").addEventListener("click", () => {
    getCtx();
    playCashBlip();
    if(!soundOn){
      soundOn = true;
      soundBtn.setAttribute("aria-pressed", "true");
      soundBtn.querySelector(".sound-icon").textContent = "🔊";
      soundBtn.querySelector(".sound-label").textContent = "ОТДЕЛ ПРОДАЖ ГРЕМИТ";
      startOfficeLoop();
    }
    heroFlash.classList.add("flash");
    setTimeout(() => heroFlash.classList.remove("flash"), 520);
  });

  /* ---------------------------------------------------------------
     6. ЖИВАЯ (демо) ЦЕНА SOL НА ПАНЕЛИ — лёгкое дрожание числа
  --------------------------------------------------------------- */
  const statPrice = document.getElementById("statPrice");
  let basePrice = 259.98;
  setInterval(() => {
    basePrice += (Math.random() - 0.5) * 1.4;
    statPrice.textContent = "$" + basePrice.toFixed(2);
  }, 2200);

})();
