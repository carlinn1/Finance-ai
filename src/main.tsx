import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { FeedbackProvider } from "./components/feedback";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <FeedbackProvider><App /></FeedbackProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
