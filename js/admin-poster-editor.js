"use strict";

/* =========================================================
   ZAVYRO POSTER EDITOR
   FINAL VERSION

   FIXES:
   - Independent A6 / A5 / A4 / A3 orientation
   - Real visual size difference between A6/A5/A4/A3
   - Correct horizontal / vertical canvas
   - Working zoom slider
   - Mouse wheel zoom
   - Free-hand drag
   - Fit / Fill
   - Rotation
   - Saved variant state
   - Supabase save

   STATUS:
   - Original
   - Unsaved
   - Saved
   ========================================================= */


/* =========================================================
   SUPABASE
   ========================================================= */

const db = window.supabaseClient;


/* =========================================================
   DOM
   ========================================================= */

const loadingScreen =
    document.getElementById("loadingScreen");

const productTitle =
    document.getElementById("productTitle");

const posterFrame =
    document.getElementById("posterFrame");

const posterImage =
    document.getElementById("posterImage");

const emptyPreview =
    document.getElementById("emptyPreview");

const currentSizeLabel =
    document.getElementById("currentSize");

const currentDimensions =
    document.getElementById("currentDimensions");

const variantStatus =
    document.getElementById("variantStatus");

const imageInput =
    document.getElementById("imageInput");

const fitBtn =
    document.getElementById("fitBtn");

const fillBtn =
    document.getElementById("fillBtn");

const centerBtn =
    document.getElementById("centerBtn");

const resetBtn =
    document.getElementById("resetBtn");

const zoomSlider =
    document.getElementById("zoomSlider");

const zoomValue =
    document.getElementById("zoomValue");

const rotationSlider =
    document.getElementById("rotationSlider");

const rotationValue =
    document.getElementById("rotationValue");

const rotateLeftBtn =
    document.getElementById("rotateLeftBtn");

const rotateRightBtn =
    document.getElementById("rotateRightBtn");

const saveVariantBtn =
    document.getElementById("saveVariantBtn");

const downloadVariantBtn =
    document.getElementById("downloadVariantBtn");

const downloadAllBtn =
    document.getElementById("downloadAllBtn");

const backBtn =
    document.getElementById("backBtn");

const message =
    document.getElementById("message");


/* =========================================================
   PRODUCT
   ========================================================= */

let productId = null;
let product = null;

let originalImageUrl = "";
let originalImagePath = "";

let imageNaturalWidth = 0;
let imageNaturalHeight = 0;
let imageReady = false;

let objectUrl = null;


/* =========================================================
   PAPER DIMENSIONS
   MILLIMETERS
   ========================================================= */

const PAPER_SIZES = {

    A6: {
        width: 105,
        height: 148
    },

    A5: {
        width: 148,
        height: 210
    },

    A4: {
        width: 210,
        height: 297
    },

    A3: {
        width: 297,
        height: 420
    }

};


/* =========================================================
   VISUAL SIZE SCALE
   ========================================================= */

const VISUAL_SCALE = {

    A6: 0.353553,

    A5: 0.5,

    A4: 0.707106,

    A3: 1

};


/* =========================================================
   EDITOR STATE
   ========================================================= */

let currentSize = "A4";


/*
   EACH SIZE HAS ITS OWN STATE.
*/

const variants = {

    A6: {
        orientation: "vertical",
        imageUrl: "",
        imageSource: "",
        zoom: 100,
        rotation: 0,
        x: 0,
        y: 0,
        mode: "fill",
        saved: false
    },

    A5: {
        orientation: "vertical",
        imageUrl: "",
        imageSource: "",
        zoom: 100,
        rotation: 0,
        x: 0,
        y: 0,
        mode: "fill",
        saved: false
    },

    A4: {
        orientation: "vertical",
        imageUrl: "",
        imageSource: "",
        zoom: 100,
        rotation: 0,
        x: 0,
        y: 0,
        mode: "fill",
        saved: false
    },

    A3: {
        orientation: "vertical",
        imageUrl: "",
        imageSource: "",
        zoom: 100,
        rotation: 0,
        x: 0,
        y: 0,
        mode: "fill",
        saved: false
    }

};


/* =========================================================
   DRAG STATE
   ========================================================= */

let dragging = false;

let dragStartPointerX = 0;
let dragStartPointerY = 0;

let dragStartImageX = 0;
let dragStartImageY = 0;


/* =========================================================
   MESSAGE
   ========================================================= */

function showMessage(
    text,
    type = "success"
) {

    if (!message) {
        return;
    }

    message.textContent =
        text;

    message.className =
        `show ${type}`;

    clearTimeout(
        showMessage.timer
    );

    showMessage.timer =
        setTimeout(
            () => {

                message.className =
                    "";

            },
            2500
        );

}


/* =========================================================
   PRODUCT ID
   ========================================================= */

function getProductId() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get("id");

}


/* =========================================================
   PUBLIC URL
   ========================================================= */

function getPublicUrl(path) {

    if (!path || !db) {
        return "";
    }

    try {

        const result =
            db.storage
                .from("posters")
                .getPublicUrl(path);

        return result?.data?.publicUrl || "";

    } catch (error) {

        console.error(
            "PUBLIC URL ERROR:",
            error
        );

        return "";

    }

}


/* =========================================================
   NORMALIZE POSTER EDITS
   ========================================================= */

function getPosterEdits() {

    if (!product) {
        return {};
    }

    let edits =
        product.poster_edits;

    if (!edits) {
        return {};
    }

    if (
        typeof edits ===
        "string"
    ) {

        try {

            edits =
                JSON.parse(
                    edits
                );

        } catch {

            return {};

        }

    }

    if (
        typeof edits !==
        "object" ||
        Array.isArray(edits)
    ) {

        return {};

    }

    return edits;

}


/* =========================================================
   GET PAPER DIMENSIONS
   ========================================================= */

