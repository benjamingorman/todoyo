/* @refresh reload */
import { render } from "solid-js/web";

import "./css/pico.colors.min.css";
// import "./css/pico.amber.css";
import "./styles.css";
import "./assets/fonts/PatrickHand-Regular.ttf";
import App from "./App";
import { appWindow } from "@tauri-apps/api/window";

document
  .getElementById("titlebar-minimize")
  ?.addEventListener("click", () => appWindow.minimize());

document
  .getElementById("titlebar-maximize")
  ?.addEventListener("click", () => appWindow.toggleMaximize());
document
  .getElementById("titlebar-close")
  ?.addEventListener("click", () => appWindow.close());

render(() => <App />, document.getElementById("root") as HTMLElement);
