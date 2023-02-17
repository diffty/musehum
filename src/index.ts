import { MusehumApp } from "./musehum-app"

const app = new MusehumApp();
document.body.appendChild(app.renderer.domElement);

function test() {
    console.log("test");
}
