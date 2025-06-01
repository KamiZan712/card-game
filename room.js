// room.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getDatabase, ref, onValue, set, onDisconnect } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth();

const roomId = new URLSearchParams(location.search).get("roomId");
document.getElementById("room-id").textContent = `ルームID: ${roomId}`;

onAuthStateChanged(auth, (user) => {
  if (!user) return;

  const uid = user.uid;
  const roomRef = ref(db, `rooms/${roomId}/players`);
  const mySlot = Math.random() < 0.5 ? "player1" : "player2"; // 仮にスロットを決定（実際は安全な方法に）

  // 自分を登録
  set(ref(db, `rooms/${roomId}/players/${mySlot}`), {
    uid: uid,
    ready: true
  });

  // 切断時に自動削除
  onDisconnect(ref(db, `rooms/${roomId}/players/${mySlot}`)).remove();

  // プレイヤー状態の監視
  onValue(roomRef, (snapshot) => {
    const players = snapshot.val() || {};

    document.getElementById("player1-status").textContent =
      players.player1 ? "接続済" : "未接続";
    document.getElementById("player2-status").textContent =
      players.player2 ? "接続済" : "未接続";

    if (players.player1 && players.player2) {
      // 両方そろったらゲームへ進む
      document.getElementById("status").textContent = "ゲームを開始します...";
      setTimeout(() => {
        window.location.href = `game.html?roomId=${roomId}&player=${mySlot}`;
      }, 1000);
    }
  });
});
