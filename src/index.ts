import { MusehumApp } from "./musehum-app"

const app = new MusehumApp();
document.body.appendChild(app.renderer.domElement);

let nextlink = document.getElementById("next-link");
if (nextlink) {
    nextlink.addEventListener("click", (e: Event) => { app.viewer.nextArtefact(); });
}

let prevlink = document.getElementById("prev-link");
if (prevlink) {
    prevlink.addEventListener("click", (e: Event) => { app.viewer.prevArtefact(); });
}
