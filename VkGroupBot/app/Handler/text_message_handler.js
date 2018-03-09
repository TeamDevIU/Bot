const BaseHandler = require('./base_handler');
const logger = require('../logger').get();

module.exports = class TextMessageHandler extends BaseHandler{
    constructor (message){
        super();
        if(typeof message !== "object"){
            logger.error(`module: ${module.id} : is not object`);
            throw "is not object";
        }

        this.message = message.body;
        if(!this.message && typeof this.message !== 'string') {
            logger.error(`module: ${module.id} : not find message`);
            throw 'not find message';
        }
    }


    execute(sessionId,responseFunc,errorFunc) {
        super.execute(sessionId);
        let req = this.dialogflow.textRequest(this.message,{
            sessionId: sessionId
        });

        req.on('response',responseFunc);
        req.on('error',errorFunc);
        req.end();
    }

};