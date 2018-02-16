const { Bot } = require('node-vk-bot');

let bot = new Bot({
    token: '<token>'
}).start();

let apiai = require('apiai');
let dialogflow = apiai("<client_token>");

bot.get(/.*/i, msg => {
    console.log(msg);
    let request = dialogflow.textRequest(msg.body, {
        sessionId: '123456'
    });
    request.on('response', function (res) {
        bot.send(res.result.fulfillment.speech,msg.peer_id);
    });
    request.on('error', function(error) {
        bot.send('у меня ошибки какие-то: '+ JSON.stringify(error),msg.peer_id);
    });
    request.end();
});
