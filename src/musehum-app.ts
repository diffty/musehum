import * as THREE from "three";
import { App } from "./app"
import { ArtefactViewer } from "./artefactviewer"

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"


export class MusehumApp extends App {
    dirLight: THREE.DirectionalLight;
    ambLight: THREE.AmbientLight;
    obj: THREE.Group;
    viewer: ArtefactViewer;

    init() {
        this.viewer = new ArtefactViewer();

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        this.renderer.setClearColor(0xC0C0C0);

        const orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        orbitControls.mouseButtons = {
            MIDDLE: THREE.MOUSE.ROTATE,
        }

        this.dirLight = new THREE.DirectionalLight(0xFFFFFF, 1);
        this.ambLight = new THREE.AmbientLight(0xFFFFFF, 0.8);

        this.dirLight.translateZ(3)

        this.scene.add(this.camera);
        this.scene.add(this.dirLight);
        this.scene.add(this.ambLight);

        this.scene.add(this.viewer);

        this.camera.translateZ(0.65);

        window.addEventListener("resize", () => { this.onWindowResize() });
    }

    update(deltaTime: number) {
        if (this.obj) {
            this.obj.rotateY(deltaTime * 2.5);
        }
    }

    onDrag(moveDelta: THREE.Vector2): void {
        this.viewer.onDrag(moveDelta);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.viewer.onWindowResize();
    }
}
