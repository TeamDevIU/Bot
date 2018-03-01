const BaseHandler = require('./base_handler');

module.exports = class TextMessageHandler extends BaseHandler{
    constructor (message){
        super();
        if(typeof message !== "object"){
            throw "is not object";
        }

        this.message = message.body;
        if(!this.message && typeof this.message !== 'string')
            throw 'not find message';
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