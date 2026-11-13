const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 700;

const GAME_TIME = 30;
const WEIGHT_LIMIT = 7.0;
const SPAWN_INTERVAL = 45;

let scene = "title";

let suitcase;
let fallingItems = [];
let spawnPool = [];

let collectedNames = [];
let collectedItems = [];

let currentWeight = 0;
let remainingTime = GAME_TIME;
let gameStartTime = 0;

let noticeText = "";
let noticeColor;
let noticeEndTime = 0;

let resultReason = "";
let gameFinished = false;

const itemData = [
  {
    name: "パスポート",
    icon: "🛂",
    weight: 0.1,
    required: true,
    message: "出国するために必要です"
  },
  {
    name: "スマホ",
    icon: "📱",
    weight: 0.2,
    required: true,
    message: "地図や連絡に使用できます"
  },
  {
    name: "モバイルバッテリー",
    icon: "🔋",
    weight: 0.3,
    required: true,
    message: "スマホの充電切れを防げます"
  },
  {
    name: "クレジットカード",
    icon: "💳",
    weight: 0.1,
    required: true,
    message: "現地での支払いに使用できます"
  },
  {
    name: "着替え",
    icon: "👕",
    weight: 1.5,
    required: true,
    message: "旅行中に着替えられます"
  },
  {
    name: "折りたたみ傘",
    icon: "🌂",
    weight: 0.4,
    required: true,
    message: "スコールへの対策ができます"
  },
  {
    name: "炊飯器",
    icon: "🍚",
    weight: 3.0,
    required: false,
    message: "これは今回の旅行には使いません！"
  },
  {
    name: "ダンベル",
    icon: "🏋️",
    weight: 4.0,
    required: false,
    message: "これは旅行に持っていく必要がありません！"
  },
  {
    name: "ギター",
    icon: "🎸",
    weight: 2.5,
    required: false,
    message: "今回の旅行には必要ありません！"
  },
  {
    name: "デスクトップPC",
    icon: "🖥️",
    weight: 5.0,
    required: false,
    message: "重すぎて旅行には向いていません！"
  }
];

function setup() {
  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  canvas.parent("game-container");

  textFont("sans-serif");
  rectMode(CORNER);

  suitcase = {
    x: width / 2,
    y: height - 95,
    width: 150,
    height: 65,
    speed: 9
  };

  prepareGame();
}

function draw() {
  if (scene === "title") {
    drawTitleScreen();
  } else if (scene === "game") {
    drawGameScreen();
  } else if (scene === "result") {
    drawResultScreen();
  }
}

function prepareGame() {
  fallingItems = [];
  spawnPool = [];

  collectedNames = [];
  collectedItems = [];

  currentWeight = 0;
  remainingTime = GAME_TIME;

  noticeText = "";
  noticeEndTime = 0;

  resultReason = "";
  gameFinished = false;

  suitcase.x = width / 2;

  createSpawnPool();
}

function createSpawnPool() {
  spawnPool = [];

  for (const item of itemData) {
    if (item.required) {
      spawnPool.push(item);
      spawnPool.push(item);
    } else {
      for (let i = 0; i < 7; i++) {
        spawnPool.push(item);
      }
    }
  }

  shuffleArray(spawnPool);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const randomIndex = floor(random(i + 1));

    const temporary = array[i];
    array[i] = array[randomIndex];
    array[randomIndex] = temporary;
  }
}

function drawTitleScreen() {
  background(225, 245, 255);

  drawHeader();

  fill(30);
  textAlign(CENTER, CENTER);

  textSize(22);
  text(
    "30秒以内に必要な持ち物を集めよう!",
    width / 2,
    102
  );

  textSize(17);
  text(
    "ただし、荷物が7kgを超えると重量オーバーです",
    width / 2,
    136
  );

  drawItemGuide();

  drawStartButton();
}

function drawHeader() {
  fill(220, 45, 45);
  noStroke();
  rect(0, 0, width, 75);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(34);
  textStyle(BOLD);

  text(
    "シンガポール旅行 荷造りチャレンジ",
    width / 2,
    37
  );

  textStyle(NORMAL);
}

