let actualUsername;

const ioClient = io({ // création du socket client avec le namespace de base "/"
    reconnection: false
});

// Connexion au socket par default
ioClient.on('connect', () => {
    console.log("connexion OK");
});

//connexion au ns global /userconversation
ioClient.on('rooms', ({rooms, username}) => {
    actualUsername = username;
    for(let room of rooms){
        ioClient.emit("joinRoom", room._id)
    }
})

//Joindre un nouvelle room
ioClient.on('room', room => {
    ioClient.emit('joinRoom', room._id)
})

// Quand le room est connecté
ioClient.on('connected', ({room, _id}) => {
    createRoomItem(room, _id);
})

// A le reception d'un message
ioClient.on("message", (data) => {
    insertMessage(data)
})

// Ouverture d'une fenetre de conversation
ioClient.on('newRoom', ({room, _id, newRoom}) => {
    const contact = room.users.filter(user => user._id !== _id);
    newRoom && createRoomItem(room, _id);
    createUserConversation(room._id, contact);
})


