// game.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth();

const roomId = new URLSearchParams(location.search).get("roomId");
const mySlot = new URLSearchParams(location.search).get("player");

document.getElementById("room-id").textContent = `ルームID: ${roomId}`;
document.getElementById("player-id").textContent = `あなた: ${mySlot}`;

// UI
const turnIndicator = document.getElementById("turn-indicator");
const endTurnBtn = document.getElementById("end-turn");
const handDiv = document.getElementById("hand");

// プレイヤーの初期手札（仮）
const defaultHands = {
  player1: ["カードA", "カードB", "カードC"],
  player2: ["カードX", "カードY", "カードZ"]
};

onAuthStateChanged(auth, (user) => {
  if (!user) return;

  // 初期化（部屋にまだデータがなければ）
  const stateRef = ref(db, `rooms/${roomId}/state`);
  onValue(stateRef, (snapshot) => {
    const state = snapshot.val();

    if (!state) {
      // 初期状態を登録（ホスト側だけで十分）
      if (mySlot === "player1") {
        set(stateRef, {
          turn: "player1",
          hands: defaultHands
        });
      }
      return;
    }

    // 表示更新
    turnIndicator.textContent = `現在のターン: ${state.turn}`;
    const myHand = state.hands?.[mySlot] || [];

    // 手札表示
    handDiv.innerHTML = "";
    myHand.forEach((card) => {
      const btn = document.createElement("button");
      btn.textContent = card;
      btn.onclick = () => alert(`${card} を使った！`); // 仮処理
      handDiv.appendChild(btn);
    });

    // ターン制御
    if (state.turn === mySlot) {
      endTurnBtn.disabled = false;
    } else {
      endTurnBtn.disabled = true;
    }
  });
});

// ターン終了ボタン処理
endTurnBtn.onclick = () => {
  const nextTurn = mySlot === "player1" ? "player2" : "player1";
  const turnRef = ref(db, `rooms/${roomId}/state/turn`);
  set(turnRef, nextTurn);
};
