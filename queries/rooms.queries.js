const Room = require("../database/models/room.model");

// Création d'une room
exports.createRoom = (usersId) => {
    const newRoom = new Room({users: usersId});
    return newRoom.save()
}

// Récupération d'une room par userId
exports.findRoomPerUserId = (userId) => {
    return Room.findOne(userId).exec()
}

//  Récupération de tous les rooms par userId
exports.findAllRoomsPerUserId = (userId) => {
    return Room.find({ users: userId }).populate('users', ['avatar','username']).exec()
}

// Récupération d'une room concernant les deux utilisateur propriétaire
exports.findOneRoomPerUserId = (user1, user2) => {
    return Room.findOne({ "users": {$all: [user1, user2]}}).populate('users', ['avatar','username']).exec();
}

// Récupération d'une room par son ID
exports.findRoomPerId = (roomId) => {
    return Room.findById(roomId).populate('users', ['avatar','username']).exec()
}