

const jobs = require('./config.js') ;
const loggermodule = require('#modules/loggermodule.js') ;
const { scheduleJob } = require('node-schedule')

exports.initJobsProcessing = ()=> {
    try{
        if(!Array.isArray(jobs)) return;
        for(let {name, alert , cron , immediate}  of jobs){
            loggermodule.info(`Add job "${name}",  on "${cron}"`);
            if (cron && typeof alert == 'function') {
                scheduleJob(cron, () =>  alert({name , cron }));
                if(immediate) setTimeout(()=> {
                    alert();
                }, 1000)
            }else if(typeof alert !== 'function') {
                loggermodule.error(`action is not  a function for alert "${name}"`);
            }
        }
    }catch(e){
        loggermodule.error(`Error dispatching watcher ${e.message}`);
    }
};