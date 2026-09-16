
"use strict";

/* =========================================================
   PRICES
========================================================= */

const prices = {
    A3: 249,
    A4: 179,
    A5: 129,
    A6: 99
};


/* =========================================================
   STATE
========================================================= */

const photos = [];

let selectedPhotoId = null;

let dragging = false;

let pointerStartX = 0;
let pointerStartY = 0;

let photoStartX = 0;
let photoStartY = 0;


/* =========================================================
   ELEMENTS
========================================================= */

const photoInput =
    document.getElementById("photoInput");

const photoList =
    document.getElementById("photoList");

const photoCount =
    document.getElementById("photoCount");

const poster =
    document.getElementById("posterPreview");

const previewImage =
    document.getElementById("previewImage");

const previewEmpty =
    document.getElementById("previewEmpty");

const previewInfo =
    document.getElementById("previewInfo");

const editorControls =
    document.getElementById("editorControls");

const zoomRange =
    document.getElementById("zoomRange");

const zoomValue =
    document.getElementById("zoomValue");

const minusBtn =
    document.getElementById("minusBtn");

const plusBtn =
    document.getElementById("plusBtn");

const quantityValue =
    document.getElementById("quantityValue");

const rotateLeftBtn =
    document.getElementById("rotateLeftBtn");

const rotateRightBtn =
    document.getElementById("rotateRightBtn");

const resetBtn =
    document.getElementById("resetPositionBtn");

const orderFooter =
    document.getElementById("orderFooter");

const grandTotal =
    document.getElementById("grandTotal");

const addAllBtn =
    document.getElementById("addAllBtn");

const customMessage =
    document.getElementById("customMessage");

const cartCount =
    document.getElementById("cartCount");


/* =========================================================
   HELPERS
========================================================= */

function getSelectedPhoto() {

    return photos.find(
        function (photo) {
            return photo.id === selectedPhotoId;
        }
    ) || null;
}


function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function clamp(value, min, max) {

    return Math.max(
        min,
        Math.min(max, value)
    );
}


/* =========================================================
   UPLOAD
========================================================= */

photoInput.addEventListener(
    "change",
    function (event) {

        const files =
            Array.from(
                event.target.files || []
            );


        files.forEach(
            function (file) {

                if (
                    !file.type ||
                    !file.type.startsWith("image/")
                ) {
                    return;
                }


                const reader =
                    new FileReader();


                reader.onload =
                    function () {

                        const image =
                            new Image();


                        image.onload =
                            function () {

                                const photo = {

                                    id:
                                        "custom-" +
                                        Date.now() +
                                        "-" +
                                        Math.random()
                                            .toString(36)
                                            .slice(2, 9),

                                    name:
                                        file.name,

                                    src:
                                        reader.result,

                                    width:
                                        image.naturalWidth,

                                    height:
                                        image.naturalHeight,

                                    size:
                                        "A4",

                                    fit:
                                        "fill",

                                    zoom:
                                        1,

                                    scale:
                                        1,

                                    rotation:
                                        0,

                                    x:
                                        0,

                                    y:
                                        0,

                                    quantity:
                                        1
                                };


                                photos.push(
                                    photo
                                );


                                if (
                                    selectedPhotoId === null
                                ) {

                                    selectedPhotoId =
                                        photo.id;
                                }


                                prepareNewPhoto(
                                    photo
                                );


                                renderAll();
                            };


                        image.src =
                            reader.result;
                    };


                reader.readAsDataURL(file);
            }
        );


        photoInput.value = "";
    }
);


/* =========================================================
   INITIAL SCALE
========================================================= */

function prepareNewPhoto(photo) {

    const canvasWidth =
        poster.clientWidth || 260;

    const canvasHeight =
        poster.clientHeight || 368;


    let imageWidth =
        photo.width;

    let imageHeight =
        photo.height;


    if (
        photo.rotation === 90 ||
        photo.rotation === 270
    ) {

        imageWidth =
            photo.height;

        imageHeight =
            photo.width;
    }


    if (photo.fit === "fill") {

        photo.scale =
            Math.max(
                canvasWidth / imageWidth,
                canvasHeight / imageHeight
            );

    } else {

        photo.scale =
            Math.min(
                canvasWidth / imageWidth,
                canvasHeight / imageHeight
            );
    }
}