function getDimensions(
    size,
    orientation
) {

    const paper =
        PAPER_SIZES[size];

    if (!paper) {

        return {
            width: 210,
            height: 297
        };

    }

    if (
        orientation ===
        "horizontal"
    ) {

        return {

            width:
                paper.height,

            height:
                paper.width

        };

    }

    return {

        width:
            paper.width,

        height:
            paper.height

    };

}


/* =========================================================
   CURRENT VARIANT
   ========================================================= */

function getCurrentVariant() {

    return variants[currentSize];

}


/* =========================================================
   MARK CURRENT VARIANT UNSAVED
   ========================================================= */

function markCurrentVariantUnsaved() {

    const variant =
        getCurrentVariant();

    if (!variant) {
        return;
    }

    variant.saved =
        false;

    updateVariantStatus();
    updateInfo();

}


/* =========================================================
   SIZE BUTTONS
   ========================================================= */

function updateSizeButtons() {

    document
        .querySelectorAll(
            ".size-btn"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.size ===
                        currentSize
                );

            }
        );

}


/* =========================================================
   ORIENTATION BUTTONS
   ========================================================= */

function updateOrientationButtons() {

    const variant =
        getCurrentVariant();

    const orientation =
        variant.orientation;

    document
        .querySelectorAll(
            ".orientation-btn"
        )
        .forEach(
            button => {

                let buttonOrientation =
                    button.dataset.orientation;

                if (
                    !buttonOrientation
                ) {

                    const text =
                        button.textContent
                            .trim()
                            .toLowerCase();

                    if (
                        text.includes(
                            "horizontal"
                        ) ||
                        text.includes(
                            "landscape"
                        )
                    ) {

                        buttonOrientation =
                            "horizontal";

                    } else if (
                        text.includes(
                            "vertical"
                        ) ||
                        text.includes(
                            "portrait"
                        )
                    ) {

                        buttonOrientation =
                            "vertical";

                    }

                }

                button.classList.toggle(
                    "active",
                    buttonOrientation ===
                        orientation
                );

            }
        );

}


/* =========================================================
   GET STAGE
   ========================================================= */

function getStage() {

    if (!posterFrame) {
        return null;
    }

    return posterFrame.parentElement;

}


/* =========================================================
   RESIZE FRAME
   ========================================================= */

function resizeFrame() {

    if (!posterFrame) {
        return;
    }

    const stage =
        getStage();

    if (!stage) {
        return;
    }

    const variant =
        getCurrentVariant();

    const dimensions =
        getDimensions(
            currentSize,
            variant.orientation
        );

    const ratio =
        dimensions.width /
        dimensions.height;

    const stageWidth =
        stage.clientWidth;

    const stageHeight =
        stage.clientHeight;

    if (
        stageWidth <= 0 ||
        stageHeight <= 0
    ) {
        return;
    }

    const availableWidth =
        Math.max(
            220,
            stageWidth - 100
        );

    const availableHeight =
        Math.max(
            260,
            stageHeight - 100
        );

    let a3Width =
        availableWidth;

    let a3Height =
        a3Width /
        ratio;

    if (
        a3Height >
        availableHeight
    ) {

        a3Height =
            availableHeight;

        a3Width =
            a3Height *
            ratio;

    }

    const visualScale =
        VISUAL_SCALE[currentSize] || 1;

    let width =
        a3Width *
        visualScale;

    let height =
        a3Height *
        visualScale;

    if (
        width >
        availableWidth
    ) {

        const factor =
            availableWidth /
            width;

        width *= factor;
        height *= factor;

    }

    if (
        height >
        availableHeight
    ) {

        const factor =
            availableHeight /
            height;

        width *= factor;
        height *= factor;

    }

    if (
        ratio > 0
    ) {

        height =
            width /
            ratio;

    }

    posterFrame.style.aspectRatio =
        `${dimensions.width} / ${dimensions.height}`;

    posterFrame.style.width =
        `${Math.round(width)}px`;

    posterFrame.style.height =
        `${Math.round(height)}px`;

    posterFrame.style.minWidth =
        "0";

    posterFrame.style.minHeight =
        "0";

    posterFrame.style.maxWidth =
        "none";

    posterFrame.style.maxHeight =
        "none";

    posterFrame.dataset.size =
        currentSize;

    posterFrame.dataset.orientation =
        variant.orientation;

    applyTransform();

}


/* =========================================================
   UPDATE INFO
   ========================================================= */

function updateInfo() {

    const variant =
        getCurrentVariant();

    const dimensions =
        getDimensions(
            currentSize,
            variant.orientation
        );

    if (currentSizeLabel) {

        currentSizeLabel.textContent =
            currentSize;

    }

    if (currentDimensions) {

        currentDimensions.textContent =
            `${dimensions.width} × ${dimensions.height} mm`;

    }

    if (variantStatus) {

        if (variant.saved) {

            variantStatus.textContent =
                "Saved Variant";

        } else if (
            variant.imageUrl ||
            variant.x !== 0 ||
            variant.y !== 0 ||
            variant.zoom !== 100 ||
            variant.rotation !== 0
        ) {

            variantStatus.textContent =
                "Unsaved Changes";

        } else {

            variantStatus.textContent =
                "Original";

        }

    }

    if (saveVariantBtn) {

        saveVariantBtn.textContent =
            `Save ${currentSize} Variant`;

    }

}


/* =========================================================
   VARIANT STATUS
   ========================================================= */

