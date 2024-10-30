import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { MetaMaskProvider } from "./MetaMaskContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MetaMaskProvider>
      <App />
    </MetaMaskProvider>
  </StrictMode>
);
