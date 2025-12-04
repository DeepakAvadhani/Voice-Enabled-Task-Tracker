import { useState } from 'react';
import './Dashboard.css';
import Navbar from '../components/navbar/Navbar.jsx';
import VoiceRecordModal from '../components/voicerecord/VoiceRecordModal.jsx';
import { CustomKanban } from '../components/kanban/Kanban.jsx';

function Dashboard({ currentPage, onNavigate }) {
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  const handleTaskCreated = (newTask) => {
    setShowVoiceModal(false);
  };

  return (
    <div className="dashboard-container">
      <Navbar currentPage={currentPage} onNavigate={onNavigate} />
      
      <div className="dashboard-content">
        <h1 className="dashboard-title">Task Dashboard</h1>
        <CustomKanban onOpenVoiceModal={() => setShowVoiceModal(true)} />
      </div>

      {showVoiceModal && (
        <VoiceRecordModal
          onClose={() => setShowVoiceModal(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}
    </div>
  );
}

export default Dashboard;