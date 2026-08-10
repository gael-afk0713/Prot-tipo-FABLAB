const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let width = 0;
let height = 0;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();

/* =========================================================
   ESTADOS DO JOGO
========================================================= */

const STATE = {
  MENU: "menu",
  BUSINESS: "business",
  TRANSITION: "transition",
  PLATFORM: "platform",
  END: "end"
};

let state = STATE.MENU;


/* =========================================================
   FASE 1 — O EMPRESÁRIO
========================================================= */

const business = {
  money: 100,
  income: 0,
  pollution: 0,
  goal: 5000,
  structures: [],

  types: [
    {
      name: "Fábrica",
      cost: 100,
      income: 10,
      pollution: 5
    },

    {
      name: "Usina",
      cost: 300,
      income: 35,
      pollution: 18
    },

    {
      name: "Complexo Industrial",
      cost: 800,
      income: 100,
      pollution: 55
    }
  ]
};


const buildButtons =
  document.getElementById("buildButtons");


function createBuildButtons() {

  buildButtons.innerHTML = "";

  business.types.forEach((type, index) => {

    const button = document.createElement("button");

    button.className = "build";

    button.innerHTML = `
      <span>
        <b>${type.name}</b>
        <small>
          +R$ ${type.income}/s · +${type.pollution} poluição
        </small>
      </span>

      <strong>
        R$ ${type.cost}
      </strong>
    `;

    button.onclick = () => {
      buildStructure(index);
    };

    buildButtons.appendChild(button);
  });
}


function buildStructure(index) {

  const type = business.types[index];

  if (business.money < type.cost) {
    return;
  }

  business.money -= type.cost;

  business.income += type.income;

  business.pollution += type.pollution;

  business.structures.push({
    type: index,
    x: 350 + business.structures.length * 90
  });

  updateBusinessHUD();
}


function updateBusinessHUD() {

  document.getElementById("money").textContent =
    "R$ " + Math.floor(business.money);

  document.getElementById("income").textContent =
    "R$ " + Math.floor(business.income);

  document.getElementById("pollution").textContent =
    Math.floor(business.pollution);
}


function updateBusiness(dt) {

  business.money += business.income * dt;

  updateBusinessHUD();

  if (business.money >= business.goal) {

    business.money = business.goal;

    startTransition();
  }
}


/* =========================================================
   DESENHO DA FASE DO EMPRESÁRIO
========================================================= */

