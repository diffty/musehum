import * as THREE from "three";
import { readTextFile } from "./utils";
import { ArtefactBase } from "./artefactbase";
import { ArtefactData } from "./artefactdata";
import { StencilShutter } from "./stencilshutter";


export class ArtefactViewer extends THREE.Group {
    artefacts: Array<ArtefactBase>;
    currArtefact: ArtefactBase;
    artefactsToLoad: number; 
    shutter: StencilShutter;

    constructor() {
        super();
        this.artefacts = [];
        this.artefactsToLoad = 2;

        this.loadArtefactsDataFromUrl("artefacts.json");

        this.shutter = new StencilShutter(2);
        this.add(this.shutter);
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
            
            for (let i = 0; i < Math.min(this.artefactsToLoad, this.artefacts.length); i++) {
                this.loadArtefact(this.artefacts[i])
                    .then((a: ArtefactBase) => {
                        this.showArtefact(a); // Attention on affiche tout là
                    });
                this.artefacts[i].visible = false;
            }
            
            this.currArtefact.visible = true;
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

        if (!stencilId) {
            stencilId = this.getArtefactStencilId(artefact);
            console.log(stencilId);
        }

        artefact.setStencilId(stencilId);
    }

    prevArtefact() {
        if (this.currArtefact) {
            this.currArtefact.unload();
        }
        
        const currArtefactIdx = this.artefacts.indexOf(this.currArtefact);
        
        if (currArtefactIdx - 1 < 0) {
            this.currArtefact = this.artefacts[(this.artefacts.length-1)];
        }
        else {
            this.currArtefact = this.artefacts[currArtefactIdx - 1];
        }

        this.showArtefact(this.currArtefact);
    }

    nextArtefact() {
        if (this.currArtefact) {
            this.currArtefact.unload();
        }
        const currArtefactIdx = this.artefacts.indexOf(this.currArtefact);
        this.currArtefact = this.artefacts[(currArtefactIdx+1) % this.artefacts.length];
        this.showArtefact(this.currArtefact);
    }

    getArtefactStencilId(artefact: ArtefactBase) {
        const artefactIdx = this.artefacts.indexOf(artefact);
        return (artefactIdx % 2) + 1;
    }

    onDrag(moveDelta: THREE.Vector2) {
        this.shutter.topGroup.translateX(moveDelta.x);

        const edgeSize = 0.050;
        
        if (this.shutter.topGroup.position.x > this.shutter.mainPlane.scale.x + edgeSize + 0.001) {
            this.shutter.topGroup.position.set(
                -(this.shutter.mainPlane.scale.x + edgeSize),
                0,
                0,
            )
        }
        else if (this.shutter.topGroup.position.x < -(this.shutter.mainPlane.scale.x + edgeSize + 0.001)) {
            this.shutter.topGroup.position.set(
                this.shutter.mainPlane.scale.x + edgeSize,
                0,
                0,
            )
        }
    }

    onWindowResize() {
        const ratio = (window.innerWidth / window.innerHeight);
        
        this.shutter.mainPlane.scale.set(ratio, 1, this.shutter.mainPlane.scale.z);
        this.shutter.topPlane.scale.set(ratio, 1, this.shutter.mainPlane.scale.z);

        this.shutter.leftEdge.position.set(-ratio * 0.5, 0, 0);
        this.shutter.rightEdge.position.set(ratio * 0.5, 0, 0);
    }
}
