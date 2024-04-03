module.exports = {
  config: {
    name: "music",
    version: "1.0",
    author: "Luis Lavigne",
    countDown: 0,
    role: 0,
    shortDescription: "music",
    longDescription: "",
    category: "no prefix",
  },
  onStart: async function(){},
  onChat: async function({ event, message, getLang }) {
    if (event.body && event.body.toLowerCase() === "music") {
      return message.reply({
        body: "",
        attachment: await global.utils.getStreamFromURL("https://sandipapi.onrender.com/music?song=${encodeURIComponent(text)}")
      });
    }
  }
}
