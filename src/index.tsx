/* @refresh reload */
import { render } from "solid-js/web";

import "./css/pico.colors.min.css";
// import "./css/pico.amber.css";
import "./styles.css";
import "./assets/fonts/PatrickHand-Regular.ttf";
import App from "./App";

render(() => <App />, document.getElementById("root") as HTMLElement);
