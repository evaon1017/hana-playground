import { initializeApp } from 'firebase/app';
import { getDatabase } from "firebase/database";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAesIqTIOSXc7w1SikZRHR-b01ILaN2ljs",
  authDomain: "hana-playground-624bb.firebaseapp.com",
  databaseURL: "https://hana-playground-624bb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "hana-playground-624bb",
  storageBucket: "hana-playground-624bb.firebasestorage.app",
  messagingSenderId: "324217254424",
  appId: "1:324217254424:web:44d638286fa0ae7401c96d"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = getDatabase(app);