/* =========================================================
   MAIN RENDER
========================================================= */

function renderAll() {

    renderPhotoList();

    renderPreview();

    renderTotals();

    renderApplyButtons();

    updateCartCount();
}


/* =========================================================
   PHOTO LIST
========================================================= */

function renderPhotoList() {

    if (!photos.length) {

        photoList.innerHTML =
            '<div class="empty-state">' +
            'Your uploaded photos will appear here.' +
            '</div>';

        photoCount.textContent =
            "0 photos selected";

        return;
    }


    photoList.innerHTML = "";


    photos.forEach(
        function (photo) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "photo-item" +
                (
                    photo.id === selectedPhotoId
                        ? " active"
                        : ""
                );


            item.dataset.id =
                photo.id;


            const total =
                prices[photo.size] *
                photo.quantity;


            item.innerHTML =
                '<div class="photo-thumb">' +
                    '<img src="' +
                    escapeHtml(photo.src) +
                    '" alt="Uploaded photo">' +
                '</div>' +

                '<div class="photo-item-info">' +

                    '<div class="photo-item-name" ' +
                    'title="' +
                    escapeHtml(photo.name) +
                    '">' +
                        escapeHtml(photo.name) +
                    '</div>' +

                    '<div class="photo-item-size">' +
                        photo.size +
                        " · Qty " +
                        photo.quantity +
                    '</div>' +

                '</div>' +

                '<div class="photo-item-price">' +
                    "₹" +
                    total +
                '</div>' +

                '<button ' +
                    'type="button" ' +
                    'class="remove-photo" ' +
                    'data-remove-id="' +
                    photo.id +
                    '" ' +
                    'title="Remove photo">' +
                    "×" +
                '</button>';


            photoList.appendChild(
                item
            );
        }
    );


    photoCount.textContent =
        photos.length +
        (
            photos.length === 1
                ? " photo selected"
                : " photos selected"
        );
}


/* =========================================================
   PHOTO LIST CLICK
========================================================= */

photoList.addEventListener(
    "click",
    function (event) {

        const removeButton =
            event.target.closest(
                "[data-remove-id]"
            );


        if (removeButton) {

            event.stopPropagation();

            removePhoto(
                removeButton.dataset.removeId
            );

            return;
        }


        const item =
            event.target.closest(
                ".photo-item"
            );


        if (!item) {
            return;
        }


        selectedPhotoId =
            item.dataset.id;


        renderAll();
    }
);


/* =========================================================
   REMOVE
========================================================= */

function removePhoto(id) {

    const index =
        photos.findIndex(
            function (photo) {
                return photo.id === id;
            }
        );


    if (index === -1) {
        return;
    }


    photos.splice(
        index,
        1
    );


    if (
        selectedPhotoId === id
    ) {

        selectedPhotoId =
            photos.length
                ? photos[0].id
                : null;
    }


    renderAll();
}


/* =========================================================
   PREVIEW
========================================================= */

function renderPreview() {

    const photo =
        getSelectedPhoto();


    if (!photo) {

        previewImage.style.display =
            "none";

        previewImage.removeAttribute(
            "src"
        );

        previewEmpty.style.display =
            "flex";

        editorControls.style.display =
            "none";

        previewInfo.textContent =
            "Upload a photo to see the preview.";

        return;
    }


    poster.classList.remove(
        "a3",
        "a4",
        "a5",
        "a6"
    );


    poster.classList.add(
        photo.size.toLowerCase()
    );


    previewImage.src =
        photo.src;


    previewImage.style.display =
        "block";


    previewEmpty.style.display =
        "none";


    editorControls.style.display =
        "block";


    previewInfo.textContent =
        photo.name +
        " · " +
        photo.size;


    updateSizeButtons();

    updateFitButtons();


    zoomRange.value =
        photo.zoom;


    zoomValue.textContent =
        Math.round(
            photo.zoom * 100
        ) +
        "%";


    quantityValue.textContent =
        photo.quantity;


    requestAnimationFrame(
        function () {
            drawImage();
        }
    );
}


/* =========================================================
   SIZE BUTTONS
========================================================= */

