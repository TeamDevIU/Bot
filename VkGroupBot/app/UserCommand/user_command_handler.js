const CommandsFabric = require('./commands_fabric');
const logger = require('../logger').get();
const CONFIG = require(`../${process.env.CONFIG}`);
let instance;

let sendToUser = (user_id,message) => {
    process.send({user_id,message});
};

let onErrorFromServer = (type,error,user_id) => {
    if(type !== 'info' && type !== 'error'){
        logger.error(`module: ${module.id} Type of logger: ${type}`);
        throw 'wrong type for logger';
    }
    logger.log(type,`module: ${module.id} MainServer error: ${error}`);
    sendToUser(user_id,`Запрос не выполнен :( \n( ${error} )`);
};

let getErrorForCatch = (user_id) => {
  return (err) => onErrorFromServer('error',err,user_id);
};

let defaultCallBack = (command) => {
    command.execute().then((response) => {
        new CheckError(user_id).checkErrorInResponse(response,
            (response,user_id) => {
                sendToUser(user_id,text);
            }
        );
        return;
    }).catch(getErrorForCatch(user_id));
};

class CheckError {
    constructor(user_id){
        if(user_id === undefined){
            logger.error(`module: ${module.id} no user_id`);
            throw 'no user id';
        }
        this.user_id = user_id;
    }

    checkErrorInResponse(response,onNoError) {
        if(response.error !== 'none'){
            onErrorFromServer('info',response.error,this.user_id);
        } else {
            onNoError(response,this.user_id);
        }
    }

}


let CreateRoom = (options) => {
    let user_id = options.user_id;
    let user_name = options.user_name;
    let text = options.text;
    let commandsFabric = options.commandsFabric;

    let command = commandsFabric.createRoom(`${user_name} room`, user_id, user_name);
    command.execute().then((response) => {
        new CheckError(user_id).checkErrorInResponse(response,
            (response,user_id) => {
                sendToUser(user_id,`${text} (${response.room_id})`);
            }
        );
        return;
    }).catch(getErrorForCatch(user_id));
};

let DeleteRoom = (options) => {
    let user_id = options.user_id;
    let text = options.text;
    sendToUser(user_id,text);
};

let SendMessage = (options) => {
    let user_id = options.user_id;
    let user_name = options.user_name;
    let text = options.text;
    let req = options.req;
    let commandsFabric = options.commandsFabric;

    let message_for_group = req.result.parameters.user_message;
    let room_id = req.result.parameters.room_id;
    if(message_for_group.replace(/\s+/g, '') === "" ||
        room_id.replace(/\s+/g, '') === ""){
        sendToUser(user_id,text);
        return;
    }

    let command = commandsFabric.sendMessage(room_id,message_for_group,user_id,user_name);
    defaultCallBack(command);
};
let ConnectedToRoom = (options) => {
    let user_id = options.user_id;
    let user_name = options.user_name;
    let text = options.text;
    let req = options.req;
    let commandsFabric = options.commandsFabric;

    let room_id = req.result.parameters.room_id;
    if(room_id.replace(/\s+/g, '') === ""){
        sendToUser(user_id,text);
        return;
    }
    let command = commandsFabric.subscribe(room_id,user_id,user_name);
    defaultCallBack(command);
};

let Unsubscription = (options) => {
    let user_id = options.user_id;
    let text = options.text;
    let req = options.req;
    let commandsFabric = options.commandsFabric;

    let unsubscription_id = req.result.parameters.unsubscription_id;
    if(unsubscription_id.replace(/\s+/g, '') === ""){
        sendToUser(user_id,text);
        return;
    }
    text = text+"  ("+unsubscription_id+") ";
    sendToUser(user_id,text);
};

let SetPrivilege = (options) => {
    let user_id = options.user_id;
    let text = options.text;
    let req = options.req;
    let commandsFabric = options.commandsFabric;

    let privilage_id = req.result.parameters.privilage_id;
    if(privilage_id.replace(/\s+/g, '') === ""){
        sendToUser(user_id,text);
        return;
    }
    text = text+"  ("+privilage_id+") ";
    sendToUser(user_id,text);
};

let RoomListBase = (type,options) => {
    let user_id = options.user_id;
    let text = options.text;
    let commandsFabric = options.commandsFabric;

    let command = commandsFabric.roomsList(type,user_id);
    command.execute().then(response => {
        new CheckError(user_id).checkErrorInResponse(response,
            (response,user_id) => {
                let message = `${text}\n\n`;
                response.rooms.forEach((room) => {
                    message += `id: ${room.id} Название : ${room.name}\n`;
                });
                sendToUser(user_id,message);
            }
        );
        return;
    }).catch(getErrorForCatch(user_id));
};

let RoomsListAdmin = (options) => {
    RoomListBase("admin",options);
};


let RoomsListReader = (options) => {
    RoomListBase("reader",options);
};


let RoomsListModerator = (options) => {
    RoomListBase("moderator",options);
};


let RoomInfo = (options) => {
    let user_id = options.user_id;
    let text = options.text;
    let commandsFabric = options.commandsFabric;
    let req = options.req;

    let room_id = req.result.parameters.room_id;
    if(room_id.replace(/\s+/g, '') === ""){
        sendToUser(user_id,text);
        return;
    }
    let command = commandsFabric.roominfo(room_id);
    command.execute().then(response => {
        new CheckError(user_id).checkErrorInResponse(response,
            (response,user_id) => {
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
                sendToUser(user_id,message);
            }
        );
        return;
    }).catch(getErrorForCatch(user_id));
};


let __Default = (options) => {
    let user_id = options.user_id;
    let text = options.text;

    sendToUser(user_id,text);
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
        return instance;
    }

    calculate(user_id,user_name,req) {
        let current_user_message = req.result.resolvedQuery;
        let intent_name = req.result.metadata.intentName;
        let text = req.result.fulfillment.speech;

        logger.info(`${user_id}:  from Dialogflow intent:${intent_name}  speech: ${text} user_message: ${current_user_message}`);
        let result = Object.keys(this.intents).find((item) => {
            return intent_name === item;
        });
        if(result === undefined){
            logger.info(`SET DEFAULT INTENT FOR ${intent_name}  (speech: ${text} user_message: ${current_user_message})`);
            intent_name = "__Default";
        }
        this.intents[intent_name]({
            user_id,
            user_name,
            current_user_message: current_user_message,
            text: text,
            req,
            commandsFabric: this.commandsFabric
        });
    }
};
