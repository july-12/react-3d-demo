import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface appProps {
    canvas: HTMLCanvasElement;
}

interface planetProps {
    name: string;
    radius: number;
    speed?: number;
    color: number;
    texture?: string;
    ringTexture?: string;
}

function randomInRange(min: number, max: number): number {
    const diff = max - min;
    return min + Math.floor(Math.random() * diff);
}

const planets: planetProps[] = [
    {
        name: 'Mercury',
        radius: 10,
        color: 0xffdd59,
        texture: './images/textures/tex/mercury.jpg'
    },
    {
        name: 'Venus',
        radius: 13,
        color: 0x0fbcf9,
        texture: './images/textures/tex/Venus.jpg'
    },
    {
        name: 'Earth',
        radius: 14,
        color: 0x575fcf,
        texture: './images/textures/tex/world5400x2700.jpg'
    },
    {
        name: 'Mars',
        radius: 12,
        color: 0x34e7e4,
        texture: './images/textures/tex/mars.jpg'
    },
    {
        name: 'Jupiter',
        radius: 20,
        color: 0x05c46b,
        texture: './images/textures/tex/Jupitar.jpg'
    },
    {
        name: 'Saturn',
        radius: 40,
        color: 0xff3f34,
        texture: './images/textures/tex/saturn.jpg',
        ringTexture: './images/textures/tex/ring.PNG'
    },
    {
        name: 'Uranus',
        radius: 42,
        color: 0x808e9b,
        texture: './images/textures/tex/uranus.jpg'
    },
    {
        name: 'Neptune',
        radius: 44,
        color: 0xef5777,
        texture: './images/textures/tex/neptune.jpg'
    }
];
planets.forEach((p) => (p.speed = randomInRange(1, 10)));

export class Graph3DApp {
    canvas: HTMLCanvasElement;

    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
    control: OrbitControls;

    planetList: THREE.Object3D[];
    sun: THREE.Object3D;

    timer: { delta: number; then: number };

    constructor(options: appProps) {
        this.canvas = options.canvas;

        this.renderer = this.setRenderer();
        this.scene = new THREE.Scene();
        this.camera = this.setCamera();

        this.timer = { delta: 0, then: 0 };
        this.setLights();

        this.control = this.setControl();

        this.setDebugger();

        this.planetList = [];
        this.sun = new THREE.Object3D();
        this.loadingBackground();
    }