function updateVariantStatus() {

    const sizes = [
        "A6",
        "A5",
        "A4",
        "A3"
    ];

    sizes.forEach(size => {

        const element =
            document.getElementById(
                `status${size}`
            );

        if (!element) {
            return;
        }

        const variant =
            variants[size];

        /*
         * IMPORTANT:
         * Get the second DIRECT child.
         * This prevents the dot span from
         * being selected accidentally.
         */

        const statusText =
            element.children[1];

        const dot =
            element.querySelector(
                ".dot"
            );

        if (!statusText) {
            return;
        }


        /* =================================================
           SAVED
           ================================================= */

        if (
            variant &&
            variant.saved === true
        ) {

            statusText.textContent =
                "Saved";

            element.classList.add(
                "ready"
            );

            if (dot) {

                dot.style.background =
                    "#4ade80";

                dot.style.boxShadow =
                    "0 0 8px rgba(74,222,128,.55)";

            }

        }


        /* =================================================
           UNSAVED
           ================================================= */

        else {

            /*
               If the variant has no edits yet,
               show Original.
            */

            const isOriginal =
                variant &&
                !variant.imageUrl &&
                Number(variant.x) === 0 &&
                Number(variant.y) === 0 &&
                Number(variant.zoom || 100) === 100 &&
                Number(variant.rotation || 0) === 0 &&
                variant.mode === "fill";

            if (isOriginal) {

                statusText.textContent =
                    "Original";

                if (dot) {

                    dot.style.background =
                        "#666";

                    dot.style.boxShadow =
                        "none";

                }

            } else {

                statusText.textContent =
                    "Unsaved";

                if (dot) {

                    dot.style.background =
                        "#facc15";

                    dot.style.boxShadow =
                        "0 0 8px rgba(250,204,21,.45)";

                }

            }

            element.classList.remove(
                "ready"
            );

        }


        /* =================================================
           CURRENT SIZE
           ================================================= */

        if (
            size === currentSize
        ) {

            element.classList.add(
                "current"
            );

        } else {

            element.classList.remove(
                "current"
            );

        }

    });

}


/* =========================================================
   IMAGE SOURCE
   ========================================================= */

function setImageSource(url) {

    imageReady =
        false;

    if (!posterImage) {
        return;
    }

    if (!url) {

        posterImage.removeAttribute(
            "src"
        );

        posterImage.style.display =
            "none";

        if (emptyPreview) {

            emptyPreview.style.display =
                "flex";

        }

        return;

    }

    posterImage.style.display =
        "block";

    if (emptyPreview) {

        emptyPreview.style.display =
            "none";

    }

    posterImage.onload =
        () => {

            imageNaturalWidth =
                posterImage.naturalWidth;

            imageNaturalHeight =
                posterImage.naturalHeight;

            imageReady =
                true;

            requestAnimationFrame(
                () => {

                    applyTransform();

                }
            );

        };

    posterImage.onerror =
        () => {

            imageReady =
                false;

            posterImage.style.display =
                "none";

            if (emptyPreview) {

                emptyPreview.style.display =
                    "flex";

            }

            showMessage(
                "Unable to load image.",
                "error"
            );

        };

    posterImage.src =
        url;

}


/* =========================================================
   BASE SCALE
   ========================================================= */

function getBaseScale() {

    if (
        !imageReady ||
        !posterFrame ||
        !imageNaturalWidth ||
        !imageNaturalHeight
    ) {

        return 1;

    }

    const frameWidth =
        posterFrame.clientWidth;

    const frameHeight =
        posterFrame.clientHeight;

    if (
        !frameWidth ||
        !frameHeight
    ) {

        return 1;

    }

    const variant =
        getCurrentVariant();

    const imageWidth =
        imageNaturalWidth;

    const imageHeight =
        imageNaturalHeight;


    /* FIT */

    if (
        variant.mode ===
        "fit"
    ) {

        return Math.min(

            frameWidth /
                imageWidth,

            frameHeight /
                imageHeight

        );

    }


    /* FILL */

    return Math.max(

        frameWidth /
            imageWidth,

        frameHeight /
            imageHeight

    );

}


/* =========================================================
   IMAGE BOUNDS
   ========================================================= */

function getImageBounds() {

    if (!imageReady) {

        return {

            width: 0,
            height: 0

        };

    }

    const variant =
        getCurrentVariant();

    const baseScale =
        getBaseScale();

    const zoom =
        Number(
            variant.zoom
        ) / 100;

    const scale =
        baseScale *
        zoom;

    const angle =
        Number(
            variant.rotation || 0
        ) *
        Math.PI /
        180;

    const width =
        imageNaturalWidth *
        scale;

    const height =
        imageNaturalHeight *
        scale;

    const cos =
        Math.abs(
            Math.cos(angle)
        );

    const sin =
        Math.abs(
            Math.sin(angle)
        );

    return {

        width:
            width * cos +
            height * sin,

        height:
            width * sin +
            height * cos

    };

}


/* =========================================================
   CLAMP POSITION
   ========================================================= */

function clampPosition(
    x,
    y
) {

    if (
        !posterFrame ||
        !imageReady
    ) {

        return {

            x: 0,
            y: 0

        };

    }

    const frameWidth =
        posterFrame.clientWidth;

    const frameHeight =
        posterFrame.clientHeight;

    const bounds =
        getImageBounds();

    const variant =
        getCurrentVariant();


    /* FILL */

    if (
        variant.mode ===
        "fill"
    ) {

        const maxX =
            Math.max(
                0,
                (
                    bounds.width -
                    frameWidth
                ) / 2
            );

        const maxY =
            Math.max(
                0,
                (
                    bounds.height -
                    frameHeight
                ) / 2
            );

        return {

            x:
                Math.max(
                    -maxX,
                    Math.min(
                        maxX,
                        Number(x) || 0
                    )
                ),

            y:
                Math.max(
                    -maxY,
                    Math.min(
                        maxY,
                        Number(y) || 0
                    )
                )

        };

    }


    /* FIT */

    const maxX =
        Math.max(
            0,
            (
                bounds.width +
                frameWidth
            ) / 2
        );

    const maxY =
        Math.max(
            0,
            (
                bounds.height +
                frameHeight
            ) / 2
        );

    return {

        x:
            Math.max(
                -maxX,
                Math.min(
                    maxX,
                    Number(x) || 0
                )
            ),

        y:
            Math.max(
                -maxY,
                Math.min(
                    maxY,
                    Number(y) || 0
                )
            )

    };

}


