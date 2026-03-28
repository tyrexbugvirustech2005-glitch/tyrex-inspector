const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());

// Function ya ku-check URL kama sahihi
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// Endpoint ya /scan
app.get("/scan", async (req, res) => {
  const url = req.query.url;

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  try {
    const response = await axios.get(url, {
      timeout: 5000,
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const $ = cheerio.load(response.data);

    res.json({
      status: response.status,
      title: $("title").text(),
      links: $("a").map((i, el) => $(el).attr("href")).get(),
      images: $("img").map((i, el) => $(el).attr("src")).get(),
      scripts: $("script[src]").map((i, el) => $(el).attr("src")).get(),
      css: $("link[rel='stylesheet']").map((i, el) => $(el).attr("href")).get()
    });

  } catch (err) {
    res.status(500).json({ error: "Failed to scan", message: err.message });
  }
});

// Anza server
app.listen(10000, () => console.log("Server running on port 10000"));