function drawBusiness() {

  const pollutionLevel =
    Math.min(1, business.pollution / 250);

  const skyR =
    Math.floor(75 - pollutionLevel * 55);

  const skyG =
    Math.floor(150 - pollutionLevel * 100);

  const skyB =
    Math.floor(210 - pollutionLevel * 100);

  const gradient =
    ctx.createLinearGradient(0, 0, 0, height);

  gradient.addColorStop(
    0,
    `rgb(${skyR},${skyG},${skyB})`
  );

  gradient.addColorStop(
    1,
    `rgb(
      ${20 - pollutionLevel * 10},
      ${60 - pollutionLevel * 35},
      ${35 - pollutionLevel * 20}
    )`
  );

  ctx.fillStyle = gradient;

  ctx.fillRect(
    0,
    0,
    width,
    height
  );


  /* Árvores */

  if (pollutionLevel < 0.7) {

    for (let i = 0; i < 16; i++) {

      const x = i * 100 + 20;

      ctx.fillStyle = "#5b3c25";

      ctx.fillRect(
        x,
        height - 160,
        12,
        80
      );

      ctx.fillStyle = "#438a4c";

      ctx.beginPath();

      ctx.arc(
        x + 6,
        height - 170,
        38,
        0,
        Math.PI * 2
      );

      ctx.fill();
    }
  }


  /* Chão */

  ctx.fillStyle = "#263a29";

  ctx.fillRect(
    0,
    height - 80,
    width,
    80
  );


  /* Estruturas */

  business.structures.forEach((structure, index) => {

    const x =
      330 +
      (index % 8) * 100;

    const row =
      Math.floor(index / 8);

    const y =
      height - 80 -
      100 -
      row * 80;


    /* Fábrica */

    if (structure.type === 0) {

      ctx.fillStyle = "#73777c";

      ctx.fillRect(
        x,
        y,
        65,
        100
      );

      ctx.fillStyle = "#30343a";

      for (let i = 0; i < 3; i++) {

        ctx.fillRect(
          x + 8 + i * 18,
          y + 20,
          12,
          12
        );
      }
    }


    /* Usina */

    if (structure.type === 1) {

      ctx.fillStyle = "#555b62";

      ctx.fillRect(
        x,
        y + 25,
        65,
        75
      );

      ctx.fillStyle = "#30343a";

      ctx.fillRect(
        x + 20,
        y - 20,
        22,
        50
      );
    }


    /* Complexo industrial */

    if (structure.type === 2) {

      ctx.fillStyle = "#41464c";

      ctx.fillRect(
        x,
        y,
        90,
        100
      );

      ctx.fillStyle = "#24282c";

      ctx.fillRect(
        x + 15,
        y - 40,
        25,
        50
      );

      ctx.fillRect(
        x + 52,
        y - 55,
        25,
        65
      );
    }

  });


  /* Fumaça */

  for (
    let i = 0;
    i < business.structures.length;
    i++
  ) {

    const x =
      350 +
      (i % 8) * 100;

    const y =
      height -
      220 -
      Math.floor(i / 8) * 80;

    ctx.fillStyle =
      `rgba(
        30,
        30,
        35,
        ${0.15 + pollutionLevel * 0.35}
      )`;

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      22,
      0,
      Math.PI * 2
    );

    ctx.arc(
      x + 25,
      y - 18,
      28,
      0,
      Math.PI * 2
    );

    ctx.arc(
      x + 55,
      y - 5,
      24,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }


  /* Poluição global */

  if (pollutionLevel > 0.25) {

    ctx.fillStyle =
      `rgba(
        30,
        30,
        35,
        ${pollutionLevel * 0.35}
      )`;

    ctx.fillRect(
      0,
      0,
      width,
      height
    );
  }
}


/* =========================================================
   TRANSIÇÃO
========================================================= */

let transitionStep = 0;
let transitionTimer = 0;


function startTransition() {

  state = STATE.TRANSITION;

  transitionStep = 0;

  transitionTimer = 0;

  document
    .getElementById("phase1HUD")
    .classList.add("hidden");

  document
    .getElementById("transition")
    .classList.remove("hidden");
}


function updateTransition(dt) {

  transitionTimer += dt;

  if (transitionTimer > 3) {

    transitionTimer = 0;

    transitionStep++;
  }


  if (transitionStep === 0) {

    document
      .getElementById("transitionTitle")
      .textContent =
      "Você construiu um império.";

    document
      .getElementById("transitionText")
      .textContent =
      "Sua empresa alcançou tudo o que você queria.";
  }


  if (transitionStep === 1) {

    document
      .getElementById("transitionTitle")
      .textContent =
      "Mas o mundo pagou o preço.";

    document
      .getElementById("transitionText")
      .textContent =
      "A natureza foi destruída pela busca desenfreada por lucro.";
  }


  if (transitionStep === 2) {

    document
      .getElementById("transitionTitle")
      .textContent =
      "A poluição ganhou vida.";

    document
      .getElementById("transitionText")
      .textContent =
      "A contaminação acumulada deu origem aos Parasitas de Poluição.";
  }


  if (transitionStep === 3) {

    document
      .getElementById("transitionTitle")
      .textContent =
      "O Guardião despertou.";

    document
      .getElementById("transitionText")
      .textContent =
      "Agora você precisa recuperar o mundo que destruiu.";
  }


  if (transitionStep >= 4) {

    document
      .getElementById("transition")
      .classList.add("hidden");

    state = STATE.PLATFORM;

    resetPlatform();

    document
      .getElementById("phase2HUD")
      .classList.remove("hidden");
  }
}


/* =========================================================
   FASE 2 — PLATAFORMA
========================================================= */

