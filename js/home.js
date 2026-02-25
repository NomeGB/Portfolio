import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { TrackballControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/TrackballControls.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 2000);

const renderer = new THREE.WebGLRenderer({ 
    alpha: true,
    antialias: true, 
    precision: "highp"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
document.getElementById("3Dcontainer").appendChild(renderer.domElement);

// ─── Phone detector ──────────────────────────────────────────────────────────

const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

if (isMobile) {
    document.getElementById('3Dcontainer').style.display = 'none';
    document.getElementById('labels').style.display = 'none';

    document.getElementById('mobileMenu').style.display  = 'flex';
} else {
    document.getElementById('mobileMenu').style.display  = 'none';
}

// ─── Scene objects ────────────────────────────────────────────────────────

let moonObject;
let sateliteObject;
let flagObject;
let roberObject;
let capsuleObject;
let controls;


// ─── Models textures ───────────────────────────────────────────────────────

const textureLoader = new THREE.TextureLoader();
const Texture = textureLoader.load(`Assets/3d/Color.png`);
Texture.encoding = THREE.sRGBEncoding;


// ─── Main group and light ────────────────────────────────────────────────────

let lightOffset = new THREE.Vector3(10, 250, 0);

const sceneGroup = new THREE.Group();
scene.add(sceneGroup);

// ─── Fog ─────────────────────────────────────────────────────────────────────

scene.fog = new THREE.FogExp2(0x3f223f, 0.0025);

// ─── bg novols nen ────────────────────────────────────────────────────────

function createNebula() {
    const nebulaData = [
        // ─── Const 1 ────────────────────────────────────
        { pos: new THREE.Vector3( 500,  200, -300), color: new THREE.Color(0x8b4a8b), scale: 400, opacity: 0.35 },
        { pos: new THREE.Vector3( 560,  250, -280), color: new THREE.Color(0x6b3a6b), scale: 280, opacity: 0.20 },
        { pos: new THREE.Vector3( 450,  160, -340), color: new THREE.Color(0xaa5aaa), scale: 220, opacity: 0.25 },
        { pos: new THREE.Vector3( 620,  180, -320), color: new THREE.Color(0x9b3a9b), scale: 180, opacity: 0.15 },

        // ─── Const 2 ──────────────────────────────
        { pos: new THREE.Vector3(-400,  100,  400), color: new THREE.Color(0x2a1a3e), scale: 380, opacity: 0.40 },
        { pos: new THREE.Vector3(-360,   60,  430), color: new THREE.Color(0x3f223f), scale: 240, opacity: 0.25 },
        { pos: new THREE.Vector3(-440,  140,  370), color: new THREE.Color(0x4a2a5e), scale: 200, opacity: 0.18 },
        { pos: new THREE.Vector3(-480,   80,  450), color: new THREE.Color(0x5a3a6e), scale: 160, opacity: 0.15 },

        // ─── Const 3 ─────────────────────────────────────────
        { pos: new THREE.Vector3( 200, -300, -500), color: new THREE.Color(0x8b3a6b), scale: 450, opacity: 0.30 },
        { pos: new THREE.Vector3( 240, -260, -480), color: new THREE.Color(0xaa4a8b), scale: 280, opacity: 0.28 },
        { pos: new THREE.Vector3( 160, -340, -520), color: new THREE.Color(0x9b2a7b), scale: 200, opacity: 0.20 },

        // ─── BG ───────────────────────
        { pos: new THREE.Vector3(-600,  300, -600), color: new THREE.Color(0xcc44cc), scale: 500, opacity: 0.45 },
        { pos: new THREE.Vector3( 700, -200,  500), color: new THREE.Color(0x993399), scale: 550, opacity: 0.50 },
        { pos: new THREE.Vector3(-200,  600,  400), color: new THREE.Color(0xbb33aa), scale: 480, opacity: 0.42 },
        { pos: new THREE.Vector3( 400, -500, -200), color: new THREE.Color(0xaa2299), scale: 520, opacity: 0.48 },
        { pos: new THREE.Vector3(-700, -300,  200), color: new THREE.Color(0x882288), scale: 460, opacity: 0.38 },
        { pos: new THREE.Vector3( 300,  400,  600), color: new THREE.Color(0xdd55bb), scale: 440, opacity: 0.44 },

        // ─── fill ──────────────────────────────────────────────
        { pos: new THREE.Vector3(-300, -200,  300), color: new THREE.Color(0x6b3a6b), scale: 300, opacity: 0.10 },
        { pos: new THREE.Vector3( 100,  500, -200), color: new THREE.Color(0x2a1a3e), scale: 350, opacity: 0.12 },
        { pos: new THREE.Vector3(-500, -100, -400), color: new THREE.Color(0x3f223f), scale: 320, opacity: 0.08 },
    ];

    nebulaData.forEach(data => {

        // Cloud shaped canvas
        const canvas  = document.createElement('canvas');
        canvas.width  = 256;
        canvas.height = 256;
        const ctx     = canvas.getContext('2d');

        // Gaussian stains
        const blobs = 6;
        for (let i = 0; i < blobs; i++) {
            const bx   = 80 + Math.random() * 96;
            const by   = 80 + Math.random() * 96;
            const brad = 40 + Math.random() * 60;
            const grad = ctx.createRadialGradient(bx, by, 0, bx, by, brad);
            grad.addColorStop(0,   `rgba(255,255,255,${0.15 + Math.random() * 0.15})`);
            grad.addColorStop(1,   'rgba(255,255,255,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 256, 256);
        }

        const texture  = new THREE.CanvasTexture(canvas);
        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshBasicMaterial({
            map:         texture,
            color:       data.color,
            transparent: true,
            opacity:     data.opacity,
            depthWrite:  false,
            blending:    THREE.AdditiveBlending,
            side:        THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(data.pos);
        mesh.scale.setScalar(data.scale);

        scene.add(mesh);
    });
}
createNebula();

// ─── Raycaster ───────────────────────────────────────────────────────────────

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


// ─── Hover system ────────────────────────────────────────────────────────────

let sateliteHovered = false;
let sateliteShaders  = [];

let flagHovered = false;
let flagShaders  = [];

let roberHovered = false;
let roberShaders  = [];

let capsuleHovered = false;
let capsuleShaders  = [];

// ─── Global cam state ─────────────────────────────────────────────────────────

let isZoomed          = false;
let isReturning       = false;
let returningPhase    = 0;
let returningProgress = 0;
let autoRotate        = true;
let activeItem        = null;

let returnStartPos    = new THREE.Vector3();
let returnStartTarget = new THREE.Vector3();

const defaultCameraPos    = new THREE.Vector3(0, 0, 350);
const defaultCameraTarget = new THREE.Vector3(0, 0, 0);
let   returnMidpoint      = new THREE.Vector3(0, 100, 400);

const defaultSceneRot    = new THREE.Euler(0, 0, 0);
const defaultSateliteRot = new THREE.Euler(90, 0, 120);


// ─── Interactuable items ──────────────────────────────────────────────────────

const items = [
    {
        name:         "Contact",
        cameraPos:    new THREE.Vector3(-110, -70, 180),
        cameraTarget: new THREE.Vector3(-172, -90, 75),
        destination:  "contact.html",
        object:       null,
        anchor:       null
    },
    {
        name:         "3D work",
        cameraPos:    new THREE.Vector3(-40, -50, -200),
        cameraTarget: new THREE.Vector3(0, -60, -130),
        destination:  "3d.html",
        object:       null,
        anchor:       null
    },
    {
        name:         "Game developement",
        cameraPos:    new THREE.Vector3(140, -50, 120),
        cameraTarget: new THREE.Vector3(120, -10, 100),
        destination:  "dev.html",
        object:       null,
        anchor:       null
    },
    {
        name:         "Visual media",
        cameraPos:    new THREE.Vector3(-70, 150, -60),
        cameraTarget: new THREE.Vector3(-30, 125.5, -20),
        destination:  "media.html",
        object:       null,
        anchor:       null
    }
];


// ─── Safe midpoint calculator ─────────────────────────────────────────────────

function getSafeMidpoint() {
    const from = camera.position.clone();
    const to   = defaultCameraPos.clone();
    const mid  = from.clone().lerp(to, 0.3);

    // Check if route enters to safe zone (moon model)
    const dir      = to.clone().sub(from).normalize();
    const toOrigin = new THREE.Vector3().sub(from);
    const dot      = toOrigin.dot(dir);
    const closest  = from.clone().add(dir.clone().multiplyScalar(dot));

    if (closest.length() < 150) {
        mid.y += 250;
    }

    return mid;
}


// ─── Mouse Events ─────────────────────────────────────────────────────────────

renderer.domElement.addEventListener('mousemove', (e) => {
    mouse.x = ( e.clientX / window.innerWidth  ) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    if (sateliteObject) {
        const intersects = raycaster.intersectObject(sateliteObject, true);
        sateliteHovered = intersects.length > 0;
    }
    if (flagObject) {
        const intersects = raycaster.intersectObject(flagObject, true);
        flagHovered = intersects.length > 0;
    }
    if (roberObject) {
        const intersects = raycaster.intersectObject(roberObject, true);
        roberHovered = intersects.length > 0;
    }
    if (capsuleObject) {
        const intersects = raycaster.intersectObject(capsuleObject, true);
        capsuleHovered = intersects.length > 0;
    }
});

renderer.domElement.addEventListener('click', (e) => {
    if (isZoomed) return;

    mouse.x = ( e.clientX / window.innerWidth  ) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const clickables = [sateliteObject, flagObject, roberObject, capsuleObject, moonObject].filter(Boolean);
    const intersects = raycaster.intersectObjects(clickables, true);

    if (intersects.length === 0) return;

    const hit = intersects[0].object;

    const check = (obj, item) => obj && hit.parent && (hit === obj || hit.isDescendantOf?.(obj) || intersects[0].object.traverseAncestors?.((a) => a === obj));

    if (sateliteObject && sateliteHovered && sateliteObject.getObjectById(hit.id)) {
        isZoomed = true; isReturning = false; autoRotate = false;
        controls.enabled = false; activeItem = items[0];
    } else if (flagObject && flagHovered && flagObject.getObjectById(hit.id)) {
        isZoomed = true; isReturning = false; autoRotate = false;
        controls.enabled = false; activeItem = items[1];
    } else if (roberObject && roberHovered && roberObject.getObjectById(hit.id)) {
        isZoomed = true; isReturning = false; autoRotate = false;
        controls.enabled = false; activeItem = items[2];
    } else if (capsuleObject && capsuleHovered && capsuleObject.getObjectById(hit.id)) {
        isZoomed = true; isReturning = false; autoRotate = false;
        controls.enabled = false; activeItem = items[3];
    }
});


// ─── Satelite ────────────────────────────────────────────────────────────────

const loader = new GLTFLoader();

loader.load(
    `Assets/3d/Satelite.gltf`,
    function (gltf) {
        sateliteObject = gltf.scene;
        sateliteObject.scale.set(0.75, 0.75, 0.75);
        sateliteObject.rotation.copy(defaultSateliteRot);

        gltf.scene.traverse(child => {
            if (!child.isMesh) return;

            const oldMat = child.material;
            child.material = new THREE.MeshStandardMaterial({
                color:             oldMat.color || 0xffffff,
                map:               Texture,
                emissive:          0xffffff,
                emissiveMap:       Texture,
                emissiveIntensity: 0,
                metalness:         0,
                roughness:         1
            });

            child.material.onBeforeCompile = (shader) => {
                shader.uniforms.fresnelPower = { value: 10.0 };
                sateliteShaders.push(shader);

                shader.vertexShader = 'varying vec3 vWorldPosition;\nvarying vec3 vWorldNormal;\n'
                    + shader.vertexShader.replace(
                        '#include <begin_vertex>',
                        `#include <begin_vertex>
                        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                        vWorldNormal   = normalize(mat3(modelMatrix) * normal);`
                    );

                shader.fragmentShader = 'varying vec3 vWorldPosition;\nvarying vec3 vWorldNormal;\nuniform float fresnelPower;\n'
                    + shader.fragmentShader.replace(
                        '#include <emissivemap_fragment>',
                        `#include <emissivemap_fragment>
                        vec3  viewDir = normalize(cameraPosition - vWorldPosition);
                        float fresnel = pow(1.0 - dot(normalize(vWorldNormal), viewDir), fresnelPower);
                        totalEmissiveRadiance += texture2D(emissiveMap, vUv).rgb * fresnel * 2.0;`
                    );
            };
        });

        items[0].object = sateliteObject;

        // ─── Anchor: punto 3D hijo del objeto que sigue su rotación ──────────
        // Ajusta position.set(x, y, z) en espacio LOCAL del objeto
        const anchor = new THREE.Object3D();
        anchor.position.set(0, 265, 15);
        sateliteObject.add(anchor);
        items[0].anchor = anchor;

        sceneGroup.add(sateliteObject);
    },
    (xhr)   => console.log((xhr.loaded / xhr.total * 100).toFixed(1) + '% satélite'),
    (error) => console.error(error)
);

// ─── Stars ────────────────────────────────────────────────────────────────────

loader.load(
    `Assets/3d/stars.gltf`,
    function (gltf) {

        gltf.scene.traverse(child => {
            if (!child.isMesh) return;

            child.material = new THREE.MeshStandardMaterial({
                color:             0xffffff,
                emissive:          0xffffff,
                emissiveIntensity: 1.0,
                metalness:         0,
                roughness:         1
            });
        });

        sceneGroup.add(gltf.scene);
    },
    (xhr)   => console.log((xhr.loaded / xhr.total * 100).toFixed(1) + '% stars'),
    (error) => console.error(error)
);

// ─── Moon ────────────────────────────────────────────────────────────────────

loader.load(
    `Assets/3d/scene.gltf`,
    function (gltf) {
        moonObject = gltf.scene;
        moonObject.scale.set(1.25, 1.25, 1.25);

        gltf.scene.traverse(child => {
            if (!child.isMesh) return;

            const oldMat = child.material;
            child.material = new THREE.MeshStandardMaterial({
                color:             oldMat.color || 0xffffff,
                map:               Texture,
                emissive:          0xffffff,
                emissiveMap:       Texture,
                emissiveIntensity: 0,
                metalness:         0,
                roughness:         0.75
            });

            child.material.onBeforeCompile = (shader) => {
                shader.vertexShader = 'varying vec3 vWorldPosition;\nvarying vec3 vWorldNormal;\n'
                    + shader.vertexShader.replace(
                        '#include <begin_vertex>',
                        `#include <begin_vertex>
                        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                        vWorldNormal   = normalize(mat3(modelMatrix) * normal);`
                    );

                shader.fragmentShader = 'varying vec3 vWorldPosition;\nvarying vec3 vWorldNormal;\n'
                    + shader.fragmentShader.replace(
                        '#include <emissivemap_fragment>',
                        `#include <emissivemap_fragment>
                        vec3  viewDir = normalize(cameraPosition - vWorldPosition);
                        float fresnel = pow(1.0 - dot(normalize(vWorldNormal), viewDir), 11.0);
                        totalEmissiveRadiance += texture2D(emissiveMap, vUv).rgb * fresnel * 2.0;`
                    );
            };
        });

        sceneGroup.add(moonObject);
    },
    (xhr)   => console.log((xhr.loaded / xhr.total * 100).toFixed(1) + '% luna'),
    (error) => console.error(error)
);

// ─── Flag ────────────────────────────────────────────────────────────────────

loader.load(
    `Assets/3d/Flag.gltf`,
    function (gltf) {
        flagObject = gltf.scene;
        flagObject.scale.set(1.25, 1.25, 1.25);
        flagObject.rotation.set(-90, 0, 0);

        gltf.scene.traverse(child => {
            if (!child.isMesh) return;

            const oldMat = child.material;
            child.material = new THREE.MeshStandardMaterial({
                color:             oldMat.color || 0xffffff,
                map:               Texture,
                emissive:          0xffffff,
                emissiveMap:       Texture,
                emissiveIntensity: 0,
                metalness:         0,
                roughness:         0.75
            });

            child.material.onBeforeCompile = (shader) => {
                shader.uniforms.fresnelPower = { value: 10.0 };
                flagShaders.push(shader);

                shader.vertexShader = 'varying vec3 vWorldPosition;\nvarying vec3 vWorldNormal;\n'
                    + shader.vertexShader.replace(
                        '#include <begin_vertex>',
                        `#include <begin_vertex>
                        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                        vWorldNormal   = normalize(mat3(modelMatrix) * normal);`
                    );

                shader.fragmentShader = 'varying vec3 vWorldPosition;\nvarying vec3 vWorldNormal;\nuniform float fresnelPower;\n'
                    + shader.fragmentShader.replace(
                        '#include <emissivemap_fragment>',
                        `#include <emissivemap_fragment>
                        vec3  viewDir = normalize(cameraPosition - vWorldPosition);
                        float fresnel = pow(1.0 - dot(normalize(vWorldNormal), viewDir), fresnelPower);
                        totalEmissiveRadiance += texture2D(emissiveMap, vUv).rgb * fresnel * 2.0;`
                    );
            };
        });

        items[1].object = flagObject;

        // ─── Anchor ───────────────────────────────────────────────────────────
        const anchor = new THREE.Object3D();
        anchor.position.set(0, 145, 0);
        flagObject.add(anchor);
        items[1].anchor = anchor;

        sceneGroup.add(flagObject);
    },
    (xhr)   => console.log((xhr.loaded / xhr.total * 100).toFixed(1) + '% flag'),
    (error) => console.error(error)
);

// ─── Rober ────────────────────────────────────────────────────────────────────

loader.load(
    `Assets/3d/rober.gltf`,
    function (gltf) {
        roberObject = gltf.scene;
        roberObject.scale.set(1.25, 1.25, 1.25);
        roberObject.rotation.set(30, 0, 180);

        gltf.scene.traverse(child => {
            if (!child.isMesh) return;

            const oldMat = child.material;
            child.material = new THREE.MeshStandardMaterial({
                color:             oldMat.color || 0xffffff,
                map:               Texture,
                emissive:          0xffffff,
                emissiveMap:       Texture,
                emissiveIntensity: 0,
                metalness:         0,
                roughness:         0.75
            });

            child.material.onBeforeCompile = (shader) => {
                shader.uniforms.fresnelPower = { value: 10.0 };
                roberShaders.push(shader);

                shader.vertexShader = 'varying vec3 vWorldPosition;\nvarying vec3 vWorldNormal;\n'
                    + shader.vertexShader.replace(
                        '#include <begin_vertex>',
                        `#include <begin_vertex>
                        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                        vWorldNormal   = normalize(mat3(modelMatrix) * normal);`
                    );

                shader.fragmentShader = 'varying vec3 vWorldPosition;\nvarying vec3 vWorldNormal;\nuniform float fresnelPower;\n'
                    + shader.fragmentShader.replace(
                        '#include <emissivemap_fragment>',
                        `#include <emissivemap_fragment>
                        vec3  viewDir = normalize(cameraPosition - vWorldPosition);
                        float fresnel = pow(1.0 - dot(normalize(vWorldNormal), viewDir), fresnelPower);
                        totalEmissiveRadiance += texture2D(emissiveMap, vUv).rgb * fresnel * 2.0;`
                    );
            };
        });

        items[2].object = roberObject;

        // ─── Anchor ───────────────────────────────────────────────────────────
        const anchor = new THREE.Object3D();
        anchor.position.set(0, 130, 0);
        roberObject.add(anchor);
        items[2].anchor = anchor;

        sceneGroup.add(roberObject);
    },
    (xhr)   => console.log((xhr.loaded / xhr.total * 100).toFixed(1) + '% rober'),
    (error) => console.error(error)
);

// ─── Capsule ─────────────────────────────────────────────────────────────────

loader.load(
    `Assets/3d/Capsule.gltf`,
    function (gltf) {
        capsuleObject = gltf.scene;
        capsuleObject.scale.set(1, 1, 1);
        capsuleObject.rotation.set(-6.455, 0, 0.25);
        capsuleObject.position.set(-30, 115.5, -20);

        gltf.scene.traverse(child => {
            if (!child.isMesh) return;

            const oldMat = child.material;
            child.material = new THREE.MeshStandardMaterial({
                color:             oldMat.color || 0xffffff,
                map:               Texture,
                emissive:          0xffffff,
                emissiveMap:       Texture,
                emissiveIntensity: 0,
                metalness:         0,
                roughness:         0.75
            });

            child.material.onBeforeCompile = (shader) => {
                shader.uniforms.fresnelPower = { value: 10.0 };
                capsuleShaders.push(shader);

                shader.vertexShader = 'varying vec3 vWorldPosition;\nvarying vec3 vWorldNormal;\n'
                    + shader.vertexShader.replace(
                        '#include <begin_vertex>',
                        `#include <begin_vertex>
                        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                        vWorldNormal   = normalize(mat3(modelMatrix) * normal);`
                    );

                shader.fragmentShader = 'varying vec3 vWorldPosition;\nvarying vec3 vWorldNormal;\nuniform float fresnelPower;\n'
                    + shader.fragmentShader.replace(
                        '#include <emissivemap_fragment>',
                        `#include <emissivemap_fragment>
                        vec3  viewDir = normalize(cameraPosition - vWorldPosition);
                        float fresnel = pow(1.0 - dot(normalize(vWorldNormal), viewDir), fresnelPower);
                        totalEmissiveRadiance += texture2D(emissiveMap, vUv).rgb * fresnel * 2.0;`
                    );
            };
        });

        items[3].object = capsuleObject;

        // ─── Anchor ───────────────────────────────────────────────────────────
        const anchor = new THREE.Object3D();
        anchor.position.set(0, 40, 0);
        capsuleObject.add(anchor);
        items[3].anchor = anchor;

        sceneGroup.add(capsuleObject);
    },
    (xhr)   => console.log((xhr.loaded / xhr.total * 100).toFixed(1) + '% capsule'),
    (error) => console.error(error)
);

// ─── Camera and lights ────────────────────────────────────────────────────────

camera.position.z = 600;
isReturning      = true;
returningPhase   = 1;
returningProgress = 0;

const topLight = new THREE.DirectionalLight(0xffffff, 0.4);
topLight.position.copy(camera.position).add(lightOffset);
topLight.castShadow = false;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);


// ─── Camera control ───────────────────────────────────────────────────────────

controls = new TrackballControls(camera, renderer.domElement);
controls.noPan                = true;
controls.noZoom               = true;
controls.rotateSpeed          = 2.0;
controls.dynamicDampingFactor = 0.05;
controls.staticMoving         = false;

const targetLightPos = new THREE.Vector3();


// ─── Travel dialog ────────────────────────────────────────────────────────────

function showTravelDialog() {
    const dialog = document.getElementById('travelDialog');
    if (!dialog.classList.contains('visible')) {
        document.getElementById('destinationName').textContent = activeItem.name;
        dialog.classList.add('visible');
    }
}

document.getElementById('acceptBtn').addEventListener('click', () => {
    document.getElementById('travelDialog').classList.remove('visible');
    const transition = document.getElementById('transition');
    transition.classList.add('active');
    setTimeout(() => { window.location.href = activeItem.destination; }, 800);
});

document.getElementById('cancelBtn').addEventListener('click', () => {
    document.getElementById('travelDialog').classList.remove('visible');

    returnMidpoint.copy(getSafeMidpoint());
    returnStartPos.copy(camera.position);
    returnStartTarget.copy(controls.target);

    isZoomed          = false;
    isReturning       = true;
    returningPhase    = 0;
    returningProgress = 0;
    autoRotate        = true;
    controls.enabled  = false;
    activeItem        = null;
});

// ─── Labels 3D ───────────────────────────────────────────────────────────────

const labelItems = [
    { id: 'label-0', item: items[0] },
    { id: 'label-1', item: items[1] },
    { id: 'label-2', item: items[2] },
    { id: 'label-3', item: items[3] },
];

function updateLabels() {
    if (isZoomed) {
        labelItems.forEach(l => document.getElementById(l.id)?.classList.remove('visible'));
        return;
    }

    // blablabla occlider objects lmao lmao
    const occluders = [moonObject, sateliteObject, flagObject, roberObject, capsuleObject].filter(Boolean);

    labelItems.forEach(l => {
        const anchor = l.item.anchor;
        const el     = document.getElementById(l.id);
        if (!anchor || !el) return;

        const worldPos = new THREE.Vector3();
        anchor.getWorldPosition(worldPos);

        // ── Occlusion check ───────────────────────────────────────────────────
        // raycasting from cam 
        const dir      = worldPos.clone().sub(camera.position).normalize();
        const distance = camera.position.distanceTo(worldPos);
        const occRay   = new THREE.Raycaster(camera.position, dir);
        const hits     = occRay.intersectObjects(occluders, true);

        const occluded = hits.some(hit => {
            if (hit.distance >= distance - 2) return false;
            if (moonObject && moonObject.getObjectById(hit.object.id)) return true;
            return false;
        });
        if (occluded) {
            el.classList.remove('visible');
            return;
        }

        // ── scrin proyecton ─────────────────────────────────────────────
        const projected = worldPos.clone();
        projected.project(camera);

        if (projected.z > 1) { el.classList.remove('visible'); return; }

        const x = ( projected.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;

        el.style.left = x + 'px';
        el.style.top  = y + 'px';
        el.classList.add('visible');
    });
}


// ─── Tick loop ────────────────────────────────────────────────────────────────

function animate() {
    requestAnimationFrame(animate);

    // Nebula always looking at cam
    scene.children.forEach(child => {
        if (child.isMesh && child.material.blending === THREE.AdditiveBlending) {
            child.quaternion.copy(camera.quaternion);
        }
    });

    // Group autorotation
    if (autoRotate) {
        sceneGroup.rotation.y = (sceneGroup.rotation.y + 0.0002) % (Math.PI * 2);
        if (sateliteObject) {
            sateliteObject.rotation.x -= 0.0003;
            sateliteObject.rotation.y -= 0.0001;
        }
    }

    // Fresnel hover effects
    sateliteShaders.forEach(shader => {
        shader.uniforms.fresnelPower.value = sateliteHovered ? 2.0 : 10.0;
    });
    flagShaders.forEach(shader => {
        shader.uniforms.fresnelPower.value = flagHovered ? 2.0 : 10.0;
    });
    roberShaders.forEach(shader => {
        shader.uniforms.fresnelPower.value = roberHovered ? 2.0 : 10.0;
    });
    capsuleShaders.forEach(shader => {
        shader.uniforms.fresnelPower.value = capsuleHovered ? 2.0 : 10.0;
    });

    // ── Zoom transition towards an item ───────────────────────────────────────
    if (isZoomed && activeItem) {

        sceneGroup.rotation.x += (defaultSceneRot.x - sceneGroup.rotation.x) * 0.02;
        sceneGroup.rotation.y += (defaultSceneRot.y - sceneGroup.rotation.y) * 0.02;
        sceneGroup.rotation.z += (defaultSceneRot.z - sceneGroup.rotation.z) * 0.02;

        sateliteObject.rotation.x += (defaultSateliteRot.x - sateliteObject.rotation.x) * 0.07;
        sateliteObject.rotation.y += (defaultSateliteRot.y - sateliteObject.rotation.y) * 0.07;
        sateliteObject.rotation.z += (defaultSateliteRot.z - sateliteObject.rotation.z) * 0.07;

        camera.position.lerp(activeItem.cameraPos,    0.025);
        controls.target.lerp(activeItem.cameraTarget, 0.025);

        if (camera.position.distanceTo(activeItem.cameraPos) < 5) {
            showTravelDialog();
        }

    // ── Return transition to default position ─────────────────────────────────
    } else if (isReturning) {

        returningProgress = Math.min(returningProgress + 0.008, 1);

        if (returningPhase === 0) {

            returningProgress = Math.min(returningProgress + 0.008, 1);
            const easeIn = returningProgress * returningProgress * returningProgress;

            camera.position.lerpVectors(returnStartPos, returnMidpoint, easeIn);

            if (returningProgress >= 1) {
                returningPhase    = 1;
                returningProgress = 0;
                returnStartPos.copy(camera.position);
                returnStartTarget.copy(controls.target);
            }

        } else {

            returningProgress = Math.min(returningProgress + 0.008, 1);
            const easeOut = 1 - Math.pow(1 - returningProgress, 2);

            camera.position.lerpVectors(returnStartPos, defaultCameraPos, easeOut);
            controls.target.lerp(defaultCameraTarget, 0.08);

            if (returningProgress >= 1) {
                camera.position.copy(defaultCameraPos);
                controls.target.copy(defaultCameraTarget);
                isReturning       = false;
                returningPhase    = 0;
                returningProgress = 0;
                controls.enabled  = true;
            }
        }
    }

    // Light follows cam smoothly
    const desiredPos = camera.position.clone().add(lightOffset);
    targetLightPos.lerp(desiredPos, 0.05);
    topLight.position.copy(targetLightPos);
    topLight.lookAt(scene.position);

    updateLabels();

    controls.update();
    renderer.render(scene, camera);
}


// ─── Resize ───────────────────────────────────────────────────────────────────

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    controls.handleResize();
});


// ─── Intro transition ──────────────────────────────────────────────────

window.addEventListener('load', () => {
    // ─── TextAnim ───────────────────────────────────────────────
    function animateText(selector, baseDelay) {
        const el = document.querySelector(selector);
        if (!el) return;
        const text = el.textContent;
        el.textContent = '';

        text.split('').forEach((char, i) => {
            const span = document.createElement('span');
            span.textContent     = char === ' ' ? '\u00A0' : char;
            span.style.opacity   = '0';
            span.style.display   = 'inline-block';
            span.style.animation = `charFadeIn 0.9s ease ${baseDelay + i * 0.1}s forwards`;
            el.appendChild(span);
        });
    }

    animateText('header h1', 0.3);
    animateText('header h3', 0.5);

    // ─── IrisAnim ───────────────────────────────────────────────

    const circle = document.getElementById('irisCircle');
    const maxR   = Math.hypot(window.innerWidth, window.innerHeight);

    circle.setAttribute('r', 0);

    const start    = performance.now();
    const duration = 1200;

    function animateIris(now) {
        const t     = Math.min((now - start) / duration, 1);
        const eased = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
        circle.setAttribute('r', eased * maxR);

        if (t < 1) {
            requestAnimationFrame(animateIris);
        } else {
            document.getElementById('introTransition').remove();
        }
    }

    requestAnimationFrame(animateIris);
});


// ─── Tick ─────────────────────────────────────────────────────────────────────
animate();