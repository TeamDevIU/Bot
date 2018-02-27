var assert = require('assert');
describe("tasks_distributor", () => {
    const TaskDistributor = require('../app/tasks_distributor');
    it("Проверка конструктора на ошибку 'workers not init'", ()=> {
        try {
            let taskDistributor = new TaskDistributor()
        } catch (err) {
            console.log(err);
            assert.equal(err,"workers not init");
        }
    })
});