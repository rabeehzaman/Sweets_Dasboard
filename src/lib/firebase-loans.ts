import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration for Loan Management App
const firebaseConfig = {
  apiKey: "AIzaSyD5xSSgVtVhb-p0oLWDZzErNmpsu3T5P24",
  authDomain: "loanappv3.firebaseapp.com",
  projectId: "loanappv3",
  storageBucket: "loanappv3.firebasestorage.app",
  messagingSenderId: "398200950530",
  appId: "1:398200950530:web:4a5ad43a9e6284984dfc1b"
};

// Initialize Firebase for loans (only if not already initialized)
const app = getApps().length === 0 ? initializeApp(firebaseConfig, 'loans-app') : getApps()[0];

// Initialize Firestore
export const loansDb = getFirestore(app);