function drawItemGuide() {
  fill(255);
  stroke(210);
  strokeWeight(2);
  rect(70, 165, 860, 350, 14);

  noStroke();

  fill(20, 130, 70);
  textAlign(CENTER, CENTER);
  textSize(23);
  textStyle(BOLD);
  text("必要な持ち物", 285, 198);

  fill(190, 45, 45);
  text("不要な持ち物", 710, 198);

  textStyle(NORMAL);
  textAlign(LEFT, CENTER);
  textSize(17);

  const requiredItems = itemData.filter(item => item.required);
  const unnecessaryItems = itemData.filter(item => !item.required);

  for (let i = 0; i < requiredItems.length; i++) {
    const item = requiredItems[i];
    const y = 245 + i * 42;

    fill(30);
    text(
      item.icon + "  " + item.name + " " +
      item.weight.toFixed(1) + "kg",
      130,
      y
    );
  }

  for (let i = 0; i < unnecessaryItems.length; i++) {
    const item = unnecessaryItems[i];
    const y = 245 + i * 55;

    fill(30);
    text(
      item.icon + "  " + item.name + " " +
      item.weight.toFixed(1) + "kg",
      570,
      y
    );
  }

  fill(70);
  textAlign(CENTER, CENTER);
  textSize(16);
  text(
    "同じ必要品を2回取ると、2個分の重量が加算されます",
    width / 2,
    490
  );
}

function drawStartButton() {
  const buttonX = width / 2 - 120;
  const buttonY = 550;
  const buttonWidth = 240;
  const buttonHeight = 70;

  const isMouseOver =
    mouseX >= buttonX &&
    mouseX <= buttonX + buttonWidth &&
    mouseY >= buttonY &&
    mouseY <= buttonY + buttonHeight;

  noStroke();

  if (isMouseOver) {
    fill(35, 170, 85);
  } else {
    fill(25, 140, 70);
  }

  rect(
    buttonX,
    buttonY,
    buttonWidth,
    buttonHeight,
    14
  );

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(27);
  textStyle(BOLD);
  text("START", width / 2, buttonY + buttonHeight / 2);
  textStyle(NORMAL);

  fill(50);
  textSize(16);
  text(
    "キーボードの「←」「→」でスーツケースを動かします",
    width / 2,
    660
  );
}

function drawGameScreen() {
  drawGameBackground();
  updateTimer();
  moveSuitcase();
  spawnItem();
  updateFallingItems();
  drawSuitcase();
  drawGameInformation();
  drawNotice();

  if (remainingTime <= 0 && !gameFinished) {
    finishGame("時間終了");
  }
}

function drawGameBackground() {
  background(170, 225, 255);

  noStroke();
  fill(255, 230);
  ellipse(150, 130, 130, 65);
  ellipse(205, 125, 95, 55);
  ellipse(820, 155, 150, 70);
  ellipse(875, 145, 100, 55);

  fill(235, 205, 145);
  rect(0, height - 120, width, 120);
}

function updateTimer() {
  const elapsedSeconds =
    floor((millis() - gameStartTime) / 1000);

  remainingTime = max(
    0,
    GAME_TIME - elapsedSeconds
  );
}

function moveSuitcase() {
  if (keyIsDown(LEFT_ARROW)) {
    suitcase.x -= suitcase.speed;
  }

  if (keyIsDown(RIGHT_ARROW)) {
    suitcase.x += suitcase.speed;
  }

  suitcase.x = constrain(
    suitcase.x,
    suitcase.width / 2,
    width - suitcase.width / 2
  );
}

