import * as THREE from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import { ArtefactData } from './artefactdata'
import { randFloat, randInt } from "three/src/math/MathUtils";


export class ArtefactBase extends THREE.Group {
    data: ArtefactData;
    obj?: THREE.Group;
    loadingProgress: number;
    stencilId: number;
    testBGMat: THREE.MeshBasicMaterial;

    constructor(artefactData: ArtefactData) {
        super()
        this.loadingProgress = 0;
        this.data = artefactData;
        this.stencilId = 0;

        const testBGGeo = new THREE.PlaneGeometry();
        this.testBGMat = new THREE.MeshBasicMaterial({color: new THREE.Color(randFloat(0, 1), randFloat(0, 1), randFloat(0, 1))});
        const testBGMesh = new THREE.Mesh(testBGGeo, this.testBGMat);
        
        this.testBGMat.stencilWrite = true;
        this.testBGMat.stencilRef = this.stencilId;
        testBGMesh.scale.set(100, 100, 100);
        testBGMesh.translateZ(-20);

        this.add(testBGMesh);
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
        this.testBGMat.stencilWrite = true;
        this.testBGMat.stencilRef = this.stencilId;
        this.testBGMat.stencilFunc = THREE.EqualStencilFunc;
    }
}
