
"use strict";

/* =====================================================
   ZAVYRO POSTERS
   ADMIN DASHBOARD
===================================================== */


/* =====================================================
   ELEMENTS
===================================================== */

const categorySelect =
    document.getElementById("category");

const subcategorySelect =
    document.getElementById("subcategory");

const imageInput =
    document.getElementById("posterImage");

const preview =
    document.getElementById("preview");

const previewImage =
    document.getElementById("previewImage");

const form =
    document.getElementById("posterForm");

const uploadBtn =
    document.getElementById("uploadBtn");

const statusBox =
    document.getElementById("status");

const adminOrderList =
    document.getElementById("adminOrderList");


/* =====================================================
   ADMIN ACCESS
===================================================== */

async function checkAdminAccess() {

    try {

        const {
            data: { session },
            error
        } =
            await supabaseClient.auth.getSession();


        if (error) {

            console.error(
                "Session error:",
                error
            );

            return false;
        }


        if (!session?.user) {

            window.location.replace(
                "admin-login.html"
            );

            return false;
        }


        const {
            data: isAdmin,
            error: adminError
        } =
            await supabaseClient.rpc(
                "check_admin"
            );


        if (adminError) {

            console.error(
                "Admin check error:",
                adminError
            );

            showStatus(
                "Admin verification failed: " +
                adminError.message,
                "error"
            );

            return false;
        }


        if (!isAdmin) {

            await supabaseClient.auth.signOut();

            window.location.replace(
                "admin-login.html"
            );

            return false;
        }


        console.log(
            "Admin access confirmed."
        );


        return true;

    } catch (error) {

        console.error(
            "ADMIN ACCESS ERROR:",
            error
        );

        return false;
    }
}


/* =====================================================
   CATEGORY DATA
===================================================== */

const subcategories = {

    anime: [
        "naruto",
        "one piece",
        "dragon ball"
    ],

    movies: [
        "kollywood",
        "bollywood",
        "mollywood",
        "tollywood",
        "hollywood",
        "marvel",
        "dc"
    ],

    music: [
        "tamil",
        "telugu",
        "hindi",
        "malayalam",
        "english"
    ],

    sports: [
        "cricket",
        "football",
        "formula1",
        "others"
    ],

    cars: [
        "automotive"
    ],

    aesthetic: [
        "aesthetic"
    ],

    devotional: []
};


/* =====================================================
   STATUS
===================================================== */

function showStatus(
    message,
    type
) {

    if (!statusBox) {
        return;
    }


    statusBox.textContent =
        message;


    statusBox.className =
        `status ${type}`;
}


/* =====================================================
   CATEGORY CHANGE
===================================================== */

categorySelect?.addEventListener(
    "change",
    () => {

        const category =
            categorySelect.value;


        subcategorySelect.innerHTML =
            '<option value="">Select Subcategory</option>';


        if (
            category === "devotional"
        ) {
            return;
        }


        const list =
            subcategories[
                category
            ];


        if (!list) {
            return;
        }


        list.forEach(
            subcategory => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    subcategory;


                option.textContent =
                    subcategory.replace(
                        /\b\w/g,
                        letter =>
                            letter.toUpperCase()
                    );


                subcategorySelect.appendChild(
                    option
                );
            }
        );
    }
);


/* =====================================================
   IMAGE PREVIEW
===================================================== */

imageInput?.addEventListener(
    "change",
    () => {

        const file =
            imageInput.files[0];


        if (!file) {

            preview.style.display =
                "none";

            return;
        }


        previewImage.src =
            URL.createObjectURL(
                file
            );


        preview.style.display =
            "block";
    }
);


/* =====================================================
   NUMBER
===================================================== */

function getNumber(id) {

    const element =
        document.getElementById(id);


    return Number(
        element?.value || 0
    );
}


/* =====================================================
   FORM
===================================================== */