function updateSizeButtons() {

    const photo =
        getSelectedPhoto();


    if (!photo) {
        return;
    }


    document
        .querySelectorAll(".size-btn")
        .forEach(
            function (button) {

                button.classList.toggle(
                    "active",
                    button.dataset.size ===
                    photo.size
                );
            }
        );
}


document
    .querySelectorAll(".size-btn")
    .forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const photo =
                        getSelectedPhoto();


                    if (!photo) {
                        return;
                    }


                    /*
                       ONLY poster size changes.
                    */

                    photo.size =
                        button.dataset.size;


                    renderAll();
                }
            );
        }
    );


/* =========================================================
   APPLY SAME SIZE TO ALL
========================================================= */

function renderApplyButtons() {

    if (!photos.length) {
        return;
    }


    const firstSize =
        photos[0].size;


    const allSame =
        photos.every(
            function (photo) {

                return photo.size ===
                    firstSize;
            }
        );


    document
        .querySelectorAll(
            ".apply-size-btn"
        )
        .forEach(
            function (button) {

                button.classList.toggle(
                    "active",
                    allSame &&
                    button.dataset.applySize ===
                    firstSize
                );
            }
        );
}


document
    .querySelectorAll(
        ".apply-size-btn"
    )
    .forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const size =
                        button.dataset.applySize;


                    photos.forEach(
                        function (photo) {

                            photo.size =
                                size;
                        }
                    );


                    renderAll();


                    showMessage(
                        size +
                        " applied to all photos."
                    );
                }
            );
        }
    );


/* =========================================================
   FIT / FILL
========================================================= */

function updateFitButtons() {

    const photo =
        getSelectedPhoto();


    if (!photo) {
        return;
    }


    document
        .querySelectorAll(
            ".fit-btn"
        )
        .forEach(
            function (button) {

                button.classList.toggle(
                    "active",
                    button.dataset.fit ===
                    photo.fit
                );
            }
        );
}


document
    .querySelectorAll(".fit-btn")
    .forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const photo =
                        getSelectedPhoto();


                    if (!photo) {
                        return;
                    }


                    photo.fit =
                        button.dataset.fit;


                    photo.x = 0;
                    photo.y = 0;


                    calculateScale(
                        photo
                    );


                    updateFitButtons();

                    drawImage();
                }
            );
        }
    );


/* =========================================================
   SCALE
========================================================= */

function calculateScale(photo) {

    const canvasWidth =
        poster.clientWidth;

    const canvasHeight =
        poster.clientHeight;


    if (
        !canvasWidth ||
        !canvasHeight
    ) {
        return;
    }


    let imageWidth =
        photo.width;

    let imageHeight =
        photo.height;


    if (
        photo.rotation === 90 ||
        photo.rotation === 270
    ) {

        imageWidth =
            photo.height;

        imageHeight =
            photo.width;
    }


    if (photo.fit === "fill") {

        photo.scale =
            Math.max(
                canvasWidth / imageWidth,
                canvasHeight / imageHeight
            );

    } else {

        photo.scale =
            Math.min(
                canvasWidth / imageWidth,
                canvasHeight / imageHeight
            );
    }
}


/* =========================================================
   DRAW PREVIEW
========================================================= */

function drawImage() {

    const photo =
        getSelectedPhoto();


    if (!photo) {
        return;
    }


    const displayWidth =
        photo.width *
        photo.scale *
        photo.zoom;


    const displayHeight =
        photo.height *
        photo.scale *
        photo.zoom;


    let boundWidth =
        displayWidth;

    let boundHeight =
        displayHeight;


    if (
        photo.rotation === 90 ||
        photo.rotation === 270
    ) {

        boundWidth =
            displayHeight;

        boundHeight =
            displayWidth;
    }


    if (photo.fit === "fill") {

        const canvasWidth =
            poster.clientWidth;

        const canvasHeight =
            poster.clientHeight;


        const maxX =
            Math.max(
                0,
                (
                    boundWidth -
                    canvasWidth
                ) / 2
            );


        const maxY =
            Math.max(
                0,
                (
                    boundHeight -
                    canvasHeight
                ) / 2
            );


        photo.x =
            clamp(
                photo.x,
                -maxX,
                maxX
            );


        photo.y =
            clamp(
                photo.y,
                -maxY,
                maxY
            );
    }


    previewImage.style.width =
        displayWidth +
        "px";


    previewImage.style.height =
        displayHeight +
        "px";


    previewImage.style.left =
        "50%";


    previewImage.style.top =
        "50%";


    previewImage.style.transform =
        "translate(-50%, -50%) " +
        "translate(" +
        photo.x +
        "px, " +
        photo.y +
        "px" +
        ") rotate(" +
        photo.rotation +
        "deg)";
}


