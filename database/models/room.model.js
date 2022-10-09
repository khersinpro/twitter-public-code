const mongoose = require('mongoose');
const schema = mongoose.Schema;

const room = schema({
    index: Number,
    users : {type: [schema.Types.ObjectId], ref: 'user', required: true}    //user ayant accés a la room
})

const Room = mongoose.model('room', room);

module.exports = Room;