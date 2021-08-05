const { google } = require('googleapis');
const dayjs = require('dayjs');

authorize();

async function authorize() {
    var jwt = new google.auth.JWT(
        process.env.SERVICE_EMAIL,
        null,
        process.env.SERVICE_PRIVATE_KEY,
        'https://www.googleapis.com/auth/calendar'
    );
    await jwt.authorize();
    google.options({ auth: jwt });
    console.log('Authorized google api service account!');
}

async function addToCalendar(data) {
    try {
        const start = data.allDay
            ? { date: dayjs(data.start).format('YYYY-MM-DD') }
            : { dateTime: new Date(data.start).toISOString() };
        const end = data.allDay
            ? { date: dayjs(data.start).format('YYYY-MM-DD') }
            : { dateTime: new Date(data.end).toISOString() };
        const res = await google.calendar('v3').events.insert({
            calendarId: process.env.CALENDAR_ID,
            requestBody: {
                start,
                end,
                summary: `${data.name} (${data.club})`,
                description: data.description,
            },
        });
        return res.data.id;
    } catch (error) {
        console.dir(error);
        return null;
    }
}

async function updateCalendar(data, id) {
    try {
        const start = data.allDay
            ? { date: dayjs(data.start).format('YYYY-MM-DD') }
            : { dateTime: new Date(data.start).toISOString() };
        const end = data.allDay
            ? { date: dayjs(data.start).format('YYYY-MM-DD') }
            : { dateTime: new Date(data.end).toISOString() };
        await google.calendar('v3').events.update({
            calendarId: process.env.CALENDAR_ID,
            eventId: id,
            requestBody: {
                start,
                end,
                summary: `${data.name} (${data.club})`,
                description: data.description,
            },
        });
        return 1;
    } catch (error) {
        console.dir(error);
        return null;
    }
}

module.exports = { addToCalendar, updateCalendar };
