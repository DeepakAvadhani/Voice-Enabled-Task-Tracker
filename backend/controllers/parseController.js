const nlpParser = require("../services/nlpService");

const parseContoller = {
  parseVoice: async (req, res) => {
    try {
      const { transcript } = req.body;
      if (!transcript || transcript.trim().length === 0) {
        return res.status(400).json({ error: "Transcript is required" });
      }
      const data = nlpParser.parseVoiceInput(transcript);
      res.status(200).json({
        success: true,
        message: "Voice input parsed successfully",
        data: {
          original: transcript,
          parsed: data,
        },
      });
    } catch (e) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

module.exports = parseContoller;