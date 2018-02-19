const VK = require('vk-node-sdk');
const cluster = require('cluster');
const TaskDistributor = require('./tasks_distributor');
let Group = new VK.Group(process.env.VKTOKEN, {
    webhook: {
        url: process.env.URL,
        port: process.env.PORT
    }
});

cluster.setupMaster({exec: 'worker.js'});
for( let i = 0; i< process.env.WORKER ; i++){
    cluster.fork();
}

let td = new TaskDistributor(cluster.workers);

function messageHandler(message) {
    Group.sendMessage(message);
}
td.onMessage(messageHandler);

Group.onMessage((message) => {
    message.setTyping();
    td.execute({
        message: Object.assign({}, message),
    });
});

