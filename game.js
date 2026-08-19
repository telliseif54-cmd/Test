const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const startBtn = document.getElementById('startBtn');
const message = document.getElementById('message');

let player, blocks, score, lives, running, lastTime, spawnTimer, keys;
const W = canvas.width, H = canvas.height;

function reset() {
  player = { x: W / 2 - 24, y: H - 58, w: 48, h: 28, speed: 360 };
  blocks = [];
  score = 0;
  lives = 3;
  spawnTimer = 0;
  lastTime = performance.now();
  keys = {};
  updateHud();
}

function updateHud() {
  scoreEl.textContent = Math.floor(score);
  livesEl.textContent = lives;
}

function spawn() {
  const size = 22 + Math.random() * 28;
  blocks.push({ x: Math.random() * (W - size), y: -size, w: size, h: size, speed: 150 + Math.random() * 120 + score * 0.7 });
}

function hit(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0d1120';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#161d35';
  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  ctx.fillStyle = '#7cf7d4';
  ctx.shadowColor = '#7cf7d4'; ctx.shadowBlur = 18;
  ctx.fillRect(player.x, player.y, player.w, player.h);
  ctx.shadowBlur = 0;

  blocks.forEach(b => {
    ctx.fillStyle = '#ff5c7a';
    ctx.shadowColor = '#ff5c7a'; ctx.shadowBlur = 15;
    ctx.fillRect(b.x, b.y, b.w, b.h);
  });
  ctx.shadowBlur = 0;
}

function endGame() {
  running = false;
  startBtn.textContent = 'Rejouer';
  message.textContent = `Game over — score : ${Math.floor(score)}`;
}

function loop(now) {
  if (!running) return;
  const dt = Math.min((now - lastTime) / 1000, 0.033);
  lastTime = now;
  score += dt * 10;

  if (keys.ArrowLeft || keys.a || keys.A) player.x -= player.speed * dt;
  if (keys.ArrowRight || keys.d || keys.D) player.x += player.speed * dt;
  player.x = Math.max(0, Math.min(W - player.w, player.x));

  spawnTimer -= dt;
  if (spawnTimer <= 0) { spawn(); spawnTimer = Math.max(0.22, 0.7 - score / 500); }

  for (let i = blocks.length - 1; i >= 0; i--) {
    const b = blocks[i];
    b.y += b.speed * dt;
    if (hit(player, b)) {
      blocks.splice(i, 1); lives--; updateHud();
      if (lives <= 0) { endGame(); break; }
    } else if (b.y > H + b.h) blocks.splice(i, 1);
  }

  updateHud(); draw();
  requestAnimationFrame(loop);
}

startBtn.addEventListener('click', () => {
  reset(); running = true; startBtn.textContent = 'Recommencer'; message.textContent = 'Survis le plus longtemps possible !';
  requestAnimationFrame(loop);
});

window.addEventListener('keydown', e => { keys[e.key] = true; if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault(); });
window.addEventListener('keyup', e => { keys[e.key] = false; });

reset(); draw();
