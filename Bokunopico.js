global.api = {
  samirApi: "https://apis-samir.onrender.com"
};

const axios = require('axios');

module.exports = {
  config: {
    name: "imagine2",
    aliases: ["im2"],
    author: "Luis Lavigne ",
    version: "1.0",
    countDown: 0,
    role: 0,
    shortDescription: "Generates an image from a text description",
    longDescription: "Generates an image from a text description",
    category: "ai",
    guide: {
      en: "{pn} prompt | model \n Models:\n 1: animagineXL \n 2: dreamshaperXL\n 3: dynavisionXL \n 4: juggernautXL \n 5: realismEngineSDXL \n 6:  realvisxlV40 \n 7: sd_xl_base \n 8: inpaint \n 9:turbovisionXL",
    }
  },

  langs: {
    en: {
      loading: "⌛ | generating your Imagination...",
      error: "🤡 | An error occurred, please try again later"
    }
  },

  onStart: async function ({ event, message, getLang, threadsData, api, args }) {
    const { threadID } = event;

    const info = args.join(" ");
    if (!info) {
      return message.reply(`🤡 | baka type your imagination!`);
    } else {
      const msg = info.split("|");
      const text = msg[0];
      const model = msg[1] || '1'; 
      const timestamp = new Date().getTime();

      try {
        let msgSend = message.reply(getLang("🤡 | loading"));
        const { data } = await axios.get(
          `${global.api.samirApi}/sdxl/generate?prompt=${text}&model=${model}`
        );

        const imageUrls = data.imageUrls[0];
        const shortLink = await global.utils.uploadImgbb(imageUrls);
        
        let fUrl = shortLink.image.url;
        await message.unsend((await msgSend).messageID);
        if (imageUrls) {
          message.reply({
            body: `🤡 | Here's your AI generated image \n prompt "${text}" \n HD download Link: ${fUrl}`,
            attachment: await global.utils.getStreamFromURL(imageUrls)
          });
        } else {
          throw new Error("🤡 | Failed to fetch the generated image. Contact the administration group to resolve the issue. Group link: https://www.facebook.com/groups/761805065901067/?ref=share");
        }
      } catch (err) {
        console.error(err);
        return message.reply(getLang("🤡 | error"));
      }
    }
  }
};

function getModelName(model) {
  switch (model) {
    case '1': return "animagineXL";
    case '2': return "dreamshaperXL";
    case '3': return "dynavisionXL";
    case '4': return "juggernautXL";
    case '5': return "realismEngineSDXL";
    case '6': return "realvisxlV40";
    case '7': return "sd_xl_base";
    case '8': return "inpaint";
    case '9': return "turbovisionXL";
    default: return "animagineXL";
  }
    }
