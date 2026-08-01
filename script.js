"use strict";


/*====================================================
=                 ELEMENTOS HTML                     =
====================================================*/

const sceneContainer =
    document.getElementById(
        "sceneContainer"
    );

const startScreen =
    document.getElementById(
        "startScreen"
    );

const startButton =
    document.getElementById(
        "startButton"
    );

const loadStatus =
    document.getElementById(
        "loadStatus"
    );

const zoomOutButton =
    document.getElementById(
        "zoomOutButton"
    );

const resetButton =
    document.getElementById(
        "resetButton"
    );

const zoomInButton =
    document.getElementById(
        "zoomInButton"
    );

const musicButton =
    document.getElementById(
        "musicButton"
    );

const backgroundMusic =
    document.getElementById(
        "backgroundMusic"
    );

const letterCard =
    document.getElementById(
        "letterCard"
    );

const continueButton =
    document.getElementById(
        "continueButton"
    );

const phraseLayer =
    document.getElementById(
        "phraseLayer"
    );


/*====================================================
=                 CONFIGURACIÓN                      =
====================================================*/

const LETTER_SECOND = 15;

const PHRASE_VISIBLE_TIME =
    2300;

const PHRASE_FADE_TIME =
    650;

const PHRASE_GAP_TIME =
    350;


/*====================================================
=                 FRASES BREVES                      =
====================================================*/

const shortPhrases = [
    "Te amo",
    "Te quiero mucho",
    "Eres importante para mí",
    "Mi persona favorita",
    "Mi niña hermosa",
    "Siempre tú",
    "Contigo todo es bonito",
    "Eres mi paz",
    "Me haces muy feliz",
    "Adoro tu sonrisa",
    "Eres mi lugar seguro",
    "Gracias por existir",
    "Mi luna favorita",
    "Te elegiría mil veces"
];


/*====================================================
=          POSICIONES DE LAS FRASES                  =
====================================================*/

const phraseAnchors = [
    {
        x: -3.8,
        y: 2.45,
        z: 0.45
    },

    {
        x: 3.8,
        y: 2.35,
        z: 0.30
    },

    {
        x: -4.15,
        y: 0.95,
        z: 0.25
    },

    {
        x: 4.10,
        y: 0.75,
        z: 0.35
    },

    {
        x: -4.05,
        y: -0.85,
        z: 0.40
    },

    {
        x: 4.00,
        y: -0.95,
        z: 0.25
    },

    {
        x: -3.15,
        y: -2.25,
        z: 0.35
    },

    {
        x: 3.10,
        y: -2.20,
        z: 0.20
    },

    {
        x: -1.45,
        y: 3.15,
        z: 0.25
    },

    {
        x: 1.55,
        y: 3.10,
        z: 0.30
    },

    {
        x: -1.55,
        y: -3.15,
        z: 0.30
    },

    {
        x: 1.55,
        y: -3.10,
        z: 0.20
    },

    {
        x: -4.35,
        y: 1.80,
        z: 0.35
    },

    {
        x: 4.35,
        y: 1.65,
        z: 0.25
    }
];


/*====================================================
=               VARIABLES THREE.JS                   =
====================================================*/

let scene;
let camera;
let renderer;
let clock;

let moon;
let moonGroup;
let halo;

let starParticleTexture;


/*
 * Aquí se guardan todas las capas
 * del cielo estrellado.
 */
const starLayers = [];


/*====================================================
=                   ESTADO GENERAL                   =
====================================================*/

let sceneReady = false;
let experienceStarted = false;
let musicPlaying = false;

let letterTriggered = false;
let phraseSequenceStarted = false;

let cameraTargetZ = 13;
let defaultCameraZ = 10.6;
let minimumCameraZ = 5.4;
let maximumCameraZ = 14;

let phraseIndex = 0;


/*====================================================
=                 EFECTOS ACTIVOS                    =
====================================================*/

const activeBursts = [];
const phraseTimers = [];

let activePhraseLabel = null;


/*====================================================
=                      EVENTOS                       =
====================================================*/

startButton.addEventListener(
    "click",
    startExperience
);

zoomOutButton.addEventListener(
    "click",
    () => changeZoom(0.85)
);

resetButton.addEventListener(
    "click",
    resetZoom
);

zoomInButton.addEventListener(
    "click",
    () => changeZoom(-0.85)
);

musicButton.addEventListener(
    "click",
    toggleMusic
);

continueButton.addEventListener(
    "click",
    continueAfterLetter
);

