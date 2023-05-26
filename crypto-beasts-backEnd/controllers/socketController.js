const admin = require("firebase-admin");
const AuthHelper = require('../helper/authHelper');

var playerQueue = []
var rooms = []

module.exports = (socketIO) => {
    socketIO.on('connection', (socket) => {
        const index = playerQueue.findIndex(x => x.user === socket.handshake.auth.user);
        if (index > -1) playerQueue[index] = {...playerQueue[index], ...socket.handshake.auth};
        else playerQueue.push(socket.handshake.auth);
        
        socket.userID = socket.handshake.auth.user;
        socket.sessionID = AuthHelper.makeId(10);
        
        console.log('a user connected');

        socket.emit("session",{
            sessionID: socket.sessionID
        })

        socket.on("find_match", (data) => {
            const room = rooms.find(x=>x.user2 === undefined);
            if(!room){
                let roomTmp = {
                    room: AuthHelper.makeId(10),
                    user1: socket.handshake.auth.user
                }
                rooms.push(roomTmp)
                socket.roomId =roomTmp.room;
                socket.join(roomTmp.room);
            }else{
                room.user2 = socket.handshake.auth.user;
                socket.roomId =room.room;
                socket.join(room.room);

                socket.to(room.room).emit("match_found", room.room);
                socket.emit("match_found", room.room)
                
                setTimeout(()=>{
                    socket.emit("start_turn")
                },1000)
            }
        });
        
        socket.on("card_played", (data) => {
            socket.to(socket.roomId).emit("enemy_play", data)
        });
        
        socket.on("end_turn", (data) => {
            socket.to(socket.roomId).emit("start_turn")
        });

        socket.on("disconnect", () => {
            console.log("user disconnected");
        });
    });
}