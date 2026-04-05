/* ════════════════════════════════════════════════════
   LENS — 3D Hero Camera
   Three.js Stylized DSLR Implementation
   ════════════════════════════════════════════════════ */

let scene, camera, renderer, cameraModel;
let container = document.getElementById('hero-3d-container');

function init3D() {
    container = document.getElementById('hero-3d-container');
    if (!container) return;

    // SCENE
    scene = new THREE.Scene();

    // CAMERA
    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 1000);
    camera.position.z = 8;

    // RENDERER
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(5, 5, 8);
    scene.add(mainLight);
    
    const rimLight = new THREE.DirectionalLight(0xc8a96b, 0.8); // Gold rim light
    rimLight.position.set(-5, 2, -5);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xffffff, 0.5);
    fillLight.position.set(0, -2, 5);
    scene.add(fillLight);

    // CAMERA MODEL GROUP
    cameraModel = new THREE.Group();
    scene.add(cameraModel);

    // Materials
    const bodyMat = new THREE.MeshPhysicalMaterial({
        color: 0x121212,
        roughness: 0.6,
        metalness: 0.3,
        reflectivity: 0.5
    });
    const lensMat = new THREE.MeshPhysicalMaterial({
        color: 0x0a0a0a,
        roughness: 0.2,
        metalness: 0.7
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0x1a1a1a,
        roughness: 0.05,
        metalness: 1,
        transparent: true,
        opacity: 0.6,
        transmission: 0.9,
        thickness: 0.5
    });
    const goldMat = new THREE.MeshStandardMaterial({
        color: 0xc8a96b,
        metalness: 0.9,
        roughness: 0.1
    });
    const redMat = new THREE.MeshStandardMaterial({
        color: 0xff3333,
        metalness: 0.5,
        roughness: 0.2
    });

    // Main Body
    const bodyGeom = new THREE.BoxGeometry(3.6, 2.4, 1.6);
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    cameraModel.add(body);

    // Grip (Curved look using a cylinder + box)
    const gripGeom = new THREE.CylinderGeometry(0.5, 0.5, 2.4, 16);
    const grip = new THREE.Mesh(gripGeom, bodyMat);
    grip.position.set(1.6, 0, 0.5);
    cameraModel.add(grip);

    // Lens Barrel (Main)
    const lensBarrelGeom = new THREE.CylinderGeometry(1.0, 1.05, 1.5, 32);
    const lensBarrel = new THREE.Mesh(lensBarrelGeom, lensMat);
    lensBarrel.rotation.x = Math.PI / 2;
    lensBarrel.position.set(-0.4, 0, 1.2);
    cameraModel.add(lensBarrel);

    // Lens Front (Glass)
    const glassGeom = new THREE.CylinderGeometry(0.85, 0.85, 0.1, 32);
    const glass = new THREE.Mesh(glassGeom, glassMat);
    glass.rotation.x = Math.PI / 2;
    glass.position.set(-0.4, 0, 1.96);
    cameraModel.add(glass);

    // Gold Accent Ring on Lens
    const ringGeom = new THREE.TorusGeometry(1.01, 0.03, 16, 100);
    const ring = new THREE.Mesh(ringGeom, goldMat);
    ring.position.set(-0.4, 0, 1.5);
    cameraModel.add(ring);

    // Viewfinder / Pentaprism
    const vfGeom = new THREE.CylinderGeometry(0.8, 1.1, 0.6, 4); // Pyramid-ish
    const vf = new THREE.Mesh(vfGeom, bodyMat);
    vf.rotation.y = Math.PI / 4;
    vf.position.set(-0.4, 1.35, 0);
    cameraModel.add(vf);

    // Shutter Button
    const buttonGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.15, 16);
    const shutter = new THREE.Mesh(buttonGeom, goldMat);
    shutter.position.set(1.5, 1.2, 0.6);
    cameraModel.add(shutter);

    // Recording Dot (Red)
    const dotGeom = new THREE.SphereGeometry(0.05, 16, 16);
    const dot = new THREE.Mesh(dotGeom, redMat);
    dot.position.set(1.0, 0.8, 0.85);
    cameraModel.add(dot);

    // Top Dial
    const dialGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.2, 24);
    const dial = new THREE.Mesh(dialGeom, bodyMat);
    dial.position.set(-1.2, 1.2, 0);
    cameraModel.add(dial);

    // Initial tilt
    cameraModel.rotation.y = -0.4;
    cameraModel.rotation.x = 0.2;

    // ANIMATION
    animate();

    // INTERACTION
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;
    let targetRotationX = 0.2;
    let targetRotationY = -0.4;

    container.addEventListener('mousedown', (e) => { 
        isDragging = true; 
        previousMouseX = e.clientX;
        previousMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => { isDragging = false; });
    
    window.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaX = e.clientX - previousMouseX;
            const deltaY = e.clientY - previousMouseY;
            targetRotationY += deltaX * 0.005;
            targetRotationX += deltaY * 0.005;
            previousMouseX = e.clientX;
            previousMouseY = e.clientY;
        }
    });

    // Touch support
    container.addEventListener('touchstart', (e) => { 
        isDragging = true; 
        previousMouseX = e.touches[0].clientX; 
        previousMouseY = e.touches[0].clientY; 
    });
    window.addEventListener('touchend', () => { isDragging = false; });
    window.addEventListener('touchmove', (e) => {
        if (isDragging) {
            const deltaX = e.touches[0].clientX - previousMouseX;
            const deltaY = e.touches[0].clientY - previousMouseY;
            targetRotationY += deltaX * 0.01;
            targetRotationX += deltaY * 0.01;
            previousMouseX = e.touches[0].clientX;
            previousMouseY = e.touches[0].clientY;
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    
    if (cameraModel) {
        // Subtle auto-float and smooth rotation
        const time = Date.now() * 0.001;
        
        cameraModel.position.y = Math.sin(time * 0.5) * 0.15;
        
        // Smoothly interpolate rotation
        cameraModel.rotation.y += (targetRotationY - cameraModel.rotation.y) * 0.05;
        cameraModel.rotation.x += (targetRotationX - cameraModel.rotation.x) * 0.05;
        
        // Constant slow spin when not dragging
        targetRotationY += 0.002;
    }
    
    renderer.render(scene, camera);
}

// Handle Resize
window.addEventListener('resize', () => {
    if (!container || !camera || !renderer) {
        container = document.getElementById('hero-3d-container');
        if (!container) return;
    }
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

// Init on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init3D);
} else {
    init3D();
}
