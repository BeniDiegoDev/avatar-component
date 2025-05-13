// jest.setup.cjs
// 1) Polyfill fetch/Request pour Three.js
require('whatwg-fetch');

// 2) Stub global de THREE.WebGLRenderer pour éviter le getContext()
const THREE = require('three');
class MockWebGLRenderer {
    constructor(params) {
        // vous pouvez conserver params si besoin pour des tests ultérieurs
    }
    setSize(width, height) {
        // stub, ne fait rien
    }
    // si votre code utilise gammaOutput / gammaFactor, autorisez simplement leur affectation
}
THREE.WebGLRenderer = MockWebGLRenderer;
