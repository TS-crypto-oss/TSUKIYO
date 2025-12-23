const axios = require('axios');

async function getStreamFromURL(url) {
  const response = await axios.get(url, { responseType: 'stream' });
  return response.data;
}

async function fetchTikTokVideos(query) {
  try {
    const response = await axios.get(`https://mahi-apis.onrender.com/api/tiktok?search=${encodeURIComponent(query)}`);
    return response.data.data;
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
}

module.exports = {
  config: {
    name: "animeedit",
    aliases: ["aniedit", "tiktoksearch"],
    author: "Sanjida Snigdha",
    version: "3.1",
    shortDescription: {
      en: "Search for TikTok anime edit videos",
    },
    longDescription: {
      en: "Search and fetch TikTok anime edit videos based on your query.",
    },
    category: "anime",
    guide: {
      en: "{p}{n} [query]",
    },
  },
  
  onStart: async function ({ api, event, args }) {
    try {
      api.setMessageReaction("✨", event.messageID, (err) => {}, true);

      const query = args.join(' ');

      if (!query) {
        api.sendMessage({ 
          body: "❌ Please provide a search query.\n\nExample:\nanisearch Naruto\nanisearch Demon Slayer\nanisearch One Piece" 
        }, event.threadID, event.messageID);
        return;
      }

      // Append "anime edit" to the query for better results
      const modifiedQuery = `${query} anime edit`;
      
      console.log(`[ANISEARCH] Searching for: ${modifiedQuery}`);

      const videos = await fetchTikTokVideos(modifiedQuery);

      if (!videos || videos.length === 0) {
        api.setMessageReaction("❌", event.messageID, (err) => {}, true);
        api.sendMessage({ 
          body: `❌ No videos found for: "${query}"` 
        }, event.threadID, event.messageID);
        return;
      }

      // Select random video from results
      const selectedVideo = videos[Math.floor(Math.random() * videos.length)];
      const videoUrl = selectedVideo.video;
      const title = selectedVideo.title || "No title available";

      if (!videoUrl) {
        api.setMessageReaction("❌", event.messageID, (err) => {}, true);
        api.sendMessage({ 
          body: '❌ Error: Video URL not found.' 
        }, event.threadID, event.messageID);
        return;
      }

      console.log(`[ANISEARCH] Selected video: ${title}`);

      // Get video stream
      const videoStream = await getStreamFromURL(videoUrl);

      api.setMessageReaction("✅", event.messageID, (err) => {}, true);

      // Send the video without extra text
      await api.sendMessage({
        body: ``,
        attachment: videoStream,
      }, event.threadID, event.messageID);

    } catch (error) {
      console.error("[ANISEARCH] Error:", error);
      
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      
      let errorMessage = '❌ An error occurred.';
      
      if (error.code === 'ECONNREFUSED') {
        errorMessage = '❌ API server unavailable.';
      } else if (error.response) {
        errorMessage = `❌ API Error: ${error.response.status}`;
      } else if (error.message.includes('timeout')) {
        errorMessage = '❌ Request timeout.';
      }
      
      api.sendMessage({
        body: errorMessage,
      }, event.threadID, event.messageID);
    }
  },
};
