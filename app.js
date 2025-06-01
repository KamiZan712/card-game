// Firebaseモジュールの読み込み（ESモジュール方式）
//import { initializeApp } from "firebase/app";
//import { getDatabase, ref, set , onValue  } from "firebase/database";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { get, getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";


// 先ほどのfirebaseConfigをここに貼り付ける
const firebaseConfig = {
    apiKey: "AIzaSyAqFXRB4QJ7jpLzSSS5XRsvDawnRBkY-Hg",
    authDomain: "card-game-online-85ef0.firebaseapp.com",
    databaseURL: "https://card-game-online-85ef0-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "card-game-online-85ef0",
    storageBucket: "card-game-online-85ef0.firebasestorage.app",
    messagingSenderId: "108818603108",
    appId: "1:108818603108:web:151e301474a1bc84a39371",
    measurementId: "G-VDH6D9BG71"
};

// Firebaseアプリの初期化
const app = initializeApp(firebaseConfig);

// Realtime Databaseのインスタンス取得
const database = getDatabase(app);

//サービスワーカーの登録
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker registered', reg))
      .catch(err => console.error('Service Worker registration failed', err));
  });
}



// ここからDB操作を始める
// 認証インスタンスを取得
const auth = getAuth(app);

// 匿名ログイン実行
signInAnonymously(auth)
    .then(() => {
        console.log("匿名ログイン成功");
    })
    .catch((error) => {
        console.error("ログイン失敗:", error);
    });

// ログイン状態の監視
onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
        console.log("ログインユーザーID:", uid);
        // ここにUIDを使った処理を書く
    } else {
        console.log("ログアウト状態");
    }
});


//ルームの設定
// Firebase 初期化済みであることが前提
let currentUserId = null;

// 匿名ログイン後にUIDを保持
onAuthStateChanged(getAuth(), (user) => {
  if (user) {
    currentUserId = user.uid;
    console.log("ログイン済みUID:", currentUserId);
  }
});

export function joinRoom() {
  const roomId = document.getElementById('roomIdInput').value;
  if (!roomId || !currentUserId) {
    alert("ルームIDが空か、ログインが完了していません");
    return;
  }

  const roomRef = ref(database, 'rooms/' + roomId);

  get(roomRef).then((snapshot) => {
    const data = snapshot.val();
    if (!data) {
      // ルームが存在しない → 新規作成
      set(roomRef, {
        player1: currentUserId,
        createdAt: Date.now()
      });
      console.log("新しいルームを作成:", roomId);
    } else if (!data.player2 && data.player1 !== currentUserId) {
      // ルームに空きあり → 参加
      set(ref(database, 'rooms/' + roomId + '/player2'), currentUserId);
      console.log("ルームに参加:", roomId);
    } else if (data.player1 === currentUserId || data.player2 === currentUserId) {
      console.log("すでにこのルームに参加しています");
    } else {
      alert("このルームは満員です");
    }
  });
  // joinRoom関数の最後に追記
watchRoom(roomId);

}

function watchRoom(roomId) {
  const roomRef = ref(database, 'rooms/' + roomId + '/');

  onValue(roomRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      console.log("ルームが削除されたか存在しません");
      return;
    }

    const { player1, player2 } = data;
    console.log("現在の参加者", player1, player2);

    if (player1 && player2) {
      console.log("両者揃った！ゲーム開始できる！");
      startGame(roomId, player1, player2);
    }
  });
}

function startGame(roomId, player1, player2) {
  console.log(`ゲーム開始！ ルーム: ${roomId} プレイヤー1: ${player1} プレイヤー2: ${player2}`);
  // TODO: ここからゲームの初期化処理や画面遷移などを実装
}


