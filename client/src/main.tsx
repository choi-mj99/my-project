import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).then((registration) => {
      const announceUpdate = () => {
        if (registration.waiting) {
          window.dispatchEvent(new CustomEvent("pwa-update-available", { detail: registration }));
        }
      };
      announceUpdate();
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) announceUpdate();
        });
      });
      const checkForUpdate = () => registration.update().then(announceUpdate).catch(() => undefined);
      registration.update().then(announceUpdate).catch(() => undefined);
      window.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") checkForUpdate();
      });
      window.addEventListener("focus", checkForUpdate);
    }).catch(() => undefined);
  });
}
