import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmojiPicker from "emoji-picker-react";
export default function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();
  const chatRoomDetails = JSON.parse(sessionStorage.getItem("chatRoom"));
  const username = sessionStorage.getItem("username");
  useEffect(() => {
    if (!chatRoomDetails) {
      navigate("/login");
      return;
    }
    const { sender, receiver } = chatRoomDetails;
    const chatRoomData = chatRoomDetails.data || chatRoomDetails;
    const { id, room_type, name } = chatRoomData;
    const chatroomId = id;
    const wsUrl = "ws://127.0.0.1:9000/ws";
    const ws = new WebSocket(wsUrl);
    setSocket(ws);
    function appendMessage(content, kind) {
      setMessages((prev) => [...prev, { content, kind }]);
    }
    async function loadOldMessages(chatroomId) {
      const response = await fetch(
        `http://127.0.0.1:8000/messages/?chatroom_id=${chatroomId}`,
        {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("access")}` },
        }
      );
      const oldMessages = await response.json();
      oldMessages.forEach((msg) => {
        const kind = msg.sender_id === sender ? "me" : "other";
        appendMessage(`<strong>${msg.sender_name}:</strong> ${msg.content}`, kind);
      });
    }
    ws.addEventListener("open", () => {
      const payload = {
        type: "join",
        username,
        chatroom_id: chatroomId,
      };
      ws.send(JSON.stringify(payload));
      loadOldMessages(chatroomId);
    });
    ws.addEventListener("message", (event) => {
      try {
        const incoming = JSON.parse(event.data);
        if (incoming.type === "system") {
          appendMessage(incoming.message, "system");
        } else if (incoming.type === "chat") {
          const kind = incoming.sender_id == sessionStorage.getItem("userid") ? "me" : "other";
          appendMessage(`<strong>${incoming.username}:</strong> ${incoming.message}`, kind);
        }
      } catch {
        appendMessage(event.data, "other");
      }
    });
    ws.addEventListener("close", () => {
      appendMessage(":warning: Disconnected from server", "system");
    });
    return () => {
      ws.close();
    };
  }, [navigate]);
  const handleSend = () => {
    if (!text.trim() || !socket || socket.readyState !== WebSocket.OPEN) return;
    const { sender, receiver } = chatRoomDetails;
    const chatRoomData = chatRoomDetails.data || chatRoomDetails;
    const { id, room_type } = chatRoomData;
    const chatroomId = id;
    const payload =
      room_type === "private"
        ? {
            type: "chat",
            receiver_id: receiver,
            sender_id: sender,
            chatroom_id: chatroomId,
            content: text,
          }
        : {
            type: "chat",
            sender_id: sessionStorage.getItem("userid"),
            chatroom_id: id,
            content: text,
          };
    socket.send(JSON.stringify(payload));
    setText("");
  };
  const handleEmojiClick = (emojiData, event) => {
    setText((prev) => prev + emojiData.emoji);
  };
  if (!chatRoomDetails) return null;
  const chatRoomData = chatRoomDetails.data || chatRoomDetails;
  const { name } = chatRoomData;
  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "20px auto", border: "1px solid #ddd", borderRadius: "8px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
      <div style={{ padding: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          style={{ background: "#007bff", color: "white", border: "none", borderRadius: "4px", padding: "6px 12px", cursor: "pointer" }}
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <h4 style={{ margin: 0 }}>Chatting with: {name || "Unknown User"}</h4>
      </div>
      <div id="messages" style={{ height: "400px", overflowY: "auto", padding: "5px", backgroundColor: "#f9f9f9" }}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`msg ${msg.kind}`} style={{
            background: msg.kind === "me" ? "#dcf8c6" : msg.kind === "system" ? "#eee" : "#f1f0f0",
            textAlign: msg.kind === "me" ? "right" : "left",
            margin: "8px 0",
            padding: "10px",
            borderRadius: "8px",
            maxWidth: "95%",
          }} dangerouslySetInnerHTML={{ __html: msg.content }}></div>
        ))}
      </div>
      <div style={{ position: "relative", display: "flex", padding: "10px", borderTop: "1px solid #ddd", alignItems: "center" }}>
        <button
          type="button"
          className="btn btn-light me-2"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
        >
          😀
        </button>
        {showEmojiPicker && (
          <div style={{ position: "absolute", bottom: "60px", zIndex: 1000 }}>
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="form-control"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="btn btn-success ms-2"
        >
          Send
        </button>
      </div>
    </div>
  );
}



