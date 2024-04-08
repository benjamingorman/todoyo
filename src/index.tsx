/* @refresh reload */
import { render } from "solid-js/web";

import { appWindow } from "@tauri-apps/api/window";
import App from "./App";
import "./assets/fonts/PatrickHand-Regular.ttf";
import "./css/pico.colors.min.css";
// import "./css/pico.amber.css";
import "./fonts.css";
// import "./theme-tomnook.css";
import "./styles-titlebar.scss";
import "./styles.css";

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
