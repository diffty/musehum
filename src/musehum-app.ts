import * as THREE from "three";
import { App } from "./app"
import { ArtefactViewer } from "./artefactviewer"

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";


export class MusehumApp extends App {
    dirLight: THREE.DirectionalLight;
    ambLight: THREE.AmbientLight;
    obj: THREE.Group;
    viewer: ArtefactViewer;

    init() {
        console.log("testtt");

        this.viewer = new ArtefactViewer();

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        
        this.dirLight = new THREE.DirectionalLight(0xFFFFFF, 1);
        this.ambLight = new THREE.AmbientLight(0xFFFFFF, 0.8);

        this.dirLight.translateZ(3)

        this.scene.add(this.camera);
        this.scene.add(this.dirLight);
        this.scene.add(this.ambLight);

        this.scene.add(this.viewer);

        this.camera.translateZ(1);
    }

    update(deltaTime: number) {
        if (this.obj) {
            this.obj.rotateY(deltaTime * 2.5);
        }
    }
}
