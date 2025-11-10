import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register service worker (enabled in both dev and production for testing)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(
    (registration) => {
      console.log('SW registered:', registration);
    },
    (error) => {
      console.error('SW registration failed:', error);
    }
  );

  // Listen for navigation messages from service worker (fallback for browsers without client.navigate())
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'NAVIGATE_TO') {
      const targetUrl = event.data.url;
      console.log('[App] Received navigation message from SW:', targetUrl);

      // Use React Router's navigation by updating window.location
      // This ensures proper routing in PWA context
      if (targetUrl && typeof targetUrl === 'string') {
        window.location.href = targetUrl;
      }
    }
  });
}
