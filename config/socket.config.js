const socketio = require('socket.io');
const { getUserPerUsername } = require('../queries/users.queries');
const { findAllRoomsPerUserId, findRoomPerId, findOneRoomPerUserId, createRoom } = require('../queries/rooms.queries');
const { createMessage } = require('../queries/message.queries');
const { autorisation } = require('./guards.config');
let ios;
let clientSocketIds = [];

const initSocketServer = (server) => {
    ios = socketio(server, {
        allowRequest: autorisation
    })
    ios.on('connect', async (socket) => {

        // Ajout de l'utilisateur a la liste des utilisateurs connecté et on lui retourne ses rooms
        try{
            const {username, _id } = socket.request.user;
            clientSocketIds.push({ userId: _id.toString(), socketId: socket.id })
            const rooms = await findAllRoomsPerUserId(_id)
            socket.emit("rooms", {rooms ,username});
        } catch(e) {
            throw e;
        }

        // Ecouteur "joinRoom" pour se connecter a la room et emmetre la room au client
        socket.on("joinRoom", async (roomId) => {
            try {
                const room = await findRoomPerId(roomId);
                const { _id } = socket.request.user;
                socket.join(`/${ roomId }`);
                socket.emit("connected", {room , _id});
            } catch(e) {
                throw e;
            }
        })

        // Ecouteur qui recupére le message et le room , puis emet le message a la room concernée
        socket.on("message", async ({roomId, text}) => {
            try {
                const { username, _id } = socket.request.user;
                const newMessage = await createMessage({
                    author: _id,
                    room: roomId,
                    message: text,
                    authorName: username
                });
                ios.to(`/${ roomId }`).emit("message", newMessage);
            } catch(e) {
                throw e;
            }
        })

        // Ecouteur qui permet d'ouvrir une page de conversation coté client
        socket.on("openRoom", async (roomId) => {
            try {
                const room = await findRoomPerId(roomId);
                const { _id } = socket.request.user;
                ios.to(socket.id).emit("newRoom", {room, _id});
            } catch(e) {
                throw e;
            }
        })

        // Ecouteur qui permet d'ouvrir une page de conversation si les utilisateur en ont deja une
        // Sinon créer une room qui permettra d'ouvrir une page de conversation 
        socket.on('roomControl', async (username) => {
            try {
                const { _id } = socket.request.user;
                const user = await getUserPerUsername(username)         // récupération de l'utilisateur a contacter
                let room = await findOneRoomPerUserId(user._id, _id);   // controle si les deux utilisateur ont une room commune
                let newRoom ;
                
                let clientConnected = clientSocketIds.find(element => element.userId === user._id.toString() ) // Recherche si le client a contacté est connecté
                if(room){
                    newRoom = false;
                    socket.emit("newRoom", { room, _id, newRoom });
                } else {
                    newRoom = true;
                    room = await createRoom([user._id, _id])                                // Création de la room avec les deux userId
                    await room.populate("users", ['avatar','username']);                    // populate de la room pour avoir les infos utilisateurs
                    socket.join(`/${ room._id }`);                                          // connexion de la room
                    socket.emit("newRoom", { room, _id, newRoom });                         // emission "newRoom" pour ouvrir la conversation coté client
                    clientConnected && ios.to(clientConnected.socketId).emit('room', room); // si l'utilisateur est connecté, on lui ouvre la page de conversation
                }
            } catch(e) {
                throw e;
            }
        })

        // Ecouteur de deconnexion pour mise a jour du tableau d'utilisateurs connecté
        socket.on('disconnect', () => { 
            clientSocketIds = clientSocketIds.filter(element => element.socketId !== socket.id )
        });
    })

    // Ecouteur de deconnexion pour mise a jour du tableau d'utilisateurs connecté
    ios.on("close", (socket) => {                    
        clientSocketIds = clientSocketIds.filter(element => element.socketId !== socket.id )
        socket.disconnect(true);
    });
}

module.exports = { initSocketServer };