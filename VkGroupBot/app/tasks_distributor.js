/**
 * необходим для распределения задач на
 * дочернее процессы. Распределяет задачи по кругу
 * @class TasksDistributor
 * @type {module.TasksDistributor}
 */
module.exports = class TasksDistributor{
    /**
     * @constructor
     * @param {Object} [workers]
     */
    constructor(workers) {
        console.log(workers);
        if (workers === undefined)
            throw "workers not init";
        this.workers = workers;
        this.size = Object.keys(workers).length;
        this.i = 0;
    }

    /**
     * @method execute
     * Передает задачу следующему воркеру
     * @param task
     */
    execute(task){
        this.workers[((++this.i) % this.size) +1].send(task);
    }

    /**
     * @method onMessage
     * Подписывает функцию обработки сообщений от воркеров
     * @param onMessageFunc
     */
    onMessage(onMessageFunc){
        Object.keys(this.workers).forEach((id) => {
            this.workers[id].on('message', onMessageFunc);
        });
    }
};