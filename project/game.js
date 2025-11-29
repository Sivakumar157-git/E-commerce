
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const fpsEl = document.getElementById('fps');
const startBtn = document.getElementById('startBtn');

let lastTime = 0;
let fps = 0;
let running = false;


const CONFIG = {
  gravity: 1800,        
  moveSpeed: 310,       
  jumpVelocity: -700,   
  groundHeight: 96,     
  canvasWidth: 800,
  canvasHeight: 500
};


function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * devicePixelRatio);
  canvas.height = Math.round((rect.width * (CONFIG.canvasHeight / CONFIG.canvasWidth)) * devicePixelRatio);
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();


const keys = {
  left: false, right: false, up: false
};

window.addEventListener('keydown', (e) => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
  if (e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') keys.up = true;
});
window.addEventListener('keyup', (e) => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
  if (e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') keys.up = false;
});


class Player {
  constructor(x, y, w = 48, h = 56) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.w = w;
    this.h = h;
    this.color = '#0b5';
    this.onGround = false;
  }

  update(dt) {
    
    let targetVX = 0;
    if (keys.left)  targetVX = -CONFIG.moveSpeed;
    if (keys.right) targetVX = CONFIG.moveSpeed;
   
    this.vx = targetVX;

   
    this.vy += CONFIG.gravity * dt;

    
    if (keys.up && this.onGround) {
      this.vy = CONFIG.jumpVelocity;
      this.onGround = false;
    }

    
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    
    if (this.x < 8) this.x = 8;
    if (this.x + this.w > CONFIG.canvasWidth - 8) this.x = CONFIG.canvasWidth - 8 - this.w;
  }

  draw(ctx) {
    
    ctx.fillStyle = this.color;
    roundRect(ctx, this.x, this.y, this.w, this.h, 8);
    ctx.fill();

    
    ctx.fillStyle = '#083';
    ctx.fillRect(this.x + this.w*0.6, this.y + this.h*0.25, 6, 6);
  }
}

class Game {
  constructor() {
    this.player = new Player(80, 300);
    this.lastUpdate = performance.now();
    this.groundY = CONFIG.canvasHeight - CONFIG.groundHeight;
  }

  reset() {
    this.player.x = 80;
    this.player.y = 300;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.onGround = false;
  }

  update(dt) {
   
    this.player.update(dt);

    
    const p = this.player;
    const groundY = this.groundY - p.h;
    if (p.y > groundY) {
      p.y = groundY;
      p.vy = 0;
      p.onGround = true;
    } else {
      p.onGround = false;
    }
  }

  draw(ctx) {
    
    ctx.clearRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);

    
    const sky = ctx.createLinearGradient(0,0,0,CONFIG.canvasHeight);
    sky.addColorStop(0, '#9be7ff');
    sky.addColorStop(1, '#d9f7ff');
    ctx.fillStyle = sky;
    ctx.fillRect(0,0,CONFIG.canvasWidth, CONFIG.canvasHeight);

  
    drawHills(ctx, CONFIG.canvasWidth, CONFIG.canvasHeight);

    
    ctx.fillStyle = '#576b4f';
    ctx.fillRect(0, this.groundY, CONFIG.canvasWidth, CONFIG.groundHeight);

    
    this.player.draw(ctx);

    
    ctx.fillStyle = '#033';
    ctx.font = '14px system-ui, Arial';
    ctx.fillText('Score: 0', 12, 22);
  }
}


function roundRect(ctx, x, y, w, h, r=6) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawHills(ctx, w, h) {
  ctx.save();
 
  ctx.fillStyle = '#8ec6a7';
  ctx.beginPath();
  ctx.ellipse(w*0.2, h*0.7, 250, 80, 0, 0, Math.PI*2);
  ctx.ellipse(w*0.7, h*0.75, 320, 100, 0, 0, Math.PI*2);
  ctx.fill();

  
  ctx.fillStyle = '#6aa36f';
  ctx.beginPath();
  ctx.ellipse(w*0.5, h*0.85, 520, 140, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}

const game = new Game();

function gameLoop(ts) {
  if (!running) return;
  const dt = Math.min((ts - lastTime) / 1000, 0.033); // cap dt to avoid big jumps
  lastTime = ts;

  game.update(dt);
  game.draw(ctx);

  // fps
  fps = Math.round(1 / dt);
  fpsEl.textContent = FPS: ${fps};

  requestAnimationFrame(gameLoop);
}

startBtn.addEventListener('click', () => {
  if (!running) {
    
    fitDrawingToVisibleCanvas();
    running = true;
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
    startBtn.textContent = 'Running...';
  } else {
    running = false;
    startBtn.textContent = 'Start';
  }
});


function fitDrawingToVisibleCanvas() {
  
  const displayRect = canvas.getBoundingClientRect();
  const scaleX = displayRect.width / CONFIG.canvasWidth;
  const scaleY = (displayRect.width * (CONFIG.canvasHeight / CONFIG.canvasWidth)) / CONFIG.canvasHeight;
  
  canvas.style.height = ${(displayRect.width * (CONFIG.canvasHeight / CONFIG.canvasWidth))}px;
  
}

/* --- initialization --- */
(function init() {
 
  canvas.width = CONFIG.canvasWidth;
  canvas.height = CONFIG.canvasHeight;
  canvas.style.maxWidth = '900px';
  canvas.style.width = '100%';
  canvas.style.background = 'transparent';
  game.reset();
  
})();