backgroundMusic.addEventListener(
    "timeupdate",
    checkLetterMoment
);

backgroundMusic.addEventListener(
    "seeked",
    checkLetterMoment
);


/*
 * Evita el zoom propio de Safari
 * sobre la página.
 */
document.addEventListener(
    "gesturestart",

    (event) => {
        event.preventDefault();
    },

    {
        passive: false
    }
);

document.addEventListener(
    "gesturechange",

    (event) => {
        event.preventDefault();
    },

    {
        passive: false
    }
);


/*====================================================
=               COMPROBAR THREE.JS                   =
====================================================*/

if (
    typeof THREE ===
    "undefined"
) {

    loadStatus.textContent =
        "No se pudo cargar Three.js. Revisa Internet y usa Live Server.";

    startButton.textContent =
        "Reintentar";

    startButton.addEventListener(
        "click",

        () => {
            window.location.reload();
        },

        {
            once: true
        }
    );

} else {

    try {

        initialize3D();

    } catch (error) {

        console.error(error);

        loadStatus.textContent =
            "No se pudo iniciar la escena 3D. Revisa la consola con F12.";
    }
}


/*====================================================
=                  INICIAR THREE.JS                  =
====================================================*/

function initialize3D() {

    configureResponsiveValues();


    scene =
        new THREE.Scene();


    scene.background =
        new THREE.Color(
            0x000207
        );


    camera =
        new THREE.PerspectiveCamera(
            34,

            window.innerWidth /
                window.innerHeight,

            0.1,

            250
        );


    camera.position.set(
        0,
        0.02,
        13
    );


    renderer =
        new THREE.WebGLRenderer({
            antialias: true,

            powerPreference:
                "high-performance"
        });


    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );


    renderer.setPixelRatio(
        getRecommendedPixelRatio()
    );


    renderer.outputColorSpace =
        THREE.SRGBColorSpace;


    renderer.toneMapping =
        THREE.ACESFilmicToneMapping;


    renderer.toneMappingExposure =
        0.88;


    sceneContainer.appendChild(
        renderer.domElement
    );


    clock =
        new THREE.Clock();


    starParticleTexture =
        createStarParticleTexture();


    createLights();
    createMoon();
    createStars();
    configureZoomInteraction();
    loadMoonTextures();


    window.addEventListener(
        "resize",
        resizeScene
    );


    renderer.setAnimationLoop(
        animate
    );


    sceneReady = true;


    loadStatus.textContent =
        "Escena preparada. Cargando texturas...";
}


/*====================================================
=            CONFIGURACIÓN RESPONSIVE                =
====================================================*/

function isMobileDevice() {

    return (
        window.innerWidth <= 768
    );
}


function configureResponsiveValues() {

    if (
        isMobileDevice()
    ) {

        defaultCameraZ = 11.25;
        minimumCameraZ = 6.15;
        maximumCameraZ = 15;

    } else {

        defaultCameraZ = 10.6;
        minimumCameraZ = 5.4;
        maximumCameraZ = 14;
    }
}


function getRecommendedPixelRatio() {

    const limit =
        isMobileDevice()
            ? 1.5
            : 2;


    return Math.min(
        window.devicePixelRatio || 1,
        limit
    );
}


/*====================================================
=                  ILUMINACIÓN                       =
====================================================*/

function createLights() {

    const ambientLight =
        new THREE.AmbientLight(
            0x101522,
            0.075
        );


    scene.add(
        ambientLight
    );


    const sunlight =
        new THREE.DirectionalLight(
            0xfff7e9,
            4.75
        );


    sunlight.position.set(
        -4.8,
        2.9,
        6.4
    );


    scene.add(
        sunlight
    );


    const rimLight =
        new THREE.DirectionalLight(
            0x4d6fa8,
            0.08
        );


    rimLight.position.set(
        5,
        -2,
        -5
    );


    scene.add(
        rimLight
    );
}


/*====================================================
=                    LUNA 3D                         =
====================================================*/

function createMoon() {

    const mobile =
        isMobileDevice();


    const geometry =
        new THREE.SphereGeometry(
            2.08,

            mobile
                ? 144
                : 320,

            mobile
                ? 108
                : 240
        );


    const material =
        new THREE.MeshStandardMaterial({
            color: 0xffffff,

            roughness: 1,

            metalness: 0,

            displacementScale:
                0.032,

            displacementBias:
                -0.015,

            normalScale:
                new THREE.Vector2(
                    0.55,
                    0.55
                ),

            bumpScale:
                0.014
        });


    moon =
        new THREE.Mesh(
            geometry,
            material
        );


    moon.rotation.z =
        THREE.MathUtils.degToRad(
            1.5
        );


    moonGroup =
        new THREE.Group();


    moonGroup.position.y =
        -0.08;


    moonGroup.add(
        moon
    );


    scene.add(
        moonGroup
    );


    createMoonHalo();
}


