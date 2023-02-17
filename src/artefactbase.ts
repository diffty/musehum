import * as THREE from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import { ArtefactData } from './artefactdata'


export class ArtefactBase extends THREE.Group {
    data: ArtefactData;
    obj: THREE.Group;
    loadingProgress: number;

    constructor(artefactData: ArtefactData) {
        super()
        this.loadingProgress = 0;
        this.data = artefactData
    }

    load(onLoadingEndCallback?: (artefact: ArtefactBase) => void) {
        const gltfLoader = new GLTFLoader();

        gltfLoader.load(
            this.data.fileName,
            (gltf) => {
                this.add(gltf.scene);
                this.obj = gltf.scene;
                if (onLoadingEndCallback) {
                    onLoadingEndCallback(this);
                }
            },
            (event) => { this.loadingProgress = event.loaded / event.total; }
        )
    }

    unload() {
        if (this.obj && this.loadingProgress > 0) {
            this.clear();
            this.loadingProgress = 0;
        }
    }
}
