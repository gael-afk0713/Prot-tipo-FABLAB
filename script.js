// Elementos do DOM
const startScreen = document.getElementById('startScreen');
const rulesScreen = document.getElementById('rulesScreen');
const gameContainer = document.getElementById('gameContainer');
const playButton = document.getElementById('playButton');
const rulesButton = document.getElementById('rulesButton');
const backButton = document.getElementById('backButton');
const gameCanvas = document.getElementById('gameCanvas');
const bgCanvas = document.getElementById('bgCanvas');
const bgCanvas2 = document.getElementById('bgCanvas2');

const ctx = gameCanvas ? gameCanvas.getContext('2d') : null;
const bgCtx = bgCanvas ? bgCanvas.getContext('2d') : null;
const bgCtx2 = bgCanvas2 ? bgCanvas2.getContext('2d') : null;

// Configuração do canvas do jogo
function resizeGameCanvas() {
  if (gameCanvas) {
    gameCanvas.width = window.innerWidth;
    gameCanvas.height = window.innerHeight;
  }
}

// Configuração do canvas de fundo
function resizeBackgroundCanvas() {
  if (bgCanvas) {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  }
  if (bgCanvas2) {
    bgCanvas2.width = window.innerWidth;
    bgCanvas2.height = window.innerHeight;
  }
}

window.addEventListener('resize', () => {
  resizeGameCanvas();
  resizeBackgroundCanvas();
});

resizeGameCanvas();
resizeBackgroundCanvas();

// Partículas para o fundo
class Particle {
  constructor(x, y, canvas) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 3 + 1;
    this.speedX = (Math.random() - 0.5) * 2;
    this.speedY = (Math.random() - 0.5) * 2;
    this.opacity = Math.random() * 0.5 + 0.2;
    this.canvas = canvas;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.opacity -= 0.005;