/* =========================================================
   APPLY TRANSFORM
   ========================================================= */

function applyTransform() {

    if (
        !posterImage ||
        !imageReady
    ) {
        return;
    }

    const variant =
        getCurrentVariant();

    const safe =
        clampPosition(
            variant.x,
            variant.y
        );

    variant.x =
        safe.x;

    variant.y =
        safe.y;

    const baseScale =
        getBaseScale();

    const zoom =
        Number(
            variant.zoom || 100
        ) / 100;

    const scale =
        baseScale *
        zoom;

    posterImage.style.transform =
        `translate(-50%, -50%)
         translate(${safe.x}px, ${safe.y}px)
         scale(${scale})
         rotate(${variant.rotation || 0}deg)`;


    /* ZOOM UI */

    if (zoomSlider) {

        zoomSlider.value =
            String(
                variant.zoom
            );

    }

    if (zoomValue) {

        zoomValue.textContent =
            `${Math.round(
                variant.zoom
            )}%`;

    }


    /* ROTATION UI */

    if (rotationSlider) {

        rotationSlider.value =
            String(
                variant.rotation
            );

    }

    if (rotationValue) {

        rotationValue.textContent =
            `${Math.round(
                variant.rotation
            )}°`;

    }

}


/* =========================================================
   CENTER
   ========================================================= */

function centerImage() {

    const variant =
        getCurrentVariant();

    variant.x =
        0;

    variant.y =
        0;

    markCurrentVariantUnsaved();

    applyTransform();
    updateInfo();

}


/* =========================================================
   FIT
   ========================================================= */

function fitImage() {

    const variant =
        getCurrentVariant();

    variant.mode =
        "fit";

    variant.zoom =
        100;

    variant.x =
        0;

    variant.y =
        0;

    markCurrentVariantUnsaved();

    applyTransform();
    updateInfo();

    showMessage(
        `${currentSize} Fit`
    );

}


/* =========================================================
   FILL
   ========================================================= */

function fillImage() {

    const variant =
        getCurrentVariant();

    variant.mode =
        "fill";

    variant.zoom =
        Math.max(
            100,
            Number(
                variant.zoom || 100
            )
        );

    variant.x =
        0;

    variant.y =
        0;

    markCurrentVariantUnsaved();

    applyTransform();
    updateInfo();

    showMessage(
        `${currentSize} Fill`
    );

}


/* =========================================================
   RESET
   ========================================================= */

function resetImage() {

    const variant =
        getCurrentVariant();

    variant.mode =
        "fill";

    variant.zoom =
        100;

    variant.rotation =
        0;

    variant.x =
        0;

    variant.y =
        0;

    markCurrentVariantUnsaved();

    applyTransform();
    updateInfo();

    showMessage(
        `${currentSize} reset`
    );

}


/* =========================================================
   ROTATE LEFT
   ========================================================= */

function rotateLeft() {

    const variant =
        getCurrentVariant();

    variant.rotation -=
        90;

    if (
        variant.rotation <
        -180
    ) {

        variant.rotation +=
            360;

    }

    markCurrentVariantUnsaved();

    applyTransform();
    updateInfo();

}


/* =========================================================
   ROTATE RIGHT
   ========================================================= */

function rotateRight() {

    const variant =
        getCurrentVariant();

    variant.rotation +=
        90;

    if (
        variant.rotation >
        180
    ) {

        variant.rotation -=
            360;

    }

    markCurrentVariantUnsaved();

    applyTransform();
    updateInfo();

}


/* =========================================================
   FREE HAND DRAG
   ========================================================= */

function pointerDown(event) {

    if (
        !imageReady ||
        event.button !== 0
    ) {

        return;

    }

    event.preventDefault();

    dragging =
        true;

    dragStartPointerX =
        event.clientX;

    dragStartPointerY =
        event.clientY;

    const variant =
        getCurrentVariant();

    dragStartImageX =
        Number(
            variant.x || 0
        );

    dragStartImageY =
        Number(
            variant.y || 0
        );

    posterImage.classList.add(
        "dragging"
    );

    try {

        posterImage.setPointerCapture(
            event.pointerId
        );

    } catch {}

}


/* =========================================================
   POINTER MOVE
   ========================================================= */

function pointerMove(event) {

    if (!dragging) {
        return;
    }

    event.preventDefault();

    const variant =
        getCurrentVariant();

    const dx =
        event.clientX -
        dragStartPointerX;

    const dy =
        event.clientY -
        dragStartPointerY;

    variant.x =
        dragStartImageX +
        dx;

    variant.y =
        dragStartImageY +
        dy;

    variant.saved =
        false;

    updateVariantStatus();

    applyTransform();

}


/* =========================================================
   POINTER UP
   ========================================================= */

function pointerUp(event) {

    if (!dragging) {
        return;
    }

    dragging =
        false;

    posterImage.classList.remove(
        "dragging"
    );

    try {

        posterImage.releasePointerCapture(
            event.pointerId
        );

    } catch {}

    updateInfo();
    updateVariantStatus();

}


/* =========================================================
   MOUSE WHEEL ZOOM
   ========================================================= */

function wheelZoom(event) {

    if (!imageReady) {
        return;
    }

    event.preventDefault();

    const variant =
        getCurrentVariant();

    const change =
        event.deltaY < 0
            ? 5
            : -5;

    let zoom =
        Number(
            variant.zoom || 100
        );

    zoom += change;

    const minimumZoom =
        100;

    zoom =
        Math.max(
            minimumZoom,
            Math.min(
                300,
                zoom
            )
        );

    variant.zoom =
        zoom;

    markCurrentVariantUnsaved();

    applyTransform();
    updateInfo();

}


/* =========================================================
   SLIDER ZOOM
   ========================================================= */

