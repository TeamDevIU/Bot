const BaseCommand = require('./base_command');
const rp = require('request-promise');
module.exports = class RoomsListCommand extends BaseCommand{
    constructor(options){
        super(options);
    }

    execute(){
        let uri = this.uri;
        let method = this.method;
        return rp({
            uri: uri,
            method: method,
            json: true
        })
    }
};