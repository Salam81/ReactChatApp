import React, { useRef, useState, useEffect } from 'react';
import dummyAvatar from './avatar.png'
import googleIcon from './google.png'

import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics'

import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'

firebase.initializeApp({
  apiKey: "AIzaSyBcGH_6WYSp7hKOoNNrr9AH11JfEonthuc",
  authDomain: "react-chat-app-37d8a.firebaseapp.com",
  databaseURL: "https://react-chat-app-37d8a.firebaseio.com",
  projectId: "react-chat-app-37d8a",
  storageBucket: "react-chat-app-37d8a.appspot.com",
  messagingSenderId: "250597409350",
  appId: "1:250597409350:web:d591485272e721ed8e4047",
  measurementId: "G-BJGXNSQRV8"
})

const auth = firebase.auth();
const firestore = firebase.firestore();
firebase.analytics();

function App() {
  const [user] = useAuthState(auth);
  
  return (
    <div className="App">
      <header>
        <h1>Chat App</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn /> }
      </section>
    </div>
  );
}

function SignIn(){
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return(
    <button className="sign-in" onClick={signInWithGoogle}><img src={googleIcon} alt="Google"></img>Sign in with Google</button>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  const dummy = useRef(null);

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt', 'desc').limit(25);

  const [messages] = useCollectionData(query, {idField: 'id'});
  const [formValue, setFormValue] = useState('');
  console.log(messages)

  const scrollToBottom = () => {
    dummy.current.scrollIntoView({behavior: 'smooth'});
  }

  useEffect(() => {
    scrollToBottom();
  });

  const sendMessage = async(e) => {
    e.preventDefault();

    const {uid, photoURL} = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue('');
    scrollToBottom();
  }

  return (
    <>
      <main>
        {messages && messages.reverse().map(msg => <ChatMessage key={msg.id} message={msg} />)}
      
        <span ref={dummy}></span>

      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Type a message"/>

        <button type="submit" disabled={!formValue || formValue.replace(/^\s+/, '').replace(/\s+$/, '') === ''}>Send</button>
      </form>
    </>
  )
}

function ChatMessage(props) {
  const {text, uid, photoURL} = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL || dummyAvatar} alt="avatar" />
      <p>{text}</p>
    </div>
  )
}

export default App;
