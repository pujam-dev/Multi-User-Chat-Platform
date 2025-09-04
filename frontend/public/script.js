// // static/script.js
// (function () {
//   // prompt for username
//   let username = "";


// console.log("inside script.js",sessionStorage.getItem('chatRoom'))
// //response {"data":{"id":2,"name":"","room_type":"private","participant_id":[1,3],"created_at":"2025-09-01T13:10:02.014297Z"},"sender":3,"receiver":1}
// chatRoomDetails=JSON.parse(sessionStorage.getItem('chatRoom'))
// const {data,sender,receiver}=chatRoomDetails
// //console.log(data.id,sender,receiver)

//   const wsUrl = "ws://127.0.0.1:9000/ws";
//   const socket = new WebSocket(wsUrl);

//   const messagesEl = document.getElementById("messages");
//   const textInput = document.getElementById("text");
//   const sendBtn = document.getElementById("sendBtn");
//   const onlineCountEl = document.getElementById("onlineCount");

//   // helper to append message
//   function appendMessage(content, kind) {
//     const div = document.createElement("div");
//     div.className = "msg " + (kind || "other");
//     div.innerHTML = content;
//     messagesEl.appendChild(div);
//     messagesEl.scrollTop = messagesEl.scrollHeight;
//   }

//   async function loadOldMessages(chatroomId) {
//   const response = await fetch(`http://127.0.0.1:8000/messages/?chatroom_id=${chatroomId}`, {
//     headers: {
//       "Authorization": `Bearer ${localStorage.getItem("access")}`
//     }
//   });
//   const messages = await response.json();
//   console.log("Previous messages:", messages);
//   messages.forEach(msg => {
//     const kind = msg.sender_id === sender ? "me" : "other";
//     appendMessage(`<strong>${msg.sender_name}:</strong> ${msg.content}`, kind);
//   });
// }



//   socket.addEventListener("open", function () {
//     // send username as first message to register
//    // socket.send(localStorage.getItem('username'));
//         payload={
//       'type':'join',
//       'username':localStorage.getItem('username'),
//       'chatroom_id':data.id
//     }
//     socket.send(JSON.stringify(payload));
//     loadOldMessages(data.id)
//   });

//   socket.addEventListener("message", function (event) {
//     try {
//       const data = JSON.parse(event.data);
//       if (data.type === "system") {
//         const text = data.message;
//         const div = document.createElement("div");
//         div.className = "system";
//         div.textContent = text;
//         messagesEl.appendChild(div);
//       } else if (data.type === "chat") {
//         const sender = data.username;
//         const msg = data.message;
//         if (sender === username) {
//           appendMessage(`<strong>${sender}:</strong> ${msg}`, "me");
//         } else {
//           appendMessage(`<strong>${sender}:</strong> ${msg}`, "other");
//         }
//       }
//     } catch (err) {
//       // fallback if server sent plain text
//       appendMessage(event.data, "other");
//     }
//   });

//   socket.addEventListener("close", function () {
//     appendMessage("⚠️ Disconnected from server", "system");
//   });

//   sendBtn.addEventListener("click", function () {
//     const val = textInput.value.trim();
//     if (!val) return;
//     payload={
//       'type':'chat',
//       'receiver_id':receiver,
//       'sender_id':sender,
//       'chatroom_id':data.id,
//       'content':val
//     }
//     socket.send(JSON.stringify(payload));
//     textInput.value = "";
//   });

//   textInput.addEventListener("keydown", function (e) {
//     if (e.key === "Enter") {
//       sendBtn.click();
//     }
//   });
// })();




(function () {
  console.log("ChatRoom:", sessionStorage.getItem("chatRoom"));
  const chatRoomDetails = JSON.parse(sessionStorage.getItem("chatRoom"));
  if (!chatRoomDetails) {
    alert(":warning: No chatroom found in session!");
    return;
  }
  // Private ke liye tum JSON me sender, receiver save kar rahi ho
  // Public group ke liye tum JSON me {id, name, room_type, participants} save karti ho
  const {  sender, receiver } = chatRoomDetails;
 
 const chatRoomData = chatRoomDetails.data ? chatRoomDetails.data : chatRoomDetails
console.log("chatRoomData",chatRoomData)
  const {id,room_type,name}=chatRoomData
  const chatroomId=id
  const wsUrl = "ws://127.0.0.1:9000/ws";
  const socket = new WebSocket(wsUrl);
  const messagesEl = document.getElementById("messages");
  const textInput = document.getElementById("text");
  const sendBtn = document.getElementById("sendBtn");
  function appendMessage(content, kind) {
    const div = document.createElement("div");
    div.className = "msg " + (kind || "other");
    div.innerHTML = content;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  async function loadOldMessages(chatroomId) {
    const response = await fetchWithAuth(
      `http://127.0.0.1:8000/messages/?chatroom_id=${chatroomId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      }
    );
    const messages = await response.json();
    console.log("Previous messages:", messages);
    messages.forEach((msg) => {
      const kind = msg.sender_id === sender ? "me" : "other";
      appendMessage(`<strong>${msg.sender_name}:</strong> ${msg.content}`, kind);
    });
  }
  socket.addEventListener("open", function () {
    console.log(":white_check_mark: Connected to WebSocket");
    // join payload
    const payload = {
      type: "join",
      username: localStorage.getItem("username"),
      chatroom_id: chatroomId ,
    };
    socket.send(JSON.stringify(payload));
    // old msgs load karo
    loadOldMessages(chatroomId);
  });
  socket.addEventListener("message", function (event) {
    try {
      const incoming = JSON.parse(event.data);
      if (incoming.type === "system") {
        const div = document.createElement("div");
        div.className = "system";
        div.textContent = incoming.message;
        messagesEl.appendChild(div);
      } else if (incoming.type === "chat") {
        const msgSender = incoming.username;
        const msg = incoming.message;
        const kind = incoming.sender_id === sender ? "me" : "other";
        appendMessage(`<strong>${msgSender}:</strong> ${msg}`, kind);
      }
    } catch (err) {
      appendMessage(event.data, "other");
    }
  });
  socket.addEventListener("close", function () {
    appendMessage(":warning: Disconnected from server", "system");
  });
  sendBtn.addEventListener("click", function () {
    const val = textInput.value.trim();
    if (!val) return;
    let payload;
    if (room_type === "private") {
      // private message ke liye receiver_id zaroori hai
      payload = {
        type: "chat",
        receiver_id: receiver,
        sender_id: sender,
        chatroom_id: data.id,
        content: val,
      };
    } else {
      // group chat me receiver_id nahi hota
      payload = {
        type: "chat",
        sender_id:localStorage.getItem("userid"),
        chatroom_id: id,
        content: val,
      };
    }
    socket.send(JSON.stringify(payload));
    textInput.value = "";
  });
  textInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      sendBtn.click();
    }
  });
})();



