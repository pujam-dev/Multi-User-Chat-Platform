// static/script.js
(function () {
  // prompt for username
  let username = "";
  while (!username) {
    username = prompt("Enter username (will be visible to others):");
    if (username) username = username.trim();
  }

  const wsUrl = (location.protocol === "https:" ? "wss://" : "ws://") + location.host + "/ws";
  const socket = new WebSocket(wsUrl);

  const messagesEl = document.getElementById("messages");
  const textInput = document.getElementById("text");
  const sendBtn = document.getElementById("sendBtn");
  const onlineCountEl = document.getElementById("onlineCount");

  // helper to append message
  function appendMessage(content, kind) {
    const div = document.createElement("div");
    div.className = "msg " + (kind || "other");
    div.innerHTML = content;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  socket.addEventListener("open", function () {
    // send username as first message to register
    socket.send(username);
  });

  socket.addEventListener("message", function (event) {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "system") {
        const text = data.message;
        const div = document.createElement("div");
        div.className = "system";
        div.textContent = text;
        messagesEl.appendChild(div);
      } else if (data.type === "chat") {
        const sender = data.username;
        const msg = data.message;
        if (sender === username) {
          appendMessage(`<strong>${sender}:</strong> ${msg}`, "me");
        } else {
          appendMessage(`<strong>${sender}:</strong> ${msg}`, "other");
        }
      }
    } catch (err) {
      // fallback if server sent plain text
      appendMessage(event.data, "other");
    }
  });

  socket.addEventListener("close", function () {
    appendMessage("⚠️ Disconnected from server", "system");
  });

  sendBtn.addEventListener("click", function () {
    const val = textInput.value.trim();
    if (!val) return;
    socket.send(val);
    textInput.value = "";
  });

  textInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      sendBtn.click();
    }
  });
})();
