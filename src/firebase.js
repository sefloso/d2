import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  // Your web app's Firebase configuration
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const functions = getFunctions(app);