function sliderZoom() {

    if (!zoomSlider) {
        return;
    }

    const variant =
        getCurrentVariant();

    let value =
        Number(
            zoomSlider.value
        );

    if (
        !Number.isFinite(value)
    ) {

        value =
            100;

    }

    value =
        Math.max(
            100,
            Math.min(
                300,
                value
            )
        );

    variant.zoom =
        value;

    zoomSlider.value =
        String(value);

    markCurrentVariantUnsaved();

    applyTransform();
    updateInfo();

}


/* =========================================================
   ROTATION SLIDER
   ========================================================= */

function sliderRotation() {

    if (
        !rotationSlider
    ) {
        return;
    }

    const variant =
        getCurrentVariant();

    let value =
        Number(
            rotationSlider.value
        );

    if (
        !Number.isFinite(value)
    ) {

        value =
            0;

    }

    variant.rotation =
        value;

    markCurrentVariantUnsaved();

    applyTransform();
    updateInfo();

}


/* =========================================================
   IMAGE UPLOAD
   ========================================================= */

function handleImageUpload(
    event
) {

    const file =
        event.target.files?.[0];

    if (!file) {
        return;
    }

    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        showMessage(
            "Please select an image.",
            "error"
        );

        return;

    }

    if (objectUrl) {

        URL.revokeObjectURL(
            objectUrl
        );

    }

    objectUrl =
        URL.createObjectURL(
            file
        );

    const variant =
        getCurrentVariant();

    variant.imageUrl =
        objectUrl;

    variant.imageSource =
        "";

    variant.saved =
        false;

    variant.mode =
        "fill";

    variant.zoom =
        100;

    variant.rotation =
        0;

    variant.x =
        0;

    variant.y =
        0;

    setImageSource(
        objectUrl
    );

    updateInfo();
    updateVariantStatus();

    showMessage(
        `${currentSize} image changed`
    );

}


/* =========================================================
   LOAD CURRENT VARIANT
   ========================================================= */

async function loadCurrentVariant() {

    const variant =
        getCurrentVariant();

    const url =
        variant.imageUrl ||
        originalImageUrl;

    setImageSource(
        url
    );

    updateOrientationButtons();
    updateInfo();
    updateVariantStatus();

    requestAnimationFrame(
        () => {

            resizeFrame();
            applyTransform();

        }
    );

}


/* =========================================================
   CHANGE SIZE
   ========================================================= */

async function changeSize(
    size
) {

    if (
        !variants[size]
    ) {

        return;

    }

    currentSize =
        size;

    updateSizeButtons();
    updateOrientationButtons();
    updateInfo();
    updateVariantStatus();

    await loadCurrentVariant();

}


/* =========================================================
   CHANGE ORIENTATION
   ========================================================= */

function changeOrientation(
    orientation
) {

    if (
        orientation !==
            "vertical" &&
        orientation !==
            "horizontal"
    ) {

        return;

    }

    const variant =
        getCurrentVariant();

    if (
        variant.orientation ===
        orientation
    ) {

        return;

    }

    variant.orientation =
        orientation;

    variant.x =
        0;

    variant.y =
        0;

    variant.saved =
        false;

    updateOrientationButtons();

    updateInfo();

    updateVariantStatus();

    resizeFrame();

    applyTransform();

    showMessage(
        `${currentSize} ${orientation}`
    );

}


/* =========================================================
   LOAD SAVED VARIANTS
   ========================================================= */

function loadSavedVariants() {

    if (!product) {
        return;
    }

    const edits =
        getPosterEdits();

    [
        "A6",
        "A5",
        "A4",
        "A3"
    ].forEach(
        size => {

            const saved =
                edits[size];

            if (!saved) {
                return;
            }

            const variant =
                variants[size];

            /*
               OLD FORMAT
            */

            if (
                typeof saved ===
                "string"
            ) {

                variant.imageUrl =
                    getPublicUrl(
                        saved
                    );

                variant.imageSource =
                    saved;

                variant.saved =
                    true;

                return;

            }

            if (
                typeof saved !==
                "object"
            ) {

                return;

            }

            /*
               IMAGE PATH
            */

            if (
                saved.path
            ) {

                variant.imageUrl =
                    getPublicUrl(
                        saved.path
                    );

                variant.imageSource =
                    saved.path;

                variant.saved =
                    true;

            }

            /*
               ORIENTATION
            */

            if (
                saved.orientation ===
                    "horizontal" ||
                saved.orientation ===
                    "vertical"
            ) {

                variant.orientation =
                    saved.orientation;

            }

            /*
               ZOOM
            */

            if (
                Number.isFinite(
                    Number(
                        saved.zoom
                    )
                )
            ) {

                variant.zoom =
                    Math.max(
                        50,
                        Math.min(
                            300,
                            Number(
                                saved.zoom
                            )
                        )
                    );

            }

            /*
               ROTATION
            */

            if (
                Number.isFinite(
                    Number(
                        saved.rotation
                    )
                )
            ) {

                variant.rotation =
                    Number(
                        saved.rotation
                    );

            }

            /*
               X
            */

            if (
                Number.isFinite(
                    Number(
                        saved.x
                    )
                )
            ) {

                variant.x =
                    Number(
                        saved.x
                    );

            }

            /*
               Y
            */

            if (
                Number.isFinite(
                    Number(
                        saved.y
                    )
                )
            ) {

                variant.y =
                    Number(
                        saved.y
                    );

            }

            /*
               MODE
            */

            if (
                saved.mode ===
                    "fit" ||
                saved.mode ===
                    "fill"
            ) {

                variant.mode =
                    saved.mode;

            }

        }
    );

}


/* =========================================================
   LOAD PRODUCT
   ========================================================= */

