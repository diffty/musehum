import * as THREE from "three";


export class StencilShutter extends THREE.Group {
    planes: THREE.Mesh[];

    constructor(nbStencilIds: number, startIdShift?: number) {
        super();

        if (startIdShift == undefined) {
            startIdShift = 1;
        }

        this.planes = []

        for (let i = 1; i <= Math.max(4, nbStencilIds); i++) {
            const planeGeometry = new THREE.PlaneGeometry(1, 1);
            const planeMaterial = new THREE.MeshBasicMaterial({});

            let stencilId = ((i-1-startIdShift) % nbStencilIds) + 1;
            if (stencilId < 1) stencilId = nbStencilIds;

            planeMaterial.depthWrite = false;
            planeMaterial.stencilWrite = true;
            planeMaterial.stencilRef = stencilId;
            planeMaterial.stencilFunc = THREE.AlwaysStencilFunc;
            planeMaterial.stencilZPass = THREE.ReplaceStencilOp;

            const newPlane = new THREE.Mesh(planeGeometry, planeMaterial);
            newPlane.translateX(((i-1-startIdShift) * 1));
            newPlane.scale.set(window.innerWidth / window.innerHeight, 1, newPlane.scale.z);

            this.planes.push(newPlane)
            this.add(newPlane);
        }
    }
}