/*====================================================
=                   HALO LUNAR                       =
====================================================*/

function createMoonHalo() {

    halo =
        new THREE.Sprite(
            new THREE.SpriteMaterial({
                map:
                    createHaloTexture(),

                transparent:
                    true,

                opacity:
                    0.12,

                blending:
                    THREE.AdditiveBlending,

                depthWrite:
                    false
            })
        );


    halo.scale.set(
        5.35,
        5.35,
        1
    );


    halo.position.z =
        -0.38;


    moonGroup.add(
        halo
    );
}


/*====================================================
=               TEXTURA DEL HALO                     =
====================================================*/

function createHaloTexture() {

    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        256;

    canvas.height =
        256;


    const context =
        canvas.getContext(
            "2d"
        );


    const gradient =
        context.createRadialGradient(
            128,
            128,
            5,

            128,
            128,
            128
        );


    gradient.addColorStop(
        0,
        "rgba(255,255,255,0.44)"
    );


    gradient.addColorStop(
        0.30,
        "rgba(195,215,255,0.16)"
    );


    gradient.addColorStop(
        0.65,
        "rgba(105,145,220,0.04)"
    );


    gradient.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );


    context.fillStyle =
        gradient;


    context.fillRect(
        0,
        0,
        256,
        256
    );


    return new THREE.CanvasTexture(
        canvas
    );
}


/*====================================================
=          TEXTURA DE PUNTOS ESTELARES               =
====================================================*/

function createStarParticleTexture() {

    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        64;

    canvas.height =
        64;


    const context =
        canvas.getContext(
            "2d"
        );


    const gradient =
        context.createRadialGradient(
            32,
            32,
            0,

            32,
            32,
            32
        );


    gradient.addColorStop(
        0,
        "rgba(255,255,255,1)"
    );


    gradient.addColorStop(
        0.18,
        "rgba(255,255,255,0.95)"
    );


    gradient.addColorStop(
        0.48,
        "rgba(170,205,255,0.42)"
    );


    gradient.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );


    context.fillStyle =
        gradient;


    context.fillRect(
        0,
        0,
        64,
        64
    );


    const texture =
        new THREE.CanvasTexture(
            canvas
        );


    texture.colorSpace =
        THREE.SRGBColorSpace;


    return texture;
}


/*====================================================
=              TEXTURAS DE LA LUNA                   =
====================================================*/

function loadMoonTextures() {

    const loader =
        new THREE.TextureLoader();


    const textures = [
        {
            path:
                "assets/textures/moon_color.jpg",

            property:
                "map",

            isColor:
                true
        },

        {
            path:
                "assets/textures/moon_normal.jpg",

            property:
                "normalMap",

            isColor:
                false
        },

        {
            path:
                "assets/textures/moon_displacement.jpg",

            property:
                "displacementMap",

            isColor:
                false
        },

        {
            path:
                "assets/textures/moon_roughness.jpg",

            property:
                "roughnessMap",

            isColor:
                false
        }
    ];


    let completed = 0;
    let failed = 0;


    textures.forEach(
        (textureData) => {

            loader.load(

                textureData.path,

                (texture) => {

                    prepareTexture(
                        texture,

                        textureData.isColor,

                        textureData.property
                    );


                    moon.material[
                        textureData.property
                    ] = texture;


                    if (
                        textureData.property ===
                        "displacementMap"
                    ) {

                        moon.material.bumpMap =
                            texture;
                    }


                    moon.material.needsUpdate =
                        true;


                    finishTexture(
                        false
                    );
                },

                undefined,

                (error) => {

                    console.warn(
                        "No se pudo cargar:",
                        textureData.path,
                        error
                    );


                    finishTexture(
                        true
                    );
                }
            );
        }
    );


    function finishTexture(
        hasFailed
    ) {

        completed++;


        if (
            hasFailed
        ) {

            failed++;
        }


        loadStatus.textContent =
            `Cargando texturas ${completed}/${textures.length}...`;


        if (
            completed <
            textures.length
        ) {

            return;
        }


        loadStatus.textContent =
            failed === 0

                ? "La luna está lista."

                : "La luna está lista; alguna textura no cargó.";
    }
}


