//=============================================================================
// index.js v1.1  Created by Gururaj B Shetty on 01/06/22.
//=============================================================================
var cron = require('node-schedule');
const organisation = require('../router/api/organisation')
const individual = require('../services/organisation-service')

class Scheduler {
    constructor(cron) {
        this.cron = cron
        this.intervalTasks = {
            '0 */10 * * * *': [
                {
                    task: organisationService["getInfo"],
                    param: {}  
                },
                {
                    task:organisationService["update"],
                    param: {}
                }
            ],
            '0 */30 * * * *': [
                {
                    task: organisationService["getInfo"],
                    param: {}
                }
            ]
        }

        this.timeTasks = [
            {
                hours: 19,
                minutes: 00,
                task: individualOrderService.paymentReminder.bind(this),
                param: {}
            },
            {
                hours: 10,
                minutes: 00,
                task: organisationService.getList.bind(this),
                param: {}
            },
        ]

    }

    runTasks() {
        for (const interval of Object.keys(this.intervalTasks)) {
            for (const task of this.intervalTasks[interval]) {
                try {
                    this.cron.schedule(interval, async () => {
                        await task.function.apply(task.param)
                    })
                } catch (e) {
                    console.log(e)
                }
            }
        }
        for(const time_task of this.timeTasks){
            try{
                let rule = cron.RecurrenceRule()
                rule.hours = task.hours;
                rule.minutes = task.minutes;
                this.cron.schedule(rule, function(){
                    time_task.task(time_task.param)
                })
            }catch(e){
                console.log(e)
            }
        }
    }
}

module.exports = new Scheduler(cron)