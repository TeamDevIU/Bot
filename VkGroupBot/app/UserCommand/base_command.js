module.exports = class BaseCommand {
    constructor(options){
        this.uri = 'http://';
        if(options.port === undefined){
            this.uri += options.host;
        } else {
            this.uri += `${options.host}:${options.port}`;
        }
        this.uri += options.path;
        this.method = options.method;
        if(options.querys !== undefined){
            this.uri += '?';
            let keys = Object.keys(options.querys);
            keys.forEach((key,idx) => {
                this.uri += `${key}=${options.querys[key]}`;
                if(idx !== keys.length-1)
                    this.uri += '&';
            })
        }
        this.body = options.body;
    }

    execute(){
        throw 'command not execute'
    }
};