/*====================================================
=             PREPARAR UNA TEXTURA                   =
====================================================*/

function prepareTexture(
    texture,
    isColor,
    property
) {

    resizeTextureForMobile(
        texture,
        property
    );


    texture.wrapS =
        THREE.RepeatWrapping;


    texture.wrapT =
        THREE.ClampToEdgeWrapping;


    texture.generateMipmaps =
        true;


    texture.minFilter =
        THREE.LinearMipmapLinearFilter;


    texture.magFilter =
        THREE.LinearFilter;


    texture.anisotropy =
        Math.min(
            renderer
                .capabilities
                .getMaxAnisotropy(),

            16
        );


    if (
        isColor
    ) {

        texture.colorSpace =
            THREE.SRGBColorSpace;
    }


    texture.needsUpdate =
        true;
}


/*====================================================
=          REDUCIR TEXTURAS EN CELULAR               =
====================================================*/

function resizeTextureForMobile(
    texture,
    property
) {

    if (
        !isMobileDevice()
    ) {

        return;
    }


    const source =
        texture.image;


    if (
        !source
    ) {

        return;
    }


    const deviceLimit =
        Math.min(
            2048,

            renderer
                .capabilities
                .maxTextureSize
        );


    const desiredWidth =
        property ===
            "normalMap" ||
        property ===
            "roughnessMap"

            ? Math.min(
                2048,
                deviceLimit
            )

            : deviceLimit;


    if (
        source.width <=
        desiredWidth
    ) {

        return;
    }


    const scale =
        desiredWidth /
        source.width;


    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        desiredWidth;


    canvas.height =
        Math.max(
            1,

            Math.round(
                source.height *
                scale
            )
        );


    const context =
        canvas.getContext(
            "2d",

            {
                alpha: false
            }
        );


    context.drawImage(
        source,

        0,
        0,

        canvas.width,
        canvas.height
    );


    texture.image =
        canvas;
}


/*====================================================
=          CAMPO DE ESTRELLAS MEJORADO               =
====================================================*/

function createStars() {

    const mobile =
        isMobileDevice();


    /*
     * Estrellas diminutas y lejanas.
     */
    addStarLayer({
        amount:
            mobile ? 2300 : 4500,

        minimumRadius:
            22,

        maximumRadius:
            120,

        size:
            0.038,

        opacity:
            0.43,

        rotationSpeed:
            0.00038,

        direction:
            1
    });


    /*
     * Estrellas pequeñas.
     */
    addStarLayer({
        amount:
            mobile ? 1300 : 2600,

        minimumRadius:
            18,

        maximumRadius:
            90,

        size:
            0.058,

        opacity:
            0.57,

        rotationSpeed:
            0.00055,

        direction:
            -1
    });


    /*
     * Estrellas medianas.
     */
    addStarLayer({
        amount:
            mobile ? 720 : 1350,

        minimumRadius:
            15,

        maximumRadius:
            62,

        size:
            0.085,

        opacity:
            0.72,

        rotationSpeed:
            0.00078,

        direction:
            1
    });


    /*
     * Estrellas brillantes medianas.
     */
    addStarLayer({
        amount:
            mobile ? 310 : 620,

        minimumRadius:
            13,

        maximumRadius:
            48,

        size:
            0.125,

        opacity:
            0.84,

        rotationSpeed:
            0.00105,

        direction:
            -1
    });


    /*
     * Estrellas grandes, menos numerosas.
     */
    addStarLayer({
        amount:
            mobile ? 125 : 260,

        minimumRadius:
            12,

        maximumRadius:
            42,

        size:
            0.19,

        opacity:
            0.90,

        rotationSpeed:
            0.00128,

        direction:
            1
    });


    /*
     * Unas pocas estrellas destacadas.
     */
    addStarLayer({
        amount:
            mobile ? 50 : 110,

        minimumRadius:
            11,

        maximumRadius:
            36,

        size:
            0.28,

        opacity:
            0.96,

        rotationSpeed:
            0.00155,

        direction:
            -1
    });
}


/*====================================================
=              AGREGAR CAPA ESTELAR                  =
====================================================*/

function addStarLayer(
    options
) {

    const stars =
        createStarLayer(
            options.amount,
            options.minimumRadius,
            options.maximumRadius,
            options.size,
            options.opacity
        );


    stars.rotation.x =
        THREE.MathUtils.randFloat(
            -0.25,
            0.25
        );


    stars.rotation.z =
        THREE.MathUtils.randFloat(
            -0.18,
            0.18
        );


    starLayers.push({
        stars,

        speed:
            options.rotationSpeed,

        direction:
            options.direction
    });
}


