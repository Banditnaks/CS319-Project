import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // อ้างอิง App.jsx
import "./index.css"; // นำเข้า CSS หลัก
import "bootstrap/dist/css/bootstrap.min.css"; // นำเข้า Bootstrap

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
