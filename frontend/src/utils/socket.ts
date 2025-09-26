import { io, Socket } from "socket.io-client";
import { BACKEND_URL } from "../config";

let socket: Socket | null = null;

export function connectSocket() {
  if (!socket) {
    socket = io(BACKEND_URL, { transports: ["websocket"] });
  }
  return socket;
}

export function getSocket() {
  if (!socket) throw new Error("Socket not initialized. Call connectSocket() first.");
  return socket;
}
