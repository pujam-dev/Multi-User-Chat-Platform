# main.py
import json
import requests
from typing import Dict, List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import uvicorn
app = FastAPI()
DJANGO_API_URL = "http://127.0.0.1:8000/messages/"
# Room wise connection manager
class ConnectionManager:
    def __init__(self):
        # room_id -> list of connections
        self.rooms: Dict[str, List[WebSocket]] = {}
        # connection -> username
        self.usernames: Dict[WebSocket, str] = {}
        # connection -> room_id
        self.user_rooms: Dict[WebSocket, str] = {}

    async def add(self, websocket: WebSocket, username: str, room_id: str):
        # user join karega room_id me
        if room_id not in self.rooms:
            self.rooms[room_id] = []
        self.rooms[room_id].append(websocket)
        self.usernames[websocket] = username
        self.user_rooms[websocket] = room_id
        await self.broadcast_system(room_id, f"🟢 {username} joined room {room_id}")

    def remove(self, websocket: WebSocket) -> str:
        username = self.usernames.pop(websocket, None)
        room_id = self.user_rooms.pop(websocket, None)
        if room_id and websocket in self.rooms.get(room_id, []):
            self.rooms[room_id].remove(websocket)
            # agar room empty ho jaye toh delete kar do
            if not self.rooms[room_id]:
                del self.rooms[room_id]
        return username, room_id
    
    async def broadcast(self, room_id: str, payload: dict):
        """send message to all users of a room"""
        text = json.dumps(payload)
        for conn in list(self.rooms.get(room_id, [])):
            try:
                await conn.send_text(text)
            except Exception:
                self.remove(conn)

    async def broadcast_system(self, room_id: str, message: str):
        await self.broadcast(room_id, {"type": "system", "message": message})

manager = ConnectionManager()

@app.websocket("/ws")

async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        # client se first message ayega -> join payload
        # example: {"type": "join", "username": "Alice", "chatroom_id": "123"}
        join_data = await websocket.receive_text()
        join_payload = json.loads(join_data)
        if join_payload.get("type") != "join":
            await websocket.close()
            return
        username = join_payload["username"]
        room_id = join_payload["chatroom_id"]
        # register user
        await manager.add(websocket, username, room_id)
        # ab infinite loop messages ke liye
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            if payload.get("type") == "chat":
                sender = payload["sender_id"]
                receiver = payload["receiver_id"]
                chatroom = payload["chatroom_id"]
                content = payload["content"]
                print(f"🟢 Room {chatroom} | {sender} → {receiver}: {content}")
                # Django API me save karo
                response = requests.post(DJANGO_API_URL, json={
                    "sender_id": sender,
                    "receiver_id": receiver,
                    "chatroom_id": chatroom,
                    "content": content
                })
                if response.status_code == 201:
                    print("🟢 Message saved in Django")
                else:
                    print(":x: Django save error:", response.text)
                # broadcast message to same room
                await manager.broadcast(chatroom, {
                    "type": "chat",
                    "username": username,
                    "message": content,
                    "sender_id": sender,
                    "receiver_id": receiver
                })

    except WebSocketDisconnect:
        left_user, room_id = manager.remove(websocket)
        if left_user and room_id:
            await manager.broadcast_system(room_id, f"🔴  {left_user} left room {room_id}")



















