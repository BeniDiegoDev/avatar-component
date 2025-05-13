import * as THREE from 'three';

export class AnimationManager {
    private mixer: THREE.AnimationMixer;
    private clips: THREE.AnimationClip[];

    constructor(scene: THREE.Object3D, clips: THREE.AnimationClip[]) {
        this.mixer = new THREE.AnimationMixer(scene);
        this.clips = clips;
    }

    playOnce(name: string): Promise<void> {
        return new Promise(resolve => {
            const clip = this.clips.find(c => c.name === name);
            if (!clip) return resolve();

            const action = this.mixer.clipAction(clip).reset();
            action.clampWhenFinished = true;
            action.loop = THREE.LoopOnce;
            action.play();

            const onFinished = (e: { action: THREE.AnimationAction }) => {
                if (e.action.getClip().name !== name) return;
                this.mixer.removeEventListener('finished', onFinished);
                resolve();
            };
            this.mixer.addEventListener('finished', onFinished);
        });
    }

    getMixer(): THREE.AnimationMixer {
        return this.mixer;
    }
}