/*====================================================
=              CREAR CAPA DE ESTRELLAS               =
====================================================*/

function createStarLayer(
    amount,
    minimumRadius,
    maximumRadius,
    size,
    opacity
) {

    const positions =
        new Float32Array(
            amount * 3
        );


    for (
        let index = 0;
        index < amount;
        index++
    ) {

        const radius =
            THREE.MathUtils.randFloat(
                minimumRadius,
                maximumRadius
            );


        const horizontalAngle =
            Math.random() *
            Math.PI *
            2;


        const verticalAngle =
            Math.acos(
                THREE.MathUtils.randFloat(
                    -1,
                    1
                )
            );


        positions[
            index * 3
        ] =
            radius *
            Math.sin(
                verticalAngle
            ) *
            Math.cos(
                horizontalAngle
            );


        positions[
            index * 3 + 1
        ] =
            radius *
            Math.cos(
                verticalAngle
            );


        positions[
            index * 3 + 2
        ] =
            radius *
            Math.sin(
                verticalAngle
            ) *
            Math.sin(
                horizontalAngle
            );
    }


    const geometry =
        new THREE.BufferGeometry();


    geometry.setAttribute(
        "position",

        new THREE.BufferAttribute(
            positions,
            3
        )
    );


    const material =
        new THREE.PointsMaterial({
            map:
                starParticleTexture,

            color:
                0xffffff,

            size,

            transparent:
                true,

            opacity,

            alphaTest:
                0.01,

            sizeAttenuation:
                true,

            depthWrite:
                false,

            fog:
                false,

            blending:
                THREE.AdditiveBlending
        });


    const stars =
        new THREE.Points(
            geometry,
            material
        );


    scene.add(
        stars
    );


    return stars;
}


/*====================================================
=                 CONTROL DEL ZOOM                   =
====================================================*/

function configureZoomInteraction() {

    const canvas =
        renderer.domElement;


    canvas.addEventListener(
        "wheel",

        (event) => {

            if (
                !experienceStarted
            ) {

                return;
            }


            event.preventDefault();


            changeZoom(
                event.deltaY *
                0.006
            );
        },

        {
            passive: false
        }
    );


    let pinchStartDistance = 0;

    let pinchStartCameraZ =
        defaultCameraZ;


    canvas.addEventListener(
        "touchstart",

        (event) => {

            if (
                event.touches.length !==
                2
            ) {

                return;
            }


            pinchStartDistance =
                getTouchDistance(
                    event.touches
                );


            pinchStartCameraZ =
                cameraTargetZ;
        },

        {
            passive: true
        }
    );


    canvas.addEventListener(
        "touchmove",

        (event) => {

            if (
                event.touches.length !== 2 ||
                pinchStartDistance === 0
            ) {

                return;
            }


            event.preventDefault();


            const currentDistance =
                getTouchDistance(
                    event.touches
                );


            const ratio =
                currentDistance /
                pinchStartDistance;


            cameraTargetZ =
                THREE.MathUtils.clamp(
                    pinchStartCameraZ /
                        ratio,

                    minimumCameraZ,

                    maximumCameraZ
                );
        },

        {
            passive: false
        }
    );


    canvas.addEventListener(
        "touchend",

        () => {

            pinchStartDistance =
                0;
        }
    );
}


/*====================================================
=                 DISTANCIA TÁCTIL                   =
====================================================*/

function getTouchDistance(
    touches
) {

    return Math.hypot(

        touches[0].clientX -
            touches[1].clientX,

        touches[0].clientY -
            touches[1].clientY
    );
}


/*====================================================
=                    CAMBIAR ZOOM                    =
====================================================*/

function changeZoom(
    amount
) {

    if (
        !experienceStarted
    ) {

        return;
    }


    cameraTargetZ =
        THREE.MathUtils.clamp(
            cameraTargetZ +
                amount,

            minimumCameraZ,

            maximumCameraZ
        );
}


/*====================================================
=                  RESTABLECER ZOOM                  =
====================================================*/

function resetZoom() {

    cameraTargetZ =
        defaultCameraZ;
}


/*====================================================
=              INICIAR EXPERIENCIA                   =
====================================================*/

