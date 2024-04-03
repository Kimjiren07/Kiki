module.exports = {
  config: {
    name: "music",
    version: "1.0",
    author: "Luis Lavigne",
    countDown: 0,
    role: 0,
    category: "box chat"
  },

  onStart: async function ({ api, event }){},
  onChat: async function({ event, message, getLang }) {
 if (event.body && event.body.toLowerCase() === "music") {
    const axios = require("axios");
    const fs = require("fs-extra");
    const ytdl = require("@distube/ytdl-core");
    const yts = require("yt-search");

    const input = event.body;
    const text = input.substring(12);
    const data = input.split(" ");

    if (data.length < 2) {
      return api.sendMessage("Please put a song", event.threadID);
    }

    data.shift();
    const song = data.join(" ");

    try {
      let Send = await api.sendMessage(`⌛ Searching your song 🔎 ${song}`, event.threadID);

      const searchResults = await yts(song);
      if (!searchResults.videos.length) {
        return api.sendMessage("Error: Invalid request.", event.threadID, event.messageID);
      }

      const video = searchResults.videos[0];
      const videoUrl = video.url;

      const stream = ytdl(videoUrl, { filter: "audioonly" });

      const fileName = `music.mp3`;
      const filePath = __dirname + `/cache/${fileName}`;

      stream.pipe(fs.createWriteStream(filePath));

      stream.on('response', () => {
        console.info('[DOWNLOADER]', 'Starting download now!');
      });

      stream.on('info', (info) => {
        console.info('[DOWNLOADER]', `Downloading ${info.videoDetails.title} by ${info.videoDetails.author.name}`);
      });

      stream.on('end', async () => {
        console.info('[DOWNLOADER] Downloaded');
        await api.unsendMessage(Send.messageID);

        if (fs.statSync(filePath).size > 26214400) {
          fs.unlinkSync(filePath);
          return api.sendMessage('The file could not be sent because it is larger than 25MB.', event.threadID);
        }

        const message = {
          body: `Title: ${video.title}\nArtist: ${video.author.name}`,
          attachment: fs.createReadStream(filePath)
        };

        api.sendMessage(message, event.threadID, () => {
          fs.unlinkSync(filePath);
        });
      });
    } catch (error) {
      console.error('[ERROR]', error);
      api.sendMessage('An error occurred while processing the command.', event.threadID);
    }
  }
}
};
