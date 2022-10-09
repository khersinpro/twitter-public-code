const mongoose = require('mongoose');
const schema = mongoose.Schema;

const messageSchema = schema({
    author: {type: schema.Types.ObjectId, ref: 'user', required: true},
    authorName: {
        type: String,
        minlength: [3, "Trop court"],
        required: [true, "authorName requis"]
    },
    message: {
        type: String,
        minlength: [1, "message trop court"],
        required: [true, "message requis"]
    },
    room: {type: schema.Types.ObjectId, ref: "room", required: [true, "Champ requis"]}
}, { timestamps: true });

const Message = mongoose.model('message', messageSchema);

module.exports = Message;