async function loadProduct() {

    if (!productId) {

        throw new Error(
            "No product ID."
        );

    }

    if (!db) {

        throw new Error(
            "Supabase client unavailable."
        );

    }

    const {
        data,
        error
    } =
        await db
            .from("products")
            .select("*")
            .eq(
                "id",
                productId
            )
            .single();

    if (error) {
        throw error;
    }

    if (!data) {

        throw new Error(
            "Poster not found."
        );

    }

    product =
        data;

    if (productTitle) {

        productTitle.textContent =
            product.title ||
            "Untitled Poster";

    }

    originalImagePath =
        product.image_path ||
        "";

    originalImageUrl =
        getPublicUrl(
            originalImagePath
        );

    loadSavedVariants();

    const edits =
        getPosterEdits();

    const a4HasOrientation =
        edits.A4 &&
        typeof edits.A4 ===
        "object" &&
        (
            edits.A4.orientation ===
                "horizontal" ||
            edits.A4.orientation ===
                "vertical"
        );

    if (
        !a4HasOrientation &&
        product.orientation ===
            "horizontal"
    ) {

        variants.A4.orientation =
            "horizontal";

    }

    currentSize =
        "A4";

    updateSizeButtons();
    updateOrientationButtons();
    updateInfo();
    updateVariantStatus();

    await loadCurrentVariant();

}


/* =========================================================
   CREATE EXPORT CANVAS
   ========================================================= */

async function createVariantCanvas(
    size
) {

    const variant =
        variants[size];

    if (!variant) {

        throw new Error(
            "Variant not found."
        );

    }

    const url =
        variant.imageUrl ||
        originalImageUrl;

    if (!url) {

        throw new Error(
            `${size} has no image.`
        );

    }

    const image =
        await loadImage(
            url
        );

    const dimensions =
        getDimensions(
            size,
            variant.orientation
        );

    const EXPORT_LONG =
        1800;

    let canvasWidth;
    let canvasHeight;

    if (
        dimensions.width >=
        dimensions.height
    ) {

        canvasWidth =
            EXPORT_LONG;

        canvasHeight =
            Math.round(
                EXPORT_LONG *
                dimensions.height /
                dimensions.width
            );

    } else {

        canvasHeight =
            EXPORT_LONG;

        canvasWidth =
            Math.round(
                EXPORT_LONG *
                dimensions.width /
                dimensions.height
            );

    }

    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.width =
        canvasWidth;

    canvas.height =
        canvasHeight;

    const ctx =
        canvas.getContext(
            "2d"
        );

    ctx.imageSmoothingEnabled =
        true;

    ctx.imageSmoothingQuality =
        "high";

    const stage =
        getStage();

    let frameWidth =
        posterFrame.clientWidth;

    let frameHeight =
        posterFrame.clientHeight;

    if (
        size !== currentSize &&
        stage
    ) {

        const stageWidth =
            stage.clientWidth;

        const stageHeight =
            stage.clientHeight;

        const availableWidth =
            Math.max(
                220,
                stageWidth - 120
            );

        const availableHeight =
            Math.max(
                260,
                stageHeight - 120
            );

        const ratio =
            dimensions.width /
            dimensions.height;

        let a4Width =
            availableWidth;

        let a4Height =
            a4Width /
            ratio;

        if (
            a4Height >
            availableHeight
        ) {

            a4Height =
                availableHeight;

            a4Width =
                a4Height *
                ratio;

        }

        const scale =
            VISUAL_SCALE[size] || 1;

        frameWidth =
            a4Width *
            scale;

        frameHeight =
            a4Height *
            scale;

    }

    let baseScale;

    if (
        variant.mode ===
        "fit"
    ) {

        baseScale =
            Math.min(

                frameWidth /
                    image.naturalWidth,

                frameHeight /
                    image.naturalHeight

            );

    } else {

        baseScale =
            Math.max(

                frameWidth /
                    image.naturalWidth,

                frameHeight /
                    image.naturalHeight

            );

    }

    const zoom =
        Number(
            variant.zoom || 100
        ) / 100;

    const scale =
        baseScale *
        zoom;

    const angle =
        Number(
            variant.rotation || 0
        ) *
        Math.PI /
        180;

    const exportScale =
        canvasWidth /
        frameWidth;

    ctx.save();

    ctx.translate(
        canvasWidth / 2,
        canvasHeight / 2
    );

    ctx.translate(

        Number(
            variant.x || 0
        ) *
        exportScale,

        Number(
            variant.y || 0
        ) *
        exportScale

    );

    ctx.rotate(
        angle
    );

    ctx.scale(

        scale *
            exportScale,

        scale *
            exportScale

    );

    ctx.drawImage(

        image,

        -image.naturalWidth / 2,

        -image.naturalHeight / 2

    );

    ctx.restore();

    return canvas;

}


/* =========================================================
   LOAD IMAGE
   ========================================================= */

function loadImage(
    url
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const image =
                new Image();

            image.crossOrigin =
                "anonymous";

            image.onload =
                () =>
                    resolve(
                        image
                    );

            image.onerror =
                () =>
                    reject(
                        new Error(
                            "Image could not be loaded."
                        )
                    );

            image.src =
                url;

        }
    );

}


/* =========================================================
   DOWNLOAD BLOB
   ========================================================= */

function downloadBlob(
    blob,
    filename
) {

    const url =
        URL.createObjectURL(
            blob
        );

    const link =
        document.createElement(
            "a"
        );

    link.href =
        url;

    link.download =
        filename;

    document.body.appendChild(
        link
    );

    link.click();

    link.remove();

    setTimeout(
        () =>
            URL.revokeObjectURL(
                url
            ),
        1000
    );

}


/* =========================================================
   DOWNLOAD CURRENT
   ========================================================= */

async function downloadCurrentVariant() {

    try {

        const canvas =
            await createVariantCanvas(
                currentSize
            );

        const blob =
            await new Promise(
                resolve =>
                    canvas.toBlob(
                        resolve,
                        "image/png"
                    )
            );

        if (!blob) {

            throw new Error(
                "Could not create image."
            );

        }

        downloadBlob(
            blob,
            `Zavyro-${currentSize}.png`
        );

    } catch (error) {

        console.error(
            error
        );

        showMessage(
            error.message ||
                "Download failed.",
            "error"
        );

    }

}


