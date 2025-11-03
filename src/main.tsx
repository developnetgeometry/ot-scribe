import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register service worker in production only
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/sw.js').then(
    (registration) => {
      console.log('SW registered:', registration);
    },
    (error) => {
      console.error('SW registration failed:', error);
    }
  );
}
