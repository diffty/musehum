import * as THREE from "three";
import { App } from "./app"
import { ArtefactViewer } from "./artefactviewer"
import { TextTransition } from "./text-transition"

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"


export class MusehumApp extends App {
    rimLight: THREE.DirectionalLight;
    keyLight: THREE.DirectionalLight;
    fillLight: THREE.DirectionalLight;
    ambLight: THREE.AmbientLight;
    obj: THREE.Group;
    viewer: ArtefactViewer;
    textTransition: TextTransition;

    init() {
        this.viewer = new ArtefactViewer();

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);

        //const orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        //orbitControls.mouseButtons = {
        //    MIDDLE: THREE.MOUSE.ROTATE,
        //}

        this.rimLight = new THREE.DirectionalLight(0xFFFFFF, 1); // 1
        this.keyLight = new THREE.DirectionalLight(0xFFFFFF, 1); // 1
        this.fillLight = new THREE.DirectionalLight(0xFFFFFF, 0.8); // 1
        this.ambLight = new THREE.AmbientLight(0xFFFFFF, 0);   // 0.8
        
        this.rimLight.position.set(-5, 0, -3);
        this.keyLight.position.set(-2, 0, 3);
        this.fillLight.position.set(5, 0, 1.5);

        this.scene.add(this.camera);
        this.scene.add(this.rimLight);
        this.scene.add(this.keyLight);
        this.scene.add(this.fillLight);
        this.scene.add(this.ambLight);

        this.scene.add(this.viewer);

        this.textTransition = new TextTransition();

        this.camera.translateZ(0.65);

        window.addEventListener('resize', () => { this.onWindowResize(); });
        window.addEventListener('keydown', (e) => { this.onKeyDown(e); });
    }

    update(deltaTime: number) {
        this.viewer.update(deltaTime);
        if (this.textTransition.enabled) {
            this.textTransition.update();
            const titleDomElement = document.getElementById("title");
            if (titleDomElement) {
                titleDomElement.textContent = this.textTransition.getBuffer();
            }
        }
    }

    onDrag(moveDelta: THREE.Vector2): void {
        this.viewer.onDrag(moveDelta);
    }

    onKeyDown(e) {
        if (e.keyCode == 37 || e.key == "ArrowLeft") {
            this.viewer.prevArtefact();
            this.textTransition.setText(this.viewer.currArtefact.data.author.toUpperCase());
        }
        else if (e.keyCode == 39 || e.key == "ArrowRight") {
            this.viewer.nextArtefact();
            this.textTransition.setText(this.viewer.currArtefact.data.author.toUpperCase());
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.viewer.onWindowResize();
    }
}
