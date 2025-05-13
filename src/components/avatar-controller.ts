import type * as THREE from 'three';
import {css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {FBXModel, loadFBX, loadGLTF} from '../services/model-loader.js';
import {AnimationManager} from '../services/animation-manager.js';

@customElement('avatar-controller')
export class AvatarController extends LitElement {
    static styles = css`
        :host {
            display: block;
            position: relative;
        }

        #canvas-container {
            width: 100%;
            background: #000;
            position: relative;
            overflow: hidden;
        }

        .overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #fff;
        }

        .controls {
            position: absolute;
            bottom: 1rem;
            left: 1rem;
            display: flex;
            gap: 0.5rem;
        }

        .button {
            background: #fff;
            border: none;
            border-radius: 0.25rem;
            padding: 0.5rem 1rem;
            font-size: 1rem;
            cursor: pointer;
            color: #000;
            transition: background 0.2s ease-in-out;

            &:disabled {
                opacity: 0.5;
            }
        }
    `;

    @property({type: String}) src = '/models/avatar.glb';
    @property({type: Number}) width = 600;
    @property({type: Number}) height = 600;
    @property({type: Boolean}) autoplay = true;

    @state() loading = true;
    @state() error: string | null = null;
    @state() animating = false;

    private threeLib?: typeof THREE;
    private renderer!: THREE.WebGLRenderer;
    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private controls!: OrbitControls;
    private avatarGroup!: THREE.Object3D;
    private baseAvatarY = 0;
    private animationManager!: AnimationManager;
    private defaultClip?: THREE.AnimationClip;

    connectedCallback() {
        super.connectedCallback();
        this.updateComplete.then(() => this.initScene());
    }

    private async initScene() {
        try {
            const THREE = await import('three');
            this.threeLib = THREE;

            this.scene = new THREE.Scene();
            this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
            this.renderer.setSize(this.width, this.height);
            (this.renderer as any).gammaOutput = true;
            (this.renderer as any).gammaFactor = 2.2;
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.shadowRoot!
                .getElementById('canvas-container')!
                .appendChild(this.renderer.domElement);

            const texLoader = new THREE.TextureLoader();
            const pano = await texLoader.loadAsync('/textures/environment.jpg');

            const cubeRT = new THREE.WebGLCubeRenderTarget(pano.image.height, {
                format: THREE.RGBAFormat,
                generateMipmaps: true,
                minFilter: THREE.LinearMipmapLinearFilter,
            });
            cubeRT.fromEquirectangularTexture(this.renderer, pano);

            this.scene.environment = cubeRT.texture;
            this.scene.background = cubeRT.texture;

            pano.dispose();

            this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
            this.camera.position.set(-0.002, 4.63, 2.877);

            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.enablePan = false;
            const initDist = this.camera.position.distanceTo(this.controls.target);
            this.controls.minDistance = initDist - 1;
            this.controls.maxDistance = initDist + 1;
            this.controls.target.set(-0.004, 4.231, -0.454);
            this.controls.update();
            this.controls.addEventListener('change', () => {
                this.camera.position.y = THREE.MathUtils.clamp(this.camera.position.y, 4.340, 7.400);
            });

            this.scene.add(new THREE.AmbientLight(0xffffff, 0.4));
            const sun = new THREE.DirectionalLight(0xffffff, 0.8);
            sun.position.set(5, 10, 7.5);
            sun.castShadow = true;
            const d = 10;
            const shadowCam = sun.shadow.camera as THREE.OrthographicCamera;
            shadowCam.left = -d;
            shadowCam.right = d;
            shadowCam.top = d;
            shadowCam.bottom = -d;
            shadowCam.updateProjectionMatrix();
            sun.shadow.mapSize.set(2048, 2048);
            this.scene.add(sun);

            const groundFbx = await loadFBX('/models/ground.fbx', '/textures');
            const groundBox = new THREE.Box3().setFromObject(groundFbx);
            groundFbx.position.y = -groundBox.min.y;
            const groundHeight = groundBox.max.y - groundBox.min.y;
            const floorTex = await texLoader.loadAsync('/textures/2.jpg');
            floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
            floorTex.repeat.set(10, 10);

            groundFbx.traverse(o => {
                if ((o as THREE.Mesh).isMesh) {
                    const m = o as THREE.Mesh;
                    m.receiveShadow = true;
                    m.castShadow = false;
                    m.material = new THREE.MeshStandardMaterial({
                        map: floorTex,
                        envMap: cubeRT.texture,
                        roughness: 0.7,
                        metalness: 0.2,
                    });
                }
            });
            this.scene.add(groundFbx);

            const gltf = await loadGLTF(this.src);
            this.avatarGroup = gltf.scene;
            const avatarBox = new THREE.Box3().setFromObject(this.avatarGroup);
            this.baseAvatarY = groundHeight - avatarBox.min.y;
            this.avatarGroup.position.y = this.baseAvatarY - 3.91;
            this.avatarGroup.traverse(o => {
                if ((o as THREE.Mesh).isMesh) {
                    const m = o as THREE.Mesh;
                    m.castShadow = true;
                    m.receiveShadow = true;
                }
            });
            this.scene.add(this.avatarGroup);

            const clips = gltf.animations.map(c => c.clone());
            const extra: Record<string, string> = {sauter: 'jumping', saluer: 'waving', danser: 'dancing'};
            for (const [name, file] of Object.entries(extra)) {
                const fbxAnim = await loadFBX(`/models/${file}.fbx`, '/textures');
                (fbxAnim as FBXModel).animations.forEach(clip => {
                    clip.name = name;
                    clips.push(clip);
                });
            }
            this.animationManager = new AnimationManager(this.avatarGroup, clips);
            this.defaultClip = clips[0];
            if (this.autoplay && this.defaultClip) {
                const idle = this.animationManager.getMixer().clipAction(this.defaultClip);
                idle.reset();
                idle.loop = THREE.LoopRepeat;
                idle.play();
            }

            const clock = new THREE.Clock();
            const animate = () => {
                requestAnimationFrame(animate);
                const dt = clock.getDelta();
                this.controls.update();
                this.animationManager.getMixer().update(dt);
                this.renderer.render(this.scene, this.camera);
            };
            animate();

            this.loading = false;
        } catch (e: any) {
            console.error(e);
            this.error = 'Impossible de charger modèle ou animations.';
            this.loading = false;
        }
    }

    private play(name: string) {
        if (!this.animationManager || this.animating) return;
        this.animating = true;
        this.dispatchEvent(new CustomEvent('animation-start', {detail: name}));
        this.animationManager.getMixer().stopAllAction();
        this.animationManager.playOnce(name).then(() => {
            this.dispatchEvent(new CustomEvent('animation-end', {detail: name}));
            this.animating = false;
            if (this.defaultClip && this.threeLib) {
                const idle = this.animationManager.getMixer().clipAction(this.defaultClip);
                idle.reset();
                idle.loop = this.threeLib.LoopRepeat;
                idle.play();
            }
        });
    }

    private resetPose() {
        if (!this.animationManager || !this.defaultClip) return;
        const mixer = this.animationManager.getMixer();
        mixer.stopAllAction();
        const idle = mixer.clipAction(this.defaultClip);
        idle.reset();
        idle.loop = this.threeLib!.LoopRepeat;
        idle.play();
        this.animating = false;
    }

    override render() {
        return html`
            <div id="canvas-container" style="width:${this.width}px; height:${this.height}px;">
                ${this.loading ? html`
                    <div class="overlay">Chargement…</div>` : ''}

                ${this.error ? html`
                    <div class="overlay">${this.error}</div>` : ''}

                <div class="controls">
                    <button class="button" @click=${() => this.play('sauter')}
                            ?disabled=${this.loading || this.animating}>
                        Sauter
                    </button>

                    <button class="button" @click=${() => this.play('saluer')}
                            ?disabled=${this.loading || this.animating}>
                        Saluer
                    </button>

                    <button class="button" @click=${() => this.play('danser')}
                            ?disabled=${this.loading || this.animating}>
                        Danser
                    </button>

                    <button class="button" @click=${() => this.resetPose()}
                            ?disabled=${this.loading}>
                        Réinitialiser
                    </button>
                </div>
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'avatar-controller': AvatarController;
    }
}
