const speechToTextService = require('../services/speechToText');
const nlpParser = require('../services/nlpService');

const transcriptorController = {
  transcribeAudio: async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No audio file uploaded'
        });
      }

      const transcript = await speechToTextService.transcribeAudioBuffer(req.file.buffer);

      res.status(200).json({
        success: true,
        message: 'Audio transcribed successfully',
        data: {
          transcript
        }
      });
    } catch (error) {
      next(error);
    }
  },

  transcribeAndParse: async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No audio file uploaded'
        });
      }

      const transcript = await speechToTextService.transcribeAudioBuffer(req.file.buffer);
      
      const parsed = nlpParser.parseVoiceInput(transcript);

      res.status(200).json({
        success: true,
        message: 'Audio transcribed and parsed successfully',
        data: {
          transcript,
          parsed
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = transcriptorController;