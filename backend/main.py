# main.py
import json
from pathlib import Path
from typing import List, Dict

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

app = FastAPI()




# Connection manager to handle multiple clients
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.usernames: Dict[WebSocket, str] = {}  # map websocket -> username

    # add connection AFTER websocket.accept() has been called
    async def add(self, websocket: WebSocket, username: str):
        self.active_connections.append(websocket)
        self.usernames[websocket] = username
        # notify everyone that user joined
        await self.broadcast_system(f"🟢 {username} joined the chat")

    def remove(self, websocket: WebSocket) -> str:
        # remove connection and return username (if any)
        username = self.usernames.pop(websocket, None)
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        return username

    async def broadcast(self, payload: dict):
        text = json.dumps(payload)
        for conn in list(self.active_connections):
            try:
                await conn.send_text(text)
            except Exception:
                # if sending fails, remove connection
                self.remove(conn)

    async def broadcast_system(self, message: str):
        await self.broadcast({"type": "system", "message": message})


manager = ConnectionManager()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # Accept connection first
    await websocket.accept()

    # Expect the client to send username as first message
    try:
        username = await websocket.receive_text()
    except WebSocketDisconnect:
        return

    # register connection
    await manager.add(websocket, username)

    try:
        while True:
            text = await websocket.receive_text()  # chat message from this client
            # build payload
            payload = {
                "type": "chat",
                "username": username,
                "message": text
            }
            # broadcast to all connected clients (including sender)
            await manager.broadcast(payload)

    except WebSocketDisconnect:
        left_user = manager.remove(websocket)
        if left_user:
            await manager.broadcast_system(f"🔴 {left_user} left the chat")
