const BaseCommand = require('./base_command');
const rp = require('request-promise');
module.exports = class RoominfoCommand extends BaseCommand{
    constructor(options){
        super(options);
    }

    execute(){
        let uri = this.uri;
        let method = this.method;
        let body = this.body;
        return rp({
            uri: uri,
            method: method,
            body: body,
            json: true
        });
    }
};