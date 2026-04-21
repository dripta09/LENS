/* ════════════════════════════════════════════════════
   LENS — 3D Hero Camera (Sketchfab DSLR Model)
   Game Ready DSLR Camera from Sketchfab
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
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // LIGHTS - Professional studio lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Key light (main)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(8, 8, 10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);

    // Fill light (soften shadows)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
    fillLight.position.set(-6, 3, 5);
    scene.add(fillLight);

    // Rim light (gold edge highlight)
    const rimLight = new THREE.DirectionalLight(0xc8a96b, 1.5);
    rimLight.position.set(-8, 4, -6);
    scene.add(rimLight);

    // Back light
    const backLight = new THREE.PointLight(0xffffff, 1.0);
    backLight.position.set(0, -3, -8);
    scene.add(backLight);

    // Accent light from below
    const accentLight = new THREE.PointLight(0xc8a96b, 0.6);
    accentLight.position.set(0, -4, 3);
    scene.add(accentLight);

    // Additional spotlight for dramatic effect
    const spotLight = new THREE.SpotLight(0xffffff, 1.5);
    spotLight.position.set(5, 10, 5);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.3;
    spotLight.castShadow = true;
    scene.add(spotLight);

    // CREATE CAMERA MODEL
    createProfessionalDSLRCamera();

    // ANIMATION
    animate();

    // INTERACTION CONTROLS
    setupInteractionControls();
}

function createProfessionalDSLRCamera() {
    // Create a highly detailed DSLR camera model
    cameraModel = new THREE.Group();
    scene.add(cameraModel);

    // ══════════════════════════════════════════════════
    // MATERIALS - Professional Quality
    // ══════════════════════════════════════════════════
    
    const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.6,
        metalness: 0.3,
        envMapIntensity: 0.5
    });

    const gripMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.8,
        metalness: 0.1
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
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        reflectivity: 1.0
    });

    const goldMat = new THREE.MeshStandardMaterial({
        color: 0xc8a96b,
        metalness: 0.9,
        roughness: 0.15,
        emissive: 0xc8a96b,
        emissiveIntensity: 0.1
    });

    const redMat = new THREE.MeshStandardMaterial({
        color: 0xff3333,
        metalness: 0.3,
        roughness: 0.2,
        emissive: 0xff3333,
        emissiveIntensity: 0.3
    });

    const blackPlasticMat = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        roughness: 0.7,
        metalness: 0.1
    });

    const screenMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a2a,
        roughness: 0.1,
        metalness: 0.8,
        emissive: 0x2a2a4a,
        emissiveIntensity: 0.15
    });

    // ══════════════════════════════════════════════════
    // MAIN CAMERA BODY
    // ══════════════════════════════════════════════════

    const bodyGeom = new THREE.BoxGeometry(4.0, 2.8, 2.0);
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.castShadow = true;
    body.receiveShadow = true;
    cameraModel.add(body);

    // Top rounded edge
    const topEdgeGeom = new THREE.CylinderGeometry(0.15, 0.15, 4.0, 16);
    const topEdge = new THREE.Mesh(topEdgeGeom, bodyMat);
    topEdge.rotation.z = Math.PI / 2;
    topEdge.position.y = 1.4;
    cameraModel.add(topEdge);

    // ══════════════════════════════════════════════════
    // PENTAPRISM (TOP HUMP)
    // ══════════════════════════════════════════════════

    const prismGroup = new THREE.Group();
    prismGroup.position.y = 1.4;
    cameraModel.add(prismGroup);

    const prismGeom = new THREE.BoxGeometry(2.5, 1.0, 1.8);
    const prism = new THREE.Mesh(prismGeom, bodyMat);
    prism.position.y = 0.5;
    prism.castShadow = true;
    prismGroup.add(prism);

    // Pentaprism front slope
    const slopeGeom = new THREE.BoxGeometry(2.5, 0.6, 0.3);
    const slope = new THREE.Mesh(slopeGeom, bodyMat);
    slope.position.set(0, 0.3, 0.95);
    slope.rotation.x = Math.PI / 6;
    prismGroup.add(slope);

    // ══════════════════════════════════════════════════
    // VIEWFINDER
    // ══════════════════════════════════════════════════

    const viewfinderGeom = new THREE.BoxGeometry(1.2, 0.6, 0.8);
    const viewfinder = new THREE.Mesh(viewfinderGeom, blackPlasticMat);
    viewfinder.position.set(0, 2.2, -0.7);
    cameraModel.add(viewfinder);

    // Eyepiece
    const eyepieceGeom = new THREE.CylinderGeometry(0.35, 0.4, 0.3, 16);
    const eyepiece = new THREE.Mesh(eyepieceGeom, gripMat);
    eyepiece.rotation.x = Math.PI / 2;
    eyepiece.position.set(0, 2.2, -1.2);
    cameraModel.add(eyepiece);

    // ══════════════════════════════════════════════════
    // GRIP SECTION
    // ══════════════════════════════════════════════════

    const gripGroup = new THREE.Group();
    gripGroup.position.set(1.8, -0.2, 0.6);
    cameraModel.add(gripGroup);

    const gripBase = new THREE.BoxGeometry(0.8, 2.8, 1.6);
    const grip1 = new THREE.Mesh(gripBase, gripMat);
    grip1.castShadow = true;
    gripGroup.add(grip1);

    // Rubberized grip texture
    for (let i = 0; i < 5; i++) {
        const grooveGeom = new THREE.BoxGeometry(0.82, 0.15, 1.62);
        const groove = new THREE.Mesh(grooveGeom, blackPlasticMat);
        groove.position.y = -1.0 + (i * 0.5);
        gripGroup.add(groove);
    }

    // Shutter button
    const shutterGeom = new THREE.CylinderGeometry(0.15, 0.18, 0.15, 16);
    const shutter = new THREE.Mesh(shutterGeom, goldMat);
    shutter.position.set(0.3, 1.5, 0.3);
    gripGroup.add(shutter);

    // ══════════════════════════════════════════════════
    // LENS ASSEMBLY - PROFESSIONAL QUALITY
    // ══════════════════════════════════════════════════

    const lensGroup = new THREE.Group();
    lensGroup.position.set(-0.5, 0, 1.2);
    cameraModel.add(lensGroup);

    // Lens mount (bayonet)
    const mountGeom = new THREE.CylinderGeometry(1.15, 1.2, 0.4, 32);
    const mount = new THREE.Mesh(mountGeom, bodyMat);
    mount.rotation.x = Math.PI / 2;
    mount.castShadow = true;
    lensGroup.add(mount);

    // Mount bayonet teeth
    for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const toothGeom = new THREE.BoxGeometry(0.15, 0.4, 0.2);
        const tooth = new THREE.Mesh(toothGeom, goldMat);
        tooth.position.set(
            Math.cos(angle) * 1.15,
            Math.sin(angle) * 1.15,
            0.2
        );
        tooth.rotation.z = angle;
        lensGroup.add(tooth);
    }

    // Main lens barrel with detailed rings
    const barrelSections = [
        { radius: 1.1, length: 0.6, pos: 0.5 },
        { radius: 1.05, length: 0.3, pos: 1.0 },
        { radius: 1.15, length: 0.5, pos: 1.5 },
        { radius: 1.1, length: 0.4, pos: 2.1 },
        { radius: 1.2, length: 0.5, pos: 2.7 }
    ];

    barrelSections.forEach(section => {
        const sectionGeom = new THREE.CylinderGeometry(
            section.radius, section.radius, section.length, 32
        );
        const sectionMesh = new THREE.Mesh(sectionGeom, lensMat);
        sectionMesh.rotation.x = Math.PI / 2;
        sectionMesh.position.z = section.pos;
        sectionMesh.castShadow = true;
        lensGroup.add(sectionMesh);
    });

    // Focus/Zoom rings with texture
    const ringPositions = [0.8, 1.8];
    ringPositions.forEach(pos => {
        const ringGeom = new THREE.CylinderGeometry(1.18, 1.18, 0.4, 32);
        const ring = new THREE.Mesh(ringGeom, gripMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.z = pos;
        lensGroup.add(ring);

        // Ring grooves for grip
        for (let i = 0; i < 12; i++) {
            const grooveGeom = new THREE.BoxGeometry(0.05, 0.42, 1.22);
            const groove = new THREE.Mesh(grooveGeom, blackPlasticMat);
            const angle = (i / 12) * Math.PI * 2;
            groove.position.x = Math.cos(angle) * 1.18;
            groove.position.y = Math.sin(angle) * 1.18;
            groove.position.z = pos;
            groove.rotation.z = angle;
            lensGroup.add(groove);
        }
    });

    // Lens hood
    const hoodGeom = new THREE.CylinderGeometry(1.35, 1.2, 0.9, 32);
    const hood = new THREE.Mesh(hoodGeom, blackPlasticMat);
    hood.rotation.x = Math.PI / 2;
    hood.position.z = 3.0;
    lensGroup.add(hood);

    // Front lens glass (multi-coated)
    const glassGeom = new THREE.CylinderGeometry(1.05, 1.05, 0.15, 32);
    const glass = new THREE.Mesh(glassGeom, glassMat);
    glass.rotation.x = Math.PI / 2;
    glass.position.z = 3.4;
    lensGroup.add(glass);

    // Lens coating reflection (blue/purple tint)
    const coatingMat = new THREE.MeshPhysicalMaterial({
        color: 0x4444ff,
        roughness: 0.01,
        metalness: 0.95,
        transparent: true,
        opacity: 0.3,
        clearcoat: 1.0
    });
    const coating = new THREE.Mesh(glassGeom, coatingMat);
    coating.rotation.x = Math.PI / 2;
    coating.position.z = 3.41;
    coating.scale.set(0.98, 0.98, 0.5);
    lensGroup.add(coating);

    // Inner lens elements
    for (let i = 0; i < 4; i++) {
        const elementGeom = new THREE.CylinderGeometry(0.85 - i * 0.1, 0.85 - i * 0.1, 0.05, 32);
        const element = new THREE.Mesh(elementGeom, glassMat);
        element.rotation.x = Math.PI / 2;
        element.position.z = 2.8 - i * 0.3;
        lensGroup.add(element);
    }

    // ══════════════════════════════════════════════════
    // MODE DIAL
    // ══════════════════════════════════════════════════

    const dialGeom = new THREE.CylinderGeometry(0.6, 0.55, 0.25, 32);
    const dial = new THREE.Mesh(dialGeom, blackPlasticMat);
    dial.position.set(-1.3, 1.6, 0.5);
    cameraModel.add(dial);

    // Dial markings
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const markGeom = new THREE.BoxGeometry(0.05, 0.08, 0.26);
        const mark = new THREE.Mesh(markGeom, goldMat);
        mark.position.set(
            -1.3 + Math.cos(angle) * 0.55,
            1.6 + Math.sin(angle) * 0.55,
            0.5
        );
        mark.rotation.y = -angle;
        cameraModel.add(mark);
    }

    // ══════════════════════════════════════════════════
    // LCD SCREEN (BACK)
    // ══════════════════════════════════════════════════

    const screenGeom = new THREE.BoxGeometry(2.2, 1.5, 0.05);
    const screen = new THREE.Mesh(screenGeom, screenMat);
    screen.position.set(0, 0, -1.02);
    cameraModel.add(screen);

    // Screen bezel
    const bezelGeom = new THREE.BoxGeometry(2.3, 1.6, 0.03);
    const bezel = new THREE.Mesh(bezelGeom, bodyMat);
    bezel.position.set(0, 0, -1.04);
    cameraModel.add(bezel);

    // ══════════════════════════════════════════════════
    // BUTTONS & CONTROLS
    // ══════════════════════════════════════════════════

    // D-pad buttons
    const dpadPositions = [
        { x: 1.3, y: -0.5 }, { x: 1.5, y: -0.3 },
        { x: 1.3, y: -0.1 }, { x: 1.1, y: -0.3 }
    ];

    dpadPositions.forEach(pos => {
        const btnGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.06, 16);
        const btn = new THREE.Mesh(btnGeom, blackPlasticMat);
        btn.rotation.x = Math.PI / 2;
        btn.position.set(pos.x, pos.y, -1.0);
        cameraModel.add(btn);
    });

    // Center OK button
    const okBtnGeom = new THREE.CylinderGeometry(0.1, 0.1, 0.08, 16);
    const okBtn = new THREE.Mesh(okBtnGeom, goldMat);
    okBtn.rotation.x = Math.PI / 2;
    okBtn.position.set(1.3, -0.3, -1.0);
    cameraModel.add(okBtn);

    // Recording indicator LED
    const ledGeom = new THREE.SphereGeometry(0.06, 16, 16);
    const led = new THREE.Mesh(ledGeom, redMat);
    led.position.set(1.0, 1.0, 1.05);
    cameraModel.add(led);

    // ══════════════════════════════════════════════════
    // BRANDING
    // ══════════════════════════════════════════════════

    // Brand badge (LENS logo area)
    const badgeGeom = new THREE.BoxGeometry(0.8, 0.2, 0.02);
    const badge = new THREE.Mesh(badgeGeom, goldMat);
    badge.position.set(0.3, 0.5, 1.01);
    cameraModel.add(badge);

    // Model designation
    const modelGeom = new THREE.BoxGeometry(1.0, 0.1, 0.01);
    const modelText = new THREE.Mesh(modelGeom, goldMat);
    modelText.position.set(0.3, 0.2, 1.01);
    cameraModel.add(modelText);

    // ══════════════════════════════════════════════════
    // HOT SHOE (flash mount)
    // ══════════════════════════════════════════════════

    const hotShoeGeom = new THREE.BoxGeometry(0.8, 0.15, 0.4);
    const hotShoe = new THREE.Mesh(hotShoeGeom, bodyMat);
    hotShoe.position.set(0, 2.5, 0.2);
    cameraModel.add(hotShoe);

    // Hot shoe contacts
    const contactGeom = new THREE.BoxGeometry(0.6, 0.02, 0.15);
    const contact = new THREE.Mesh(contactGeom, goldMat);
    contact.position.set(0, 2.58, 0.2);
    cameraModel.add(contact);

    // ══════════════════════════════════════════════════
    // FINAL POSITIONING
    // ══════════════════════════════════════════════════

    cameraModel.rotation.y = -0.5;
    cameraModel.rotation.x = 0.15;
    cameraModel.position.y = -0.5;
}

// Animation variables
let targetRotationX = 0.15;
let targetRotationY = -0.5;
let autoRotate = true;
let autoRotateSpeed = 0.001;

function animate() {
    requestAnimationFrame(animate);

    if (cameraModel) {
        const time = Date.now() * 0.001;

        // Subtle floating animation
        cameraModel.position.y = -0.5 + Math.sin(time * 0.4) * 0.12;

        // Smooth rotation interpolation
        cameraModel.rotation.y += (targetRotationY - cameraModel.rotation.y) * 0.08;
        cameraModel.rotation.x += (targetRotationX - cameraModel.rotation.x) * 0.08;

        // Auto-rotate when not interacting
        if (autoRotate) {
            targetRotationY += autoRotateSpeed;
        }

        // Subtle tilt animation
        const tiltOffset = Math.sin(time * 0.3) * 0.015;
        cameraModel.rotation.z = tiltOffset;
    }

    renderer.render(scene, camera);
}

function setupInteractionControls() {
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;

    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        autoRotate = false;
        previousMouseX = e.clientX;
        previousMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        // Resume auto-rotate after 3 seconds of inactivity
        setTimeout(() => { autoRotate = true; }, 3000);
    });

    window.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaX = e.clientX - previousMouseX;
            const deltaY = e.clientY - previousMouseY;
            targetRotationY += deltaX * 0.008;
            targetRotationX += deltaY * 0.008;
            // Limit vertical rotation
            targetRotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotationX));
            previousMouseX = e.clientX;
            previousMouseY = e.clientY;
        }
    });

    // Touch support
    container.addEventListener('touchstart', (e) => {
        isDragging = true;
        autoRotate = false;
        previousMouseX = e.touches[0].clientX;
        previousMouseY = e.touches[0].clientY;
    });

    window.addEventListener('touchend', () => {
        isDragging = false;
        setTimeout(() => { autoRotate = true; }, 3000);
    });

    window.addEventListener('touchmove', (e) => {
        if (isDragging) {
            const deltaX = e.touches[0].clientX - previousMouseX;
            const deltaY = e.touches[0].clientY - previousMouseY;
            targetRotationY += deltaX * 0.012;
            targetRotationX += deltaY * 0.012;
            targetRotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotationX));
            previousMouseX = e.touches[0].clientX;
            previousMouseY = e.touches[0].clientY;
        }
    });
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
function attemptInit() {
    container = document.getElementById('hero-3d-container');
    if (!container) {
        setTimeout(attemptInit, 100);
        return;
    }

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 500;

    if (width > 0 && height > 0) {
        init3D();
    } else {
        container.style.width = '400px';
        container.style.height = '500px';
        setTimeout(init3D, 100);
    }
}

function waitForThree() {
    if (typeof THREE === 'undefined') {
        setTimeout(waitForThree, 50);
        return;
    }
    attemptInit();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForThree);
} else {
    waitForThree();
}
