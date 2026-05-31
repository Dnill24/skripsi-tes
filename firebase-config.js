// firebase-config.js

const firebaseConfig = {
  apiKey: "AIzaSyDwl2zUW15JEZLyPySG_4jZpKgj50dFJG0",
  authDomain: "math-quest-b03be.firebaseapp.com",
  databaseURL: "https://math-quest-b03be-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "math-quest-b03be",
  storageBucket: "math-quest-b03be.firebasestorage.app",
  messagingSenderId: "1018754619592",
  appId: "1:1018754619592:web:23c427029a4f93fd1fadfd"
};

// Initialize Firebase using compat libraries
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
