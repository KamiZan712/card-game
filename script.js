const playerHPElement = document.getElementById("player-hp");
const enemyHPElement = document.getElementById("enemy-hp");
const handContainer = document.getElementById("hand");
const log = document.getElementById("log");

const deckBuilder = document.getElementById("deck-builder");
const cardPoolDiv = document.getElementById("card-pool");
const deckPreview = document.getElementById("deck-preview");
const deckCount = document.getElementById("deck-count");
const startButton = document.getElementById("start-game");
const battleArea = document.getElementById("battle-area");

let playerHP = 30;
let enemyHP = 30;
let playerDeck = [];
let hand = [];

const cardPool = [
  { name: "炎の一撃", atk: 5 },
  { name: "雷の矢", atk: 4 },
  { name: "氷の刃", atk: 3 },
  { name: "影の斬撃", atk: 6 },
  { name: "岩石投げ", atk: 2 }
];

function renderCard(card, onClick) {
  const div = document.createElement("div");
  div.className = "card";
  div.textContent = `${card.name}\nATK: ${card.atk}`;
  div.onclick = () => onClick(card);
  return div;
}

// デッキ構築モード
function showDeckBuilder() {
  cardPoolDiv.innerHTML = "";
  deckPreview.innerHTML = "";
  playerDeck = [];

  cardPool.forEach(card => {
    const cardEl = renderCard(card, addCardToDeck);
    cardPoolDiv.appendChild(cardEl);
  });

  updateDeckPreview();
}

function addCardToDeck(card) {
  if (playerDeck.length >= 10) return;
  playerDeck.push(card);
  updateDeckPreview();
}

function removeCardFromDeck(index) {
  playerDeck.splice(index, 1);
  updateDeckPreview();
}

function updateDeckPreview() {
  deckPreview.innerHTML = "";
  playerDeck.forEach((card, index) => {
    const cardEl = renderCard(card, () => removeCardFromDeck(index));
    deckPreview.appendChild(cardEl);
  });
  deckCount.textContent = playerDeck.length;
  startButton.disabled = playerDeck.length < 1;
}

startButton.onclick = () => {
  deckBuilder.style.display = "none";
  battleArea.style.display = "block";
  startBattle();
};

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function startBattle() {
  shuffle(playerDeck);
  hand = [];
  playerHP = 30;
  enemyHP = 30;
  updateHP();
  drawHand();
}

function drawHand() {
  // 既存の手札は保持、足りない分だけ補充
  while (hand.length < 3 && playerDeck.length > 0) {
    hand.push(playerDeck.pop());
  }

  // UI再描画
  handContainer.innerHTML = "";
  if (hand.length === 0) {
    log.textContent = "山札も手札も尽きた！";
    return;
  }

  hand.forEach((card, index) => {
    const cardDiv = renderCard(card, () => playCard(index));
    handContainer.appendChild(cardDiv);
  });
}

function playCard(cardIndex) {
  const card = hand[cardIndex];
  log.textContent = `プレイヤーは${card.name}を使った！ ${card.atk}ダメージ！`;
  enemyHP -= card.atk;
  updateHP();

  // 使ったカードを手札から削除
  hand.splice(cardIndex, 1);

  if (enemyHP <= 0) {
    log.textContent += `\n敵を倒した！勝利！`;
    handContainer.innerHTML = "";
    return;
  }

  setTimeout(enemyTurn, 1000);
}

function enemyTurn() {
  const enemyAttack = Math.floor(Math.random() * 6) + 1;
  playerHP -= enemyAttack;
  log.textContent += `\n敵の反撃！ ${enemyAttack}ダメージ！`;
  updateHP();

  if (playerHP <= 0) {
    log.textContent += `\nやられた……ゲームオーバー。`;
    handContainer.innerHTML = "";
    return;
  }

  drawHand(); // 必要分だけ補充
}

function updateHP() {
  playerHPElement.textContent = Math.max(playerHP, 0);
  enemyHPElement.textContent = Math.max(enemyHP, 0);
}

// 初期化
showDeckBuilder();
