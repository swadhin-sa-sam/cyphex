import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import './styles/Dashboard.css';
import './styles/RiskGauge.css';
import './styles/SpectrogramCanvas.css';
import './styles/WaveformDisplay.css';
import './styles/ProsodyMetrics.css';
import './styles/AlertPanel.css';
import './styles/SessionInfo.css';
import './styles/SpeakerEnrollment.css';
import './styles/AudioStreamer.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
