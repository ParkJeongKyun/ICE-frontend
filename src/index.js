import React from 'react';
import ReactDOM from 'react-dom/client';

// Component
import App from './App';

// Style
import './styles/index.css';
import 'bootstrap/dist/css/bootstrap.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <App/>
  // </React.StrictMode>
);