// firebase-config.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAuJSxpcFZ1QI-dEsEnx2qSqlb0wsvs6Mc",
  authDomain: "lginvest-776cf.firebaseapp.com",
  databaseURL: "https://lginvest-776cf-default-rtdb.firebaseio.com",
  projectId: "lginvest-776cf",
  storageBucket: "lginvest-776cf.firebasestorage.app",
  messagingSenderId: "831934282072",
  appId: "1:831934282072:web:6a8b7a5bcba5d4d1264d2d",
  measurementId: "G-265YF9DYCF"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;