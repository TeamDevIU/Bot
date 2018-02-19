module.exports = class TasksDistributor{
    constructor(workers) {
        this.workers = workers;
        this.size = Object.keys(workers).length;
        this.i = 0;
    }

    execute(task){
        this.workers[((++this.i) % this.size) +1].send(task);
    }

    onMessage(onMessageFunc){
        Object.keys(this.workers).forEach((id) => {
            this.workers[id].on('message', onMessageFunc);
        });
    }
};