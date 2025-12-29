// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {

    apiKey:import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "servio-food-delivery-webapp.firebaseapp.com",
  projectId: "servio-food-delivery-webapp",
  storageBucket: "servio-food-delivery-webapp.firebasestorage.app",
  messagingSenderId: "95738714430",
  appId: "1:95738714430:web:80ba39311e0a025661b46f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app)
export {app,auth}