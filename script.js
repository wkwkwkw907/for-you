(function() {
  // Konfigurasi File Audio
  const CONFIG = {
    audioNo: "tidak.mp3",
    audioYes: "iya.mp3",
    musicBg: "lagu.mp3"
  };

  const sfxNo = new Audio(CONFIG.audioNo);
  const sfxYes = new Audio(CONFIG.audioYes);
  const bgm = new Audio(CONFIG.musicBg);

  bgm.loop = true;
  bgm.volume = 0.6;
  sfxYes.volume = 0.8;
  sfxNo.volume = 0.4;

  // --- Particle System ---
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  let DPR = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    canvas.width = window.innerWidth * DPR;
    canvas.height = window.innerHeight * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  const heartSprites = {};
  const colors = ['#ff9db3', '#ffc9d6', '#ffd27f', '#e2c07d', '#ff6b95'];

  function initSprites() {
    colors.forEach(c => {
      const s = document.createElement('canvas');
      s.width = 60; s.height = 60;
      const x = s.getContext('2d');
      x.translate(30, 30);
      x.beginPath();
      x.moveTo(0, 15);
      x.bezierCurveTo(-30, -15, -30, 25, 0, 30);
      x.bezierCurveTo(30, 25, 30, -15, 0, 15);
      x.fillStyle = c;
      x.shadowColor = c;
      x.shadowBlur = 10;
      x.fill();
      heartSprites[c] = s;
    });
  }
  initSprites();

  let particles = [];
  function spawn() {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + 50,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -(0.5 + Math.random()),
      size: 10 + Math.random() * 15,
      life: 1,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }

  function burst(x, y) {
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4;
      particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 8 + Math.random() * 10,
        life: 1,
        decay: 0.01 + Math.random() * 0.02,
        gravity: 0.05,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: 'burst'
      });
    }
  }

  let last = performance.now();
  function animate(now) {
    if (now - last > 200) { spawn(); last = now; }
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (let i = particles.length - 1; i >= 0; i--) {
      let p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.type === 'burst') {
        p.vy += p.gravity;
        p.life -= p.decay;
      } else {
        p.life -= 0.002;
      }
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(0, p.life);
      if (heartSprites[p.color]) {
        const s = p.size;
        ctx.drawImage(heartSprites[p.color], p.x - s / 2, p.y - s / 2, s, s);
      }
    }
    requestAnimationFrame(animate);
  }
  animate(performance.now());

  // --- UI Logic ---
  const yesBtn = document.getElementById('yes');
  const noBtn = document.getElementById('no');
  const poem = document.getElementById('poem');
  const closePoem = document.getElementById('closePoem');
  const controls = document.getElementById('controls');
  const lyricEl = document.getElementById('lyricText');

  // Bungkus teks ke dalam span untuk efek reveal
  const rawLines = lyricEl.innerHTML.split('<br>');
  lyricEl.innerHTML = rawLines.map(line => `<span>${line}</span>`).join('');

  // Tombol "Tidak" menghindar
  noBtn.addEventListener('mouseover', moveButton);
  noBtn.addEventListener('click', moveButton);

  function moveButton(e) {
    e.stopPropagation();
    sfxNo.currentTime = 0;
    sfxNo.play().catch(() => {});
    const rect = controls.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();
    
    if (noBtn.style.position !== 'absolute') {
      noBtn.style.position = 'absolute';
    }
    
    const maxX = rect.width - btnRect.width;
    const maxY = rect.height - btnRect.height;
    const newX = Math.random() * maxX;
    const newY = Math.random() * maxY;
    
    noBtn.style.left = newX + "px";
    noBtn.style.top = newY + "px";
  }

  // Tombol "Ya"
  yesBtn.addEventListener('click', function() {
    sfxYes.play().catch(() => {});
    bgm.currentTime = 0;
    bgm.play().catch(err => console.log("Audio dimatikan browser:", err));
    
    const r = yesBtn.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2);
    poem.classList.add('show');

    // Animasi lirik berurutan
    const spans = lyricEl.querySelectorAll('span');
    spans.forEach((span, i) => {
      span.classList.remove('reveal');
      setTimeout(() => {
        span.classList.add('reveal');
      }, 1200 + (i * 950));
    });
  });

  // Tutup Puisi
  closePoem.addEventListener('click', function() {
    poem.classList.remove('show');
    bgm.pause();
    bgm.currentTime = 0;
  });
})();
