import * as firebase from "firebase";
require("@firebase/firestore");

var firebaseConfig = {
  apiKey: "AIzaSyD64zZk0OILU7qOBH47Oz79IjYE-YxHl4g",
  authDomain: "wily-app-a3f02.firebaseapp.com",
  databaseURL: "https://wily-app-a3f02.firebaseio.com",
  projectId: "wily-app-a3f02",
  storageBucket: "wily-app-a3f02.appspot.com",
  messagingSenderId: "886183312964",
  appId: "1:886183312964:web:fc339cd76ac0266d844611",
};
// Initialize Firebase
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

export default firebase.firestore();
