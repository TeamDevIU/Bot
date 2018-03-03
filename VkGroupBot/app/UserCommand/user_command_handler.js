const CommandsFabric = require('./commands_fabric');
const logger = require('../logger').get();
const CONFIG = require(`../${process.env.CONFIG}`);
let instance;

let CreateRoom = (options) => {

    let process = options.process;
    let user_id = options.user_id;
    let user_name = options.user_name;
    let text = options.text;
    let commandsFabric = options.commandsFabric;

    let command = commandsFabric.createRoom(`${user_name} room`, user_id, user_name);
    command.execute().then((response) => {
        process.send({
            user_id: user_id,
            message: `${text} (${response.room_id})`
        });
    }).catch(err => {
        logger.error(`module: ${module} : ${err}`);
        process.send({
            user_id: user_id,
            message: `MainServer ERROR: ${err}`
        });
    });
};

let DeleteRoom = (options) => {
    let process = options.process;
    let user_id = options.user_id;
    let text = options.text;

    process.send({
        user_id: user_id,
        message: text
    });
};

let SendMessage = (options) => {
    let process = options.process;
    let user_id = options.user_id;
    let user_name = options.user_name;
    let user_message = options.user_message;
    let text = options.text;
    let req = options.req;
    let commandsFabric = options.commandsFabric;

    let room_id = req.result.parameters.room_id;
    if(user_message.replace(/\s+/g, '') === "" ||
        room_id.replace(/\s+/g, '') === ""){
        process.send({
            user_id: user_id,
            message: text
        });
        return;
    }
    let command = commandsFabric.sendMessage(room_id,user_message,user_id,user_name);
    command.execute().then((response) => {
        process.send({
            user_id: user_id,
            message: `${text}`
        });
    }).catch(err => {
        logger.error(`module: ${module} : ${err}`);
        process.send({
            user_id: options.user_id,
            message: `MainServer ERROR: ${err}`
        });
    });
};
let ConnectedToRoom = (options) => {
    let process = options.process;
    let user_id = options.user_id;
    let user_name = options.user_name;
    let text = options.text;
    let req = options.req;
    let commandsFabric = options.commandsFabric;

    let room_id = req.result.parameters.room_id;
    if(room_id.replace(/\s+/g, '') === ""){
        process.send({
            user_id: user_id,
            message: text
        });
        return;
    }
    let command = commandsFabric.subscribe(room_id,user_id,user_name);
    command.execute().then(response => {
        process.send({
            user_id: user_id,
            message: `${text}`
        });
    }).catch(err => {
        logger.error(`module: ${module} : ${err}`);
        process.send({
            user_id: user_id,
            message: `MainServer ERROR: ${err}`
        });
    });
};

let Unsubscription = (options) => {
    let process = options.process;
    let user_id = options.user_id;
    let text = options.text;
    let req = options.req;
    let commandsFabric = options.commandsFabric;

    let unsubscription_id = req.result.parameters.unsubscription_id;
    if(unsubscription_id.replace(/\s+/g, '') === ""){
        process.send({
            user_id: user_id,
            message: text
        });
        return
    }
    text = text+"  ("+unsubscription_id+") ";
    process.send({
        user_id: user_id,
        message: text
    });
};
let SetPrivilege = (options) => {
    let process = options.process;
    let user_id = options.user_id;
    let text = options.text;
    let req = options.req;
    let commandsFabric = options.commandsFabric;

    let privilage_id = req.result.parameters.privilage_id;
    if(privilage_id.replace(/\s+/g, '') === ""){
        process.send({
            user_id: user_id,
            message: text
        });
        return;
    }
    text = text+"  ("+privilage_id+") ";
    process.send({
        user_id: user_id,
        message: text
    });
};

let RoomsListAdmin = (options) => {
    let process = options.process;
    let user_id = options.user_id;
    let text = options.text;
    let commandsFabric = options.commandsFabric;

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
        logger.error(`module: ${module} : ${err}`);
        process.send({
            user_id: user_id,
            message: `MainServer ERROR: ${err}`
        });
    });
};


let RoomsListReader = (options) => {
    let process = options.process;
    let user_id = options.user_id;
    let text = options.text;
    let commandsFabric = options.commandsFabric;

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
        logger.error(`module: ${module} : ${err}`);
        process.send({
            user_id: user_id,
            message: `MainServer ERROR: ${err}`
        });
    });
};


let RoomsListModerator = (options) => {
    let process = options.process;
    let user_id = options.user_id;
    let text = options.text;
    let commandsFabric = options.commandsFabric;

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
        logger.error(`module: ${module} : ${err}`);
        process.send({
            user_id: user_id,
            message: `MainServer ERROR: ${err}`
        });
    });
};


let RoomInfo = (options) => {
    let process = options.process;
    let user_id = options.user_id;
    let text = options.text;
    let commandsFabric = options.commandsFabric;

    let room_id = req.result.parameters.room_id;
    if(room_id.replace(/\s+/g, '') === ""){
        process.send({
            user_id: user_id,
            message: text
        });
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
        logger.error(`module: ${module} : ${err}`);
        process.send({
            user_id: user_id,
            message: `MainServer ERROR: ${err}`
        });
    });
};


let __Default = (options) => {
    let process = options.process;
    let user_id = options.user_id;
    let text = options.text;

    process.send({
        user_id: user_id,
        message: `${text}`
    });
};



module.exports = class UserCommandHandler {
    constructor(){
        if(!instance){
            instance = this;
        }
        this.commandsFabric = new CommandsFabric({
            host: CONFIG.MAINSERVER_URL
        });
        this.intents = {
            CreateRoom,
            DeleteRoom,
            SendMessage,
            ConnectedToRoom,
            Unsubscription,
            SetPrivilege,
            RoomsListAdmin,
            RoomsListModerator,
            RoomsListReader,
            RoomInfo,
            __Default
        };
        return instance
    }

    calculate(process,user_id,user_name,req) {
        let user_message = req.result.resolvedQuery;
        let intent_name = req.result.metadata.intentName;
        let text = req.result.fulfillment.speech;

        logger.info(`${user_id}:  from Dialogflow intent:${intent_name}  speech: ${text} user_message: ${user_message}`);
        let result = Object.keys(this.intents).find((item) => {
            return intent_name === item
        });
        if(result === undefined){
            logger.info(`SET DEFAULT INTENT FOR ${intent_name}  (speech: ${text} user_message: ${user_message})`)
            intent_name = "__Default";
        }
        this.intents[intent_name]({
            process,
            user_id,
            user_name,
            user_message,
            text,
            req,
            commandsFabric: this.commandsFabric
        });
    }
};