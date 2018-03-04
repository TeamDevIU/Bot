class BaseHandler{
    constructor(){
    }

    execute(sessionId){
        if(typeof sessionId !== 'number'){
            throw 'is not a number';
        }
        this.sessionId = sessionId;
    }

    setDialogflow(dialogflow){
        this.dialogflow = dialogflow;
    }
}

module.exports = BaseHandler;