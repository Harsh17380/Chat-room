const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector(".chat-messages")
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

// Getting username and room info from url
const {username , room} = Qs.parse(location.search ,{
    ignoreQueryPrefix : true
})

const socket = io();

// Join Chat room
socket.emit('joinRoom' , {username , room});

function outputRoomName(room) {
    roomName.innerText = room ;
}

function outputUsers(users) {
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}

// Get room users
socket.on('roomUsers' , ({room , users }) =>{
    outputRoomName(room);
    outputUsers(users);
})

socket.on('message' , message =>{
    // To output message in console
    console.log(message);
    // To output message in chatroom
    outputMessage(message)
    // scrolling functionality
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit listener
chatForm.addEventListener('submit' , (e)=>{
    e.preventDefault();
    const msg = e.target.msg.value;
    socket.emit('chatMessage',msg);

    // clearing the chat after the message is sent
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
})
// function for show the message on the screen
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');

    div.innerHTML = `<p class="meta">${message.username}<span> ${message.time}</span></p>
    <p class="text">${message.text}</p>`;
    document.querySelector(".chat-messages").appendChild(div);
}