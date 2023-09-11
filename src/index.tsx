import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { HGSSIronmonMap } from "./HGSSIronmonMap";
import { Provider } from "react-redux";
import { store } from "./IronmonMapUtils/state";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <HGSSIronmonMap />
    </Provider>
  </React.StrictMode>
);
