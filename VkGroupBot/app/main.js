const VkBot = require('./Bot/bot');
const cluster = require('cluster');
const TaskDistributor = require('./tasks_distributor');
const logger = require('./logger').get();
const CONFIG = require(process.env.CONFIG);

logger.info("RUN VKBOT");
logger.error("RUN VKBOT");
let Bot = new VkBot(CONFIG.VKTOKEN, {
    webhook: {
        url: CONFIG.URL,
        port: CONFIG.PORT_BOT
    }
},[{
    method: 'post',
    path: '/send_message',
    callback: (request,response) => {
        logger.info(`from MainServer: ${JSON.stringify(request.body)}`);
        let user_id = request.body.user_id;
        let message = request.body.message;

        let flag_error = false;
        let res;
        if(!user_id){
            flag_error = true;
            res = {
                error: 404,
                message: "no user_id"
            };
        }
        if(!message){
            flag_error = true;
            res = {
                error: 404,
                message: "no message"
            };
        }
        if(flag_error) {
            logger.info(`to MainServer: ${JSON.stringify(res)} `);
            response.send(res);
            return;
        }


        let result = messageHandler({
            user_id: user_id,
            message: message
        });

        res = {
            error: 200,
            message: 'OK'
        };
        logger.info(`to MainServer: ${JSON.stringify(res)} `);
        response.send(res);
    }
}]);


cluster.setupMaster({exec: './app/worker.js'});
for( let i = 0; i< CONFIG.WORKER ; i++){
    cluster.fork();
}

let td = new TaskDistributor(cluster.workers);

function messageHandler(message) {
    return Bot.sendMessage(message);
}
td.onMessage(messageHandler);


/**
 * Вызывается при входящем сообщении от вк пользователя
 * @param {callback} [listener]
 */
Bot.onMessage((message) => {
    logger.info(JSON.stringify({
        id: message.user_id,
        attachments: message.attachments ? message.attachments[0].doc : null,
        message: message.body,

    }));
    message.setTyping();
    Bot.userGet(message.user_id, (response) => {
       message.user_name = `${response.last_name} ${response.first_name}`;
        td.execute({
            message: Object.assign({}, message),
        });
    });
});