function drawSuitcase() {
  const left = suitcase.x - suitcase.width / 2;

  noFill();
  stroke(80);
  strokeWeight(8);
  rect(
    suitcase.x - 30,
    suitcase.y - 25,
    60,
    35,
    8
  );

  fill(235, 90, 55);
  stroke(150, 45, 30);
  strokeWeight(3);
  rect(
    left,
    suitcase.y,
    suitcase.width,
    suitcase.height,
    12
  );

  fill(255, 195, 60);
  noStroke();
  rect(
    suitcase.x - 8,
    suitcase.y,
    16,
    suitcase.height
  );

  fill(60);
  ellipse(
    left + 25,
    suitcase.y + suitcase.height + 6,
    18,
    18
  );

  ellipse(
    left + suitcase.width - 25,
    suitcase.y + suitcase.height + 6,
    18,
    18
  );
}

function spawnItem() {
  if (
    frameCount % SPAWN_INTERVAL === 0 &&
    spawnPool.length > 0
  ) {
    const sourceItem = spawnPool.shift();

    const fallingItem = {
      name: sourceItem.name,
      icon: sourceItem.icon,
      weight: sourceItem.weight,
      required: sourceItem.required,
      message: sourceItem.message,

      x: random(70, width - 70),
      y: -50,
      speed: random(3.8, 6.2),
      size: 55
    };

    fallingItems.push(fallingItem);
  }
}

function updateFallingItems() {
  for (let i = fallingItems.length - 1; i >= 0; i--) {
    const item = fallingItems[i];

    item.y += item.speed;

    drawFallingItem(item);

    if (isCaught(item)) {
      collectItem(item);
      fallingItems.splice(i, 1);
    } else if (item.y > height + item.size) {
      fallingItems.splice(i, 1);
    }
  }
}

function drawFallingItem(item) {
  fill(255);
  stroke(210);
  strokeWeight(2);

  ellipse(
    item.x,
    item.y,
    item.size + 20,
    item.size + 20
  );

  noStroke();
  textAlign(CENTER, CENTER);
  textSize(38);
  text(item.icon, item.x, item.y - 5);

  fill(25);
  textSize(14);
  text(
    item.name,
    item.x,
    item.y + 42
  );
}

function isCaught(item) {
  const suitcaseLeft =
    suitcase.x - suitcase.width / 2;

  const suitcaseRight =
    suitcase.x + suitcase.width / 2;

  const itemLeft =
    item.x - item.size / 2;

  const itemRight =
    item.x + item.size / 2;

  const itemBottom =
    item.y + item.size / 2;

  const horizontalHit =
    itemRight >= suitcaseLeft &&
    itemLeft <= suitcaseRight;

  const verticalHit =
    itemBottom >= suitcase.y &&
    item.y <= suitcase.y + suitcase.height;

  return horizontalHit && verticalHit;
}

function collectItem(item) {
  currentWeight += item.weight;

  collectedItems.push(item);

  if (!collectedNames.includes(item.name)) {
    collectedNames.push(item.name);
  }

  if (item.required) {
    showNotice(
      item.name + "を入れました +" +
      item.weight.toFixed(1) + "kg",
      color(20, 130, 70)
    );
  } else {
    showNotice(
      item.message + " +" +
      item.weight.toFixed(1) + "kg",
      color(210, 45, 45)
    );
  }

  if (currentWeight > WEIGHT_LIMIT) {
    finishGame("重量オーバー");
  }
}

function showNotice(message, displayColor) {
  noticeText = message;
  noticeColor = displayColor;
  noticeEndTime = millis() + 1800;
}


function drawNotice() {
  if (
    noticeText !== "" &&
    millis() < noticeEndTime
  ) {
    noStroke();
    fill(255, 245);
    rect(
      width / 2 - 310,
      90,
      620,
      65,
      12
    );

    fill(noticeColor);
    textAlign(CENTER, CENTER);
    textSize(19);
    textStyle(BOLD);
    text(noticeText, width / 2, 122);
    textStyle(NORMAL);
  }
}

