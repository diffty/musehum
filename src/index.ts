import { MusehumApp } from "./musehum-app"

const canvasDomElement = document.getElementById("three-app");

let app: MusehumApp;

if (canvasDomElement) {
    app = new MusehumApp(canvasDomElement);
    // document.body.appendChild(app.renderer.domElement);
}
else {
    app = new MusehumApp();
}


const nextlink = document.getElementById("next-link");
if (nextlink) {
    nextlink.addEventListener("click", (e: Event) => { app.viewer.nextArtefact(); });
}

const prevlink = document.getElementById("prev-link");
if (prevlink) {
    prevlink.addEventListener("click", (e: Event) => { app.viewer.prevArtefact(); });
}
