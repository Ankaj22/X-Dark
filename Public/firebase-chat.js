/* =====================================================
   X-DARK FIREBASE REAL-TIME CHAT
   ===================================================== */

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


/* =====================================================
   FIREBASE CONFIG
   ===================================================== */

const firebaseConfig = {

  apiKey: "AIzaSyC8Hfx0E7OpnfclF7UGYVcmdU38yuxtsBY",

  authDomain: "darkwing-a717a.firebaseapp.com",

  projectId: "darkwing-a717a",

  storageBucket: "darkwing-a717a.firebasestorage.app",

  messagingSenderId: "352453390196",

  appId: "1:352453390196:web:7c375a26a823b5633a4621",

  measurementId: "G-5RVX9NET3W"

};


/* =====================================================
   INITIALIZE FIREBASE
   ===================================================== */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


/* =====================================================
   GLOBAL STATE
   ===================================================== */

let firebaseUser = null;

let unsubscribeMessages = null;

let activeChat = "";


/* =====================================================
   AUTHENTICATION
   ===================================================== */

signInAnonymously(auth)
  .then(() => {

    console.log("🔥 X-DARK Firebase anonymous login started");

  })
  .catch((error) => {

    console.error(
      "Firebase Anonymous Login Error:",
      error
    );

    if (typeof toast === "function") {

      toast("Firebase login failed");

    }

  });


onAuthStateChanged(auth, (user) => {

  if (!user) {

    firebaseUser = null;

    console.log("Firebase user signed out");

    return;

  }

  firebaseUser = user;

  console.log(
    "🔥 Firebase connected",
    user.uid
  );

});


/* =====================================================
   CHAT ID
   ===================================================== */

function getChatId(name) {

  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

}


/* =====================================================
   TIME FORMAT
   ===================================================== */

function formatTime(timestamp) {

  if (!timestamp) {

    return "";

  }

  try {

    const date =
      timestamp.toDate
        ? timestamp.toDate()
        : new Date(timestamp);

    return date.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );

  } catch (error) {

    return "";

  }

}


/* =====================================================
   RENDER MESSAGE
   ===================================================== */

function renderFirebaseMessage(message) {

  if (!window.messages) {

    return;

  }

  const type =
    firebaseUser &&
    message.senderId === firebaseUser.uid
      ? "sent"
      : "received";


  const div =
    document.createElement("div");

  div.className =
    "message " + type;


  const text =
    document.createElement("span");

  text.textContent =
    message.text || "";


  div.appendChild(text);


  const time =
    document.createElement("span");

  time.className =
    "msg-time";

  time.textContent =
    formatTime(message.createdAt);


  div.appendChild(time);


  window.messages.appendChild(div);

}


/* =====================================================
   LOAD FIREBASE CHAT
   ===================================================== */

function loadFirebaseChat(name) {

  activeChat = name;

  const chatId =
    getChatId(name);


  if (unsubscribeMessages) {

    unsubscribeMessages();

    unsubscribeMessages = null;

  }


  if (window.messages) {

    window.messages.innerHTML = "";

  }


  /* DATE DIVIDER */

  if (window.messages) {

    const divider =
      document.createElement("div");

    divider.className =
      "date-divider";

    divider.textContent =
      "Today";

    window.messages.appendChild(divider);

  }


  const messagesRef =
    collection(
      db,
      "chats",
      chatId,
      "messages"
    );


  const messagesQuery =
    query(
      messagesRef,
      orderBy("createdAt", "asc")
    );


  unsubscribeMessages =
    onSnapshot(
      messagesQuery,

      (snapshot) => {

        if (!window.messages) {

          return;

        }


        window.messages.innerHTML = "";


        /* DATE DIVIDER */

        const divider =
          document.createElement("div");

        divider.className =
          "date-divider";

        divider.textContent =
          "Today";

        window.messages.appendChild(divider);


        snapshot.forEach((doc) => {

          const message =
            {
              id: doc.id,
              ...doc.data()
            };

          renderFirebaseMessage(message);

        });


        window.messages.scrollTop =
          window.messages.scrollHeight;

      },

      (error) => {

        console.error(
          "Firestore chat error:",
          error
        );


        if (typeof toast === "function") {

          toast(
            "Chat connection error"
          );

        }

      }

    );

}


/* =====================================================
   SEND FIREBASE MESSAGE
   ===================================================== */

async function sendFirebaseMessage(text) {

  if (!text) {

    return;

  }


  if (!firebaseUser) {

    toast(
      "Connecting to Firebase..."
    );

    return;

  }


  if (!activeChat) {

    return;

  }


  const chatId =
    getChatId(activeChat);


  try {

    await addDoc(

      collection(
        db,
        "chats",
        chatId,
        "messages"
      ),

      {

        text: text,

        senderId:
          firebaseUser.uid,

        senderName:
          "Ankaj",

        createdAt:
          serverTimestamp()

      }

    );


    console.log(
      "🔥 Message sent"
    );


  } catch (error) {

    console.error(
      "Send message error:",
      error
    );


    toast(
      "Message send failed"
    );

  }

}


/* =====================================================
   OVERRIDE EXISTING OPEN CHAT
   ===================================================== */

window.openChat =
  function(name, photo) {

    window.currentUser =
      name;


    if (window.conversationName) {

      window.conversationName.textContent =
        name;

    }


    if (window.conversationAvatar) {

      window.conversationAvatar.src =
        photo;

    }


    if (window.conversation) {

      window.conversation.classList.add(
        "active"
      );

    }


    loadFirebaseChat(name);


    setTimeout(() => {

      if (window.messageInput) {

        window.messageInput.focus();

      }

    }, 150);

  };


/* =====================================================
   OVERRIDE SEND MESSAGE
   ===================================================== */

window.sendMessage =
  function() {

    if (!window.messageInput) {

      return;

    }


    const text =
      window.messageInput.value.trim();


    if (!text) {

      return;

    }


    window.messageInput.value = "";


    sendFirebaseMessage(text);

  };


/* =====================================================
   CLOSE CHAT
   ===================================================== */

window.closeChat =
  function() {

    if (window.conversation) {

      window.conversation.classList.remove(
        "active"
      );

    }


    if (window.messageInput) {

      window.messageInput.value = "";

    }


    if (unsubscribeMessages) {

      unsubscribeMessages();

      unsubscribeMessages = null;

    }


    activeChat = "";

  };


/* =====================================================
   FIREBASE STATUS
   ===================================================== */

window.XDarkFirebase = {

  getUser: function() {

    return firebaseUser;

  },

  getChat: function() {

    return activeChat;

  },

  send: function(text) {

    return sendFirebaseMessage(text);

  },

  reload: function(name) {

    return loadFirebaseChat(name);

  }

};


console.log(
  "⚡ X-DARK Firebase Chat Loaded"
);