function drawGameInformation() {
  noStroke();
  fill(255, 240);
  rect(20, 18, 250, 105, 12);

  fill(25);
  textAlign(LEFT, CENTER);
  textSize(21);
  textStyle(BOLD);

  text(
    "残り時間：" + remainingTime + "秒",
    40,
    49
  );

  const weightText =
    currentWeight.toFixed(1) +
    " / " +
    WEIGHT_LIMIT.toFixed(1) +
    "kg";

  if (currentWeight > WEIGHT_LIMIT * 0.75) {
    fill(210, 45, 45);
  } else {
    fill(25);
  }

  text("現在の重量：" + weightText, 40, 84);

  textStyle(NORMAL);

  const gaugeX = 300;
  const gaugeY = 25;
  const gaugeWidth = 670;
  const gaugeHeight = 30;

  fill(255);
  stroke(150);
  strokeWeight(2);
  rect(
    gaugeX,
    gaugeY,
    gaugeWidth,
    gaugeHeight,
    8
  );

  const gaugeRatio = constrain(
    currentWeight / WEIGHT_LIMIT,
    0,
    1
  );

  if (gaugeRatio < 0.75) {
    fill(45, 175, 90);
  } else {
    fill(225, 70, 55);
  }

  noStroke();
  rect(
    gaugeX,
    gaugeY,
    gaugeWidth * gaugeRatio,
    gaugeHeight,
    8
  );

  fill(25);
  textAlign(CENTER, CENTER);
  textSize(15);
  text(
    "7kgを超えると重量オーバー",
    gaugeX + gaugeWidth / 2,
    78
  );
}

function finishGame(reason) {
  if (gameFinished) {
    return;
  }

  gameFinished = true;
  resultReason = reason;
  scene = "result";
}

function drawResultScreen() {
  background(235, 247, 255);

  drawHeader();

  const missingItems = getMissingItems();

  const weightCleared =
    currentWeight <= WEIGHT_LIMIT;

  const allRequiredCollected =
    missingItems.length === 0;

  const success =
    weightCleared && allRequiredCollected;

  textAlign(CENTER, CENTER);

  if (success) {
    fill(20, 145, 75);
    textSize(38);
    textStyle(BOLD);
    text("旅行成功！", width / 2, 125);

    textSize(20);
    textStyle(NORMAL);
    text(
      "必要な荷物を7kg以内でそろえました",
      width / 2,
      166
    );
  } else {
    fill(205, 45, 45);
    textSize(38);
    textStyle(BOLD);

    if (!weightCleared) {
      text("重量オーバー！", width / 2, 125);
    } else {
      text("旅行準備失敗", width / 2, 125);
    }

    textStyle(NORMAL);
  }

  drawResultDetails(
    missingItems,
    weightCleared
  );

  drawRestartButton();
}

function getMissingItems() {
  const missingItems = [];

  for (const item of itemData) {
    if (
      item.required &&
      !collectedNames.includes(item.name)
    ) {
      missingItems.push(item);
    }
  }

  return missingItems;
}

function getCollectedItemCounts() {
  const itemCounts = {};

  for (const item of collectedItems) {
    if (itemCounts[item.name]) {
      itemCounts[item.name]++;
    } else {
      itemCounts[item.name] = 1;
    }
  }

  return itemCounts;
}

function drawResultDetails(missingItems, weightCleared) {
  fill(255);
  stroke(210);
  strokeWeight(2);
  rect(70, 200, 860, 350, 15);

  noStroke();

  fill(30);
  textAlign(LEFT, CENTER);
  textSize(21);
  textStyle(BOLD);

  text(
    "最終重量：" +
    currentWeight.toFixed(1) +
    " / " +
    WEIGHT_LIMIT.toFixed(1) +
    "kg",
    110,
    238
  );

  textStyle(NORMAL);
  textSize(18);

  if (!weightCleared) {
    fill(205, 45, 45);
    text(
      "荷物が7kgを超えたため、機内に持ち込めませんでした。",
      110,
      280
    );
  } else {
    fill(20, 135, 70);
    text(
      "重量制限はクリアしています。",
      110,
      280
    );
  }

  fill(30);
  textStyle(BOLD);
  text("不足している持ち物", 110, 330);
  textStyle(NORMAL);

  if (missingItems.length === 0) {
    fill(20, 135, 70);
    text(
      "必要な持ち物はすべてそろっています。",
      110,
      370
    );
  } else {
    let y = 365;

    textSize(16) 

    for (const item of missingItems) {
      fill(205, 45, 45);
      text(
        "・" + getMissingMessage(item.name),
        110,
        y
      );

      y += 30;
    }
  }

  fill(60);
  textAlign(RIGHT, CENTER);
  textSize(16);

  text(
    "取得した荷物：" +
    collectedItems.length +
    "個",
    880,
    238
  );
}

