import React, { useState } from "react";
import EmojiPicker from "emoji-picker-react";
function ChatInput({ onSend }) {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const handleEmojiClick = (emojiData, event) => {
    setText((prev) => prev + emojiData.emoji);
  };
  const handleSend = () => {
    if (text.trim()) {
      onSend(text);
      setText("");
    }
  };
  return (
    <div className="position-relative">
      <div className="d-flex align-items-center p-2">
        <button
          type="button"
          className="btn btn-light me-2"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
        >
          🥰
        </button>
        <input
          type="text"
          className="form-control"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          type="button"
          className="btn btn-success ms-2"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
      {showEmojiPicker && (
        <div style={{ position: "absolute", bottom: "60px", zIndex: 1000 }}>
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
    </div>
  );
}
export default ChatInput;









