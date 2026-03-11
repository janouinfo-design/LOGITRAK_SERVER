const ssm = require('#apis/sql-server-request.js')
const { TYPES } = require('tedious')
const FcmToken = require('@omniyat/firebasemodule')
const loggermodule = require("#modules/loggermodule.js");
const moment = require("moment");

async function fetchFcmToken(filter){
    let params = [
        {
            name: "users",
            type: TYPES.NVarChar,
            value: filter.users || ''
        }
    ]
    let response = await ssm.execProc('FCMTOKEN_LIST' , params)

    return response
}

async function saveFcmToken(data){
    let params = [
        {
            name: "userID",
            type: TYPES.BigInt,
            value: data.userID
        },
        {
            name: "token",
            type: TYPES.NVarChar,
            value: data.token
        }
    ]
    let response = await ssm.execProc('FCMTOKEN_SAVE' , params)

    return response
}

/** 
async function sendNotification() {
    try {
        const response = await ssm.execProc('FCMTOKEN_NOTIFYUSER');
        const tokens = response?.result?.map(item => item.token) || [];

        if (tokens.length > 0) {
            const result = await FcmToken.sendMessage({
                data: { type: 'message' },
                notification: { title: 'End Working Notification', body: 'Dont forget to end working before your time shift' },
                tokens: tokens
            });


            console.log('Batch notification sent:', result);
            loggermodule.info(`Batch notification sent: `+ JSON.stringify(result))
        } else {
             loggermodule.info('No tokens to send.')
        }
    } catch (error) {
        //console.error('Error sending notifications:', error.message);
         loggermodule.error('Error sending notifications:' + error.message);
    }
}

*/
async function sendNotification() {
    try {
        const response = await ssm.execProc("FCMTOKEN_NOTIFYUSER");
        const users = response?.result || [];

        const now = moment(); // Current time

        for (const user of users) {
            const userId = user.userid;
            const token = user.token;
            const endTimeStr = user.end_shift_time; // e.g., "17:30"

            // Parse end time
            const endTime = moment(endTimeStr, "HH:mm");
            const reminderTime = moment(endTime).subtract(30, "minutes");

            // Determine if current time matches either reminder or end time
            const isReminderTime = now.isSame(reminderTime, "minute");
            const isEndTime = now.isSame(endTime, "minute");

            // Skip if neither time matches
            if (!isReminderTime && !isEndTime) continue;

            // Avoid sending duplicate notifications
            const hasSentReminder = user.reminder_sent || false;
            const hasSentEnd = user.end_sent || false;

            // Send reminder if not already sent
            if (isReminderTime && !hasSentReminder) {
                await sendFcmNotification(token, "Shift Reminder", "Don't forget to end your shift in 30 minutes.");
                //await ssm.execProc("MARK_REMINDER_SENT", { userid: userId });
                loggermodule.info(`Reminder sent to user ${userId}`);
            }

            // Send end notification if not already sent
            if (isEndTime && !hasSentEnd) {
                await sendFcmNotification(token, "Shift End", "Your shift ends now.");
                //await ssm.execProc("MARK_END_SENT", { userid: userId });
                loggermodule.info(`End notification sent to user ${userId}`);
            }
        }
    } catch (error) {
        loggermodule.error(`Error sending notifications: ${error.message}`);
    }
}

// Helper to send FCM message
function sendFcmNotification(token, title, body) {
    return FcmToken.sendMessage({
        data: { type: "message" },
        notification: { title, body },
        tokens: [token]
    });
}


module.exports = {
    fetchFcmToken,
    saveFcmToken,
    sendNotification
}