form?.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        if (uploadBtn.disabled) {
            return;
        }


        const file =
            imageInput.files[0];


        if (!file) {

            showStatus(
                "Please select a poster image.",
                "error"
            );

            return;
        }


        const title =
            document
                .getElementById(
                    "title"
                )
                .value
                .trim();


        const description =
            document
                .getElementById(
                    "description"
                )
                .value
                .trim();


        const category =
            categorySelect.value;


        const subcategory =
            subcategorySelect.value;


        const mrpA6 =
            getNumber("mrp_a6");

        const mrpA5 =
            getNumber("mrp_a5");

        const mrpA4 =
            getNumber("mrp_a4");

        const mrpA3 =
            getNumber("mrp_a3");


        const offerA6 =
            getNumber("offer_a6");

        const offerA5 =
            getNumber("offer_a5");

        const offerA4 =
            getNumber("offer_a4");

        const offerA3 =
            getNumber("offer_a3");


        const offerActive =
            document.getElementById(
                "offer_active"
            ).checked;


        const selectedOfferLabel =
            document.getElementById(
                "offer_label"
            ).value;


        const customOfferLabel =
            document.getElementById(
                "custom_offer_label"
            ).value
                .trim();


        const offerLabel =
            customOfferLabel ||
            selectedOfferLabel;


        const promoActive =
            document.getElementById(
                "promo_active"
            ).checked;


        const promoBuyQty =
            getNumber(
                "promo_buy_qty"
            );


        const promoGetQty =
            getNumber(
                "promo_get_qty"
            );


        let promoLabel =
            document.getElementById(
                "promo_label"
            ).value
                .trim();


        if (
            promoActive &&
            !promoLabel
        ) {

            promoLabel =
                `BUY ${promoBuyQty} GET ${promoGetQty} FREE`;
        }


        const badge =
            document.getElementById(
                "badge"
            ).value;


        const featured =
            document.getElementById(
                "featured"
            ).checked;


        const active =
            document.getElementById(
                "active"
            ).checked;


        const sizeInputs =
            document.querySelectorAll(
                '.checkbox-row input[type="checkbox"][value]'
            );


        const availableSizes =
            Array.from(
                sizeInputs
            )
                .filter(
                    input =>
                        input.checked
                )
                .map(
                    input =>
                        input.value
                );


        /* =================================================
           VALIDATION
        ================================================= */

        if (!title) {

            showStatus(
                "Enter a poster title.",
                "error"
            );

            return;
        }


        if (!category) {

            showStatus(
                "Select a category.",
                "error"
            );

            return;
        }


        if (
            category !== "devotional" &&
            !subcategory
        ) {

            showStatus(
                "Select a subcategory.",
                "error"
            );

            return;
        }


        if (!availableSizes.length) {

            showStatus(
                "Select at least one size.",
                "error"
            );

            return;
        }


        const pricePairs = [

            ["A6", mrpA6, offerA6],

            ["A5", mrpA5, offerA5],

            ["A4", mrpA4, offerA4],

            ["A3", mrpA3, offerA3]
        ];


        for (
            const [
                size,
                mrp,
                offer
            ]
            of pricePairs
        ) {

            if (
                mrp < 0 ||
                offer < 0
            ) {

                showStatus(
                    `${size}: price cannot be negative.`,
                    "error"
                );

                return;
            }


            if (
                offer > mrp
            ) {

                showStatus(
                    `${size}: offer price cannot be higher than MRP.`,
                    "error"
                );

                return;
            }
        }


        if (
            promoActive &&
            (
                promoBuyQty < 1 ||
                promoGetQty < 1
            )
        ) {

            showStatus(
                "Enter valid Buy and Get quantities.",
                "error"
            );

            return;
        }


        /* =================================================
           UPLOAD
        ================================================= */

        uploadBtn.disabled =
            true;

        uploadBtn.textContent =
            "Uploading...";


        let imagePath = null;


        try {

            const {
                data: { session }
            } =
                await supabaseClient.auth.getSession();


            if (!session) {

                throw new Error(
                    "Your admin session has expired. Please login again."
                );
            }


            const extension =
                file.name
                    .split(".")
                    .pop()
                    .toLowerCase();


            const allowedExtensions = [

                "jpg",
                "jpeg",
                "png",
                "webp",
                "avif"
            ];


            if (
                !allowedExtensions.includes(
                    extension
                )
            ) {

                throw new Error(
                    "Unsupported image format."
                );
            }


            const cleanName =
                file.name
                    .replace(
                        /\.[^/.]+$/,
                        ""
                    )
                    .replace(
                        /[^a-zA-Z0-9-_]/g,
                        "-"
                    )
                    .toLowerCase();


            const uniqueName =
                `${Date.now()}-${cleanName}.${extension}`;


            let folder =
                category;


            if (subcategory) {

                folder +=
                    `/${subcategory}`;
            }


            imagePath =
                `${folder}/${uniqueName}`;


            const {
                error: uploadError
            } =
                await supabaseClient
                    .storage
                    .from("posters")
                    .upload(
                        imagePath,
                        file,
                        {
                            cacheControl:
                                "3600",

                            upsert:
                                false
                        }
                    );


            if (uploadError) {
                throw uploadError;
            }


            const productData = {

                title:
                    title,

                description:
                    description,

                category:
                    category,

                subcategory:
                    subcategory,

                price:
                    offerA4,

                price_a6:
                    offerA6,

                price_a5:
                    offerA5,

                price_a4:
                    offerA4,

                price_a3:
                    offerA3,

                mrp_a6:
                    mrpA6,

                mrp_a5:
                    mrpA5,

                mrp_a4:
                    mrpA4,

                mrp_a3:
                    mrpA3,

                offer_a6:
                    offerA6,

                offer_a5:
                    offerA5,

                offer_a4:
                    offerA4,

                offer_a3:
                    offerA3,

                offer_label:
                    offerLabel,

                offer_active:
                    offerActive,

                promo_active:
                    promoActive,

                promo_buy_qty:
                    promoActive
                        ? promoBuyQty
                        : 1,

                promo_get_qty:
                    promoActive
                        ? promoGetQty
                        : 0,

                promo_label:
                    promoLabel,

                image_path:
                    imagePath,

                search_tags:
                    tagsFromForm(),

                available_sizes:
                    availableSizes,

                badge:
                    badge,

                featured:
                    featured,

                active:
                    active
            };


            const {
                data: insertedProduct,
                error: insertError
            } =
                await supabaseClient
                    .from("products")
                    .insert(
                        productData
                    )
                    .select()
                    .single();


            if (insertError) {

                await supabaseClient
                    .storage
                    .from("posters")
                    .remove([
                        imagePath
                    ]);


                imagePath =
                    null;


                throw insertError;
            }


            console.log(
                "Product inserted:",
                insertedProduct
            );


            showStatus(
    "Poster created successfully! Opening poster editor...",
    "success"
);


/*
 * IMPORTANT:
 * The product has now been created in Supabase.
 * Open the existing poster editor using the
 * newly created product ID.
 */
if (insertedProduct?.id) {

    window.location.href =
        `admin-poster-editor.html?id=${encodeURIComponent(
            insertedProduct.id
        )}`;

    return;
}


/*
 * Safety fallback if Supabase somehow
 * doesn't return the new product ID.
 */
showStatus(
    "Poster was created, but the editor could not be opened automatically.",
    "error"
);


form.reset();


preview.style.display =
    "none";


subcategorySelect.innerHTML =
    '<option value="">Select Subcategory</option>';


resetDefaults();


        } catch (error) {

            console.error(
                "UPLOAD ERROR:",
                error
            );


            showStatus(
                error.message ||
                "Upload failed.",
                "error"
            );

        }


        uploadBtn.disabled =
            false;

        uploadBtn.textContent =
            "Upload Poster";
    }
);


