import { useState, useRef } from 'react';
import axios from 'axios';
import "./VoiceRecordModal.css"

function VoiceRecordModal({ onClose, onTaskCreated }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedTask, setParsedTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await uploadAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError('');
    } catch (err) {
      setError('Failed to access microphone. Please allow microphone access.');
      console.error('Microphone error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadAudio = async (audioBlob) => {
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');

    try {
      const response = await axios.post(
        'http://localhost:3000/api/tasks/transcribe-parse',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setTranscript(response.data.data.transcript);
      setParsedTask(response.data.data.parsed);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to transcribe audio. Please try again.');
      console.error('Transcription error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!parsedTask) return;

    setLoading(true);
    try {
      await axios.post('http://localhost:3000/api/tasks', {
        title: parsedTask.title,
        description: '',
        status: parsedTask.status,
        priority: parsedTask.priority,
        dueDate: parsedTask.dueDate,
        voiceTranscript: parsedTask.voiceTranscript,
        isVoiceCreated: true
      });

      onTaskCreated();
    } catch (err) {
      setError('Failed to create task. Please try again.');
      console.error('Create task error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h2 className="modal-title">Create Task with Voice</h2>

        {!transcript && !loading && (
          <div className="recording-section">
            <button
              className={`record-button ${isRecording ? 'recording' : ''}`}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={loading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {isRecording ? (
                  <rect x="6" y="6" width="12" height="12" />
                ) : (
                  <>
                    <path d="M12 1a3 3 0 003 3v8a3 3 0 11-6 0V4a3 3 0 013-3z" />
                    <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
                  </>
                )}
              </svg>
            </button>
            <p className="record-instruction">
              {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
            </p>
            <p className="record-hint">
              Try saying: "Create a high priority task to review the pull request by tomorrow evening"
            </p>
          </div>
        )}

        {loading && (
          <div className="loading-section">
            <div className="spinner"></div>
            <p>Processing your voice...</p>
          </div>
        )}

        {error && (
          <div className="error-section">
            <p>{error}</p>
          </div>
        )}

        {transcript && !loading && (
          <div className="result-section">
            <div className="transcript-box">
              <h3>Transcript</h3>
              <p>{transcript}</p>
            </div>

            {parsedTask && (
              <div className="parsed-task-box">
                <h3>Parsed Task</h3>
                <div className="task-field">
                  <strong>Title:</strong>
                  <span>{parsedTask.title}</span>
                </div>
                <div className="task-field">
                  <strong>Priority:</strong>
                  <span className={`priority-badge ${parsedTask.priority.toLowerCase()}`}>
                    {parsedTask.priority}
                  </span>
                </div>
                <div className="task-field">
                  <strong>Status:</strong>
                  <span>{parsedTask.status}</span>
                </div>
                <div className="task-field">
                  <strong>Due Date:</strong>
                  <span>
                    {parsedTask.dueDate 
                      ? new Date(parsedTask.dueDate).toLocaleString() 
                      : 'Not set'}
                  </span>
                </div>

                <div className="modal-actions">
                  <button className="btn-cancel" onClick={onClose}>
                    Cancel
                  </button>
                  <button className="btn-create" onClick={createTask}>
                    Create Task
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VoiceRecordModal;