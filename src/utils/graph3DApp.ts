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
        if (false) {
            const left = -window.innerWidth / 2;
            const right = -left;
            const top = -window.innerHeight / 2;
            const bottom = -top;
            const near = 1;
            const far = 1000;
            const camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
            camera.position.set(5, 55, 105);
            return camera;
        } else {
            const fov: number = 75;
            const aspect: number = window.innerWidth / window.innerHeight;
            const near: number = 0.1;
            const far: number = 10000;
            const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
            camera.position.set(5, 855, 405);
            return camera;
        }
    }

    renderNodes() {
        let nodeLength = 30;
        const maxNodeRadius = 20;
        const minNodeRadius = 2;
        const nodeContainer = new THREE.Object3D();
        this.scene.add(nodeContainer);
        let nodes = [];

        const nodeInstance = 10;
        let currentBorder = 0;
        function createNode(index: number) {
            const radius = randomInRange(minNodeRadius, maxNodeRadius);
            const segments = 32;
            const geo = new THREE.SphereBufferGeometry(radius, segments, segments);
            const mat = new THREE.MeshBasicMaterial({ color: 0x0000ff });
            const mesh = new THREE.Mesh(geo, mat);
            const x = currentBorder + radius;
            mesh.position.x = x;
            currentBorder = x + radius + nodeInstance;
            nodeContainer.add(mesh);
            return mesh;
        }
        for (let i = 0; i < nodeLength; i++) {
            nodes.push(createNode(i));
        }
    }

    setLights() {
        const intensity = 1;
        this.scene.add(new THREE.AmbientLight(0xf9f9f9, intensity));
        // const dirLight = new THREE.DirectionalLight(0xfafafa, intensity);
        // dirLight.position.set(30, 50, 10);
        // this.scene.add(dirLight);
        // const spotLight = new THREE.SpotLight(0xfefefe, 10);
        // spotLight.position.set(0, 200, 1);
        // this.scene.add(spotLight);
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
            let materialProps: THREE.MeshBasicMaterialParameters = {};
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

            const mat = new THREE.MeshBasicMaterial(materialProps);
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

        _this.sun = createPlanet(sun, 0);
        _this.scene.add(_this.sun);

        let distance = 60;
        let offset = sun.radius;
        planets.forEach((planet, index) => {
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