function startExperience() {

    if (
        !sceneReady
    ) {

        loadStatus.textContent =
            "La escena todavía se está preparando.";

        return;
    }


    if (
        experienceStarted
    ) {

        return;
    }


    experienceStarted =
        true;


    letterTriggered =
        false;


    phraseSequenceStarted =
        false;


    document.body.classList.add(
        "started"
    );


    startScreen.classList.add(
        "hidden"
    );


    window.setTimeout(
        () => {

            startScreen.style.display =
                "none";
        },

        1250
    );


    cameraTargetZ =
        defaultCameraZ;


    try {

        backgroundMusic.currentTime =
            0;

    } catch (error) {

        console.warn(
            "No se pudo reiniciar el audio:",
            error
        );
    }


    playMusic();
}


/*====================================================
=                      MÚSICA                        =
====================================================*/

async function playMusic() {

    backgroundMusic.volume =
        0.3;


    try {

        await backgroundMusic.play();


        musicPlaying =
            true;


        musicButton.textContent =
            "🔊";


        checkLetterMoment();

    } catch (error) {

        musicPlaying =
            false;


        musicButton.textContent =
            "🔇";


        console.warn(
            "La música no pudo reproducirse:",
            error
        );
    }
}


/*====================================================
=                 ACTIVAR O SILENCIAR                =
====================================================*/

function toggleMusic() {

    if (
        musicPlaying
    ) {

        backgroundMusic.pause();


        musicPlaying =
            false;


        musicButton.textContent =
            "🔇";


        return;
    }


    playMusic();
}


/*====================================================
=               CARTA DEL SEGUNDO 15                 =
====================================================*/

function checkLetterMoment() {

    if (
        !experienceStarted ||
        letterTriggered ||
        backgroundMusic.currentTime <
            LETTER_SECOND
    ) {

        return;
    }


    letterTriggered =
        true;


    showLetterCard();
}


/*====================================================
=                    MOSTRAR CARTA                   =
====================================================*/

function showLetterCard() {

    document.body.classList.add(
        "letter-open"
    );


    letterCard.classList.add(
        "visible"
    );
}


/*====================================================
=             CONTINUAR DESDE LA CARTA               =
====================================================*/

function continueAfterLetter() {

    letterCard.classList.remove(
        "visible"
    );


    document.body.classList.remove(
        "letter-open"
    );


    if (
        !phraseSequenceStarted
    ) {

        window.setTimeout(
            startPhraseSequence,
            650
        );
    }
}


/*====================================================
=               SECUENCIA DE FRASES                  =
====================================================*/

function startPhraseSequence() {

    phraseSequenceStarted =
        true;


    phraseIndex =
        0;


    clearPhraseTimers();


    removeActivePhrase();


    showNextPhrase();
}


/*====================================================
=               MOSTRAR SIGUIENTE FRASE              =
====================================================*/

function showNextPhrase() {

    if (
        phraseIndex >=
        shortPhrases.length
    ) {

        return;
    }


    const text =
        shortPhrases[
            phraseIndex
        ];


    const anchor =
        phraseAnchors[
            phraseIndex %
            phraseAnchors.length
        ];


    createBurst(
        anchor
    );


    createFloatingPhrase(
        text,
        anchor
    );


    const fadeTimer =
        window.setTimeout(
            () => {

                if (
                    activePhraseLabel
                ) {

                    activePhraseLabel
                        .element
                        .classList
                        .add(
                            "leaving"
                        );
                }
            },

            PHRASE_VISIBLE_TIME
        );


    const nextTimer =
        window.setTimeout(
            () => {

                removeActivePhrase();


                phraseIndex++;


                const gapTimer =
                    window.setTimeout(
                        showNextPhrase,
                        PHRASE_GAP_TIME
                    );


                phraseTimers.push(
                    gapTimer
                );
            },

            PHRASE_VISIBLE_TIME +
                PHRASE_FADE_TIME
        );


    phraseTimers.push(
        fadeTimer,
        nextTimer
    );
}


/*====================================================
=            LIMPIAR TEMPORIZADORES                  =
====================================================*/

function clearPhraseTimers() {

    while (
        phraseTimers.length >
        0
    ) {

        clearTimeout(
            phraseTimers.pop()
        );
    }
}


/*====================================================
=              EXPLOSIÓN DE ESTRELLAS                =
====================================================*/

