# main.py
import asyncio
import json
import requests
from typing import Dict, List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import uvicorn
app = FastAPI()
DJANGO_API_URL = "http://127.0.0.1:8000/messages/"

class ConnectionManager:
    def __init__(self):
        # room_id -> list of connections
        self.rooms: Dict[str, List[WebSocket]] = {}
        # connection -> username
        self.usernames: Dict[WebSocket, str] = {}
        # connection -> room_id
        self.user_rooms: Dict[WebSocket, str] = {}

    async def add(self, websocket: WebSocket, username: str, room_id: str):
        
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






class NotificationManager:
    def __init__(self):
        self.notifications: Dict[str, List[WebSocket]] = {}
    async def add(self, websocket: WebSocket, user_id: str):
        if user_id not in self.notifications:
            self.notifications[user_id] = []
        self.notifications[user_id].append(websocket)
        print(f"[notify] added connection for user {user_id} (total={len(self.notifications[user_id])})")
    def remove(self, websocket: WebSocket):
        for user_id, conns in list(self.notifications.items()):
            if websocket in conns:
                conns.remove(websocket)
                print(f"[notify] removed connection for user {user_id} (remaining={len(conns)})")
                if not conns:
                    del self.notifications[user_id]
    async def send_notification(self, user_id: str, message: dict):
        text = json.dumps(message)
        conns = list(self.notifications.get(user_id, []))
        print(f"[notify] sending to {user_id} ({len(conns)} conns): {message}")
        for conn in conns:
            try:
                await conn.send_text(text)
            except Exception as e:
                print("[notify] send failed, removing conn:", e)
                self.remove(conn)
notification_manager = NotificationManager()


@app.websocket("/ws/notify/{user_id}")
async def websocket_notify(websocket: WebSocket, user_id: str):
    
    await websocket.accept()
    await notification_manager.add(websocket, user_id)
   
    try:
        await websocket.send_text(json.dumps({"type": "system", "message": "notify_connected"}))
    except Exception as e:
        print("[notify] failed to send initial ack:", e)
    try:
        
        while True:
            
            await asyncio.sleep(30)
            
            try:
                await websocket.send_text(json.dumps({"type": "ping"}))
            except Exception:
                
                break
    except WebSocketDisconnect:
        print("[notify] websocket disconnect exception")
    except Exception as e:
        print("[notify] exception in notify loop:", e)
    finally:
        notification_manager.remove(websocket)
        try:
            await websocket.close()
        except Exception:
            pass









@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:

        join_data = await websocket.receive_text()
        join_payload = json.loads(join_data)
        if join_payload.get("type") != "join":
            await websocket.close()
            return
        username = join_payload["username"]
        room_id = join_payload["chatroom_id"]
        # register user
        await manager.add(websocket, username, room_id)
        
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            if payload.get("type") == "chat":
                sender = payload["sender_id"]
                receiver = payload.get("receiver_id")
                chatroom = payload["chatroom_id"]
                content = payload["content"]
                print(f"🟢 Room {chatroom} | {sender} → {receiver}: {content}")

                save_data={
                     "sender_id": sender,
                    "chatroom_id": chatroom,
                    "content": content
                }
                if receiver:
                    save_data["receiver_id"]=receiver
               
                response = requests.post(DJANGO_API_URL, json=save_data)
                if response.status_code == 201:
                    print("🟢 Message saved in Django")
                else:
                    print(":x: Django save error:", response.text)
               
                await manager.broadcast(chatroom, {
                    "type": "chat",
                    "username": username,
                    "message": content,
                    "sender_id": sender,
                    "receiver_id": receiver
                })

                
                if receiver and receiver != sender:
                    await notification_manager.send_notification(str(receiver),{
                            "type":"notification",
                            "chatroom_id":chatroom,
                            "message":content
                        })


    except WebSocketDisconnect:
        left_user, room_id = manager.remove(websocket)
        if left_user and room_id:
            await manager.broadcast_system(room_id, f"🔴  {left_user} left room {room_id}")



















