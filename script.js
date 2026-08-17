// Elementos do DOM
const startScreen = document.getElementById('startScreen');
const rulesScreen = document.getElementById('rulesScreen');
const gameContainer = document.getElementById('gameContainer');
const playButton = document.getElementById('playButton');
const rulesButton = document.getElementById('rulesButton');
const backButton = document.getElementById('backButton');
const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');

// Configuração do canvas
function resizeCanvas() {
  gameCanvas.width = window.innerWidth;
  gameCanvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Navegação entre telas
playButton.addEventListener('click', () => {
  startScreen.classList.remove('active');
  gameContainer.classList.add('active');
  startGame();
});

rulesButton.addEventListener('click', () => {
  startScreen.classList.remove('active');
  rulesScreen.classList.add('active');
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
  if ((key === 'w' || key === 'arrowup' || key === ' ') && !event.repeat) keys.jump = true;
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
  const pollutionLevel = Math.min(1, phase1.pollution / 250);
  
  // Céu com gradiente
  const skyGradient = ctx.createLinearGradient(0, 0, 0, gameCanvas.height);
  const skyR = Math.floor(75 - pollutionLevel * 55);
  const skyG = Math.floor(150 - pollutionLevel * 100);
  const skyB = Math.floor(210 - pollutionLevel * 100);
  
  skyGradient.addColorStop(0, `rgb(${skyR},${skyG},${skyB})`);
  skyGradient.addColorStop(1, `rgb(${20 - pollutionLevel * 10},${60 - pollutionLevel * 35},${35 - pollutionLevel * 20})`);
  
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
  const padding = 20;
  const lineHeight = 25;
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(padding, padding, 300, 150);
  
  ctx.fillStyle = '#64c896';
  ctx.font = 'bold 16px Arial';
  ctx.fillText('O Empresário', padding + 10, padding + 25);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = '14px Arial';
  ctx.fillText(`Dinheiro: R$ ${Math.floor(phase1.money)}`, padding + 10, padding + 50);
  ctx.fillText(`Renda/s: R$ ${Math.floor(phase1.income)}`, padding + 10, padding + 75);
  ctx.fillText(`Poluição: ${Math.floor(phase1.pollution)}`, padding + 10, padding + 100);
  ctx.fillText(`Objetivo: R$ ${phase1.targetMoney}`, padding + 10, padding + 125);
  
  // Instruções
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '12px Arial';
  ctx.fillText('Clique nos botões para construir', padding + 10, gameCanvas.height - 20);
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
  existingButtons.forEach(btn => btn.remove());
  
  // Criar container para botões
  let buttonContainer = document.getElementById('buttonContainer');
  if (!buttonContainer) {
    buttonContainer = document.createElement('div');
    buttonContainer.id = 'buttonContainer';
    buttonContainer.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 10px;
      z-index: 50;
    `;
    document.body.appendChild(buttonContainer);
  }
  
  phase1.buildingTypes.forEach((type, index) => {
    const btn = document.createElement('button');
    btn.className = 'building-btn';
    btn.innerHTML = `${type.name}<br>R$ ${type.cost}`;
    btn.style.cssText = `
      padding: 10px 15px;
      background: #64c896;
      color: #0a1128;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
      font-size: 12px;
      width: 120px;
      transition: all 0.3s ease;
    `;
    
    btn.addEventListener('mouseover', () => {
      btn.style.transform = 'scale(1.05)';
    });
    
    btn.addEventListener('mouseout', () => {
      btn.style.transform = 'scale(1)';
    });
    
    btn.addEventListener('click', () => {
      buildStructure(index);
    });
    
    buttonContainer.appendChild(btn);
  });
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
