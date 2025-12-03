const chrono = require("chrono-node");

class NLPParser {
  parsePriority(text) {
    const lowercaseText = text.toLowerCase();

    if (
      lowercaseText.match(/\b(critical|urgent|asap|immediately|emergency)\b/)
    ) {
      return "critical";
    }

    if (lowercaseText.match(/\b(high priority|high|important)\b/)) {
      return "high";
    }

    if (lowercaseText.match(/\b(low priority|low|minor|whenever)\b/)) {
      return "low";
    }

    return "medium";
  }

  parseStatus(text) {
    const lowercaseText = text.toLowerCase();

    if (lowercaseText.match(/\b(in progress|working on|started|doing)\b/)) {
      return "in progress";
    }

    if (lowercaseText.match(/\b(done|completed|finished)\b/)) {
      return "done";
    }

    return "to do";
  }

  parseDueDate(text) {
    try {
      const lowercaseText = text.toLowerCase();

      const parsed = chrono.parse(text);
      if (parsed.length === 0) return null;

      const date = parsed[0].start.date();

      date.setSeconds(0);
      date.setMilliseconds(0);

      const hasMorning = lowercaseText.includes("morning");
      const hasAfternoon = lowercaseText.includes("afternoon");
      const hasEvening = lowercaseText.includes("evening");
      const hasNight = lowercaseText.includes("night");

      const chronoAssignedHour = parsed[0].start.get("hour");

      if (hasMorning) {
        date.setHours(9, 0);
        return date;
      }

      if (hasAfternoon) {
        date.setHours(14, 0);
        return date;
      }

      if (hasEvening) {
        date.setHours(18, 0);
        return date;
      }

      if (hasNight) {
        date.setHours(20, 0);
        return date;
      }

      if (chronoAssignedHour === null) {
        date.setHours(17, 0);
      }

      return date;
    } catch (error) {
      console.error("Error parsing date:", error);
      return null;
    }
  }

  extractTitle(text) {
    let title = text;

    const patterns = [
      /^(create|add|new|make)\s+(a\s+)?(task\s+)?(to\s+)?/i,
      /^(remind\s+me\s+to|remember\s+to)\s+/i,
      /^(i\s+need\s+to|need\s+to)\s+/i,
      /^(don't\s+forget\s+to|dont\s+forget\s+to)\s+/i,
    ];

    patterns.forEach((pattern) => {
      title = title.replace(pattern, "");
    });

    const removePatterns = [
      /\b(by|before|until|on)\s+\w+\s+\w+\s*\d*\s*,?\s*\d*/gi,
      /\b(tomorrow|today|tonight|next\s+\w+|this\s+\w+)\s*(morning|afternoon|evening|night)?\b/gi,
      /\b(in\s+\d+\s+(day|days|week|weeks|month|months|hour|hours))\b/gi,
      /\b(high|low|medium|critical)\s+priority\b/gi,
      /\b(urgent|asap|important|critical)\b/gi,
      /\b(it's|its|it is)\s+(high|low|medium|critical)\s+priority\b/gi,
      /\b(at\s+\d+:\d+\s*(am|pm)?)\b/gi,
    ];

    removePatterns.forEach((pattern) => {
      title = title.replace(pattern, "");
    });

    title = title.replace(/\s+/g, " ").trim();

    title = title.replace(/^[,.\-:;]\s*/, "");
    title = title.replace(/\s*[,.\-:;]$/, "");

    if (title.length > 0) {
      title = title.charAt(0).toUpperCase() + title.slice(1);
    }

    return title;
  }

  parseVoiceInput(transcript) {
    if (!transcript || transcript.trim().length === 0) {
      throw new Error("Transcript cannot be empty");
    }

    const title = this.extractTitle(transcript);
    const priority = this.parsePriority(transcript);
    const status = this.parseStatus(transcript);
    const dueDate = this.parseDueDate(transcript);

    return {
      title: title || transcript.substring(0, 100),
      priority,
      status,
      dueDate,
      voiceTranscript: transcript,
      isVoiceCreated: true,
    };
  }
}

module.exports = new NLPParser();
