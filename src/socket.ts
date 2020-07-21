import { Server } from "http";
import { Socket } from "socket.io";

let io: Socket;

export const socket = {
    init: (httpServer: Server) => {
        io = require('socket.io')(httpServer)
        return io;
    },
    getIO: () => {
        if (!io) throw new Error("Socket.io was not initialized");
        return io;
    }
}