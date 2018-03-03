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
                    let message = `${text}\n\n Список комнат в которых ты администратор: \n`;
                    response.rooms.forEach((room) => {
                        message += `id: ${room.id} Название : ${room.name}\n`;
                    });
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
            case "RoomsListReader": {
                let command = commandsFabric.roomsList("reader",user_id);
                command.execute().then(response => {
                    let message = `${text}\n\n Список комнат на которые ты подписан: \n`;
                    response.rooms.forEach((room) => {
                       message += `id: ${room.id} Название : ${room.name}\n`;
                    });
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
                    let message = `${text}\n\n Список комнат в которых ты модератор: \n`;
                    response.rooms.forEach((room) => {
                        message += `id: ${room.id} Название : ${room.name}\n`;
                    });
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
                    let message = `${text}\n\n`;
                    message += `Название: ${response.room_name}\n`;
                    if(response.admin !== null && response.admin !== undefined){
                        message += `Администратор: ${response.admin.name} (${response.admin.type} ${response.admin.id})\n`;
                    }
                    if(response.moderators !== null && response.moderators !== undefined){
                        message += 'Модераторы:\n';
                        response.moderators.forEach((moderator) => {
                            message += `${moderator.name} (${moderator.type} ${moderator.id})\n`;
                        });
                    }
                    if(response.reader !== null && response.reader !== undefined){
                        message += 'Подписчики:\n';
                        response.reader.forEach((reader) => {
                            message += `${reader.name} (${reader.type} ${reader.id})\n`;
                        });
                    }
                    process.send({
                        user_id: user_id,
                        message: message
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