/* =========================================================
   DOWNLOAD ALL
   ========================================================= */

async function downloadAllVariants() {

    try {

        for (
            const size of
            [
                "A6",
                "A5",
                "A4",
                "A3"
            ]
        ) {

            const variant =
                variants[size];

            if (
                !variant.saved &&
                !variant.imageUrl &&
                size !== currentSize
            ) {

                continue;

            }

            const canvas =
                await createVariantCanvas(
                    size
                );

            const blob =
                await new Promise(
                    resolve =>
                        canvas.toBlob(
                            resolve,
                            "image/png"
                        )
                );

            if (blob) {

                downloadBlob(
                    blob,
                    `Zavyro-${size}.png`
                );

            }

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        250
                    )
            );

        }

        showMessage(
            "Variants downloaded."
        );

    } catch (error) {

        console.error(
            error
        );

        showMessage(
            error.message ||
                "Download failed.",
            "error"
        );

    }

}


/* =========================================================
   SAVE CURRENT VARIANT
   ========================================================= */

async function saveCurrentVariant() {

    if (!productId) {

        showMessage(
            "Product ID missing.",
            "error"
        );

        return;

    }

    if (!db) {

        showMessage(
            "Supabase unavailable.",
            "error"
        );

        return;

    }

    const variant =
        getCurrentVariant();

    try {

        saveVariantBtn.disabled =
            true;

        saveVariantBtn.textContent =
            `Saving ${currentSize}...`;

        const canvas =
            await createVariantCanvas(
                currentSize
            );

        const blob =
            await new Promise(
                (
                    resolve,
                    reject
                ) => {

                    canvas.toBlob(
                        result => {

                            if (result) {

                                resolve(
                                    result
                                );

                            } else {

                                reject(
                                    new Error(
                                        "PNG creation failed."
                                    )
                                );

                            }

                        },
                        "image/png"
                    );

                }
            );

        const path =
            `products/${productId}/${currentSize}.png`;

        const {
    error:
        uploadError
} =
    await db
        .storage
        .from("posters")
        .upload(
            path,
            blob,
            {
                cacheControl:
                    "31536000",

                contentType:
                    "image/png",

                upsert:
                    true
            }
        );

        if (uploadError) {
            throw uploadError;
        }

        let posterEdits =
            getPosterEdits();

        posterEdits =
            JSON.parse(
                JSON.stringify(
                    posterEdits
                )
            );

        posterEdits[
            currentSize
        ] = {

            path:
                path,

            orientation:
                variant.orientation,

            zoom:
                Number(
                    variant.zoom
                ),

            rotation:
                Number(
                    variant.rotation
                ),

            x:
                Number(
                    variant.x
                ),

            y:
                Number(
                    variant.y
                ),

            mode:
                variant.mode,

            updated_at:
                new Date().toISOString()

        };

        let availableSizes =
            Array.isArray(
                product.available_sizes
            )
                ? [
                    ...product.available_sizes
                ]
                : [];

        if (
            !availableSizes.includes(
                currentSize
            )
        ) {

            availableSizes.push(
                currentSize
            );

        }

        availableSizes =
            [
                "A6",
                "A5",
                "A4",
                "A3"
            ].filter(
                size =>
                    availableSizes.includes(
                        size
                    )
            );

        const {
            data,
            error:
                updateError
        } =
            await db
                .from("products")
                .update({

                    poster_edits:
                        posterEdits,

                    available_sizes:
                        availableSizes,

                    updated_at:
                        new Date().toISOString()

                })
                .eq(
                    "id",
                    productId
                )
                .select()
                .single();

        if (updateError) {
            throw updateError;
        }

        if (data) {

            product =
                data;

        }

        /*
           SAVE SUCCESS
        */

        variant.saved =
            true;

        variant.imageUrl =
            getPublicUrl(
                path
            );

        variant.imageSource =
            path;

        showMessage(
            `${currentSize} saved successfully.`
        );

        updateInfo();
        updateVariantStatus();

    } catch (error) {

        console.error(
            "SAVE ERROR:",
            error
        );

        /*
           Saving failed, therefore
           keep the variant unsaved.
        */

        variant.saved =
            false;

        updateInfo();
        updateVariantStatus();

        showMessage(
            error.message ||
                "Unable to save.",
            "error"
        );

    } finally {

        saveVariantBtn.disabled =
            false;

        saveVariantBtn.textContent =
            `Save ${currentSize} Variant`;

    }

}


/* =========================================================
   RESTORE ORIGINAL
   ========================================================= */

async function restoreOriginal() {

    const confirmed =
        confirm(
            `Restore original image for ${currentSize}?`
        );

    if (!confirmed) {
        return;
    }

    const variant =
        getCurrentVariant();

    variant.imageUrl =
        "";

    variant.imageSource =
        "";

    variant.saved =
        false;

    variant.zoom =
        100;

    variant.rotation =
        0;

    variant.x =
        0;

    variant.y =
        0;

    variant.mode =
        "fill";

    setImageSource(
        originalImageUrl
    );

    updateInfo();
    updateVariantStatus();

    showMessage(
        `${currentSize} restored.`
    );

}


/* =========================================================
   RESTORE BUTTON
   ========================================================= */

function createRestoreButton() {

    const tools =
        document.querySelector(
            ".tool-grid"
        );

    if (!tools) {
        return;
    }

    if (
        document.getElementById(
            "restoreOriginalBtn"
        )
    ) {

        return;

    }

    const button =
        document.createElement(
            "button"
        );

    button.type =
        "button";

    button.className =
        "tool-btn danger";

    button.id =
        "restoreOriginalBtn";

    button.textContent =
        "Restore Original";

    button.addEventListener(
        "click",
        restoreOriginal
    );

    tools.appendChild(
        button
    );

}


/* =========================================================
   EVENTS
   ========================================================= */


/* SIZE */

