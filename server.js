const express = require('express');
const app = express();
const port = 3000 || process.env.port;
const path = require('path');
const http = require('http');
const server = http.createServer(app);
const socketio = require('socket.io');
const io = socketio(server);
const formatMessage = require('./utils/messages')
const bot = 'Chat bot'
const {userJoin, getCurrentUser , userLeave, getRoomUser} = require('./utils/users');

// Serving the public folder as static folder for the server
app.use(express.static(path.join(__dirname, 'public')))

//Server.io runs when client connects
io.on('connection' , socket =>{
    // For joining the exact room with exact name
    socket.on('joinRoom' , ({username , room }) =>{
        // for joining the particular room as selected
        const user = userJoin(socket.id , username , room);
        socket.join(user.room)

        // Welcome message for current user
        socket.emit('message',formatMessage(bot,'Welcome to chat cord'));

        // Broadcast.emit :- everyone get notified that user is connecting without notifying user
        socket.broadcast.to(user.room).emit('message',formatMessage('bot',`${user.username} has joined the chat`));
        // send user and room info
        io.to(user.room).emit('roomUsers' , {
            room: user.room,
            users: getRoomUser(user.room)
        })
    })

    // Message listener
    socket.on('chatMessage' , (msg)=>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    })

    //When user disconnect
    socket.on('disconnect' , ()=>{
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit('message',formatMessage('bot',`${user.username} have left the chat`));
            // send user and room info
            io.to(user.room).emit('roomUsers' , {
                room: user.room,
                users: getRoomUser(user.room)
            });
        }
    });
});

//listening the sever on port 3000
server.listen(port , () => console.log(`Server running on port ${port}`));