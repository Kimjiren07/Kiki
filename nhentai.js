const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

module.exports = {
  config: {
    name: "nhentai",
    version: "1.0",
    author: "rehat--",
    longDescription: "Read Hentai Comic",
    category: "Hentai",
    role: 0,
    guide: {
      en: "{pn} <code>"
    }
  },
  onStart: async function({ api, event, args }) {
    try {
      if (args.length !== 2 || isNaN(args[0]) || isNaN(args[1])) {
        api.sendMessage('Usage: hentaifox <id> <page>', event.threadID, event.messageID);
        return;
      }

      const id = args[0];
      const page = args[1];
      
      const url1 = `https://hentaifox.com/${id}/`;
      const getresponse = await axios.get(url1);
      const gresponse = getresponse.data;
      const $gallery = cheerio.load(gresponse);
      const totalpages = parseInt($gallery('span.i_text.pages').text().split(':')[1].trim());

      if (page < 1 || page > totalpages) {
        api.sendMessage(`Invalid page number. Total pages: ${totalpages}`, event.threadID, event.messageID);
        return;
      }

      const url2 = `https://hentaifox.com/${id}/${page}/`;
      const getpage2 = await axios.get(url2);
      const getpage = getpage2.data;
      const $image = cheerio.load(getpage);
      const jpgurl = $image('a.next_img img').attr('data-src');

      const getimg = await axios.get(jpgurl, { responseType: 'arraybuffer' });
      const imgbuffer = Buffer.from(getimg.data);
      const dname = `cache/hentaifox.${uuidv4()}.jpg`;
      const imgpath = path.join(__dirname, dname);

      if (!fs.existsSync(path.dirname(imgpath))) {
        fs.mkdirSync(path.dirname(imgpath), { recursive: true });
      }

      fs.writeFileSync(path.join(imgpath), imgbuffer);

      const msg = `${page}/${totalpages}`;
      api.sendMessage({ body: msg, attachment: fs.createReadStream(path.join(imgpath)) }, event.threadID);
    } catch (error) {
      console.error("An error occurred:", error);
      api.sendMessage('An error occurred. Please try again later.', event.threadID, event.messageID);
    }
  }
};
