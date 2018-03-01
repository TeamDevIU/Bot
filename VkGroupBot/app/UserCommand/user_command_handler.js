const CommandsFabric = require('./commands_fabric');
const CONFIG = require(`../${process.env.CONFIG}`);

module.exports = class UserCommandHandler {
    static calculate(process,user_id,user_name,req) {
        let user_message = req.result.resolvedQuery;
        let intent_name = req.result.metadata.intentName;
        let text = req.result.fulfillment.speech;
        let commandsFabric = new CommandsFabric({
            host: CONFIG.MAINSERVER_URL
        });
        switch (intent_name) {
            case "CreateRoom": {
                let command = commandsFabric.createRoom(`${user_name} room`,user_id,user_name);
                command.execute().then((response) => {
                    process.send({
                        user_id: user_id,
                        message: `${text} (${response.room_id})`
                    });
                }).catch(err => {
                    process.send({
                        user_id: user_id,
                        message: `MainServer ERROR: ${err}`
                    });
                });
                break;
            }
            case "DeleteRoom": {
                process.send({
                    user_id: user_id,
                    message: text
                });
                break;
            }
            case "SendMessage": {
                let user_message = req.result.parameters.user_message;
                let room_id = req.result.parameters.room_id;
                if(user_message.replace(/\s+/g, '') === "" ||
                room_id.replace(/\s+/g, '') === ""){
                    process.send({
                        user_id: user_id,
                        message: text
                    });
                    break;
                }
                let command = commandsFabric.sendMessage(room_id,user_message,user_id,user_name);
                command.execute().then((response) => {
                    process.send({
                        user_id: user_id,
                        message: `${text}`
                    });
                }).catch(err => {
                    process.send({
                        user_id: user_id,
                        message: `MainServer ERROR: ${err}`
                    });
                });
                break;
            }
            case "ConnectedToRoom": {
                let room_id = req.result.parameters.room_id;
                if(room_id.replace(/\s+/g, '') === ""){
                    process.send({
                        user_id: user_id,
                        message: text
                    });
                    break;
                }
                let command = commandsFabric.subscribe(room_id,user_id,user_name);
                command.execute().then(response => {
                    process.send({
                        user_id: user_id,
                        message: `${text}`
                    });
                }).catch(err => {
                    process.send({
                        user_id: user_id,
                        message: `MainServer ERROR: ${err}`
                    });
                });
                break;
            }
            case "Unsubscription": {
                let unsubscription_id = req.result.parameters.unsubscription_id;
                if(unsubscription_id.replace(/\s+/g, '') === ""){
                    process.send({
                        user_id: user_id,
                        message: text
                    });
                    break;
                }
                text = text+"  ("+unsubscription_id+") ";
                process.send({
                    user_id: user_id,
                    message: text
                });
                break;
            }
            case "SetPrivilege": {
                let privilage_id = req.result.parameters.privilage_id;
                if(privilage_id.replace(/\s+/g, '') === ""){
                    process.send({
                        user_id: user_id,
                        message: text
                    });
                    break;
                }
                text = text+"  ("+privilage_id+") ";
                process.send({
                    user_id: user_id,
                    message: text
                });
                break;
            }
            case "RoomsListAdmin": {
                let command = commandsFabric.roomsList("admin",user_id);
                command.execute().then(response => {
                    process.send({
                        user_id: user_id,
                        message: `${text} ${JSON.stringify(response.rooms)}`
                    });
                }).catch(err => {
                    process.send({
                        user_id: user_id,
                        message: `MainServer ERROR: ${err}`
                    });
                });
                break;
            }
            case "RoomsListReader": {
                let command = commandsFabric.roomsList("reader",user_id);
                command.execute().then(response => {
                    process.send({
                        user_id: user_id,
                        message: `${text} ${response.rooms}`
                    });
                }).catch(err => {
                    process.send({
                        user_id: user_id,
                        message: `MainServer ERROR: ${err}`
                    });
                });
                break;
            }
            case "RoomsListModerator": {
                let command = commandsFabric.roomsList("moderator",user_id);
                command.execute().then(response => {
                    process.send({
                        user_id: user_id,
                        message: `${text} ${response.rooms}`
                    });
                }).catch(err => {
                    process.send({
                        user_id: user_id,
                        message: `MainServer ERROR: ${err}`
                    });
                });
                break;
            }
            case "RoomInfo": {
                let room_id = req.result.parameters.room_id;
                if(room_id.replace(/\s+/g, '') === ""){
                    process.send({
                        user_id: user_id,
                        message: text
                    });
                    break;
                }
                let command = commandsFabric.roominfo(room_id);
                command.execute().then(response => {
                    process.send({
                        user_id: user_id,
                        message: `${text} ${JSON.stringify(response)}`
                    });
                }).catch(err => {
                    process.send({
                        user_id: user_id,
                        message: `MainServer ERROR: ${err}`
                    });
                });
                break;
            }
            default: {
                process.send({
                    user_id: user_id,
                    message: `${text}`
                });
                break;
            }
        }
    }
};