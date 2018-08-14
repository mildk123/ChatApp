// Service Worker
if(ServiceWorker in navigator){
  navigator.serviceWorker.register('sw.js')
  .then(response => console.log(`[Service Worker] Registered!`, response))
  .catch(err => console.log(`[Service Worker] Registered!`, err))
}



let form = document.getElementById("form_data");
var database = firebase.database();

let signUpfName;
let signUplName;
let signUpFullName;
let signUpEmail;
let signUpPassword;

let usersEmail = "";
let usersFirstName = "";
let usersLastName = "";
let usersFullName = "";
let usersPassword = "";

let SignUpMyUid = "";
let loginMyUid = "";
let MyUid = SignUpMyUid || loginMyUid;

// Sign UP Event Handler
$("#signUpBtn").on("click", function() {
  signup();
});

// Login Event Handler
$("#loginBtn").on("click", function() {
  login();
});

// Sign Out Event Handler
$("#signOutBtn").on("click", function() {
  signOut();
});

// Send Msg Event Handler
$("#sendMsgBtn").on("click", function() {
  sendMessages();
});

// The Function That DOes EVERYTHIng
document.addEventListener("DOMContentLoaded", function() {
  checkState();
});

// Users State Check
// users.i is the state of users
// USERS>UID is the my uid
function checkState() {
  firebase.auth().onAuthStateChanged(function(user) {
    let usersState = user.I;
    MyUid = user.uid;
    if (usersState == true && location.pathname == "/signup.html") {
      location.pathname == "/chatPage.html";
      location.href = `${location.origin}/chatPage.html`;
      $("#signOutBtn").css("display", "block");
    } else if (usersState == true && location.pathname == "/") {
      location.pathname == "/chatPage.html";
      location.href = `${location.origin}/chatPage.html`;
      document.getElementById("signOutBtn").style.display = "block";
      $("#signOutBtn").css("display", "block");
    } else if (usersState == true && location.pathname == "/index.html") {
      location.pathname == "/chatPage.html";
      location.href = `${location.origin}/chatPage.html`;
      $("#signOutBtn").css("display", "block");
    } else if (usersState == true && location.pathname == "/chatPage.html") {
      $("#signOutBtn").css("display", "block");
      gettingUsersList();
      gettingMsgFromDatabase();
    } else if ((user)  && (location.pathname == "/chatPage.html")) {
      $("#signOutBtn").css("display", "none");
      location.pathname == "/index.html";
      location.href = `${location.origin}/index.html`;
    }
  });
}

// Create Account Function
function signup() {
  signUpfName = $("#userFname").val();
  signUplName = $("#userLname").val();
  signUpFullName = `${signUpfName} ${signUplName}`;
  signUpEmail = $("#userEmail").val();
  signUpPassword = $("#userPassword").val();

  // Sending DATA To Authentication
  firebase
    .auth()
    .createUserWithEmailAndPassword(signUpEmail, signUpPassword)
    .then(function(res) {
      SignUpMyUid = res.user.uid;

      location.pathname = "/chatPage.html";
    })
    .catch(function(error) {
      alert(error.message);
    });

  // Sending DATA TO DATABASE
  var userList = database.ref("Users").push();
  userList.set({
    firstName: signUpfName,
    lastName: signUplName,
    fullName: signUpFullName,
    email: signUpEmail,
    password: signUpPassword
  });
  return false;
}

// Login Function
function login() {
  var loginEmail = document.getElementById("loginEmail").value;
  var loginPassword = document.getElementById("loginPassword").value;

  firebase
    .auth()
    .signInWithEmailAndPassword(loginEmail, loginPassword)
    .then(function(response) {
      loginMyUid = response.user.uid;
      location.pathname = "chatPage.html";
    })
    .catch(function(error) {
      alert(error.message);
    });
}

// SignOut Function
function signOut() {
  firebase
    .auth()
    .signOut()
    .then(function() {
      // Sign-out successful.
      location.pathname = "index.html";
    })
    .catch(function(error) {
      // An error happened.
      alert("Sign Out Failed");
      location.reload(true);
    });
}

// Gets the Total list of account On Database
function gettingUsersList() {
  let userPlace = document.getElementById("usersList");

  var usersRef = database.ref("Users");
  usersRef.on("child_added", function(data) {
    let users = data.val();

    usersEmail = users.email;
    usersFirstName = users.firstName;
    usersLastName = users.lastName;
    usersFullName = users.fullName;
    usersPassword = users.password;

    // SETTING USERS AVATAR
    var intials = usersFirstName.charAt(0) + usersLastName.charAt(0);
    // console.log(intials);

    let row = genrateUsersList(usersFullName, intials);

    userPlace.innerHTML += row;
  });
}

// Genrates A html format of users
function genrateUsersList(Name, avatar) {
  return `<li class="user_id">
    <div>
        <div id="users_avatar">${avatar}</div>
        <div id="users_name">${Name}</div>
    </div>
    </li>`;
}

// CONFIRM USERS BEFORE SENDING MESSAGE TO DB
function sendMessages() {
  firebase.auth().onAuthStateChanged(function(response) {
    if (response) {
      pushingMessagesToDatabase();
    } else {
      alert("You Must Login First");
    }
  });
}
// SENDING MESSAGE TO DB
function pushingMessagesToDatabase() {
  msg = $("#message_textBox").val();
  var userMsg = database.ref(`Chats/Messages`).push();
  userMsg.set({
    msgMessage: msg,
    msgEmail: signUpEmail || usersEmail,
    msgFname: signUpfName || usersFirstName,
    msgLname: signUplName || usersLastName,
    msgFullName: signUpFullName || usersFullName,
    msgFrom: SignUpMyUid || loginMyUid || MyUid,
    msgTimestamp: new Date().toLocaleTimeString()
  });
}

// GETS MESSAGES FROM SERVER & SERVES
function gettingMsgFromDatabase() {
  var msgPlace = document.getElementById("messagesArea");

  var getMsg = database.ref(`Chats/Messages`);
  getMsg.on("child_added", function(data) {
    let msgResponse = data.val();
    if (loginMyUid || SignUpMyUid || MyUid == msgResponse.msgFrom) {
      // SETTING USERS AVATAR
      var msgMyintials =
        msgResponse.msgFname.charAt(0) + msgResponse.msgLname.charAt(0);
      let myMessages = genrateMyMsgs(msgResponse, msgMyintials);

      msgPlace.innerHTML += myMessages;
    } else {
      let msgs = data.val();
      // SETTING USERS AVATAR
      var msgOtherintials =
        msgResponse.msgFname.charAt(0) + msgResponse.msgLname.charAt(0);
      let Messages = genrateOtherMsgs(msgs, msgOtherintials);

      msgPlace.innerHTML += Messages;
    }
  });
}

// MESSAGE FORMAT FOR OTHERS
function genrateOtherMsgs(msgs, avatar) {
  return `<li class="msg_id">
    <div>
        <div id="msg_avatar">${avatar}</div>
        <div id="user_msg">${msgs.msgMessage}
        <div id="msg_time">${msgs.msgTimestamp}</div>
        </div>
    </div>
    </li>`;
}

// MESSAGE FORMAT FOR ME
function genrateMyMsgs(msgs, avatar) {
  return `<li class="my_msg_id">
    <div>
        <div id="my_avatar">${avatar}</div>
        <div id="my_msg">${msgs.msgMessage}
        <div id="my_msg_time">${msgs.msgTimestamp}</div>
        </div>
    </div>
    </li>`;
}
