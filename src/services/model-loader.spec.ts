import {loadFBX, loadGLTF} from './model-loader';

jest.mock('three/examples/jsm/loaders/GLTFLoader', () => ({
    GLTFLoader: jest.fn().mockImplementation(() => ({
        loadAsync: jest.fn().mockResolvedValue({scene: {}, animations: []})
    }))
}));

jest.mock('three/examples/jsm/loaders/FBXLoader.js', () => ({
    FBXLoader: jest.fn().mockImplementation(() => ({
        setResourcePath: jest.fn(),
        loadAsync: jest.fn().mockResolvedValue({animations: []})
    }))
}));

describe('model-loader', () => {
    it('loadGLTF résout un GLTF', async () => {
        const gltf = await loadGLTF('/fake.gltf');
        expect(gltf).toHaveProperty('scene');
        expect(gltf.animations).toEqual([]);
    });

    it('loadFBX résout un FBXModel', async () => {
        const fbx = await loadFBX('/fake.fbx');
        expect(fbx.animations).toBeInstanceOf(Array);
    });
});