/* =========================================================
   ROTATE
========================================================= */

rotateLeftBtn.addEventListener(
    "click",
    function () {

        const photo =
            getSelectedPhoto();


        if (!photo) {
            return;
        }


        photo.rotation -= 90;


        if (
            photo.rotation < 0
        ) {
            photo.rotation += 360;
        }


        photo.x = 0;
        photo.y = 0;


        calculateScale(
            photo
        );


        drawImage();
    }
);


rotateRightBtn.addEventListener(
    "click",
    function () {

        const photo =
            getSelectedPhoto();


        if (!photo) {
            return;
        }


        photo.rotation += 90;


        if (
            photo.rotation >= 360
        ) {
            photo.rotation -= 360;
        }


        photo.x = 0;
        photo.y = 0;


        calculateScale(
            photo
        );


        drawImage();
    }
);


/* =========================================================
   RESET
========================================================= */

resetBtn.addEventListener(
    "click",
    function () {

        const photo =
            getSelectedPhoto();


        if (!photo) {
            return;
        }


        photo.x = 0;
        photo.y = 0;

        photo.zoom = 1;

        photo.rotation = 0;

        photo.fit = "fill";


        calculateScale(
            photo
        );


        renderAll();
    }
);


/* =========================================================
   ZOOM
========================================================= */

zoomRange.addEventListener(
    "input",
    function () {

        const photo =
            getSelectedPhoto();


        if (!photo) {
            return;
        }


        photo.zoom =
            Number(
                zoomRange.value
            );


        zoomValue.textContent =
            Math.round(
                photo.zoom * 100
            ) +
            "%";


        drawImage();
    }
);


/* =========================================================
   DRAG
========================================================= */

poster.addEventListener(
    "pointerdown",
    function (event) {

        const photo =
            getSelectedPhoto();


        if (!photo) {
            return;
        }


        event.preventDefault();


        dragging = true;


        pointerStartX =
            event.clientX;


        pointerStartY =
            event.clientY;


        photoStartX =
            photo.x;


        photoStartY =
            photo.y;


        poster.classList.add(
            "dragging"
        );


        try {

            poster.setPointerCapture(
                event.pointerId
            );

        } catch (error) {
            console.warn(error);
        }
    }
);


poster.addEventListener(
    "pointermove",
    function (event) {

        if (!dragging) {
            return;
        }


        const photo =
            getSelectedPhoto();


        if (!photo) {
            return;
        }


        photo.x =
            photoStartX +
            (
                event.clientX -
                pointerStartX
            );


        photo.y =
            photoStartY +
            (
                event.clientY -
                pointerStartY
            );


        drawImage();
    }
);


function finishDrag() {

    dragging = false;

    poster.classList.remove(
        "dragging"
    );
}


poster.addEventListener(
    "pointerup",
    finishDrag
);


poster.addEventListener(
    "pointercancel",
    finishDrag
);


/* =========================================================
   QUANTITY
========================================================= */

minusBtn.addEventListener(
    "click",
    function () {

        const photo =
            getSelectedPhoto();


        if (!photo) {
            return;
        }


        photo.quantity =
            Math.max(
                1,
                photo.quantity - 1
            );


        renderAll();
    }
);


plusBtn.addEventListener(
    "click",
    function () {

        const photo =
            getSelectedPhoto();


        if (!photo) {
            return;
        }


        photo.quantity += 1;


        renderAll();
    }
);


/* =========================================================
   TOTAL
========================================================= */

function renderTotals() {

    let total = 0;


    photos.forEach(
        function (photo) {

            total +=
                prices[photo.size] *
                photo.quantity;
        }
    );


    grandTotal.textContent =
        "₹" +
        total;


    orderFooter.style.display =
        photos.length
            ? "flex"
            : "none";
}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(text) {

    customMessage.textContent =
        text;
}


