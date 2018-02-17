class BaseHandler{
    constructor(){
    }

    execute(sessionId){
        if(typeof sessionId !== 'string'){
            throw 'is not a string';
        }
    }
}

module.exports = BaseHandler;