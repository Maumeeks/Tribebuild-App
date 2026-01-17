import React from 'react';
import ReactDOM from 'react-dom/client';
// CORREÇÃO: Removemos o "/src" do caminho. Agora eles são vizinhos.
import App from './App'; 
import './styles/globals.css'; 

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);