/* ════════════════════════════════════════════════════
   LENS — Enhanced 3D Hero Camera
   Professional DSLR with Detailed Features
   ════════════════════════════════════════════════════ */

let scene, camera, renderer, cameraModel;
let container;

// Global Animation/Interaction Variables
let isDragging = false;
let previousMouseX = 0;
let previousMouseY = 0;
let targetRotationX = 0.15;
let targetRotationY = -0.5;
let autoRotate = true;
let autoRotateSpeed = 0.001;

function init3D() {
    container = document.getElementById('hero-3d-container');
    if (!container) return;

    console.log("3D Scene Initializing...");

    // SCENE
    scene = new THREE.Scene();

    // CAMERA
    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(35, aspect, 0.1, 1000);
    camera.position.set(0, 2, 10);
    camera.lookAt(0, 0, 0);

    // RENDERER
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(8, 8, 10);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xc8a96b, 1.2);
    rimLight.position.set(-8, 4, -6);
    scene.add(rimLight);

    // CAMERA MODEL GROUP
    cameraModel = new THREE.Group();
    scene.add(cameraModel);

    // MATERIALS
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.6, metalness: 0.3 });
    const gripMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 });
    const lensMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.6 });
    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x0a0a0a, roughness: 0.02, metalness: 0.9, transparent: true, opacity: 0.85 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xc8a96b, metalness: 0.9, roughness: 0.15 });

    // MAIN CAMERA BODY
    const bodyGeom = new THREE.BoxGeometry(4.0, 2.8, 2.0);
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    cameraModel.add(body);

    // LENS ASSEMBLY
    const lensGroup = new THREE.Group();
    lensGroup.position.set(-0.5, 0, 1.2);
    cameraModel.add(lensGroup);

    const barrelGeom = new THREE.CylinderGeometry(1.1, 1.1, 2.0, 32);
    const barrel = new THREE.Mesh(barrelGeom, lensMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.z = 1.0;
    lensGroup.add(barrel);

    const glassGeom = new THREE.CylinderGeometry(1.0, 1.0, 0.1, 32);
    const glass = new THREE.Mesh(glassGeom, glassMat);
    glass.rotation.x = Math.PI / 2;
    glass.position.z = 2.05;
    lensGroup.add(glass);

    // Gold accent ring
    const ringGeom = new THREE.TorusGeometry(1.12, 0.04, 16, 100);
    const goldRing = new THREE.Mesh(ringGeom, goldMat);
    goldRing.position.z = 1.3;
    lensGroup.add(goldRing);

    // GRIP
    const gripGeom = new THREE.BoxGeometry(0.8, 2.8, 1.6);
    const grip = new THREE.Mesh(gripGeom, gripMat);
    grip.position.set(1.8, -0.2, 0.6);
    cameraModel.add(grip);

    // SHUTTER BUTTON
    const shutterGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.2, 16);
    const shutter = new THREE.Mesh(shutterGeom, goldMat);
    shutter.position.set(1.5, 1.5, 0.7);
    camera
