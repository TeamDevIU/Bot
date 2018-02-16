const { Bot } = require('node-vk-bot');

let bot = new Bot({
    token: '7335acdfd581500a090c90407434802553a0bc61c49966fe674a28892a29175aeed6a4580a01b29268301'
}).start();

let apiai = require('apiai');
let dialogflow = apiai("ffe0e0524c5f4c6eab9ea38d38d5f2f6");

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
