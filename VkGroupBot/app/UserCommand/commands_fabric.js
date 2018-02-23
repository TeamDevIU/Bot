const CreateRoomCommand = require('./create_room_command');
const RoomsListCommand = require('./rooms_list_command');
const SubscribeCommand = require('./subscribe_command');
const SendMessageCommand = require('./send_message_command');
const RoomInfoCommand = require('./roominfo_command');
module.exports = class CommandFabric {
    constructor(options){
        this.host = options.host;
        if(options.port){
            this.port = options.port;
        }
    }

    createRoom(room_name, user_id, user_name){
        let command = new CreateRoomCommand({
            host: this.host,
            port: this.port,
            path: '/createRoom',
            method: 'POST',
            body: {
                room_name: `${user_name} room`,
                owner_info: {
                    id: user_id,               // Тут id по которому идентифицируется юзер в боте
                    name: user_name,
                    type: 'vk'              // Или tg
                }
            }
        });
        return command;
    }

    roomsList(role, user_id){
        let command = new RoomsListCommand({
            host: this.host,
            port: this.port,
            method: 'GET',
            path: '/rooms',
            querys: {
                role: role,
                userID: user_id,
                botType: 'vk'
            }
        });
        return command;
    }

    subscribe(room_id,user_id,user_name){
        let command = new SubscribeCommand({
            host: this.host,
            port: this.port,
            method: 'POST',
            path: '/subscribe',
            body: {
                room_id: room_id,
                user_info: {
                    id: user_id,
                    name: user_name,
                    type: 'vk'
                }
            }
        });
        return command;
    }

    sendMessage(room_id, message, user_id, user_name){
        let command = new SendMessageCommand({
            host: this.host,
            port: this.port,
            method: 'POST',
            path: '/sendMessage',
            body: {
                room_id: room_id,
                message: message,
                sender_info: {
                    id: user_id,
                    name: user_name,
                    type: 'vk'
                }
            }
        });
        return command;
    }

    roominfo(room_id){
        let command = new RoomInfoCommand({
            host: this.host,
            port: this.port,
            method: 'GET',
            path: '/roomInfo',
            querys: {
                id: room_id
            }
        });
        return command;
    }
};