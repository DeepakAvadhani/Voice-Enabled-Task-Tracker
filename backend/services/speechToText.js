const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const API_KEY = process.env.ASSEMBLY_API_KEY;
const UPLOAD_URL =
   "https://api.assemblyai.com/v2/upload";
const TRANSCRIPT_URL =
  "https://api.assemblyai.com/v2/transcript";

module.exports = {
  async uploadAudioFile(audioPath) {
    try {
      const data = fs.readfileAsync(audioPath);
      const response = await axios.post(UPLOAD_URL, data, {
        headers: {
          authorization: API_KEY,
          "Content-Type": "application/octet-stream",
        },
      });
      return response.data.upload_url;
    } catch (e) {
      console.error("Error uploading audio file:", e);
      throw e;
    }
  },
  async uploadAudioBuffer(audioBuffer) {
    try {
      const response = await axios.post(UPLOAD_URL, audioBuffer, {
        headers: {
          authorization: API_KEY,
          "Content-Type": "application/octet-stream",
        },
      });
      return response.data.upload_url;
    } catch (e) {
      console.error("Error uploading audio buffer:", e);
    }
  },
  async createTranscript(audioUrl) {
    try {
      const response = await axios.post(
        TRANSCRIPT_URL,
        {
          audio_url: audioUrl,
          language_code: "en_us",
        },
        {
          headers: {
            authorization: API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (e) {
      console.error("Error creating transcript:", e);
    }
  },

  async getTranscript(transcriptId) {
    try {
      const response = await axios.get(`${TRANSCRIPT_URL}/${transcriptId}`, {
        headers: {
          authorization: API_KEY,
        },
      });
      const data = response.data;
      if (data.status === "completed") {
        return data.text;
      } else if (data.status === "error") {
        throw new Error(`Transcription failed: ${data.error}`);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    } catch (e) {
      console.error("Error fetching transcript:", e);
    }
  },

  async transcribeAudioFile(audioPath) {
    try {
      const uploadUrl = await this.uploadAudioFile(audioPath);
      const transcriptId = this.createTranscript(uploadUrl);
      const transcript = await this.getTranscript(transcriptId);
      return transcript;
    } catch (e) {
      console.error("Error transcribing audio file:", e);
    }
  },

  async transcribeAudioBuffer(audioBuffer) {
    try {
      const uploadUrl = await this.uploadAudioBuffer(audioBuffer);
      const transcriptId = await this.createTranscript(uploadUrl);
      const transcript = await this.getTranscript(transcriptId);
      return transcript;
    } catch (e) {
      console.error("Error transcribing audio buffer:", e);
    }
  },

  async transcribeFromURL(audioUrl) {
    try {
      const transcriptId = await this.createTranscript(audioUrl);
      const transcript = await this.getTranscript(transcriptId);
      return transcript;
    } catch (e) {
      console.error("Error transcribing from URL:", e);
    }
  },
};
