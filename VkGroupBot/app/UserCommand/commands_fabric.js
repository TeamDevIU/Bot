const BaseCommand = require('./base_command');
module.exports = class CommandFabric {
    constructor(options){
        this.host = options.host;
        if(options.port){
            this.port = options.port;
        }
    }

    createRoom(room_name, user_id, user_name){
        return new BaseCommand({
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
    }

    roomsList(role, user_id){
        return new BaseCommand({
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
    }

    subscribe(room_id,user_id,user_name){
        return new BaseCommand({
            host: this.host,
            port: this.port,
            method: 'POST',
            path: '/subscribe',
            body: {
                room_id: Number.parseInt(room_id),
                user_info: {
                    id: user_id,
                    name: user_name,
                    type: 'vk'
                }
            }
        });
    }

    sendMessage(room_id, message, user_id, user_name){
        return new BaseCommand({
            host: this.host,
            port: this.port,
            method: 'POST',
            path: '/sendMessage',
            body: {
                room_id: Number.parseInt(room_id),
                message: message,
                sender_info: {
                    id: user_id,
                    name: user_name,
                    type: 'vk'
                }
            }
        });
    }

    roominfo(room_id){
        return new BaseCommand({
            host: this.host,
            port: this.port,
            method: 'GET',
            path: '/roomInfo',
            querys: {
                id: Number.parseInt(room_id)
            }
        });
    }
};