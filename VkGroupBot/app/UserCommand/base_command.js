const rp = require('request-promise');
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
            });
        }
        this.body = options.body;
    }

    execute(){
        let req = {};
        if(this.uri){
            req.uri = this.uri;
        }
        if(this.method){
            req.method = this.method;
        }
        if(this.body){
            req.body = this.body;
        }
        req.json = true;
        return rp(req);
    }
};