import * as THREE from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { TextureLoader } from "three";

import { ArtefactData } from './artefactdata'


export class ArtefactBase extends THREE.Group {
    data: ArtefactData;
    obj?: THREE.Group;
    loadingProgress: number;
    stencilId: number;

    constructor(artefactData: ArtefactData) {
        super()
        this.loadingProgress = 0;
        this.data = artefactData;
        this.stencilId = 0;
    }

    load(onLoadingEndCallback?: (artefact: ArtefactBase) => void) {
        const gltfLoader = new GLTFLoader();
        const texLoader = new TextureLoader();

        gltfLoader.load(
            this.data.fileName,
            (gltf) => {
                this.add(gltf.scene);
                this.obj = gltf.scene;
                if (this.data.fileName == "peggy.gltf") {
                    gltf.scene.traverse((o: THREE.Object3D) => {
                        if (o.type == "Mesh") {
                            //o.material.transparent = true;
                            //o.material.map = texLoader.load("captex.png");
                            //o.material.alphaMap = texLoader.load("captex_alpha.png");
                            o.material.side = THREE.DoubleSide;
                            //o.material.alphaTest = 1;
                        }
                    })
                }
                if (onLoadingEndCallback) {
                    onLoadingEndCallback(this);
                    this.updateStencilId();
                }
            },
            (event) => { this.loadingProgress = event.loaded / event.total; }
        )
    }

    unload() {
        if (this.obj && this.loadingProgress > 0) {
            this.clear();
            this.loadingProgress = 0;
            this.obj = undefined;
        }
    }

    isLoaded(): boolean {
        return !(this.loadingProgress == 0 && !this.obj);
    }

    setStencilId(newStencilId: number) {
        this.stencilId = newStencilId;
        this.updateStencilId();
    }

    updateStencilId() {
        if (this.obj) {
            this.obj.traverse((o: THREE.Object3D) => {
                if (o instanceof THREE.Mesh) {
                    o.material.stencilWrite = true;
                    o.material.stencilRef = this.stencilId;
                    o.material.stencilFunc = THREE.EqualStencilFunc;
                }
            })
        }
        //this.testBGMat.stencilWrite = true;
        //this.testBGMat.stencilRef = this.stencilId;
        //this.testBGMat.stencilFunc = THREE.EqualStencilFunc;
    }
}
