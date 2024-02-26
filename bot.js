require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Set up Telegram bot
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Detect language and translate function
async function translateAndProvideExamples(text) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/completions',
      {
        model: 'text-davinci-003', // You might need to adjust the model based on availability
        prompt: `Detect the language of the following text and translate it to the other language (English <-> Russian). Provide two example sentences using the translated word or phrase.\n\n"${text}"`,
        temperature: 0.5,
        max_tokens: 100,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error('Error:', error);
    return 'Failed to translate and provide examples.';
  }
}

// Handle messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Respond to the command /start
  if (text === '/start') {
    bot.sendMessage(chatId, "Hello! Send me a text in English or Russian, and I'll translate it and provide examples.");
    return;
  }

  const result = await translateAndProvideExamples(text);
  bot.sendMessage(chatId, result);
});

console.log('Bot has been started...');
