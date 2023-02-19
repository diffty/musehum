import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";


export class StencilShutter extends THREE.Group {
    mainPlane: THREE.Mesh;
    topPlane: THREE.Mesh;
    leftEdge: THREE.Group;
    rightEdge: THREE.Group;
    topGroup: THREE.Group;

    constructor() {
        super();

        const planeGeometry = new THREE.PlaneGeometry(1, 1);

        const planesWidth = window.innerWidth / window.innerHeight;

        this.mainPlane = new THREE.Mesh(planeGeometry, this.makeStencilMaterial(1));
        this.mainPlane.scale.set(planesWidth, 1, this.mainPlane.scale.z);

        this.topGroup = new THREE.Group();

        this.topPlane = new THREE.Mesh(planeGeometry, this.makeStencilMaterial(2));
        this.topPlane.scale.set(planesWidth, 1, this.mainPlane.scale.z);
        this.topPlane.renderOrder = 0;

        this.topGroup.add(this.topPlane);

        this.add(this.mainPlane);
        this.add(this.topGroup);
        
        const gltfLoader = new GLTFLoader();

        gltfLoader.load(
            "./mask-edge.gltf",
            (gltf) => {
                gltf.scene.traverse((o: THREE.Object3D) => {
                    if (o instanceof THREE.Mesh) {
                        o.material = this.topPlane.material;
                    }
                });

                this.leftEdge = gltf.scene;
                this.rightEdge = this.leftEdge.clone();

                this.topGroup.add(this.leftEdge);
                this.topGroup.add(this.rightEdge);
                
                this.leftEdge.position.set(-planesWidth * 0.5, 0, 0);
                this.rightEdge.position.set(planesWidth * 0.5, 0, 0);
                this.rightEdge.rotateZ(Math.PI);

            });
    }

    makeStencilMaterial(stencilId: number) {
        const planeMaterial = new THREE.MeshBasicMaterial({
            depthWrite: false,
            stencilWrite: true,
            stencilRef: stencilId,
            stencilFunc: THREE.AlwaysStencilFunc,
            stencilZPass: THREE.ReplaceStencilOp,
        });

        return planeMaterial
    }
}