function createBurst(
    anchorData
) {

    const mobile =
        isMobileDevice();


    const particleCount =
        mobile
            ? 48
            : 90;


    const positions =
        new Float32Array(
            particleCount * 3
        );


    const colors =
        new Float32Array(
            particleCount * 3
        );


    const velocities = [];


    const palettes = [
        new THREE.Color(
            0xffffff
        ),

        new THREE.Color(
            0xc4dcff
        ),

        new THREE.Color(
            0xffe8ba
        )
    ];


    const outward =
        new THREE.Vector3(
            anchorData.x,
            anchorData.y,
            anchorData.z
        ).normalize();


    for (
        let index = 0;
        index < particleCount;
        index++
    ) {

        positions[
            index * 3
        ] = 0;


        positions[
            index * 3 + 1
        ] = 0;


        positions[
            index * 3 + 2
        ] = 0;


        const spread =
            new THREE.Vector3(
                outward.x +
                    THREE.MathUtils.randFloat(
                        -0.95,
                        0.95
                    ),

                outward.y +
                    THREE.MathUtils.randFloat(
                        -0.95,
                        0.95
                    ),

                outward.z +
                    THREE.MathUtils.randFloat(
                        -0.75,
                        0.75
                    )
            ).normalize();


        const speed =
            THREE.MathUtils.randFloat(
                0.9,
                2.9
            );


        velocities.push(
            spread.multiplyScalar(
                speed
            )
        );


        const color =
            palettes[
                Math.floor(
                    Math.random() *
                    palettes.length
                )
            ];


        colors[
            index * 3
        ] =
            color.r;


        colors[
            index * 3 + 1
        ] =
            color.g;


        colors[
            index * 3 + 2
        ] =
            color.b;
    }


    const geometry =
        new THREE.BufferGeometry();


    const positionAttribute =
        new THREE.BufferAttribute(
            positions,
            3
        );


    positionAttribute.setUsage(
        THREE.DynamicDrawUsage
    );


    geometry.setAttribute(
        "position",
        positionAttribute
    );


    geometry.setAttribute(
        "color",

        new THREE.BufferAttribute(
            colors,
            3
        )
    );


    const material =
        new THREE.PointsMaterial({
            map:
                starParticleTexture,

            vertexColors:
                true,

            size:
                mobile
                    ? 0.12
                    : 0.09,

            transparent:
                true,

            opacity:
                1,

            alphaTest:
                0.012,

            sizeAttenuation:
                true,

            depthWrite:
                false,

            blending:
                THREE.AdditiveBlending
        });


    const points =
        new THREE.Points(
            geometry,
            material
        );


    points.position.set(
        moonGroup.position.x +
            anchorData.x *
            0.57,

        moonGroup.position.y +
            anchorData.y *
            0.57,

        anchorData.z *
            0.57
    );


    scene.add(
        points
    );


    activeBursts.push({
        points,
        geometry,
        material,
        positionAttribute,
        velocities,
        age:
            0,
        duration:
            1.9
    });
}


/*====================================================
=              ACTUALIZAR EXPLOSIONES                =
====================================================*/

function updateBursts(
    delta
) {

    for (
        let index =
            activeBursts.length -
            1;

        index >= 0;

        index--
    ) {

        const burst =
            activeBursts[
                index
            ];


        burst.age +=
            delta;


        const positions =
            burst
                .positionAttribute
                .array;


        for (
            let particle = 0;

            particle <
            burst.velocities.length;

            particle++
        ) {

            const velocity =
                burst.velocities[
                    particle
                ];


            positions[
                particle * 3
            ] +=
                velocity.x *
                delta;


            positions[
                particle * 3 + 1
            ] +=
                velocity.y *
                delta;


            positions[
                particle * 3 + 2
            ] +=
                velocity.z *
                delta;


            velocity.multiplyScalar(
                0.984
            );
        }


        burst
            .positionAttribute
            .needsUpdate =
            true;


        const progress =
            burst.age /
            burst.duration;


        burst.material.opacity =
            Math.max(
                0,
                1 -
                progress
            );


        burst.material.size =
            THREE.MathUtils.lerp(
                isMobileDevice()
                    ? 0.12
                    : 0.09,

                0.025,

                progress
            );


        if (
            burst.age >=
            burst.duration
        ) {

            scene.remove(
                burst.points
            );


            burst.geometry.dispose();


            burst.material.dispose();


            activeBursts.splice(
                index,
                1
            );
        }
    }
}


/*====================================================
=                 FRASE FLOTANTE                     =
====================================================*/