/* =====================================================
   TAGS
===================================================== */

function tagsFromForm() {

    const input =
        document.getElementById(
            "tags"
        );


    if (!input) {
        return [];
    }


    return input.value
        .split(",")
        .map(
            tag =>
                tag.trim()
                    .toLowerCase()
        )
        .filter(Boolean);
}


/* =====================================================
   RESET DEFAULTS
===================================================== */

function resetDefaults() {

    document.getElementById(
        "mrp_a6"
    ).value = 59;

    document.getElementById(
        "offer_a6"
    ).value = 29;


    document.getElementById(
        "mrp_a5"
    ).value = 79;

    document.getElementById(
        "offer_a5"
    ).value = 39;


    document.getElementById(
        "mrp_a4"
    ).value = 99;

    document.getElementById(
        "offer_a4"
    ).value = 49;


    document.getElementById(
        "mrp_a3"
    ).value = 149;

    document.getElementById(
        "offer_a3"
    ).value = 79;


    document.getElementById(
        "offer_active"
    ).checked = true;


    document.getElementById(
        "promo_active"
    ).checked = false;


    const promoFields =
        document.getElementById(
            "promoFields"
        );


    if (promoFields) {

        promoFields.style.display =
            "none";
    }
}


/* =====================================================
   LOAD RECENT ORDERS
===================================================== */

