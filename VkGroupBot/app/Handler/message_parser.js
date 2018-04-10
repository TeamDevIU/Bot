const logger = require('../logger').get();

module.exports = class MessageParser {

    static parseMessage(message){
        if (typeof message !== "object"){
            logger.error(`module: ${module.id} : is not object`);
            throw "is not object";
        }
        if (typeof message.body === 'string' && message.attachments === false){
            return 'text';
        }
        if(message.attachments[0].doc.title === undefined){
            logger.error(`module: ${module.id} : attachments error title == undefined : ${JSON.stringify(message.attachments[0])}`);
            throw "attachments error";
        }
        if (message.body === "" &&  message.attachments[0].doc.title.match(/(\w)+\.(ogg|webm|3gp)/) !== null ){
            return 'audio';
        }
    }
};
