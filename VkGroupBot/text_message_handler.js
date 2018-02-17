const BaseHandler = require('./base_handler');

class TextMessageHandler extends BaseHandler{
    constructor (message,dialogflow){
        super();
        if(typeof message !== "object"){
            throw "is not object";
        }

        this.message = message;
        this.dialogflow = dialogflow;
    }


    execute(sessionId,responseFunc,errorFunc) {
        super.execute(sessionId);
        let req = this.dialogflow.textRequest(this.message.text,{
            sessionId: sessionId
        });

        req.on('response',responseFunc);
        req.on('error',errorFunc);
        req.end();
    }
}

module.exports = TextMessageHandler;