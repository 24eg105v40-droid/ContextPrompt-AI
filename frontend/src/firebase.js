import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCv5QF0K-JYxp5spAGmk_h6YmA9LON1FL4",
  authDomain: "contextprompt-ai.firebaseapp.com",
  projectId: "contextprompt-ai",
  storageBucket: "contextprompt-ai.firebasestorage.app",
  messagingSenderId: "317559220492",
  appId: "1:317559220492:web:e8c415c9d990919dd98129"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider =
  new GoogleAuthProvider();