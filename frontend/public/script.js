



(function () {


  console.log("ChatRoom:", sessionStorage.getItem("chatRoom"));
  const chatRoomDetails = JSON.parse(sessionStorage.getItem("chatRoom"));
  if (!chatRoomDetails) {
    //alert(":warning: No chatroom found in session!");
    window.location.href = "http://localhost:3000/login"
    // navigate("/login")
    return;
  }

  const { sender, receiver } = chatRoomDetails;

  const chatRoomData = chatRoomDetails.data ? chatRoomDetails.data : chatRoomDetails
  console.log("chatRoomData", chatRoomData)
  const { id, room_type, name } = chatRoomData
  const chatroomId = id
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
    const response = await fetch(
      `http://127.0.0.1:8000/messages/?chatroom_id=${chatroomId}`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("access")}`,
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
    console.log("Connected to WebSocket");
    // join payload
    const payload = {
      type: "join",
      username: sessionStorage.getItem("username"),
      chatroom_id: chatroomId,
    };
    socket.send(JSON.stringify(payload));
  
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
      payload = {
        type: "chat",
        receiver_id: receiver,
        sender_id: sender,
        chatroom_id: chatroomId,
        content: val,
      };
    } else {
      payload = {
        type: "chat",
        sender_id: sessionStorage.getItem("userid"),
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



