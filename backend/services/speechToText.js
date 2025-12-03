const axios = require("axios");

const API_KEY = process.env.ASSEMBLY_API_KEY;
const UPLOAD_URL = process.env.ASSEMBLY_API_UPLOAD_URL;
const TRANSCRIPT_URL = process.env.ASSEMBLY_API_TRANSCRIPT_URL;

module.exports = {
  async uploadAudioBuffer(audioBuffer) {
    try {
      const response = await axios.post(UPLOAD_URL, audioBuffer, {
        headers: {
          authorization: API_KEY,
          "Content-Type": "application/octet-stream",
        },
      });
      console.log("Audio uploaded successfully");
      return response.data.upload_url;
    } catch (e) {
      console.error(
        "Error uploading audio buffer:",
        e.response?.data || e.message
      );
      throw e;
    }
  },

  async createTranscript(audioUrl) {
    try {
      const response = await axios.post(
        TRANSCRIPT_URL,
        {
          audio_url: audioUrl,
          language_code: "en",
        },
        {
          headers: {
            authorization: API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Transcript created with ID:", response.data.id);
      return response.data.id;
    } catch (e) {
      console.error(
        "Error creating transcript:",
        e.response?.data || e.message
      );
      throw e;
    }
  },

  async getTranscript(transcriptId) {
    try {
      while (true) {
        const response = await axios.get(`${TRANSCRIPT_URL}/${transcriptId}`, {
          headers: {
            authorization: API_KEY,
          },
        });

        const data = response.data;
        console.log("Transcription status:", data.status);
        if (data.status === "completed") {
          console.log("Transcription completed!");
          return data.text;
        } else if (data.status === "error") {
          throw new Error(`Transcription failed: ${data.error}`);
        } else {
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }
    } catch (e) {
      console.error(
        "Error fetching transcript:",
        e.response?.data || e.message
      );
      throw e;
    }
  },

  async transcribeAudioBuffer(audioBuffer) {
    try {
      console.log("Starting transcription...");

      const uploadUrl = await this.uploadAudioBuffer(audioBuffer);
      console.log("Step 1: Upload complete");

      const transcriptId = await this.createTranscript(uploadUrl);
      console.log("Step 2: Transcript job created");

      const transcript = await this.getTranscript(transcriptId);
      console.log("Step 3: Transcription complete");

      return transcript;
    } catch (e) {
      console.error("Error transcribing audio buffer:", e.message);
      throw e;
    }
  },

  async transcribeFromURL(audioUrl) {
    try {
      const transcriptId = await this.createTranscript(audioUrl);
      const transcript = await this.getTranscript(transcriptId);
      return transcript;
    } catch (e) {
      console.error("Error transcribing from URL:", e.message);
      throw e;
    }
  },
};
