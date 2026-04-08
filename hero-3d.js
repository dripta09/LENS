/* ════════════════════════════════════════════════════
   LENS — Enhanced 3D Hero Camera
   Professional DSLR with Detailed Features
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
    container.appendChild(renderer.domElement);

    // LIGHTS - Professional studio lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Key light (main)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(8, 8, 10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);
    
    // Fill light (soften shadows)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
    fillLight.position.set(-6, 3, 5);
    scene.add(fillLight);
    
    // Rim light (gold edge highlight)
    const rimLight = new THREE.DirectionalLight(0xc8a96b, 1.2);
    rimLight.position.set(-8, 4, -6);
    scene.add(rimLight);

    // Back light
    const backLight = new THREE.PointLight(0xffffff, 0.8);
    backLight.position.set(0, -3, -8);
    scene.add(backLight);

    // Accent light from below
    const accentLight = new THREE.PointLight(0xc8a96b, 0.5);
    accentLight.position.set(0, -4, 3);
    scene.add(accentLight);

    // CAMERA MODEL GROUP
    cameraModel = new THREE.Group();
    scene.add(cameraModel);

    // ══════════════════════════════════════════════════
    // MATERIALS
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

    // Beveled edges for body
    const bevelGeom = new THREE.BoxGeometry(4.1, 2.9, 2.1);
    const bevel = new THREE.Mesh(bevelGeom, blackPlasticMat);
    bevel.scale.set(0.98, 0.98, 0.98);
    cameraModel.add(bevel);

    // ══════════════════════════════════════════════════
    // GRIP SECTION
    // ══════════════════════════════════════════════════
    
    // Main grip body
    const gripGroup = new THREE.Group();
    gripGroup.position.set(1.8, -0.2, 0.6);
    cameraModel.add(gripGroup);
    
    const gripBase = new THREE.BoxGeometry(0.8, 2.8, 1.6);
    const grip1 = new THREE.Mesh(gripBase, gripMat);
    grip1.castShadow = true;
    gripGroup.add(grip1);
    
    // Rubberized grip texture (vertical grooves)
    for (let i = 0; i < 5; i++) {
        const grooveGeom = new THREE.BoxGeometry(0.82, 0.15, 1.62);
        const groove = new THREE.Mesh(grooveGeom, blackPlasticMat);
        groove.position.y = -1.0 + (i * 0.5);
        gripGroup.add(groove);
    }
    
    // Finger rest
    const fingerRestGeom = new THREE.CylinderGeometry(0.25, 0.3, 0.8, 16);
    const fingerRest = new THREE.Mesh(fingerRestGeom, gripMat);
    fingerRest.rotation.z = Math.PI / 2;
    fingerRest.position.set(0.45, 0.8, 0.4);
    gripGroup.add(fingerRest);

    // ══════════════════════════════════════════════════
    // LENS ASSEMBLY
    // ══════════════════════════════════════════════════
    
    const lensGroup = new THREE.Group();
    lensGroup.position.set(-0.5, 0, 1.2);
    cameraModel.add(lensGroup);
    
    // Lens mount
    const mountGeom = new THREE.CylinderGeometry(1.1, 1.15, 0.4, 32);
    const mount = new THREE.Mesh(mountGeom, bodyMat);
    mount.rotation.x = Math.PI / 2;
    mount.castShadow = true;
    lensGroup.add(mount);
    
    // Main lens barrel (with zoom rings)
    const barrelSections = [
        { radius: 1.1, length: 0.6, pos: 0.5 },
        { radius: 1.05, length: 0.3, pos: 1.0 },
        { radius: 1.15, length: 0.5, pos: 1.5 },
        { radius: 1.1, length: 0.4, pos: 2.1 }
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
    
    // Focus/Zoom rings (rubberized)
    const ringPositions = [0.8, 1.8];
    ringPositions.forEach(pos => {
        const ringGeom = new THREE.CylinderGeometry(1.18, 1.18, 0.4, 32);
        const ring = new THREE.Mesh(ringGeom, gripMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.z = pos;
        lensGroup.add(ring);
        
        // Ring grooves
        for (let i = 0; i < 8; i++) {
            const grooveGeom = new THREE.BoxGeometry(0.05, 0.42, 1.22);
            const groove = new THREE.Mesh(grooveGeom, blackPlasticMat);
            const angle = (i / 8) * Math.PI * 2;
            groove.position.x = Math.cos(angle) * 1.18;
            groove.position.y = Math.sin(angle) * 1.18;
            groove.position.z = pos;
            groove.rotation.z = angle;
            lensGroup.add(groove);
        }
    });
    
    // Lens hood
    const hoodGeom = new THREE.CylinderGeometry(1.3, 1.15, 0.8, 32);
    const hood = new THREE.Mesh(hoodGeom, blackPlasticMat);
    hood.rotation.x = Math.PI / 2;
    hood.position.z = 2.8;
    lensGroup.add(hood);
    
    // Front lens glass
    const glassGeom = new THREE.CylinderGeometry(1.0, 1.0, 0.15, 32);
    const glass = new THREE.Mesh(glassGeom, glassMat);
    glass.rotation.x = Math.PI / 2;
    glass.position.z = 3.15;
    lensGroup.add(glass);
    
    // Inner lens elements (visible through glass)
    for (let i = 0; i < 3; i++) {
        const innerGlassGeom = new THREE.CylinderGeometry(0.85 - i * 0.1, 0.85 - i * 0.1, 0.05, 32);
        const innerGlass = new THREE.Mesh(innerGlassGeom, glassMat);
        innerGlass.rotation.x = Math.PI / 2;
        innerGlass.position.z = 3.0 - i * 0.2;
        lensGroup.add(innerGlass);
    }
    
    // Gold lens ring accent
    const ringGeom = new THREE.TorusGeometry(1.12, 0.04, 16, 100);
    const goldRing = new THREE.Mesh(ringGeom, goldMat);
    goldRing.position.z = 1.3;
    lensGroup.add(goldRing);
    
    // Lens brand text (embossed ring)
    const textRingGeom = new THREE.TorusGeometry(1.08, 0.02, 12, 80);
    const textRing = new THREE.Mesh(textRingGeom, goldMat);
    textRing.position.z = 2.3;
    lensGroup.add(textRing);

    // ══════════════════════════════════════════════════
    // VIEWFINDER / PENTAPRISM
    // ══════════════════════════════════════════════════
    
    const vfGroup = new THREE.Group();
    vfGroup.position.set(-0.5, 1.6, -0.2);
    cameraModel.add(vfGroup);
    
    // Pentaprism housing
    const pentaGeom = new THREE.BoxGeometry(1.8, 1.0, 1.6);
    const penta = new THREE.Mesh(pentaGeom, bodyMat);
    penta.castShadow = true;
    vfGroup.add(penta);
    
    // Viewfinder eyepiece
    const eyepieceGeom = new THREE.CylinderGeometry(0.35, 0.4, 0.3, 16);
    const eyepiece = new THREE.Mesh(eyepieceGeom, blackPlasticMat);
    eyepiece.rotation.x = Math.PI / 2;
    eyepiece.position.z = -0.95;
    vfGroup.add(eyepiece);
    
    // Eyecup (rubber)
    const eyecupGeom = new THREE.CylinderGeometry(0.42, 0.35, 0.15, 16);
    const eyecup = new THREE.Mesh(eyecupGeom, gripMat);
    eyecup.rotation.x = Math.PI / 2;
    eyecup.position.z = -1.1;
    vfGroup.add(eyecup);
    
    // Hot shoe mount
    const hotShoeGeom = new THREE.BoxGeometry(0.8, 0.15, 0.5);
    const hotShoe = new THREE.Mesh(hotShoeGeom, bodyMat);
    hotShoe.position.y = 0.6;
    vfGroup.add(hotShoe);
    
    const hotShoeSlotGeom = new THREE.BoxGeometry(0.6, 0.1, 0.4);
    const hotShoeSlot = new THREE.Mesh(hotShoeSlotGeom, blackPlasticMat);
    hotShoeSlot.position.y = 0.62;
    vfGroup.add(hotShoeSlot);

    // ══════════════════════════════════════════════════
    // TOP CONTROLS
    // ══════════════════════════════════════════════════
    
    // Shutter button (gold)
    const shutterGeom = new THREE.CylinderGeometry(0.22, 0.25, 0.2, 16);
    const shutter = new THREE.Mesh(shutterGeom, goldMat);
    shutter.position.set(1.5, 1.5, 0.7);
    shutter.castShadow = true;
    cameraModel.add(shutter);
    
    // Shutter button base
    const shutterBaseGeom = new THREE.CylinderGeometry(0.3, 0.32, 0.15, 16);
    const shutterBase = new THREE.Mesh(shutterBaseGeom, bodyMat);
    shutterBase.position.set(1.5, 1.42, 0.7);
    cameraModel.add(shutterBase);
    
    // Mode dial
    const dialGeom = new THREE.CylinderGeometry(0.45, 0.45, 0.25, 32);
    const dial = new THREE.Mesh(dialGeom, bodyMat);
    dial.position.set(-1.5, 1.5, 0.2);
    dial.castShadow = true;
    cameraModel.add(dial);
    
    // Dial markers
    for (let i = 0; i < 8; i++) {
        const markerGeom = new THREE.BoxGeometry(0.5, 0.03, 0.08);
        const marker = new THREE.Mesh(markerGeom, goldMat);
        const angle = (i / 8) * Math.PI * 2;
        marker.position.set(
            -1.5 + Math.cos(angle) * 0.45,
            1.62,
            0.2 + Math.sin(angle) * 0.45
        );
        marker.rotation.y = -angle;
        cameraModel.add(marker);
    }
    
    // Power switch
    const powerGeom = new THREE.BoxGeometry(0.3, 0.1, 0.15);
    const power = new THREE.Mesh(powerGeom, blackPlasticMat);
    power.position.set(1.2, 1.45, 0.4);
    cameraModel.add(power);

    // ══════════════════════════════════════════════════
    // RECORDING INDICATOR & DETAILS
    // ══════════════════════════════════════════════════
    
    // Recording LED (red)
    const ledGeom = new THREE.SphereGeometry(0.06, 16, 16);
    const led = new THREE.Mesh(ledGeom, redMat);
    led.position.set(1.0, 1.0, 1.05);
    cameraModel.add(led);
    
    // LED housing
    const ledHousingGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 16);
    const ledHousing = new THREE.Mesh(ledHousingGeom, bodyMat);
    ledHousing.rotation.x = Math.PI / 2;
    ledHousing.position.set(1.0, 1.0, 1.08);
    cameraModel.add(ledHousing);

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
    
    // D-pad / Navigation buttons (back)
    const dpadPositions = [
        { x: 1.3, y: -0.5, z: -1.0 },
        { x: 1.5, y: -0.3, z: -1.0 },
        { x: 1.3, y: -0.1, z: -1.0 },
        { x: 1.1, y: -0.3, z: -1.0 }
    ];
    
    dpadPositions.forEach(pos => {
        const btnGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.06, 16);
        const btn = new THREE.Mesh(btnGeom, blackPlasticMat);
        btn.rotation.x = Math.PI / 2;
        btn.position.set(pos.x, pos.y, pos.z);
        cameraModel.add(btn);
    });
    
    // Center OK button
    const okBtnGeom = new THREE.CylinderGeometry(0.1, 0.1, 0.08, 16);
    const okBtn = new THREE.Mesh(okBtnGeom, goldMat);
    okBtn.rotation.x = Math.PI / 2;
    okBtn.position.set(1.3, -0.3, -1.0);
    cameraModel.add(okBtn);
    
    // Side function buttons
    for (let i = 0; i < 4; i++) {
        const sideBtnGeom = new THREE.BoxGeometry(0.15, 0.12, 0.08);
        const sideBtn = new THREE.Mesh(sideBtnGeom, blackPlasticMat);
        sideBtn.position.set(-1.2, 0.8 - i * 0.35, -1.0);
        cameraModel.add(sideBtn);
    }

    // ══════════════════════════════════════════════════
    // PORTS & CONNECTIVITY
    // ══════════════════════════════════════════════════
    
    // Side port covers
    const portCoverGeom = new THREE.BoxGeometry(0.05, 0.5, 0.3);
    const portCover = new THREE.Mesh(portCoverGeom, gripMat);
    portCover.position.set(-2.05, -0.5, 0.3);
    cameraModel.add(portCover);

    // ══════════════════════════════════════════════════
    // BRANDING
    // ══════════════════════════════════════════════════
    
    // Brand badge (gold)
    const badgeGeom = new THREE.BoxGeometry(0.6, 0.15, 0.02);
    const badge = new THREE.Mesh(badgeGeom, goldMat);
    badge.position.set(0.3, 0.5, 1.01);
    cameraModel.add(badge);
    
    // Model number text
    const modelGeom = new THREE.BoxGeometry(0.8, 0.08, 0.01);
    const modelText = new THREE.Mesh(modelGeom, goldMat);
    modelText.position.set(0.3, 0.2, 1.01);
    cameraModel.add(modelText);

    // ══════════════════════════════════════════════════
    // POSITIONING & INITIAL ROTATION
    // ══════════════════════════════════════════════════
    
    cameraModel.rotation.y = -0.5;
    cameraModel.rotation.x = 0.15;
    cameraModel.position.y = -0.5;

    // ANIMATION
    animate();

    // ══════════════════════════════════════════════════
    // INTERACTION CONTROLS
    // ══════════════════════════════════════════════════
    
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;
    let targetRotationX = 0.15;
    let targetRotationY = -0.5;
    let autoRotate = true;
    let autoRotateSpeed = 0.001;

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
    if (container && container.clientWidth > 0 && container.clientHeight > 0) {
        init3D();
    } else {
        setTimeout(attemptInit, 100);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attemptInit);
} else {
    attemptInit();
}
