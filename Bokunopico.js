const axios = require('axios');
const fs = require('fs');

module.exports = {
  config: {
    name: 'ashu',
    version: '1.0',
    author: 'Luis Lavigne',
    countDown: 0,
    role: 0,
    longDescription: {
      en: 'Text to Image'
    },
    category: 'ai',
    guide: {
      en: '1 | Sdxl 1.0'
    }
  },

  onStart: async function ({ message, args, event, api }) {
    const permission = ["100089324680810"];
    if (!permission.includes(event.senderID)) {
      api.sendMessage(
        `❌ | Command "ashu" currently unavailable buy premium to use the command.`,
        event.threadID,
        event.messageID
      );
      return;
    }
    try {
      const info = args.join(' ');
      const [prompt, ratio = '1:1'] = info.split('|').map(item => item.trim());
      const text = args.join(" ");
      if (!text) {
        return message.reply("🦊 | Please provide a prompt with models!");
      }
      const [width, height] = ratio.split(':').map(val => parseInt(val, 10));
      if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        return message.reply("🦊 | Invalid ratio format. Please use 'width:height' (e.g., '16:9')");
      }
      const modelParam = '1'; // Utilisation du premier modèle uniquement
      const apiUrl = `https://rehatdesu.xyz/api/imagine/sdxl?prompt=${prompt}&model=${modelParam}&width=${width}&height=${height}`;

      await message.reply('⌛ | Creating your Imagination...');

      const form = {};
      form.attachment = [];
      form.attachment[0] = await global.utils.getStreamFromURL(apiUrl);

      message.reply(form);
    } catch (error) {
      console.error(error);
      await message.reply('🦊 | Sorry, API has a skill issue');
    }
  }
};
