// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDN625in4Nce0JSW30LKzm6w7RYpR862Us",
  authDomain: "sql-housemanage.firebaseapp.com",
  projectId: "sql-housemanage",
  storageBucket: "sql-housemanage.firebasestorage.app",
  messagingSenderId: "887259802730",
  appId: "1:887259802730:web:50a6e5d00d8477ddf32e13",
  measurementId: "G-SCL4X4XEXN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getFirestore(app);
export {db}