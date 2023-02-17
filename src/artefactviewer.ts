import * as THREE from "three";
import { readTextFile } from "./utils";
import { ArtefactBase } from "./artefactbase";
import { ArtefactData } from "./artefactdata";

export class ArtefactViewer extends THREE.Group {
    artefacts: Array<ArtefactBase>;
    currArtefact: ArtefactBase;

    constructor() {
        super();
        this.artefacts = [];

        this.loadArtefactsDataFromUrl("artefacts.json");
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
            this.loadArtefact(this.currArtefact);
        }
    }

    onArtefactLoadEnd(artefact: ArtefactBase) {
        this.add(artefact);
    }

    loadArtefact(artefact: ArtefactBase) {
        artefact.load((a: ArtefactBase) => { this.onArtefactLoadEnd(a); });
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

        this.loadArtefact(this.currArtefact);
    }

    nextArtefact() {
        if (this.currArtefact) {
            this.currArtefact.unload();
        }
        const currArtefactIdx = this.artefacts.indexOf(this.currArtefact);
        this.currArtefact = this.artefacts[(currArtefactIdx+1) % this.artefacts.length];
        this.loadArtefact(this.currArtefact);
    }
}