function createFloatingPhrase(
    text,
    anchorData
) {

    removeActivePhrase();


    const element =
        document.createElement(
            "span"
        );


    element.className =
        "floating-phrase";


    element.textContent =
        text;


    phraseLayer.appendChild(
        element
    );


    activePhraseLabel = {
        element,

        anchor:
            new THREE.Vector3(
                anchorData.x *
                    0.74,

                anchorData.y *
                    0.74,

                anchorData.z *
                    0.74
            )
    };


    requestAnimationFrame(
        () => {

            element.classList.add(
                "visible"
            );
        }
    );
}


/*====================================================
=                 ELIMINAR FRASE                     =
====================================================*/

function removeActivePhrase() {

    if (
        !activePhraseLabel
    ) {

        return;
    }


    activePhraseLabel
        .element
        .remove();


    activePhraseLabel =
        null;
}


/*====================================================
=             ACTUALIZAR POSICIÓN DE FRASE           =
====================================================*/

function updatePhrasePosition() {

    if (
        !activePhraseLabel
    ) {

        return;
    }


    const worldPosition =
        new THREE.Vector3(
            moonGroup.position.x +
                activePhraseLabel
                    .anchor
                    .x,

            moonGroup.position.y +
                activePhraseLabel
                    .anchor
                    .y,

            activePhraseLabel
                .anchor
                .z
        );


    positionHtmlElement(
        activePhraseLabel.element,
        worldPosition
    );
}


/*====================================================
=             POSICIONAR ELEMENTO HTML               =
====================================================*/

function positionHtmlElement(
    element,
    worldPosition
) {

    const projected =
        worldPosition
            .clone()
            .project(
                camera
            );


    const x =
        (
            projected.x *
            0.5 +
            0.5
        ) *
        window.innerWidth;


    const y =
        (
            -projected.y *
            0.5 +
            0.5
        ) *
        window.innerHeight;


    const horizontalMargin =
        isMobileDevice()
            ? 28
            : 85;


    const verticalMargin =
        isMobileDevice()
            ? 78
            : 82;


    element.style.left =
        `${
            THREE.MathUtils.clamp(
                x,

                horizontalMargin,

                window.innerWidth -
                horizontalMargin
            )
        }px`;


    element.style.top =
        `${
            THREE.MathUtils.clamp(
                y,

                verticalMargin,

                window.innerHeight -
                verticalMargin
            )
        }px`;
}


/*====================================================
=                CAMBIO DE TAMAÑO                    =
====================================================*/

function resizeScene() {

    configureResponsiveValues();


    camera.aspect =
        window.innerWidth /
        window.innerHeight;


    camera.updateProjectionMatrix();


    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );


    renderer.setPixelRatio(
        getRecommendedPixelRatio()
    );


    if (
        experienceStarted &&
        cameraTargetZ >
        maximumCameraZ
    ) {

        cameraTargetZ =
            maximumCameraZ;
    }
}


/*====================================================
=            ACTUALIZAR CAMPO ESTELAR                =
====================================================*/

function updateStarLayers(
    delta
) {

    starLayers.forEach(
        (
            layer,
            index
        ) => {

            layer.stars.rotation.y +=
                delta *
                layer.speed *
                layer.direction;


            /*
             * Movimiento vertical mínimo
             * para evitar que todas las
             * capas parezcan iguales.
             */
            layer.stars.rotation.x +=
                delta *
                layer.speed *
                0.12 *
                (
                    index % 2 === 0
                        ? 1
                        : -1
                );
        }
    );
}


/*====================================================
=                BUCLE DE ANIMACIÓN                  =
====================================================*/

function animate() {

    const delta =
        clock.getDelta();


    const elapsed =
        clock.elapsedTime;


    /*
     * La Luna gira únicamente
     * sobre su propio eje.
     */
    moon.rotation.y +=
        delta *
        0.018;


    /*
     * Flotación casi imperceptible.
     */
    moonGroup.position.y =
        -0.08 +
        Math.sin(
            elapsed *
            0.45
        ) *
        0.022;


    /*
     * Halo sutil.
     */
    const haloScale =
        5.35 +
        Math.sin(
            elapsed *
            0.60
        ) *
        0.055;


    halo.scale.set(
        haloScale,
        haloScale,
        1
    );


    /*
     * Movimiento de las capas de estrellas.
     */
    updateStarLayers(
        delta
    );


    /*
     * Explosiones y frases.
     */
    updateBursts(
        delta
    );


    updatePhrasePosition();


    /*
     * Zoom suave.
     */
    camera.position.z +=
        (
            cameraTargetZ -
            camera.position.z
        ) *
        0.045;


    camera.lookAt(
        0,
        -0.08,
        0
    );


    renderer.render(
        scene,
        camera
    );
}