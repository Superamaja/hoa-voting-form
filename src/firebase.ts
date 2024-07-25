import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBMJx5B7YXVifgIEzrVAE14m1fzn0sr9kw",
  authDomain: "hoa-voting-form.firebaseapp.com",
  projectId: "hoa-voting-form",
  storageBucket: "hoa-voting-form.appspot.com",
  messagingSenderId: "489725458978",
  appId: "1:489725458978:web:b5186defd1b9341fa7687b",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
