const Message = require('../database/models/room.message.model')

exports.getAllRoomsMessagesPerRoomId = (roomId) => {
    return Message.find({ room: roomId }).exec()
}

exports.createMessage = (message) => {
    const newMessage = new Message(message);
    return newMessage.save()
}