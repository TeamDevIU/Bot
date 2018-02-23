const VK = require('vk-node-sdk');
const Utils = VK.Utils;
const express = require('express');
const bodyParser = require('body-parser');
const HttpCallbackHandlersChank = require('./http_callback_handlers_chank');
module.exports = class VkBot extends VK.Group{
    constructor(token, options,handlers){
        let httpcallbacks = new HttpCallbackHandlersChank();
        httpcallbacks.setHandlers(handlers);
        super(token,options);
    }

    startServer(webhook) {
        let self = this;
        let confingFile = './callback_server.json';
        webhook.config = Utils.jsonFromFile(confingFile);
        const app = express();
        app.use(bodyParser());

        let handlers = new HttpCallbackHandlersChank().getHandlers();
        if(handlers !== undefined){
            handlers.forEach((handler) => {
                app[handler.method](handler.path,handler.callback);
            })
        }

        app.all('/', (request,response) =>{
            try {
                let json = request.body;
                if (!json.type || !json.group_id) {
                    response.status(502).send('Required parameters are not found');
                    return;
                }
                if (json.type === 'confirmation') {
                    self.api('groups.getCallbackConfirmationCode', {group_id: json.group_id}, (data, error) => {
                        response.status(200).send(data.code || JSON.stringify(error));
                    });
                    return;
                }
                if (webhook.config && webhook.config.secret_key && !(json.object && json.secret && json.secret == webhook.config.secret_key)) {
                    response.status(200).send('Secret key is not valid');
                    return
                }
                if (json.type === 'message_new' || json.type === 'message_reply') {
                    self.pushMessage(json.object)
                }
                let stack = self.EventCallbackRegistry;
                if (stack.length > 0) {
                    let index = 0;
                    let notify = () => {
                        if (index >= stack.length) return;
                        stack[index](json, () => {
                            index++;
                            notify()
                        })
                    };
                    notify()
                }
                response.status(200).send('ok');
            } catch(e) {
                response.status(200).send('error');
            }
        });

        app.listen((webhook.port || 80), (err) => {
            if (err) {
                return console.log('something bad happened', err)
            }
            let executeCode = 'var group_id = API.groups.getById()[0].id;var callbackURL = Args.server_url;var server_id = Args.server_id;var json = {};if (server_id == 0) {server_id = API.groups.addCallbackServer({url: callbackURL, title: "vk-node-sdk", group_id: group_id});json = API.groups.getCallbackServers({group_id:group_id,server_ids:server_id}).items[0];} else {json = API.groups.getCallbackServers({group_id:group_id,server_ids:server_id}).items[0];}if (json == null) {server_id = API.groups.addCallbackServer({url: callbackURL, title: "vk-node-sdk", group_id: group_id});json = API.groups.getCallbackServers({group_id:group_id,server_ids:server_id}).items[0];}json.code = API.groups.getCallbackConfirmationCode({group_id:group_id}).code;return json;'
            self.api('execute', {code: executeCode, server_url: webhook.url, server_id: (webhook.config ? webhook.config.id : 0)}, (data, error) => {
                if (data) {
                    Utils.jsonToFile(confingFile, data)
                } else {
                    throw new Error(JSON.stringify(error))
                }
            });
            console.log(`server is listening on ${webhook.port}`)
        });
    }


};