import type {GLTF} from 'three/examples/jsm/loaders/GLTFLoader.js';
import type * as THREE from 'three';

export async function loadGLTF(url: string): Promise<GLTF> {
    const {GLTFLoader} = await import('three/examples/jsm/loaders/GLTFLoader.js');
    return new GLTFLoader().loadAsync(url);
}

export interface FBXModel extends THREE.Group {
    animations: THREE.AnimationClip[];
}

export async function loadFBX(
    url: string,
    resourcePath?: string
): Promise<FBXModel> {
    const {FBXLoader} = await import('three/examples/jsm/loaders/FBXLoader.js');
    const loader = new FBXLoader();
    loader.setResourcePath(resourcePath ?? url.substring(0, url.lastIndexOf('/') + 1));
    return (await loader.loadAsync(url)) as FBXModel;
}