/* =========================================================
   CART COUNT
========================================================= */

function updateCartCount() {

    if (!cartCount) {
        return;
    }


    try {

        const cart =
            JSON.parse(
                localStorage.getItem(
                    "zavyroCart"
                ) || "[]"
            );


        if (!Array.isArray(cart)) {

            cartCount.textContent =
                "0";

            return;
        }


        let count = 0;


        cart.forEach(
            function (item) {

                count +=
                    Number(
                        item.quantity || 1
                    );
            }
        );


        cartCount.textContent =
            count;

    } catch (error) {

        cartCount.textContent =
            "0";
    }
}


/* =========================================================
   CREATE FINAL POSTER
   RETURNS DATA URL + BLOB
========================================================= */

function createFinalPosterImage(photo) {

    return new Promise(
        function (resolve, reject) {

            const image =
                new Image();


            image.onload =
                function () {

                    const posterSizes = {

                        A3: {
                            width: 1200,
                            height: 1695
                        },

                        A4: {
                            width: 1200,
                            height: 1698
                        },

                        A5: {
                            width: 1200,
                            height: 1691
                        },

                        A6: {
                            width: 1200,
                            height: 1694
                        }
                    };


                    const output =
                        posterSizes[
                            photo.size
                        ] ||
                        posterSizes.A4;


                    const canvas =
                        document.createElement(
                            "canvas"
                        );


                    canvas.width =
                        output.width;

                    canvas.height =
                        output.height;


                    const ctx =
                        canvas.getContext(
                            "2d"
                        );


                    if (!ctx) {

                        reject(
                            new Error(
                                "Canvas is not supported."
                            )
                        );

                        return;
                    }


                    /* Theme background */

                    const gradient =
                        ctx.createRadialGradient(
                            output.width / 2,
                            output.height * 0.35,
                            0,
                            output.width / 2,
                            output.height * 0.35,
                            output.height * 0.8
                        );


                    gradient.addColorStop(
                        0,
                        "#211239"
                    );

                    gradient.addColorStop(
                        0.38,
                        "#120b1d"
                    );

                    gradient.addColorStop(
                        1,
                        "#080808"
                    );


                    ctx.fillStyle =
                        gradient;


                    ctx.fillRect(
                        0,
                        0,
                        output.width,
                        output.height
                    );


                    /*
                       Use actual preview dimensions
                       so the final image matches the
                       customer's editing exactly.
                    */

                    const previewWidth =
                        poster.clientWidth;

                    const previewHeight =
                        poster.clientHeight;


                    const sx =
                        output.width /
                        previewWidth;


                    const sy =
                        output.height /
                        previewHeight;


                    const displayWidth =
                        image.naturalWidth *
                        photo.scale *
                        photo.zoom;


                    const displayHeight =
                        image.naturalHeight *
                        photo.scale *
                        photo.zoom;


                    const finalWidth =
                        displayWidth *
                        sx;


                    const finalHeight =
                        displayHeight *
                        sy;


                    const finalX =
                        photo.x *
                        sx;


                    const finalY =
                        photo.y *
                        sy;


                    ctx.save();


                    ctx.translate(
                        output.width / 2 +
                        finalX,

                        output.height / 2 +
                        finalY
                    );


                    ctx.rotate(
                        photo.rotation *
                        Math.PI /
                        180
                    );


                    ctx.drawImage(
                        image,
                        -finalWidth / 2,
                        -finalHeight / 2,
                        finalWidth,
                        finalHeight
                    );


                    ctx.restore();


                    /*
                       Create JPEG Blob.
                    */

                    canvas.toBlob(
                        function (blob) {

                            if (!blob) {

                                reject(
                                    new Error(
                                        "Unable to create poster image."
                                    )
                                );

                                return;
                            }


                            /*
                               Also create a data URL
                               for Cart/Checkout display.
                            */

                            const reader =
                                new FileReader();


                            reader.onloadend =
                                function () {

                                    resolve({

                                        dataUrl:
                                            reader.result,

                                        blob:
                                            blob
                                    });
                                };


                            reader.onerror =
                                function () {

                                    reject(
                                        new Error(
                                            "Unable to read poster image."
                                        )
                                    );
                                };


                            reader.readAsDataURL(
                                blob
                            );

                        },
                        "image/jpeg",
                        0.95
                    );
                };


            image.onerror =
                function () {

                    reject(
                        new Error(
                            "Unable to load uploaded image."
                        )
                    );
                };


            image.src =
                photo.src;
        }
    );
}


