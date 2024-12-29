import { createRoot } from 'react-dom/client';
import App from './app';
import './index.css';

const container =
  document.getElementById('root') || document.createElement('div');
container.id = 'root';
document.body.appendChild(container);

const root = createRoot(container);
root.render(<App />);