    setRenderer() {
        const renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true,
            logarithmicDepthBuffer: true
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0xf0f0f0);
        return renderer;
    }

    setCamera() {
        const fov: number = 75;
        const aspect: number = window.innerWidth / window.innerHeight;
        const near: number = 0.1;
        const far: number = 10000;
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.set(5, 855, 405);
        return camera;
    }

    setLights() {
        this.scene.add(new THREE.AmbientLight(0x222222));
    }

    setControl() {
        const control = new OrbitControls(this.camera, this.canvas);
        return control;
    }
    setDebugger() {
        const debug = false;
        if (debug) {
            const axes = new THREE.AxesHelper(1000);
            axes.renderOrder = 1;
            // axes.material.depthTest = true
            this.scene.add(axes);
        }
    }
    loadingBackground() {
        const _this = this;
        const textures = [
            './images/textures/bkg1_right.png',
            './images/textures/bkg1_left.png',
            './images/textures/bkg1_top.png',
            './images/textures/bkg1_bot.png',
            './images/textures/bkg1_front.png',
            './images/textures/bkg1_back.png'
        ];
        const loaderManager = new THREE.LoadingManager();
        const loader = new THREE.CubeTextureLoader(loaderManager);

        let loadingEl: HTMLDivElement = document.createElement('div');
        let loadingProgressBar: HTMLDivElement = document.createElement('div');
        let loadingText: HTMLSpanElement = document.createElement('span');
        function onStart() {
            loadingEl.className = 'loading-area';
            const loadingBarAre = document.createElement('div');
            loadingBarAre.className = 'loading-area-bar';
            loadingBarAre.appendChild(loadingProgressBar);
            loadingBarAre.appendChild(loadingText);
            loadingText.innerHTML = 'loadding...';
            loadingEl.appendChild(loadingBarAre);

            document.body.appendChild(loadingEl);
        }

        function onProgress(url: string, itemsLoaded: number, itemsTotal: number) {
            const width = `${((itemsLoaded / itemsTotal) * 100) | 0}%`;
            loadingProgressBar.style.width = width;
            loadingText.innerHTML = width;
        }

        function onLoad() {
            setTimeout(() => {
                document.body.removeChild(loadingEl);
                _this.startSettingWorld();
            }, 1000);
        }

        loaderManager.onStart = onStart;
        loaderManager.onProgress = onProgress;
        loaderManager.onLoad = onLoad;

        const texture = loader.load(textures);
        this.scene.background = texture;
    }

    drawGalaxy() {
        const _this = this;
        const sun = {
            name: 'Sun',
            radius: 60,
            color: 0xffdd59,
            texture: './images/textures/tex/2k_sun.jpg'
        };

        function createOrbit(orbitRadius: number) {
            const geo = new THREE.CircleGeometry(orbitRadius, 64);
            const mat = new THREE.LineBasicMaterial({ color: 0x70a1ff });
            geo.vertices.splice(0, 1);
            const circleLine = new THREE.LineLoop(geo, mat);
            circleLine.rotation.x = Math.PI * -0.5;
            return circleLine;
        }
        function createPivot(planet: planetProps) {
            const segments = 32;
            const geo = new THREE.SphereBufferGeometry(planet.radius, segments, segments);
            // const geo = new THREE.BoxGeometry(10, 10, 10);
            let materialProps: THREE.MeshPhongMaterialParameters = {
                shininess: 150
            };
            if (planet.texture) {
                const loader = new THREE.TextureLoader();
                const texture = loader.load(planet.texture);
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                materialProps.map = texture;
                // materialProps.side = THREE.DoubleSide;
            } else {
                materialProps.color = planet.color;
            }

            const mat = new THREE.MeshPhongMaterial(materialProps);
            return new THREE.Mesh(geo, mat);
        }

        function createRing(planet: planetProps) {
            const innerRadius = planet.radius + 20;
            const outerRadius = innerRadius + 14;
            const geo = new THREE.RingGeometry(innerRadius, outerRadius, 32);
            const loader = new THREE.TextureLoader();
            const texture = loader.load(planet.ringTexture as string);
            const mat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.rotation.x = Math.PI * -0.5;
            return mesh;
        }

        function createPlanet(planet: planetProps, offset: number) {
            const planetObj = new THREE.Object3D();

            const orbit = createOrbit(offset);
            const pivot = createPivot(planet);
            pivot.position.x = offset;
            planetObj.add(orbit);
            planetObj.add(pivot);

            if (planet.ringTexture) {
                const ring = createRing(planet);
                ring.position.x = offset;
                planetObj.add(ring);
            }

            const randomAngle = randomInRange(-180, 180);
            planetObj.rotateY((randomAngle / 180) * Math.PI);

            _this.scene.add(planetObj);
            return planetObj;
        }

        function createSun(planet: planetProps) {
            const intensity = 1.4;
            const light = new THREE.PointLight(planet.color, intensity);
            light.castShadow = true;

            const segments = 32;
            const geo = new THREE.SphereBufferGeometry(planet.radius, segments, segments);

            const loader = new THREE.TextureLoader();
            const texture = loader.load(planet.texture as string);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;

            const mat = new THREE.MeshBasicMaterial({
                map: texture
            });
            mat.color.multiplyScalar(intensity);
            const sunMesh = new THREE.Mesh(geo, mat);
            light.add(sunMesh);

            const customMat = new THREE.ShaderMaterial({
                uniforms: {
                    c: { value: 0.3 },
                    p: { value: 2.82 },
                    glowColor: { value: new THREE.Color(0xffff00) },
                    viewVector: { value: _this.camera.position }
                },
                vertexShader: `
                    uniform vec3 viewVector;
                    uniform float c;
                    uniform float p;
                    varying float intensity;
                    void main()
                    {
                        vec3 vNormal = normalize( normalMatrix * normal );
                        vec3 vNormel = normalize( normalMatrix * viewVector );
                        intensity = pow( c - dot(vNormal, vNormel), p );
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                    }
                `,
                fragmentShader: `
                    uniform vec3 glowColor;
                    varying float intensity;
                    void main()
                    {
                        vec3 glow = glowColor * intensity;
                        gl_FragColor = vec4( glow, 1.0 );
                    }
                `,
                side: THREE.FrontSide,
                blending: THREE.AdditiveBlending,
                transparent: true
            });
            const sunGlow = new THREE.Mesh(geo.clone(), customMat);
            sunGlow.scale.multiplyScalar(2.19);
            sunGlow.position.set(light.position.x, light.position.y, light.position.z);
            _this.scene.add(sunGlow);

            return light;
        }

        _this.sun = createSun(sun);
        _this.scene.add(_this.sun);

        let distance = 60;
        let offset = sun.radius;
        planets.forEach((planet) => {
            offset += planet.radius * 2 + distance;
            const planetMesh = createPlanet(planet, offset);
            this.planetList.push(planetMesh);
            _this.scene.add(planetMesh);
        });

        new THREE.SphereBufferGeometry();
    }
    startSettingWorld() {
        this.drawGalaxy();
    }

    render(time: number = 0) {
        time *= 0.001;
        this.timer.delta = time - this.timer.then;
        this.timer.then = time;

        this.sun.rotateY(Math.sin(this.timer.delta * 0.6));
        this.planetList.forEach((p, index) => {
            const speed = planets[index].speed as number;
            p.rotateY(Math.sin(this.timer.delta * 0.1 * speed));
        });

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
    }
}
