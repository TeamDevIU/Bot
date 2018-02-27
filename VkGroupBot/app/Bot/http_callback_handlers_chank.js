let instance;

module.exports = class HttpCallbackHandlersChank {
    constructor(){
        if (!instance) {
            instance = this;
        }
        return instance;
    }

    setHandlers(handlers){
        this.handlers = handlers;
    }

    getHandlers(){
        return this.handlers;
    }
};