document
    .querySelectorAll(
        ".size-btn"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const size =
                        button.dataset.size;

                    changeSize(
                        size
                    );

                }
            );

        }
    );


/* ORIENTATION */

document
    .querySelectorAll(
        ".orientation-btn"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    let orientation =
                        button.dataset.orientation;

                    if (
                        orientation !==
                            "vertical" &&
                        orientation !==
                            "horizontal"
                    ) {

                        const text =
                            button.textContent
                                .trim()
                                .toLowerCase();

                        if (
                            text.includes(
                                "horizontal"
                            ) ||
                            text.includes(
                                "landscape"
                            )
                        ) {

                            orientation =
                                "horizontal";

                        } else if (
                            text.includes(
                                "vertical"
                            ) ||
                            text.includes(
                                "portrait"
                            )
                        ) {

                            orientation =
                                "vertical";

                        }

                    }

                    if (
                        orientation ===
                            "vertical" ||
                        orientation ===
                            "horizontal"
                    ) {

                        changeOrientation(
                            orientation
                        );

                    }

                }
            );

        }
    );


/* IMAGE UPLOAD */

if (imageInput) {

    imageInput.addEventListener(
        "change",
        handleImageUpload
    );

}


/* FIT */

if (fitBtn) {

    fitBtn.addEventListener(
        "click",
        fitImage
    );

}


/* FILL */

if (fillBtn) {

    fillBtn.addEventListener(
        "click",
        fillImage
    );

}


/* CENTER */

if (centerBtn) {

    centerBtn.addEventListener(
        "click",
        centerImage
    );

}


/* RESET */

if (resetBtn) {

    resetBtn.addEventListener(
        "click",
        resetImage
    );

}


/* ROTATE LEFT */

if (rotateLeftBtn) {

    rotateLeftBtn.addEventListener(
        "click",
        rotateLeft
    );

}


/* ROTATE RIGHT */

if (rotateRightBtn) {

    rotateRightBtn.addEventListener(
        "click",
        rotateRight
    );

}


/* =========================================================
   ZOOM
   ========================================================= */

if (zoomSlider) {

    zoomSlider.min =
        "50";

    zoomSlider.max =
        "300";

    zoomSlider.step =
        "1";

    zoomSlider.value =
        "100";

    zoomSlider.addEventListener(
        "input",
        sliderZoom
    );

}


/* =========================================================
   ROTATION
   ========================================================= */

if (rotationSlider) {

    rotationSlider.min =
        "-180";

    rotationSlider.max =
        "180";

    rotationSlider.step =
        "1";

    rotationSlider.value =
        "0";

    rotationSlider.addEventListener(
        "input",
        sliderRotation
    );

}


/* =========================================================
   FREE HAND
   ========================================================= */

if (posterImage) {

    posterImage.addEventListener(
        "pointerdown",
        pointerDown
    );

    posterImage.addEventListener(
        "pointermove",
        pointerMove
    );

    posterImage.addEventListener(
        "pointerup",
        pointerUp
    );

    posterImage.addEventListener(
        "pointercancel",
        pointerUp
    );

    posterImage.addEventListener(
        "wheel",
        wheelZoom,
        {
            passive: false
        }
    );

    posterImage.addEventListener(
        "contextmenu",
        event =>
            event.preventDefault()
    );

}


/* =========================================================
   SAVE
   ========================================================= */

if (saveVariantBtn) {

    saveVariantBtn.addEventListener(
        "click",
        saveCurrentVariant
    );

}


/* =========================================================
   DOWNLOAD CURRENT
   ========================================================= */

if (downloadVariantBtn) {

    downloadVariantBtn.addEventListener(
        "click",
        downloadCurrentVariant
    );

}


/* =========================================================
   DOWNLOAD ALL
   ========================================================= */

if (downloadAllBtn) {

    downloadAllBtn.addEventListener(
        "click",
        downloadAllVariants
    );

}


/* =========================================================
   BACK
   ========================================================= */

if (backBtn) {

    backBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "admin-products.html";

        }
    );

}


/* =========================================================
   WINDOW RESIZE
   ========================================================= */

window.addEventListener(
    "resize",
    () => {

        resizeFrame();

    }
);


/* =========================================================
   LOADING ERROR
   ========================================================= */

function showLoadingError(
    error
) {

    if (!loadingScreen) {
        return;
    }

    loadingScreen.innerHTML = `

        <div
            class="loading-content"
            style="
                max-width:500px;
                padding:25px;
            "
        >

            <div class="loading-logo">
                Z
            </div>

            <strong>
                Unable to open Poster Editor
            </strong>

            <p
                style="
                    color:#f87171;
                    margin-top:12px;
                "
            >
                ${String(
                    error?.message ||
                    "Unknown error"
                )}
            </p>

            <button
                id="errorBackBtn"
                class="back-btn"
                style="margin-top:15px;"
            >
                Back to Manage Posters
            </button>

        </div>

    `;

    const button =
        document.getElementById(
            "errorBackBtn"
        );

    if (button) {

        button.addEventListener(
            "click",
            () => {

                window.location.href =
                    "admin-products.html";

            }
        );

    }

}


/* =========================================================
   START EDITOR
   ========================================================= */

async function startEditor() {

    try {

        productId =
            getProductId();

        if (!productId) {

            throw new Error(
                "Missing product ID."
            );

        }

        if (!db) {

            throw new Error(
                "Supabase client unavailable."
            );

        }

        await loadProduct();

        createRestoreButton();

        requestAnimationFrame(
            () => {

                resizeFrame();
                applyTransform();

            }
        );

        if (loadingScreen) {

            loadingScreen.classList.add(
                "hidden"
            );

        }

        console.log(
            "Zavyro Poster Editor ready:",
            productId
        );

    } catch (error) {

        console.error(
            "EDITOR ERROR:",
            error
        );

        showLoadingError(
            error
        );

    }

}


/* =========================================================
   START
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startEditor
    );

} else {

    startEditor();

}


window.startEditor =
    startEditor;