async function loadRecentOrders() {

    if (!adminOrderList) {
        return;
    }


    adminOrderList.innerHTML =
        `
        <div class="admin-orders-empty">
            Loading orders...
        </div>
        `;


    try {

        const {
            data: orders,
            error
        } =
            await supabaseClient
                .from("orders")
                .select(
                    `
                    id,
                    order_number,
                    customer_name,
                    customer_phone,
                    total_amount,
                    payment_status,
                    order_status,
                    created_at,
                    items
                    `
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                )
                .limit(5);


        if (error) {
            throw error;
        }


        if (
            !orders ||
            !orders.length
        ) {

            adminOrderList.innerHTML =
                `
                <div class="admin-orders-empty">
                    No orders yet.
                </div>
                `;

            return;
        }


        adminOrderList.innerHTML =
            "";


        for (
            const order of orders
        ) {

            const items =
                parseOrderItems(
                    order.items
                );


            const customItem =
                items.find(
                    item =>
                        item.custom === true &&
                        item.customStoragePath
                );


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "admin-order-row";


            /* =================================================
               IMAGE
            ================================================= */

            const imageBox =
                document.createElement(
                    "div"
                );


            imageBox.className =
                "admin-custom-mini";


            if (customItem) {

                imageBox.textContent =
                    "Loading...";


                loadAdminCustomImage(
                    customItem.customStoragePath,
                    imageBox
                );

            } else {

                imageBox.textContent =
                    "📦";
            }


            row.appendChild(
                imageBox
            );


            /* =================================================
               INFO
            ================================================= */

            const info =
                document.createElement(
                    "div"
                );


            info.className =
                "admin-order-info";


            const number =
                document.createElement(
                    "div"
                );


            number.className =
                "admin-order-number";


            number.textContent =
                order.order_number
                    ? order.order_number
                    : "Order";


            info.appendChild(
                number
            );


            const customer =
                document.createElement(
                    "div"
                );


            customer.className =
                "admin-order-customer";


            customer.textContent =
                (
                    order.customer_name ||
                    "Customer"
                ) +
                " • " +
                (
                    order.customer_phone ||
                    ""
                );


            info.appendChild(
                customer
            );


            const status =
                document.createElement(
                    "div"
                );


            status.className =
                "admin-order-status";


            status.textContent =
                String(
                    order.order_status ||
                    "pending"
                )
                    .replace(
                        /_/g,
                        " "
                    )
                    .toUpperCase();


            info.appendChild(
                status
            );


            row.appendChild(
                info
            );


            /* =================================================
               RIGHT SIDE
            ================================================= */

            const right =
                document.createElement(
                    "div"
                );


            right.style.textAlign =
                "right";


            const total =
                document.createElement(
                    "div"
                );


            total.className =
                "admin-order-total";


            total.textContent =
                Number(
                    order.total_amount ||
                    0
                ).toLocaleString(
                    "en-IN",
                    {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0
                    }
                );


            right.appendChild(
                total
            );


            if (customItem) {

                const download =
                    document.createElement(
                        "button"
                    );


                download.type =
                    "button";


                download.className =
                    "admin-download-btn";


                download.textContent =
                    "DOWNLOAD POSTER";


                download.addEventListener(
                    "click",
                    function () {

                        downloadAdminCustomPoster(
                            customItem.customStoragePath,
                            customItem.title ||
                            "zavyro-custom-poster"
                        );

                    }
                );


                right.appendChild(
                    download
                );
            }


            row.appendChild(
                right
            );


            adminOrderList.appendChild(
                row
            );
        }


    } catch (error) {

        console.error(
            "RECENT ORDERS ERROR:",
            error
        );


        adminOrderList.innerHTML =
            `
            <div class="admin-orders-empty">
                Unable to load orders.
            </div>
            `;
    }
}