const itemCounts = getCollectedItemCounts();
const itemNames = Object.keys(itemCounts);

fill(30);
textAlign(LEFT, TOP);
textSize(17);
textStyle(BOLD);
text("取った荷物", 570, 315);

textStyle(NORMAL);
textSize(15);

let collectedY = 350;

if (itemNames.length === 0) {
  fill(100);
  text("何も取れませんでした", 570, collectedY);
} else {
  for (const itemName of itemNames) {
    const item = itemData.find(
      data => data.name === itemName
    );

    if (item.required) {
      fill(20, 130, 70);
    } else {
      fill(205, 45, 45);
    }

    text(
      item.icon + " " +
      itemName + " ×" +
      itemCounts[itemName],
      570,
      collectedY
    );

    collectedY += 28;
  }
}

textStyle(NORMAL);
function getMissingMessage(itemName) {
  if (itemName === "パスポート") {
    return "パスポートがないため、出国できませんでした。";
  }

  if (itemName === "スマホ") {
    return "スマホがないため、地図や連絡手段を使えませんでした。";
  }

  if (itemName === "モバイルバッテリー") {
    return "スマホの充電が切れてしまいました。";
  }

  if (itemName === "クレジットカード") {
    return "現地でカードによる支払いができませんでした。";
  }

  if (itemName === "着替え") {
    return "旅行中に着替えることができませんでした。";
  }

  if (itemName === "折りたたみ傘") {
    return "スコールに対応できず、びしょ濡れになりました。";
  }

  return itemName + "が不足しています。";
}

function drawRestartButton() {
  const buttonX = width / 2 - 140;
  const buttonY = 585;
  const buttonWidth = 280;
  const buttonHeight = 65;

  const isMouseOver =
    mouseX >= buttonX &&
    mouseX <= buttonX + buttonWidth &&
    mouseY >= buttonY &&
    mouseY <= buttonY + buttonHeight;

  noStroke();

  if (isMouseOver) {
    fill(55, 135, 220);
  } else {
    fill(45, 110, 195);
  }

  rect(
    buttonX,
    buttonY,
    buttonWidth,
    buttonHeight,
    14
  );

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(23);
  textStyle(BOLD);
  text(
    "もう一度遊ぶ",
    width / 2,
    buttonY + buttonHeight / 2
  );
  textStyle(NORMAL);

  fill(50);
  textSize(15);
  text(
    "Rキーでもタイトル画面へ戻れます",
    width / 2,
    675
  );
}


function mousePressed() {
  if (scene === "title") {
    const insideStartButton =
      mouseX >= width / 2 - 120 &&
      mouseX <= width / 2 + 120 &&
      mouseY >= 550 &&
      mouseY <= 620;

    if (insideStartButton) {
      startGame();
    }
  }

  if (scene === "result") {
    const insideRestartButton =
      mouseX >= width / 2 - 140 &&
      mouseX <= width / 2 + 140 &&
      mouseY >= 585 &&
      mouseY <= 650;

    if (insideRestartButton) {
      returnToTitle();
    }
  }
}


function keyPressed() {
  if (
    scene === "result" &&
    (key === "r" || key === "R")
  ) {
    returnToTitle();
  }
}

function startGame() {
  prepareGame();
  gameStartTime = millis();
  scene = "game";
}

function returnToTitle() {
  prepareGame();
  scene = "title";
}
