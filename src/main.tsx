import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './App.css';
import { initializeTheme } from './utils/theme.ts';

// Apply theme before app renders
initializeTheme();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
);