const platform = {

  worldWidth: 3600,

  camera: 0,

  player: {

    x: 120,
    y: 300,

    width: 34,
    height: 48,

    vx: 0,
    vy: 0,

    speed: 260,

    jump: 620,

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

  zones: []
};


/* =========================================================
   RESET DA FASE 2
========================================================= */

function resetPlatform() {

  platform.player.x = 120;
  platform.player.y = 250;

  platform.player.vx = 0;
  platform.player.vy = 0;

  platform.player.health = 3;

  platform.player.attackTimer = 0;

  platform.player.invincible = 0;

  platform.kills = 0;

  platform.cleaned = 0;

  platform.power = 1;

  platform.camera = 0;

  platform.parasites = [];

  platform.zones = [

    {
      x: 650,
      width: 300,
      cleaned: false
    },

    {
      x: 1500,
      width: 320,
      cleaned: false
    },

    {
      x: 2550,
      width: 350,
      cleaned: false
    }

  ];


  for (let i = 0; i < 9; i++) {

    platform.parasites.push({

      x: 520 + i * 340,

      y: 420,

      width: 35,

      height: 30,

      vx: 50 + Math.random() * 30,

      alive: true
    });
  }

  updatePlatformHUD();
}


function updatePlatformHUD() {

  document
    .getElementById("health")
    .textContent =
    platform.player.health;

  document
    .getElementById("kills")
    .textContent =
    platform.kills;

  document
    .getElementById("cleaned")
    .textContent =
    `${platform.cleaned} / 3`;

  document
    .getElementById("power")
    .textContent =
    platform.power;
}


/* =========================================================
   PLATAFORMAS
========================================================= */

const platforms = [

  {
    x: 0,
    y: 500,
    width: 3600,
    height: 100
  },

  {
    x: 420,
    y: 390,
    width: 180,
    height: 25
  },

  {
    x: 900,
    y: 330,
    width: 180,
    height: 25
  },

  {
    x: 1200,
    y: 420,
    width: 220,
    height: 25
  },

  {
    x: 1750,
    y: 350,
    width: 180,
    height: 25
  },

  {
    x: 2200,
    y: 400,
    width: 220,
    height: 25
  },

  {
    x: 2800,
    y: 320,
    width: 200,
    height: 25
  }

];


/* =========================================================
   CONTROLES
========================================================= */

const keys = {

  left: false,
  right: false,

  jump: false,
  attack: false,
  clean: false
};


window.addEventListener("keydown", event => {

  const key =
    event.key.toLowerCase();


  if (
    key === "a" ||
    key === "arrowleft"
  ) {

    keys.left = true;
  }


  if (
    key === "d" ||
    key === "arrowright"
  ) {

    keys.right = true;
  }


  if (
    key === "w" ||
    key === "arrowup" ||
    key === " "
  ) {

    if (!event.repeat) {

      keys.jump = true;
    }
  }


  if (key === "j") {

    if (!event.repeat) {

      keys.attack = true;
    }
  }


  if (key === "e") {

    if (!event.repeat) {

      keys.clean = true;
    }
  }

});


window.addEventListener("keyup", event => {

  const key =
    event.key.toLowerCase();


  if (
    key === "a" ||
    key === "arrowleft"
  ) {

    keys.left = false;
  }


  if (
    key === "d" ||
    key === "arrowright"
  ) {

    keys.right = false;
  }

});


/* =========================================================
   CONTROLES TOUCH
========================================================= */

document
  .querySelectorAll(".touch-button")
  .forEach(button => {

    const key =
      button.dataset.key;


    button.addEventListener(
      "pointerdown",
      event => {

        event.preventDefault();

        if (key === "left")
          keys.left = true;

        if (key === "right")
          keys.right = true;

        if (key === "jump")
          keys.jump = true;

        if (key === "attack")
          keys.attack = true;

        if (key === "clean")
          keys.clean = true;
      }
    );


    button.addEventListener(
      "pointerup",
      event => {

        event.preventDefault();

        if (key === "left")
          keys.left = false;

        if (key === "right")
          keys.right = false;
      }
    );

  });


/* =========================================================
   COLISÃO
========================================================= */

function collision(a, b) {

  return (

    a.x < b.x + b.width &&

    a.x + a.width > b.x &&

    a.y < b.y + b.height &&

    a.y + a.height > b.y

  );
}


/* =========================================================
   ATUALIZAÇÃO DA FASE 2
========================================================= */

function updatePlatform(dt) {

  const player =
    platform.player;


  /* Movimento */

  player.vx = 0;


  if (keys.left) {

    player.vx =
      -player.speed;

    player.facing = -1;
  }


  if (keys.right) {

    player.vx =
      player.speed;

    player.facing = 1;
  }


  player.x +=
    player.vx * dt;


  /* Gravidade */

  player.vy +=
    platform.gravity * dt;

  player.y +=
    player.vy * dt;


  /* Plataformas */

  player.grounded = false;


  for (const ground of platforms) {

    if (

      player.x + player.width >
      ground.x &&

      player.x <
      ground.x + ground.width &&

      player.y + player.height >=
      ground.y &&

      player.y + player.height <=
      ground.y +
      ground.height +
      25 &&

      player.vy >= 0

    ) {

      player.y =
        ground.y -
        player.height;

      player.vy = 0;

      player.grounded = true;
    }
  }


  /* Pulo */

  if (
    keys.jump &&
    player.grounded
  ) {

    player.vy =
      -player.jump;
  }

  keys.jump = false;


  /* Ataque */

  if (keys.attack) {

    player.attackTimer =
      0.18;

    attackEnemies();
  }

  keys.attack = false;


  /* Recuperar natureza */

  if (keys.clean) {

    cleanZone();
  }

  keys.clean = false;


  if (player.attackTimer > 0) {

    player.attackTimer -= dt;
  }


  if (player.invincible > 0) {

    player.invincible -= dt;
  }


  /* Limites */

  player.x =
    Math.max(
      0,
      Math.min(
        platform.worldWidth -
        player.width,
        player.x
      )
    );


  /* Inimigos */

  updateParasites(dt);


  /* Câmera */

  const targetCamera =
    player.x -
    width * 0.35;


  platform.camera +=
    (
      targetCamera -
      platform.camera
    ) *
    Math.min(
      1,
      dt * 5
    );


  platform.camera =
    Math.max(
      0,
      Math.min(
        platform.worldWidth -
        width,
        platform.camera
      )
    );


  updatePlatformHUD();


  if (
    platform.cleaned >= 3
  ) {

    state = STATE.END;
  }
}


/* =========================================================
   ATAQUE
========================================================= */

function attackEnemies() {

  const p =
    platform.player;

  const attackRange = 65;


  const attack = {

    x:
      p.facing === 1
        ? p.x + p.width
        : p.x - attackRange,

    y:
      p.y + 10,

    width:
      attackRange,

    height:
      28
  };


  platform.parasites
    .forEach(enemy => {

      if (!enemy.alive)
        return;


      if (
        collision(
          attack,
          enemy
        )
      ) {

        enemy.alive = false;

        platform.kills++;


        if (
          platform.kills % 3 === 0
        ) {

          platform.power++;
        }
      }

    });

}


/* =========================================================
   PARASITAS
========================================================= */

function updateParasites(dt) {

  const player =
    platform.player;


  platform.parasites
    .forEach(enemy => {

      if (!enemy.alive)
        return;


      enemy.x +=
        enemy.vx * dt;


      if (
        enemy.x < 350 ||
        enemy.x > 3400
      ) {

        enemy.vx *= -1;
      }


      if (
        collision(
          player,
          enemy
        ) &&
        player.invincible <= 0
      ) {

        player.health--;

        player.invincible = 1.2;

        player.vy = -300;


        if (
          player.health <= 0
        ) {

          resetPlatform();
        }

      }

    });
}


/* =========================================================
   RECUPERAÇÃO DA NATUREZA
========================================================= */

function cleanZone() {

  const player =
    platform.player;


  platform.zones
    .forEach(zone => {

      if (zone.cleaned)
        return;


      const distance =
        Math.abs(
          player.x -
          (
            zone.x +
            zone.width / 2
          )
        );


      if (distance < 150) {

        zone.cleaned = true;

        platform.cleaned++;

        platform.power++;
      }

    });

}


/* =========================================================
   DESENHO DA FASE DE PLATAFORMA
========================================================= */

function drawPlatform() {

  const camera =
    platform.camera;


  /* Céu */

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      0,
      height
    );


  gradient.addColorStop(
    0,
    "#18222b"
  );


  gradient.addColorStop(
    1,
    "#07100b"
  );


  ctx.fillStyle =
    gradient;


  ctx.fillRect(
    0,
    0,
    width,
    height
  );


  /* Lua */

  ctx.fillStyle =
    "rgba(220,235,220,.12)";


  ctx.beginPath();


  ctx.arc(
    width - 130,
    110,
    60,
    0,
    Math.PI * 2
  );


  ctx.fill();


  /* Cidade destruída */

  for (
    let x =
      -camera % 150 - 150;

    x <
      width + 150;

    x += 150
  ) {

    const buildingHeight =
      80 +
      Math.random() * 100;


    ctx.fillStyle =
      "#111b1a";


    ctx.fillRect(
      x,
      500 - buildingHeight,
      100,
      buildingHeight
    );

  }


  /* Áreas contaminadas */

  platform.zones
    .forEach(zone => {

      const x =
        zone.x -
        camera;


      if (zone.cleaned) {

        ctx.fillStyle =
          "rgba(65,150,75,.75)";


        ctx.fillRect(
          x,
          430,
          zone.width,
          70
        );


        /* Árvores */

        for (
          let i = 0;
          i < 5;
          i++
        ) {

          const treeX =
            x +
            25 +
            i * 60;


          ctx.fillStyle =
            "#65462d";


          ctx.fillRect(
            treeX,
            365,
            9,
            65
          );


          ctx.fillStyle =
            "#4e9c50";


          ctx.beginPath();


          ctx.arc(
            treeX + 4,
            355,
            27,
            0,
            Math.PI * 2
          );


          ctx.fill();

        }

      }

      else {

        ctx.fillStyle =
          "rgba(39,39,44,.95)";


        ctx.fillRect(
          x,
          430,
          zone.width,
          70
        );


        /* Lixo */

        for (
          let i = 0;
          i < 8;
          i++
        ) {

          ctx.fillStyle =
            "#55545a";


          ctx.fillRect(
            x +
              20 +
              i * 35,

            450 +
              (i % 2) * 12,

            18,
            12
          );
        }


        /* Fumaça */

        ctx.fillStyle =
          "rgba(20,20,25,.45)";


        for (
          let i = 0;
          i < 5;
          i++
        ) {

          ctx.beginPath();


          ctx.arc(
            x +
              30 +
              i * 60,

            400 -
              (i % 2) * 20,

            25,

            0,
            Math.PI * 2
          );


          ctx.fill();
        }

      }

    });


  /* Plataformas */

  platforms.forEach(ground => {

    const x =
      ground.x -
      camera;


    ctx.fillStyle =
      "#303c35";


    ctx.fillRect(
      x,
      ground.y,
      ground.width,
      ground.height
    );


    ctx.fillStyle =
      "#526b53";


    ctx.fillRect(
      x,
      ground.y,
      ground.width,
      6
    );

  });


  /* Entrada do Boss */

  const bossX =
    3300 -
    camera;


  ctx.fillStyle =
    "rgba(100,45,55,.8)";


  ctx.fillRect(
    bossX,
    280,
    130,
    220
  );


  ctx.strokeStyle =
    "#c96b73";


  ctx.lineWidth = 4;


  ctx.strokeRect(
    bossX,
    280,
    130,
    220
  );


  ctx.fillStyle =
    "#fff";


  ctx.font =
    "bold 13px Arial";


  ctx.fillText(
    "BOSS",
    bossX + 47,
    265
  );


  /* Parasitas */

  platform.parasites
    .forEach(enemy => {

      if (!enemy.alive)
        return;


      const x =
        enemy.x -
        camera;


      const y =
        enemy.y;


      ctx.fillStyle =
        "#17151b";


      ctx.beginPath();


      ctx.ellipse(
        x + 18,
        y + 15,
        22,
        17,
        0,
        0,
        Math.PI * 2
      );


      ctx.fill();


      /* Olhos */

      ctx.fillStyle =
        "#b4ffb9";


      ctx.beginPath();


      ctx.arc(
        x + 11,
        y + 12,
        4,
        0,
        Math.PI * 2
      );


      ctx.arc(
        x + 25,
        y + 12,
        4,
        0,
        Math.PI * 2
      );


      ctx.fill();


      /* Pernas */

      ctx.strokeStyle =
        "#77737b";


      ctx.lineWidth = 3;


      ctx.beginPath();


      ctx.moveTo(
        x + 5,
        y + 25
      );


      ctx.lineTo(
        x - 5,
        y + 34
      );


      ctx.moveTo(
        x + 30,
        y + 25
      );


      ctx.lineTo(
        x + 40,
        y + 34
      );


      ctx.stroke();

    });


  /* Jogador */

  const p =
    platform.player;


  const px =
    p.x -
    camera;


  const py =
    p.y;


  if (
    p.invincible <= 0 ||
    Math.floor(
      performance.now() / 100
    ) % 2 === 0
  ) {

    /* Corpo */

    ctx.fillStyle =
      "#dcefe0";


    ctx.fillRect(
      px,
      py,
      p.width,
      p.height
    );


    /* Roupa */

    ctx.fillStyle =
      "#347148";


    ctx.fillRect(
      px + 7,
      py + 18,
      20,
      30
    );


    /* Energia natural */

    ctx.fillStyle =
      "#78dc8a";


    ctx.beginPath();


    ctx.arc(
      px + 17,
      py + 11,
      9,
      0,
      Math.PI * 2
    );


    ctx.fill();

  }


  /* Ataque */

  if (
    p.attackTimer > 0
  ) {

    const attackRange =
      65;


    const x =
      p.facing === 1
        ? px + p.width
        : px - attackRange;


    ctx.fillStyle =
      "rgba(130,255,160,.65)";


    ctx.fillRect(
      x,
      py + 12,
      attackRange,
      20
    );

  }


  /* Mensagem */

  ctx.fillStyle =
    "rgba(255,255,255,.75)";


  ctx.font =
    "14px Arial";


  ctx.fillText(
    "Recupere as áreas contaminadas",
    20,
    height - 25
  );

}


