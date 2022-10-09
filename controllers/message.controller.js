const { getAllRoomsMessagesPerRoomId } = require("../queries/message.queries");
const { findRoomPerUserId } = require("../queries/rooms.queries");

// Récupération des messages d'une room
exports.handleRoomMessage = async (req, res, next) => {
    try {
        const roomId = req.params.roomId;
        const room = await findRoomPerUserId(req.user._id)  // control si l'utilisateur a bien accés a la room
        if(room){
            const history = await getAllRoomsMessagesPerRoomId(roomId);
            res.status(200).json(history);
        }else{
            req.logout();                       
            res.redirect('/auth/signin/form');
        }
    } catch(e) {
        next(e);
    }
}