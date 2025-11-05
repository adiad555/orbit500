import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB_eFit5rt0-wOHMp30sw5rsOUzgU1jbQ8",
  authDomain: "antamgrow.firebaseapp.com",
  databaseURL: "https://antamgrow-default-rtdb.firebaseio.com",
  projectId: "antamgrow",
  storageBucket: "antamgrow.appspot.com",
  messagingSenderId: "890745577643",
  appId: "1:890745577643:web:04b8d319cbff04caa497ee"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const transaksiList = document.getElementById("transaksi-list");

onValue(ref(db, "transaksi"), (snapshot) => {
  transaksiList.innerHTML = "";
  snapshot.forEach((child) => {
    const data = child.val();
    if (data.status === "pending") {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <p><strong>Tipe:</strong> ${data.tipe}</p>
        <p><strong>Nominal:</strong> Rp${data.jumlah}</p>
        <p><strong>Nomor:</strong> ${data.nomor}</p>
        <button class="acc">ACC</button>
        <button class="tolak">TOLAK</button>
      `;

      card.querySelector(".acc").onclick = () => accTransaksi(child.key, data);
      card.querySelector(".tolak").onclick = () => tolakTransaksi(child.key, data);

      transaksiList.appendChild(card);
    }
  });
});

function accTransaksi(id, data) {
  const userRef = ref(db, `users/${data.userId}`);
  update(ref(db, `transaksi/${id}`), { status: "acc" });

  if (data.tipe === "deposit") {
    onValue(userRef, (snap) => {
      const saldo = snap.val().saldo || 0;
      update(userRef, { saldo: saldo + data.jumlah });
    }, { onlyOnce: true });
  }

  if (data.tipe === "penarikan") {
    // Sudah dikurangi di awal, jadi cukup ubah status
  }

  alert("Transaksi ACC berhasil!");
}

function tolakTransaksi(id, data) {
  const userRef = ref(db, `users/${data.userId}`);
  update(ref(db, `transaksi/${id}`), { status: "ditolak" });

  if (data.tipe === "penarikan") {
    onValue(userRef, (snap) => {
      const saldo = snap.val().saldo || 0;
      update(userRef, { saldo: saldo + data.jumlah });
    }, { onlyOnce: true });
  }

  alert("Transaksi ditolak dan saldo dikembalikan!");
}