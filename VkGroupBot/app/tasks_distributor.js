const logger = require('./logger').get();
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
        if (workers === undefined){
            logger.error(`module: ${module} : workers not init`);
            throw "workers not init";
        }

        this.size = Object.keys(workers).length;
        if(this.size === 0){
            logger.error(`module: ${module} : workers empty`);
            throw "workers is empty";
        }
        this.workers = workers;
        this.i = 0;
    }

    /**
     * @method execute
     * Передает задачу следующему воркеру
     * @param task
     */
    execute(task){
        this.workers[((this.i++) % this.size) +1].send(task);
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