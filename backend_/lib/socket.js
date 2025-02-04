const { Server } = require ("socket.io");
const http = require ('http')
const express = require ('express');
const cors = require ("cors");

const app = express();
const server = http.createServer(app);


const io = new Server(server,
    // add cors
    cors({
      origin:'http://localhost:5173', // Add multiple origins if needed
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
);

const getReceiverSocketId = (userId) => {
    return userSocketMap[userId]
}

//used to store online users
const userSocketMap = {};  // userId: socketId

io.on("connection" , (socket) =>{
    console.log("A user connected" , socket.id);

    const userId = socket.handshake.query.userId

    if(userId) userSocketMap[userId] = socket.id;
    console.log("User ID added:", userId);

    // io.emit() is used to send events to all the connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    console.log("Updated Online Users:", Object.keys(userSocketMap));


    socket.on("disconnect", () =>{
        console.log("A user disconnected" , socket.id );
        delete userSocketMap[userId];

        io.emit("getOnlineUsers", Object.keys(userSocketMap))
        console.log("Updated Online Users after disconnect:", Object.keys(userSocketMap));

    });
    
})

module.exports = { io, app, server, getReceiverSocketId};
