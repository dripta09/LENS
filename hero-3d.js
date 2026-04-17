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
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(8, 8, 10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xc8a96b, 1.2);
    rimLight.position.set(-8, 4, -6);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(0, -5, 5);
    scene.add(fillLight);

    // CAMERA MODEL GROUP
    cameraModel = new THREE.Group();
    scene.add(cameraModel);

    // MATERIALS
    const bodyMat = new THREE.MeshStandardMaterial({ 
        color: 0x2a2a2a, 
        roughness: 0.6, 
        metalness: 0.3 
    });
    
    const gripMat = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a1a, 
        roughness: 0.8 
    });
    
    const lensMat = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a1a, 
        roughness: 0.3, 
        metalness: 0.6 
    });
    
    const glassMat = new THREE.MeshPhysicalMaterial({ 
        color: 0x0a0a0a, 
        roughness: 0.02, 
        metalness: 0.9, 
        transparent: true, 
        opacity: 0.85,
        transmission: 0.1
    });
    
    const goldMat = new THREE.MeshStandardMaterial({ 
        color: 0xc8a96b, 
        metalness: 0.9, 
        roughness: 0.15 
    });

    const screenMat = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        roughness: 0.1,
        metalness: 0.2
    });

    // MAIN CAMERA BODY
    const bodyGeom = new THREE.BoxGeometry(4.0, 2.8, 2.0);
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.castShadow = true;
    body.receiveShadow = true;
    cameraModel.add(body);

    // LENS ASSEMBLY
    const lensGroup = new THREE.Group();
    lensGroup.position.set(-0.5, 0, 1.2);
    cameraModel.add(lensGroup);

    // Lens barrel
    const barrelGeom = new THREE.CylinderGeometry(1.1, 1.1, 2.0, 32);
    const barrel = new THREE.Mesh(barrelGeom, lensMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.z = 1.0;
    barrel.castShadow = true;
    barrel.receiveShadow = true;
    lensGroup.add(barrel);

    // Front glass element
    const glassGeom = new THREE.CylinderGeometry(1.0, 1.0, 0.1, 32);
    const glass = new THREE.Mesh(glassGeom, glassMat);
    glass.rotation.x = Math.PI / 2;
    glass.position.z = 2.05;
    lensGroup.add(glass);

    // Gold accent ring (FIXED)
    const ringGeom = new THREE.TorusGeometry(1.12, 0.04, 16, 100);
    const goldRing = new THREE.Mesh(ringGeom, goldMat);
    goldRing.rotation.x = Math.PI / 2; // ← CRITICAL FIX
    goldRing.position.z = 1.3;
    goldRing.castShadow = true;
    lensGroup.add(goldRing);

    // Inner lens detail ring
    const innerRingGeom = new THREE.TorusGeometry(0.85, 0.03, 12, 80);
    const innerRing = new THREE.Mesh(innerRingGeom, goldMat);
    innerRing.rotation.x = Math.PI / 2;
    innerRing.position.z = 0.3;
    lensGroup.add(innerRing);

    // GRIP
    const gripGeom = new THREE.BoxGeometry(0.8, 2.8, 1.6);
    const grip = new THREE.Mesh(gripGeom, gripMat);
    grip.position.set(1.8, -0.2, 0.6);
    grip.castShadow = true;
    grip.receiveShadow = true;
    cameraModel.add(grip);

    // VIEWFINDER
    const viewfinderGeom = new THREE.BoxGeometry(1.2, 0.8, 1.0);
    const viewfinder = new THREE.Mesh(viewfinderGeom, bodyMat);
    viewfinder.position.set(0.5, 1.6, -0.3);
    viewfinder.castShadow = true;
    cameraModel.add(viewfinder);

    // SHUTTER BUTTON
    const shutterGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.2, 16);
    const shutter = new THREE.Mesh(shutterGeom, goldMat);
    shutter.position.set(1.5, 1.5, 0.7);
    shutter.castShadow = true;
    cameraModel.add(shutter);

    // MODE DIAL
    const dialGeom = new THREE.CylinderGeometry(0.4, 0.4, 0.15, 32);
    const dial = new THREE.Mesh(dialGeom, bodyMat);
    dial.position.set(-1.2, 1.5, 0);
    dial.castShadow = true;
    cameraModel.add(dial);

    // LCD SCREEN (back)
    const screenGeom = new THREE.BoxGeometry(2.5, 1.8, 0.1);
    const screen = new THREE.Mesh(screenGeom, screenMat);
    screen.position.set(0, 0, -1.05);
    cameraModel.add(screen);

    // LENS CAP (optional detail)
    const capGeom = new THREE.CylinderGeometry(1.15, 1.15, 0.2, 32);
    const cap = new THREE.Mesh(capGeom, bodyMat);
    cap.rotation.x = Math.PI / 2;
    cap.position.set(-0.5, -2.5, 1.2);
    cap.castShadow = true;
    cameraModel.add(cap);

    // Initial Transformations
    cameraModel.rotation.y = targetRotationY;
    cameraModel.rotation.x = targetRotationX;
    cameraModel.position.y = -0.5;

    // MOUSE INTERACTION EVENTS
    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('mousemove', onPointerMove);

    // TOUCH INTERACTION EVENTS (Mobile Support)
    container.addEventListener('touchstart', onPointerDown);
    window.addEventListener('touchend', onPointerUp);
    window.addEventListener('touchmove', onPointerMove);

    animate();
}

// Unified pointer down handler
function onPointerDown(e) {
    isDragging = true;
    autoRotate = false;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    previousMouseX = clientX;
    previousMouseY = clientY;
}

// Unified pointer up handler
function onPointerUp() {
    isDragging = false;
    setTimeout(() => { autoRotate = true; }, 3000);
}

// Unified pointer move handler
function onPointerMove(e) {
    if (!isDragging) return;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - previousMouseX;
    const deltaY = clientY - previousMouseY;
    
    targetRotationY += deltaX * 0.008;
    targetRotationX += deltaY * 0.008;
    
    // Clamp vertical rotation
    targetRotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotationX));
    
    previousMouseX = clientX;
    previousMouseY = clientY;
    
    // Prevent page scroll on touch devices
    if (e.touches) {
        e.preventDefault();
    }
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    if (cameraModel && renderer && scene && camera) {
        const time = Date.now() * 0.001;

        // Subtle floating animation
        cameraModel.position.y = -0.5 + Math.sin(time * 0.4) * 0.12;

        // Smooth rotation with easing
        cameraModel.rotation.y += (targetRotationY - cameraModel.rotation.y) * 0.08;
        cameraModel.rotation.x += (targetRotationX - cameraModel.rotation.x) * 0.08;

        // Auto-rotate when not dragging
        if (autoRotate) {
            targetRotationY += autoRotateSpeed;
        }

        renderer.render(scene, camera);
    }
}

// Handle Window Resize
function onWindowResize() {
    if (!container || !camera || !renderer) return;
    
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

window.addEventListener('resize', onWindowResize);

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (renderer) {
        renderer.dispose();
    }
    if (scene) {
        scene.clear();
    }
});

// INITIALIZATION LOGIC
function attemptInit() {
    container = document.getElementById('hero-3d-container');
    if (!container) {
        setTimeout(attemptInit, 100);
        return;
    }
    if (container.clientWidth > 0 && container.clientHeight > 0) {
        init3D();
    } else {
        setTimeout(attemptInit, 100);
    }
}

function waitForThree() {
    if (typeof THREE === 'undefined') {
        setTimeout(waitForThree, 50);
        return;
    }
    attemptInit();
}

// Start the initialization sequence
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForThree);
} else {
    waitForThree();
}