/* =====================================================
   PARSE ORDER ITEMS
===================================================== */

function parseOrderItems(items) {

    if (!items) {
        return [];
    }


    if (Array.isArray(items)) {
        return items;
    }


    if (typeof items === "string") {

        try {

            const parsed =
                JSON.parse(items);


            return Array.isArray(
                parsed
            )
                ? parsed
                : [];

        } catch {

            return [];
        }
    }


    return [];
}


/* =====================================================
   LOAD CUSTOM IMAGE
===================================================== */

async function loadAdminCustomImage(
    storagePath,
    container
) {

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .storage
                .from("custom-posters")
                .createSignedUrl(
                    storagePath,
                    3600
                );


        if (error) {
            throw error;
        }


        if (!data?.signedUrl) {
            throw new Error(
                "No signed URL."
            );
        }


        const img =
            document.createElement(
                "img"
            );


        img.src =
            data.signedUrl;


        img.alt =
            "Custom poster";


        img.onload =
            function () {

                container.innerHTML =
                    "";

                container.appendChild(
                    img
                );
            };


        img.onerror =
            function () {

                container.textContent =
                    "Error";
            };


    } catch (error) {

        console.error(
            "CUSTOM IMAGE ERROR:",
            error
        );


        container.textContent =
            "Unavailable";
    }
}


/* =====================================================
   DOWNLOAD CUSTOM POSTER
===================================================== */

async function downloadAdminCustomPoster(
    storagePath,
    title
) {

    if (!storagePath) {

        alert(
            "Custom poster file is unavailable."
        );

        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .storage
                .from("custom-posters")
                .createSignedUrl(
                    storagePath,
                    300
                );


        if (error) {
            throw error;
        }


        if (!data?.signedUrl) {

            throw new Error(
                "Unable to create download link."
            );
        }


        const response =
            await fetch(
                data.signedUrl
            );


        if (!response.ok) {

            throw new Error(
                "Unable to download poster."
            );
        }


        const blob =
            await response.blob();


        const blobUrl =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            blobUrl;


        link.download =
            sanitizeFileName(
                title
            ) +
            ".jpg";


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        setTimeout(
            function () {

                URL.revokeObjectURL(
                    blobUrl
                );

            },
            1000
        );


    } catch (error) {

        console.error(
            "DOWNLOAD ERROR:",
            error
        );


        alert(
            "Unable to download custom poster.\n\n" +
            (
                error.message ||
                "Unknown error"
            )
        );
    }
}


/* =====================================================
   FILE NAME
===================================================== */

function sanitizeFileName(
    value
) {

    return String(
        value ||
        "zavyro-custom-poster"
    )
        .replace(
            /[<>:"/\\|?*\x00-\x1F]/g,
            "_"
        )
        .replace(
            /\s+/g,
            "-"
        )
        .substring(
            0,
            100
        );
}


/* =====================================================
   START ADMIN
===================================================== */

(async function () {

    const allowed =
        await checkAdminAccess();


    if (!allowed) {
        return;
    }


    /*
       Load recent orders on the
       main admin dashboard.
    */

    await loadRecentOrders();

})();