/* =========================================================
   MENU
========================================================= */

function drawMenu() {

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      0,
      height
    );


  gradient.addColorStop(
    0,
    "#162b25"
  );


  gradient.addColorStop(
    1,
    "#050a0c"
  );


  ctx.fillStyle =
    gradient;


  ctx.fillRect(
    0,
    0,
    width,
    height
  );


  /* Cidade */

  for (
    let i = 0;
    i < 15;
    i++
  ) {

    const x =
      i * 100;


    const h =
      80 +
      (i % 4) * 35;


    ctx.fillStyle =
      "rgba(0,0,0,.35)";


    ctx.fillRect(
      x,
      height - h,
      70,
      h
    );

  }

}


/* =========================================================
   BOTÃO DE INÍCIO
========================================================= */

document
  .getElementById("startButton")
  .addEventListener(
    "click",
    () => {

      document
        .getElementById("menu")
        .classList.add("hidden");


      document
        .getElementById("phase1HUD")
        .classList.remove("hidden");


      business.money = 100;

      business.income = 0;

      business.pollution = 0;

      business.structures = [];


      createBuildButtons();

      updateBusinessHUD();


      state =
        STATE.BUSINESS;

    }
  );


/* =========================================================
   LOOP PRINCIPAL
========================================================= */

let lastTime = 0;


function loop(time) {

  const dt =
    Math.min(
      0.033,
      (time - lastTime) / 1000 || 0
    );


  lastTime = time;


  if (
    state === STATE.BUSINESS
  ) {

    updateBusiness(dt);

    drawBusiness();

  }


  else if (
    state === STATE.TRANSITION
  ) {

    drawBusiness();

    updateTransition(dt);

  }


  else if (
    state === STATE.PLATFORM
  ) {

    updatePlatform(dt);

    drawPlatform();

  }


  else if (
    state === STATE.MENU
  ) {

    drawMenu();

  }


  else if (
    state === STATE.END
  ) {

    drawPlatform();

  }


  requestAnimationFrame(loop);

}


requestAnimationFrame(loop);
