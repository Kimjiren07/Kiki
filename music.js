const fs = require("fs-extra");
const ytdl = require("@distube/ytdl-core");
const yts = require("yt-search");
const axios = require('axios');

module.exports = {
  config: {
    name: "yt",
    version: "1.0",
    role: 0,
    author: "Luis Lavigne",
    cooldowns: 0,
    shortDescription: "Download music or video from YouTube.",
    longDescription: "",
    category: "media",
    dependencies: {
      "fs-extra": "",
      "ytdl-core": "",
      "yt-search": "",
      "axios": ""
    }
  },

  onStart: async function ({ api, event }) {
  },

  onChat: async function ({ event, api }) {
    const message = event.body.toLowerCase().trim();

    if (message.includes("youtube.com") || message.includes("youtu.be")) {
      const videoId = extractVideoId(message);
      if (videoId) {
        await downloadMedia(videoId, false, event, api);
        return; // Return early after processing the YouTube link
      }
    }

    if (message.startsWith("yta ")) {
      const query = message.slice(4).trim();
      await downloadMedia(query, true, event, api);
    } else if (message.startsWith("ytv ")) {
      const query = message.slice(4).trim();
      await downloadMedia(query, false, event, api);
    } else if (message.startsWith("ytl ")) {
      const query = message.slice(4).trim();
      await downloadMediaWithLyrics(query, event, api);
    } else {
      // Handle unrecognized commands or messages here
    }
  }
};

async function downloadMedia(query, isAudio, event, api) {
  if (!query) {
    return api.sendMessage(`Please specify a ${isAudio ? "music" : "video"} name.`, event.threadID);
  }

  try {
    const loadingMessage = await api.sendMessage(`Searching ${isAudio ? "music" : "video"} for "${query}". Please wait...`, event.threadID);

    const searchResults = await yts(query);
    if (!searchResults.videos.length) {
      api.sendMessage(`No ${isAudio ? "music" : "video"} found.`, event.threadID);
      api.unsendMessage(loadingMessage.messageID);
      return;
    }

    const media = searchResults.videos[0];
    const mediaUrl = media.url;

    const stream = ytdl(mediaUrl, { filter: isAudio ? "audioonly" : "videoandaudio" });

    const fileName = `${Date.now()}.${isAudio ? "mp3" : "mp4"}`;
    const filePath = `./cache/${fileName}`;

    stream.pipe(fs.createWriteStream(filePath));

    stream.on('end', () => {
      api.sendMessage({
        body: `Title: ${media.title}`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => {
        fs.unlinkSync(filePath);
        api.unsendMessage(loadingMessage.messageID);
      });
    });
  } catch (error) {
    console.error('[ERROR]', error);
    api.sendMessage('An error occurred while processing the command.', event.threadID);
  }
}

async function downloadMediaWithLyrics(query, event, api) {
  if (!query) {
    return api.sendMessage("Please specify a song title.", event.threadID);
  }

  try {
    const loadingMessage = await api.sendMessage(`Searching for "${query}". Please wait...`, event.threadID);

    const searchResults = await yts(query);
    if (!searchResults.videos.length) {
      api.sendMessage(`No videos found for "${query}".`, event.threadID);
      api.unsendMessage(loadingMessage.messageID);
      return;
    }

    const media = searchResults.videos[0];
    const mediaUrl = media.url;

    const stream = ytdl(mediaUrl, { filter: "audioonly" });

    const fileName = `${Date.now()}.mp3`;
    const filePath = `./cache/${fileName}`;

    stream.pipe(fs.createWriteStream(filePath));

    stream.on('end', async () => {
      const lyrics = await getLyrics(query);
      if (!lyrics) {
        api.sendMessage(`No lyrics found for "${query}".`, event.threadID);
        api.unsendMessage(loadingMessage.messageID);
        return;
      }

      const replyMessage = {
        body: `Title: ${media.title}\n\nLyrics for "${query}":\n${lyrics}`,
        attachment: fs.createReadStream(filePath),
      };

      api.sendMessage(replyMessage, event.threadID, () => {
        fs.unlinkSync(filePath);
        api.unsendMessage(loadingMessage.messageID);
      });
    });
  } catch (error) {
    console.error('[ERROR]', error);
    api.sendMessage('An error occurred while processing the command.', event.threadID);
  }
}

async function getLyrics(song) {
  try {
    const response = await axios.get(`https://lyrist.vercel.app/api/${encodeURIComponent(song)}`);
    if (response.data && response.data.lyrics) {
      return response.data.lyrics;
    } else {
      return null;
    }
  } catch (error) {
    console.error('[LYRICS ERROR]', error);
    return null;
  }
}

function extractVideoId(url) {
  const match = url.match(/[?&]v=([^&]+)/);
  return match && match[1];
    }
