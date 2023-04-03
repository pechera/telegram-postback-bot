const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

require('dotenv').config({ path: './env/.env' });

const app = express();

const bot = new TelegramBot(process.env.TOKEN, { polling: true });

bot.on('message', (ctx) => {
    if (ctx.text.toString().toLowerCase().indexOf('/start') === 0) {
        bot.sendMessage(
            ctx.chat.id,
            `Your Postback URL:\n\n${process.env.URL}?start=${ctx.chat.id}\n\nEnter this URL in the Postback URL field in your CPA network with the required parameters.`
        );
    }
});

app.get('/', async (req, res) => {
    const paramList = req.query;

    try {
        if (!paramList.start) throw new Error('Invalid link');

        let result = 'New lead\n\n';

        if (Object.keys(paramList).length < 1) throw new Error('No parameters');

        for (const [paramName, paramValue] of Object.entries(paramList)) {
            if (paramName !== 'start') {
                result += `<b>${paramName}</b>: ${paramValue}\n`;
            }
        }

        await bot.sendMessage(paramList.start, result, {
            parse_mode: 'html',
        });

        return res.status(200).send('Done');
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
});

// Enable graceful stop
process.once('SIGINT', () => {
    bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
    bot.stop('SIGTERM');
});
