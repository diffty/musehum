import * as THREE from "three";
import { readTextFile } from "./utils";
import { ArtefactBase } from "./artefactbase";
import { ArtefactData } from "./artefactdata";
import { StencilShutter } from "./stencilshutter";
import { CheckerPlaneBg } from "./checker-plane-bg";


export class ArtefactViewer extends THREE.Group {
    artefacts: Array<ArtefactBase>;
    currArtefact: ArtefactBase;
    artefactsToLoad: number; 
    shutter: StencilShutter;
    currStencilId: number;
    rotateSpeed: number;
    backgrounds: CheckerPlaneBg[];

    constructor(rotateSpeed?: number) {
        super();
        this.backgrounds = [];
        this.artefacts = [];
        this.artefactsToLoad = 2;
        this.currStencilId = 1;
        this.rotateSpeed = (rotateSpeed != undefined) ? rotateSpeed : 5;

        this.loadArtefactsDataFromUrl("artefacts.json");

        this.shutter = new StencilShutter();
        this.add(this.shutter);

        this.backgrounds.push(new CheckerPlaneBg());
        this.backgrounds[0].setStencilId(1);
        this.backgrounds[0].material.uniforms.color1.value = [1., 0., 1., 1.];
        this.backgrounds[0].material.uniforms.color2.value = [0., 0., 0., 1.];
        this.add(this.backgrounds[0]);

        this.backgrounds.push(new CheckerPlaneBg());
        this.backgrounds[1].setStencilId(2);
        this.backgrounds[1].material.uniforms.color1.value = [0., 0., 0., 1.];
        this.backgrounds[1].material.uniforms.color2.value = [1., 0., 0., 1.];
        this.backgrounds[1].material.uniforms.cell.value = [1., 1.];
        this.add(this.backgrounds[1]);
    }

    loadArtefactsDataFromUrl(url: string) {
        readTextFile(url, (rawData) => {
            let data: Array<ArtefactData>;

            try {
                data = JSON.parse(rawData);
            } catch (error) {
                throw `Bad artifact data retrieved from URL ${url}:\n${rawData}`;
            }
            
            this.processArtefactsData(data);
        });
    }

    processArtefactsData(artefactsData: Array<ArtefactData>) {
        artefactsData.forEach(element => {
            const newArtefact = new ArtefactBase(element);
            this.artefacts.push(newArtefact);
        });

        if (this.artefacts.length > 0) {
            this.currArtefact = this.artefacts[0]
            
            for (let i = 0; i < this.artefacts.length /*Math.min(this.artefactsToLoad, this.artefacts.length)*/; i++) {
                this.artefacts[i].visible = false;

                this.loadArtefact(this.artefacts[i])
                    .then((a: ArtefactBase) => {
                        if (a == this.currArtefact) {
                            this.showArtefact(a, this.currStencilId);
                        }
                        //this.showArtefact(a, (i % 2) + 1); // Attention on affiche tout là
                    });
            }
        }
    }

    loadArtefact(artefact: ArtefactBase): Promise<ArtefactBase> {
        return new Promise<ArtefactBase>(resolve => {
            artefact.load((a: ArtefactBase) => {
                this.add(artefact);
                resolve(a);
            });
        });
    }

    showArtefact(artefact: ArtefactBase, stencilId?: number) {
        if (!artefact.isLoaded()) {
            throw `Trying to show this unloaded artefact ${artefact.name}`;
        }

        artefact.visible = true;

        if (stencilId != undefined) {
            artefact.setStencilId(stencilId);
        }
    }

    hideArtefact(artefact: ArtefactBase) {
        artefact.visible = false;
    }

    update(deltaTime: number) {
        this.shutter.update(deltaTime);
        if (this.currArtefact) {
            //this.currArtefact.update(deltaTime);
        }

        for (let i = 0; i < this.backgrounds.length; i++) {
            this.backgrounds[i].update(deltaTime);
        }
    }

    prevArtefact() {
        const currArtefactIdx = this.artefacts.indexOf(this.currArtefact);
        
        if (currArtefactIdx - 1 < 0) {
            this.currArtefact = this.artefacts[(this.artefacts.length-1)];
        }
        else {
            this.currArtefact = this.artefacts[currArtefactIdx - 1];
        }

        this.currStencilId--;

        if (this.currStencilId < 1) {
            this.currStencilId = 2;
        }

        this.artefacts.forEach((a) => {
            if (a.stencilId == this.currStencilId) {
                this.hideArtefact(a);
            }
        })

        this.showArtefact(this.currArtefact, this.currStencilId);

        this.shutter.moveLeft();
    }

    nextArtefact() {
        const currArtefactIdx = this.artefacts.indexOf(this.currArtefact);
        this.currArtefact = this.artefacts[(currArtefactIdx+1) % this.artefacts.length];
        this.currStencilId = ((this.currStencilId) % 2)+1
        
        this.artefacts.forEach((a) => {
            if (a.stencilId == this.currStencilId) {
                this.hideArtefact(a);
            }
        })

        this.showArtefact(this.currArtefact, this.currStencilId);

        this.shutter.moveRight();
    }

    getArtefactStencilId(artefact: ArtefactBase) {
        const artefactIdx = this.artefacts.indexOf(artefact);
        return (artefactIdx % 2) + 1;
    }

    onDrag(moveDelta: THREE.Vector2) {
        // this.shutter.setShutterPosition(this.shutter.getShutterPosition() + moveDelta.x);
        this.currArtefact.obj?.rotateY(moveDelta.x * this.rotateSpeed);
    }

    onWindowResize() {
        const ratio = (window.innerWidth / window.innerHeight);
        
        this.shutter.mainPlane.scale.set(ratio, 1, this.shutter.mainPlane.scale.z);
        this.shutter.topPlane.scale.set(ratio, 1, this.shutter.mainPlane.scale.z);

        this.shutter.leftEdge.position.set(-ratio * 0.5, 0, 0);
        this.shutter.rightEdge.position.set(ratio * 0.5, 0, 0);

        for (let i = 0; i < this.backgrounds.length; i++) {
            this.backgrounds[i].onWindowResize();
        }
    }
}
