var assert = require('assert');
describe("vkBot test", () => {
    describe("tasks_distributor", () => {
        const TaskDistributor = require('../app/tasks_distributor');
        describe("constructor", () => {
            it("Проверка конструктора на ошибку 'workers not init'", ()=> {
                try {
                    let taskDistributor = new TaskDistributor()
                } catch (err) {
                    assert.strictEqual(err,"workers not init");
                }
            });
            it("Проверка конструктора на инициализацию", ()=> {
                let taskDistributor = new TaskDistributor({1:{}});
                let test = {
                    workers: {1:{}},
                    size: 1,
                    i: 0
                };
                assert.deepEqual(taskDistributor,test);
            });
            it("Проверка конструктора на инициализацию с пустыми воркерами", ()=> {
                try {
                    let taskDistributor = new TaskDistributor({});
                    let test = {
                        workers: {1:{}},
                        size: 1,
                        i: 0
                    };
                } catch (e) {
                    assert.strictEqual(e,"workers is empty")
                }
            })
        });

        describe("execute", () => {
            let funcs = {
                1: {
                    savevalue: undefined,
                    savefunc: (task) => {
                        funcs["1"].savevalue = task;
                    }
                },
                2: {
                    savevalue: undefined,
                    savefunc: (task) => {
                        funcs["2"].savevalue = task;
                    }
                }
            };
            let td = new TaskDistributor({
                1: {
                    send: funcs["1"].savefunc,
                },
                2: {
                    send: funcs["2"].savefunc,
                }
            });
            it("проверка распределения задач", () => {
                td.execute("1 задача");
                td.execute("2 задача");

                assert.deepEqual(funcs,{
                    1: {
                        savevalue: "1 задача",
                        savefunc: funcs["1"].savefunc
                    },
                    2: {
                        savevalue: "2 задача",
                        savefunc: funcs["2"].savefunc
                    }
                })
            })
        });
    });
});