/* =========================================================
   UPLOAD FINAL POSTER TO SUPABASE
========================================================= */

async function uploadFinalPoster(
    photo,
    blob
) {

    /*
       Files are stored inside:

       custom/<unique-name>.jpg

       This matches the Storage policy.
    */

    const fileName =
        "custom/" +
        photo.id +
        ".jpg";


    const {
        data,
        error
    } =
        await supabaseClient
            .storage
            .from("custom-posters")
            .upload(
                fileName,
                blob,
                {
                    contentType:
                        "image/jpeg",

                    cacheControl:
                        "3600",

                    upsert:
                        false
                }
            );


    if (error) {

        console.error(
            "CUSTOM POSTER UPLOAD ERROR:",
            error
        );

        throw new Error(
            error.message ||
            "Unable to upload custom poster."
        );
    }


    return data.path;
}


/* =========================================================
   ADD ALL TO CART
========================================================= */

addAllBtn.addEventListener(
    "click",
    async function () {

        if (!photos.length) {

            showMessage(
                "Please upload at least one photo."
            );

            return;
        }


        try {

            addAllBtn.disabled =
                true;

            addAllBtn.textContent =
                "UPLOADING POSTERS...";


            let cart = [];


            try {

                cart =
                    JSON.parse(
                        localStorage.getItem(
                            "zavyroCart"
                        ) || "[]"
                    );


                if (
                    !Array.isArray(cart)
                ) {

                    cart = [];
                }

            } catch (error) {

                cart = [];
            }


            /*
               Process every customized photo.
            */

            for (
                const photo of photos
            ) {

                /*
                   STEP 1:
                   Create exact final image.
                */

                const finalPoster =
                    await createFinalPosterImage(
                        photo
                    );


                /*
                   STEP 2:
                   Upload final image to
                   Supabase Storage.
                */

                const storagePath =
                    await uploadFinalPoster(
                        photo,
                        finalPoster.blob
                    );


                /*
                   STEP 3:
                   Save everything in cart.
                */

                const price =
                    prices[photo.size];


                cart.push({

                    id:
                        photo.id,

                    title:
                        "Custom Poster",

                    category:
                        "Custom",

                    subcategory:
                        "Custom Poster",

                    description:
                        "Customer uploaded photo poster",


                    /*
                       Final edited image used
                       by Cart / Checkout.
                    */

                    imageUrl:
                        finalPoster.dataUrl,


                    /*
                       Permanent Supabase
                       Storage location.
                    */

                    customStoragePath:
                        storagePath,


                    image_path:
                        "",


                    size:
                        photo.size,

                    quantity:
                        photo.quantity,

                    price:
                        price,

                    mrp:
                        price,

                    offerPrice:
                        price,

                    custom:
                        true,

                    customFileName:
                        photo.name,

                    customZoom:
                        photo.zoom,

                    customFit:
                        photo.fit,

                    customRotation:
                        photo.rotation,

                    customPositionX:
                        photo.x,

                    customPositionY:
                        photo.y,

                    customScale:
                        photo.scale,

                    customWidth:
                        photo.width,

                    customHeight:
                        photo.height
                });
            }


            /*
               Save cart.
            */

            localStorage.setItem(
                "zavyroCart",
                JSON.stringify(cart)
            );


            updateCartCount();


            addAllBtn.textContent =
                "ADDED TO CART ✓";


            showMessage(
                "Your edited posters have been uploaded and added to the cart."
            );


            setTimeout(
                function () {

                    window.location.href =
                        "cart.html";

                },
                700
            );


        } catch (error) {

            console.error(
                "CUSTOM POSTER ERROR:",
                error
            );


            addAllBtn.disabled =
                false;

            addAllBtn.textContent =
                "ADD ALL TO CART";


            showMessage(
                error.message ||
                "Unable to upload your custom poster."
            );
        }
    }
);


/* =========================================================
   START
========================================================= */

renderAll();