    if (this.x > this.canvas.width) this.x = 0;
    if (this.x < 0) this.x = this.canvas.width;
    if (this.y > this.canvas.height) this.y = 0;
    if (this.y < 0) this.y = this.canvas.height;
  }

  draw(ctx) {
    ctx.fillStyle = `rgba(0, 255, 136, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

let particles = [];
let particles2 = [];

function initParticles() {
  particles = [];
  if (bgCanvas) {
    for (let i = 0; i < 60; i++) {
      particles.push(
        new Particle(
          Math.random() * bgCanvas.width,
          Math.random() * bgCanvas.height,
          bgCanvas
        )
      );
    }
  }
}

function initParticles2() {
  particles2 = [];
  if (bgCanvas2) {
    for (let i = 0; i < 60; i++) {
      particles2.push(
        new Particle(
          Math.random() * bgCanvas2.width,
          Math.random() * bgCanvas2.height,
          bgCanvas2
        )
      );
    }
  }
}

// Desenhar fundo
function drawBackground() {
  if (!bgCtx || !bgCanvas) return;

  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

  // Desenhar grid
  bgCtx.strokeStyle = 'rgba(0, 255, 136, 0.1)';
  bgCtx.lineWidth = 1;

  for (let i = 0; i < bgCanvas.width; i += 50) {
    bgCtx.beginPath();
    bgCtx.moveTo(i, 0);
    bgCtx.lineTo(i, bgCanvas.height);
    bgCtx.stroke();
  }

  for (let i = 0; i < bgCanvas.height; i += 50) {
    bgCtx.beginPath();
    bgCtx.moveTo(0, i);
    bgCtx.lineTo(bgCanvas.width, i);
    bgCtx.stroke();
  }

  // Atualizar e desenhar partículas
  particles.forEach((particle) => {
    particle.update();
    particle.draw(bgCtx);
  });
}

function drawBackground2() {
  if (!bgCtx2 || !bgCanvas2) return;

  bgCtx2.clearRect(0, 0, bgCanvas2.width, bgCanvas2.height);

  // Desenhar grid
  bgCtx2.strokeStyle = 'rgba(0, 255, 136, 0.1)';
  bgCtx2.lineWidth = 1;

  for (let i = 0; i < bgCanvas2.width; i += 50) {
    bgCtx2.beginPath();
    bgCtx2.moveTo(i, 0);
    bgCtx2.lineTo(i, bgCanvas2.height);
    bgCtx2.stroke();
  }

  for (let i = 0; i < bgCanvas2.height; i += 50) {
    bgCtx2.beginPath();
    bgCtx2.moveTo(0, i);
    bgCtx2.lineTo(bgCanvas2.width, i);
    bgCtx2.stroke();
  }

  // Atualizar e desenhar partículas
  particles2.forEach((particle) => {
    particle.update();
    particle.draw(bgCtx2);
  });
}

// Navegação entre telas
playButton.addEventListener('click', () => {
  startScreen.classList.remove('active');
  gameContainer.classList.add('active');
  startGame();
});

rulesButton.addEventListener('click', () => {
  startScreen.classList.remove('active');
  rulesScreen.classList.add('active');
  initParticles2();
  animateBackground2();
});

backButton.addEventListener('click', () => {
  rulesScreen.classList.remove('active');
  startScreen.classList.add('active');
});

// Constantes do jogo
const GAME_STATES = {
  MENU: 'menu',
  PHASE1: 'phase1',
  TRANSITION: 'transition',
  PHASE2: 'phase2',
  END: 'end'
};

let gameState = GAME_STATES.MENU;

// Dados do jogo - Fase 1 (Empresário)
const phase1 = {
  money: 100,
  income: 0,
  pollution: 0,
  pollutionGoal: 100,
  targetMoney: 5000,
  structures: [],
  buildingTypes: [
    { name: 'Fábrica', cost: 100, income: 10, pollution: 5 },
    { name: 'Usina', cost: 300, income: 35, pollution: 18 },
    { name: 'Complexo Industrial', cost: 800, income: 100, pollution: 55 }
  ]
};

// Dados do jogo - Fase 2 (Guardião)
const phase2 = {
  worldWidth: 3600,
  camera: 0,
  player: {
    x: 150,
    y: 300,
    width: 34,
    height: 48,
    vx: 0,
    vy: 0,
    speed: 260,
    jumpPower: 620,
    grounded: false,
    health: 3,
    facing: 1,
    attackTimer: 0,
    invincible: 0
  },
  gravity: 1500,
  kills: 0,
  cleaned: 0,
  power: 1,
  parasites: [],
  zones: [],
  platforms: []
};

// Sistema de controles
const keys = {
  left: false,
  right: false,
  jump: false,
  attack: false,
  clean: false
};

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();

  if (key === 'a' || key === 'arrowleft') keys.left = true;
  if (key === 'd' || key === 'arrowright') keys.right = true;
  if ((key === 'w' || key === 'arrowup' || key === ' ') && !event.repeat)
    keys.jump = true;
  if (key === 'j' && !event.repeat) keys.attack = true;
  if (key === 'e' && !event.repeat) keys.clean = true;
});

window.addEventListener('keyup', (event) => {
  const key = event.key.toLowerCase();

  if (key === 'a' || key === 'arrowleft') keys.left = false;
  if (key === 'd' || key === 'arrowright') keys.right = false;
});

// Funções de desenho - Fase 1
function drawPhase1() {
  if (!ctx) return;

  const pollutionLevel = Math.min(1, phase1.pollution / 250);

  // Céu com gradiente
  const skyGradient = ctx.createLinearGradient(0, 0, 0, gameCanvas.height);
  const skyR = Math.floor(75 - pollutionLevel * 55);
  const skyG = Math.floor(150 - pollutionLevel * 100);
  const skyB = Math.floor(210 - pollutionLevel * 100);

  skyGradient.addColorStop(0, `rgb(${skyR},${skyG},${skyB})`);
  skyGradient.addColorStop(
    1,
    `rgb(${20 - pollutionLevel * 10},${60 - pollutionLevel * 35},${
      35 - pollutionLevel * 20
    })`
  );

  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

  // Árvores
  if (pollutionLevel < 0.7) {
    for (let i = 0; i < 16; i++) {
      const x = i * 100 + 20;

      ctx.fillStyle = '#5b3c25';
      ctx.fillRect(x, gameCanvas.height - 160, 12, 80);

      ctx.fillStyle = '#438a4c';
      ctx.beginPath();
      ctx.arc(x + 6, gameCanvas.height - 170, 38, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Chão
  ctx.fillStyle = '#263a29';
  ctx.fillRect(0, gameCanvas.height - 80, gameCanvas.width, 80);

  // Estruturas
  phase1.structures.forEach((structure, index) => {
    const x = 330 + (index % 8) * 100;
    const row = Math.floor(index / 8);
    const y = gameCanvas.height - 80 - 100 - row * 80;
    const type = phase1.buildingTypes[structure.type];

    if (structure.type === 0) {
      ctx.fillStyle = '#73777c';
      ctx.fillRect(x, y, 65, 100);
      ctx.fillStyle = '#30343a';
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(x + 8 + i * 18, y + 20, 12, 12);
      }
    }

    if (structure.type === 1) {
      ctx.fillStyle = '#555b62';
      ctx.fillRect(x, y + 25, 65, 75);
      ctx.fillStyle = '#30343a';
      ctx.fillRect(x + 20, y - 20, 22, 50);
    }

    if (structure.type === 2) {
      ctx.fillStyle = '#41464c';
      ctx.fillRect(x, y, 90, 100);
      ctx.fillStyle = '#24282c';
      ctx.fillRect(x + 15, y - 40, 25, 50);
      ctx.fillRect(x + 52, y - 55, 25, 65);
    }
  });

  // Fumaça
  for (let i = 0; i < phase1.structures.length; i++) {
    const x = 350 + (i % 8) * 100;
    const y = gameCanvas.height - 220 - Math.floor(i / 8) * 80;

    ctx.fillStyle = `rgba(30,30,35,${0.15 + pollutionLevel * 0.35})`;
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.arc(x + 25, y - 18, 28, 0, Math.PI * 2);
    ctx.arc(x + 55, y - 5, 24, 0, Math.PI * 2);
    ctx.fill();
  }

  // Poluição global (overlay)
  if (pollutionLevel > 0.25) {
    ctx.fillStyle = `rgba(30,30,35,${pollutionLevel * 0.35})`;
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
  }

  // HUD da Fase 1
  drawPhase1HUD();
}

// HUD da Fase 1
function drawPhase1HUD() {
  if (!ctx) return;

  const padding = 20;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(padding, padding, 320, 160);

  ctx.strokeStyle = 'rgba(0, 255, 136, 0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(padding, padding, 320, 160);

  ctx.fillStyle = '#00ff88';
  ctx.font = 'bold 18px Arial';
  ctx.fillText('O Empresário', padding + 15, padding + 30);

  ctx.fillStyle = '#ffffff';
  ctx.font = '14px Arial';
  ctx.fillText(`💰 R$ ${Math.floor(phase1.money)}`, padding + 15, padding + 55);
  ctx.fillText(`📈 R$ ${Math.floor(phase1.income)}/s`, padding + 15, padding + 80);
  ctx.fillText(`☠️ Poluição: ${Math.floor(phase1.pollution)}`, padding + 15, padding + 105);
  ctx.fillText(`🎯 Objetivo: R$ ${phase1.targetMoney}`, padding + 15, padding + 130);

  // Instruções
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '12px Arial';
  ctx.fillText('Clique nos botões para construir', padding + 15, gameCanvas.height - 20);
}

// Funções de atualização - Fase 1
function updatePhase1(dt) {
  phase1.money += phase1.income * dt;

  if (phase1.money >= phase1.targetMoney) {
    phase1.money = phase1.targetMoney;
    gameState = GAME_STATES.TRANSITION;
  }
}

// Função para construir estrutura
function buildStructure(typeIndex) {
  const type = phase1.buildingTypes[typeIndex];

  if (phase1.money >= type.cost) {
    phase1.money -= type.cost;
    phase1.income += type.income;
    phase1.pollution += type.pollution;
    phase1.structures.push({ type: typeIndex });
  }
}

// Função para iniciar o jogo
function startGame() {
  gameState = GAME_STATES.PHASE1;
  phase1.money = 100;
  phase1.income = 0;
  phase1.pollution = 0;
  phase1.structures = [];

  // Criar botões de construção na tela
  createBuildingButtons();

  gameLoop();
}

// Criar botões de construção
function createBuildingButtons() {
  // Limpar botões anteriores se existirem
  const existingButtons = document.querySelectorAll('.building-btn');
  existingButtons.forEach((btn) => btn.remove());

  // Criar container para botões
  let buttonContainer = document.getElementById('buttonContainer');
  if (!buttonContainer) {
    buttonContainer = document.createElement('div');
    buttonContainer.id = 'buttonContainer';
    buttonContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 15px;
      z-index: 50;
      flex-wrap: wrap;
      justify-content: center;
    `;
    document.body.appendChild(buttonContainer);
  }

  phase1.buildingTypes.forEach((type, index) => {
    const btn = document.createElement('button');
    btn.className = 'building-btn';
    btn.innerHTML = `<strong>${type.name}</strong><br>R$ ${type.cost}`;
    btn.style.cssText = `
      padding: 12px 20px;
      background: linear-gradient(135deg, #00ff88 0%, #00cc88 100%);
      color: #000;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
      font-size: 12px;
      width: 140px;
      transition: all 0.3s ease;
      box-shadow: 0 5px 20px rgba(0, 255, 136, 0.4);
    `;

    btn.addEventListener('mouseover', () => {
      btn.style.transform = 'translateY(-5px)';
      btn.style.boxShadow = '0 10px 30px rgba(0, 255, 136, 0.8)';
    });

    btn.addEventListener('mouseout', () => {
      btn.style.transform = 'translateY(0)';
      btn.style.boxShadow = '0 5px 20px rgba(0, 255, 136, 0.4)';
    });

    btn.addEventListener('click', () => {
      buildStructure(index);
    });

    buttonContainer.appendChild(btn);
  });
}

// Loop de animação do fundo
function animateBackground() {
  drawBackground();
  requestAnimationFrame(animateBackground);
}

function animateBackground2() {
  drawBackground2();
  requestAnimationFrame(animateBackground2);
}

// Loop principal do jogo
let lastTime = 0;

function gameLoop(time) {
  const dt = Math.min(0.033, (time - lastTime) / 1000 || 0);
  lastTime = time;

  if (gameState === GAME_STATES.PHASE1) {
    updatePhase1(dt);
    drawPhase1();
  }

  requestAnimationFrame(gameLoop);
}

// Iniciar animação de fundo na tela inicial
initParticles();
animateBackground();
