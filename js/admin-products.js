"use strict";

/* =========================================================
   ZAVYRO POSTERS — MANAGE POSTERS

   Edit Details:
   - Title
   - Category
   - Subcategory
   - Description
   - Image
   - Prices
   - Offers
   - Available Sizes
   - Search Tags
   - Promotion
   - Featured
   - Published

   Poster Editor:
   - A6/A5/A4/A3
   - Orientation
   - Dimensions
   - Image positioning
   - Zoom
   - Rotation
   - Variant saving

   IMPORTANT:
   Orientation and dimensions are NOT edited here.
   They belong only to admin-poster-editor.html.
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const db =
    window.supabaseClient ||
    window.supabase;

if (!db) {
    console.error(
        "Zavyro: Supabase client not found."
    );
}


/* =========================================================
   MAIN DOM
========================================================= */

const productsGrid =
    document.getElementById(
        "productsGrid"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const statusFilter =
    document.getElementById(
        "statusFilter"
    );

const countLabel =
    document.getElementById(
        "countLabel"
    );

const message =
    document.getElementById(
        "message"
    );


/* =========================================================
   EDIT MODAL DOM
========================================================= */

const editModal =
    document.getElementById(
        "editModal"
    );

const editForm =
    document.getElementById(
        "editForm"
    );

const closeModalBtn =
    document.getElementById(
        "closeModal"
    );

const cancelEditBtn =
    document.getElementById(
        "cancelEdit"
    );

const saveEditBtn =
    document.getElementById(
        "saveEdit"
    );


const editId =
    document.getElementById(
        "editId"
    );

const editImage =
    document.getElementById(
        "editImage"
    );

const editImagePreviewImage =
    document.getElementById(
        "editImagePreviewImage"
    );

const editPreviewInfo =
    document.getElementById(
        "editPreviewInfo"
    );


const editTitle =
    document.getElementById(
        "editTitle"
    );

const editCategory =
    document.getElementById(
        "editCategory"
    );

const editSubcategory =
    document.getElementById(
        "editSubcategory"
    );

const editDescription =
    document.getElementById(
        "editDescription"
    );


/* =========================================================
   PRICES
========================================================= */

const editMrpA6 =
    document.getElementById(
        "editMrpA6"
    );

const editOfferA6 =
    document.getElementById(
        "editOfferA6"
    );


const editMrpA5 =
    document.getElementById(
        "editMrpA5"
    );

const editOfferA5 =
    document.getElementById(
        "editOfferA5"
    );


const editMrpA4 =
    document.getElementById(
        "editMrpA4"
    );

const editOfferA4 =
    document.getElementById(
        "editOfferA4"
    );


const editMrpA3 =
    document.getElementById(
        "editMrpA3"
    );

const editOfferA3 =
    document.getElementById(
        "editOfferA3"
    );


/* =========================================================
   OFFER
========================================================= */

const editOfferActive =
    document.getElementById(
        "editOfferActive"
    );

const editOfferLabel =
    document.getElementById(
        "editOfferLabel"
    );

const editBadge =
    document.getElementById(
        "editBadge"
    );


/* =========================================================
   TAGS
========================================================= */

const editTags =
    document.getElementById(
        "editTags"
    );


/* =========================================================
   PROMOTION
========================================================= */

const editPromoBuy =
    document.getElementById(
        "editPromoBuy"
    );

const editPromoGet =
    document.getElementById(
        "editPromoGet"
    );

const editPromoLabel =
    document.getElementById(
        "editPromoLabel"
    );

const editPromoActive =
    document.getElementById(
        "editPromoActive"
    );


/* =========================================================
   OPTIONS
========================================================= */

const editFeatured =
    document.getElementById(
        "editFeatured"
    );

const editActive =
    document.getElementById(
        "editActive"
    );


/* =========================================================
   STATE
========================================================= */

let allProducts = [];

let editingProduct = null;

let previewObjectUrl = null;


/* =========================================================
   CATEGORY DATA
========================================================= */

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


/* =========================================================
   CATEGORY DISPLAY NAMES
========================================================= */

const categoryNames = {

    anime: "Anime",

    movies: "Movies",

    music: "Music",

    sports: "Sports",

    cars: "Cars",

    aesthetic: "Aesthetic",

    devotional: "Devotional"

};


/* =========================================================
   DISPLAY NAME
========================================================= */

function displayName(
    value
) {

    return String(
        value || ""
    )
        .replace(
            /[-_]/g,
            " "
        )
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );
}


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
        `message show ${type}`;

    clearTimeout(
        showMessage.timer
    );

    showMessage.timer =
        setTimeout(
            () => {

                message.className =
                    "message";

            },
            4000
        );
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   IMAGE URL
========================================================= */

function getImageUrl(
    path
) {

    if (
        !path ||
        !db
    ) {

        return "";

    }

    const {
        data
    } =
        db
            .storage
            .from("posters")
            .getPublicUrl(
                path
            );

    return (
        data?.publicUrl ||
        ""
    );
}


/* =========================================================
   ADMIN CHECK
========================================================= */

async function checkAdmin() {

    if (!db) {
        return false;
    }

    try {

        const {
            data,
            error
        } =
            await db.rpc(
                "check_admin"
            );

        if (error) {

            console.error(
                "ADMIN CHECK ERROR:",
                error
            );

            return false;
        }

        return data === true;

    } catch (error) {

        console.error(
            "ADMIN CHECK EXCEPTION:",
            error
        );

        return false;
    }
}


/* =========================================================
   SUBCATEGORY DROPDOWN
========================================================= */

function populateSubcategories(
    category,
    selectedValue = ""
) {

    if (!editSubcategory) {
        return;
    }

    editSubcategory.innerHTML =
        "";


    const firstOption =
        document.createElement(
            "option"
        );

    firstOption.value =
        "";

    firstOption.textContent =
        category === "devotional"
            ? "No Subcategory"
            : "Select Subcategory";


    editSubcategory.appendChild(
        firstOption
    );


    const list =
        subcategories[
            category
        ] || [];


    list.forEach(
        value => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                value;

            option.textContent =
                displayName(
                    value
                );

            editSubcategory.appendChild(
                option
            );

        }
    );


    const normalizedSelected =
        String(
            selectedValue || ""
        )
            .trim()
            .toLowerCase();


    if (
        normalizedSelected &&
        list.includes(
            normalizedSelected
        )
    ) {

        editSubcategory.value =
            normalizedSelected;

    } else {

        editSubcategory.value =
            "";

    }
}


/* =========================================================
   CATEGORY CHANGE
========================================================= */

if (editCategory) {

    editCategory.addEventListener(
        "change",
        () => {

            populateSubcategories(
                editCategory.value,
                ""
            );

        }
    );

}


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {

    if (
        !productsGrid ||
        !db
    ) {

        return;

    }


    productsGrid.innerHTML = `

        <div
            style="
                grid-column:1/-1;
                padding:40px;
                text-align:center;
                color:#777;
            "
        >
            Loading posters...
        </div>

    `;


    try {

        const {
            data,
            error
        } =
            await db
                .from("products")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending:
                            false
                    }
                );


        if (error) {
            throw error;
        }


        allProducts =
            Array.isArray(data)
                ? data
                : [];


        renderProducts();


    } catch (error) {

        console.error(
            "LOAD PRODUCTS ERROR:",
            error
        );


        productsGrid.innerHTML = `

            <div
                style="
                    grid-column:1/-1;
                    padding:40px;
                    text-align:center;
                    color:#f87171;
                "
            >

                Unable to load posters.

                <br>

                <small>
                    ${escapeHtml(
                        error.message
                    )}
                </small>

            </div>

        `;

    }

}


/* =========================================================
   FILTER PRODUCTS
========================================================= */

function getFilteredProducts() {

    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const filter =
        statusFilter
            ? statusFilter.value
            : "all";


    return allProducts.filter(
        product => {

            const tags =
                Array.isArray(
                    product.search_tags
                )

                    ? product.search_tags
                        .join(" ")

                    : String(
                        product.search_tags ||
                        ""
                    );


            const searchable = `

                ${product.title || ""}

                ${product.category || ""}

                ${product.subcategory || ""}

                ${tags}

            `.toLowerCase();


            if (
                search &&
                !searchable.includes(
                    search
                )
            ) {

                return false;

            }


            if (
                filter === "active" &&
                product.active !== true
            ) {

                return false;

            }


            if (
                filter === "hidden" &&
                product.active === true
            ) {

                return false;

            }


            if (
                filter === "featured" &&
                product.featured !== true
            ) {

                return false;

            }


            return true;

        }
    );
}


/* =========================================================
   MONEY
========================================================= */

function money(
    value
) {

    const number =
        Number(
            value || 0
        );

    return (
        `₹${Math.round(
            number
        )}`
    );
}


/* =========================================================
   AVAILABLE SIZES
========================================================= */

function getAvailableSizes(
    product
) {

    if (
        Array.isArray(
            product.available_sizes
        ) &&
        product.available_sizes.length
    ) {

        return (
            product.available_sizes
        );

    }

    return [
        "A6",
        "A5",
        "A4",
        "A3"
    ];
}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts() {

    if (!productsGrid) {
        return;
    }


    const products =
        getFilteredProducts();


    if (countLabel) {

        countLabel.textContent =
            `${products.length} poster${
                products.length === 1
                    ? ""
                    : "s"
            }`;

    }


    productsGrid.innerHTML =
        "";


    if (
        !products.length
    ) {

        productsGrid.innerHTML = `

            <div
                class="empty-state"
                style="grid-column:1/-1;"
            >
                No posters found.
            </div>

        `;

        return;
    }


    products.forEach(
        product => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "product-card";


            if (
                product.active !== true
            ) {

                card.classList.add(
                    "hidden-product"
                );

            }


            const imageUrl =
                getImageUrl(
                    product.image_path
                );


            const a4Price =

                product.offer_active === true &&
                Number(
                    product.offer_a4 ||
                    0
                ) > 0

                    ? Number(
                        product.offer_a4
                    )

                    : Number(
                        product.price_a4 ||
                        product.price ||
                        0
                    );


            const sizes =
                getAvailableSizes(
                    product
                );


            card.innerHTML = `

                <div class="product-image">

                    ${
                        imageUrl

                            ? `

                                <img
                                    src="${escapeHtml(
                                        imageUrl
                                    )}"
                                    alt="${escapeHtml(
                                        product.title ||
                                        "Poster"
                                    )}"
                                    loading="lazy"
                                >

                            `

                            : `

                                <div
                                    class="product-placeholder"
                                >
                                    Z
                                </div>

                            `
                    }

                </div>


                <div class="product-body">


                    <div class="product-category">

                        ${escapeHtml(
                            categoryNames[
                                product.category
                            ] ||
                            product.category ||
                            "POSTER"
                        )}

                    </div>


                    <h3>

                        ${escapeHtml(
                            product.title ||
                            "Untitled Poster"
                        )}

                    </h3>


                    <div class="product-subcategory">

                        ${escapeHtml(
                            product.subcategory
                                ? displayName(
                                    product.subcategory
                                )
                                : ""
                        )}

                    </div>


                    <div class="product-status">


                        <span
                            class="
                                status-chip
                                ${
                                    product.active
                                        ? "live"
                                        : "off"
                                }
                            "
                        >

                            ${
                                product.active
                                    ? "PUBLISHED"
                                    : "HIDDEN"
                            }

                        </span>


                        ${
                            product.featured

                                ? `

                                    <span
                                        class="
                                            status-chip
                                            featured
                                        "
                                    >
                                        FEATURED
                                    </span>

                                `

                                : ""
                        }


                        ${
                            product.offer_active

                                ? `

                                    <span
                                        class="status-chip"
                                    >
                                        OFFER
                                    </span>

                                `

                                : ""
                        }


                        ${
                            product.promo_active

                                ? `

                                    <span
                                        class="status-chip"
                                    >
                                        PROMO
                                    </span>

                                `

                                : ""
                        }

                    </div>


                    <div
                        style="
                            margin:10px 0;
                            color:#777;
                            font-size:11px;
                        "
                    >

                        Sizes:

                        ${
                            sizes
                                .map(
                                    size =>
                                        escapeHtml(
                                            size
                                        )
                                )
                                .join(
                                    " • "
                                )
                        }

                    </div>


                    <div class="product-price">

                        A4:
                        ${money(
                            a4Price
                        )}

                    </div>


                    <div class="product-actions">


                        <button
                            type="button"
                            class="action-btn"
                            data-action="edit"
                            data-id="${escapeHtml(
                                product.id
                            )}"
                        >
                            Edit Details
                        </button>


                        <button
                            type="button"
                            class="action-btn"
                            data-action="editor"
                            data-id="${escapeHtml(
                                product.id
                            )}"
                        >
                            Poster Editor
                        </button>


                        <button
                            type="button"
                            class="
                                action-btn
                                hide
                            "
                            data-action="toggle"
                            data-id="${escapeHtml(
                                product.id
                            )}"
                        >

                            ${
                                product.active
                                    ? "Hide"
                                    : "Publish"
                            }

                        </button>


                        <button
                            type="button"
                            class="
                                action-btn
                                delete
                            "
                            data-action="delete"
                            data-id="${escapeHtml(
                                product.id
                            )}"
                        >
                            Delete
                        </button>


                    </div>

                </div>

            `;


            productsGrid.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   OPEN POSTER EDITOR
========================================================= */

function openPosterEditor(
    id
) {

    if (!id) {

        showMessage(
            "Poster ID is missing.",
            "error"
        );

        return;

    }


    window.location.href =
        `admin-poster-editor.html?id=${encodeURIComponent(
            id
        )}`;

}


/* =========================================================
   OPEN EDIT MODAL
========================================================= */

function openEditModal(
    id
) {

    const product =
        allProducts.find(
            item =>
                String(
                    item.id
                ) ===
                String(
                    id
                )
        );


    if (
        !product ||
        !editModal
    ) {

        return;

    }


    editingProduct =
        product;


    /* -----------------------------------------
       BASIC
    ----------------------------------------- */

    if (editId) {

        editId.value =
            product.id ||
            "";

    }


    if (editTitle) {

        editTitle.value =
            product.title ||
            "";

    }


    if (editDescription) {

        editDescription.value =
            product.description ||
            "";

    }


    if (editCategory) {

        editCategory.value =
            product.category ||
            "";

        populateSubcategories(
            editCategory.value,
            product.subcategory ||
            ""
        );

    }


    /* -----------------------------------------
       PRICES
    ----------------------------------------- */

    if (editMrpA6) {

        editMrpA6.value =
            product.mrp_a6 ??
            "";

    }


    if (editOfferA6) {

        editOfferA6.value =
            product.offer_a6 ??
            product.price_a6 ??
            "";

    }


    if (editMrpA5) {

        editMrpA5.value =
            product.mrp_a5 ??
            "";

    }


    if (editOfferA5) {

        editOfferA5.value =
            product.offer_a5 ??
            product.price_a5 ??
            "";

    }


    if (editMrpA4) {

        editMrpA4.value =
            product.mrp_a4 ??
            "";

    }


    if (editOfferA4) {

        editOfferA4.value =
            product.offer_a4 ??
            product.price_a4 ??
            product.price ??
            "";

    }


    if (editMrpA3) {

        editMrpA3.value =
            product.mrp_a3 ??
            "";

    }


    if (editOfferA3) {

        editOfferA3.value =
            product.offer_a3 ??
            product.price_a3 ??
            "";

    }


    /* -----------------------------------------
       OFFER
    ----------------------------------------- */

    if (editOfferActive) {

        editOfferActive.checked =
            product.offer_active === true;

    }


    if (editOfferLabel) {

        editOfferLabel.value =
            product.offer_label ||
            "";

    }


    if (editBadge) {

        editBadge.value =
            product.badge ||
            "";

    }


    /* -----------------------------------------
       TAGS
    ----------------------------------------- */

    const tags =

        Array.isArray(
            product.search_tags
        )

            ? product.search_tags

            : String(
                product.search_tags ||
                ""
            )
                .split(",")
                .map(
                    tag =>
                        tag.trim()
                )
                .filter(
                    Boolean
                );


    if (editTags) {

        editTags.value =
            tags.join(
                ", "
            );

    }


    /* -----------------------------------------
       PROMOTION
    ----------------------------------------- */

    if (editPromoBuy) {

        editPromoBuy.value =
            product.promo_buy_qty ??
            1;

    }


    if (editPromoGet) {

        editPromoGet.value =
            product.promo_get_qty ??
            0;

    }


    if (editPromoLabel) {

        editPromoLabel.value =
            product.promo_label ||
            "";

    }


    if (editPromoActive) {

        editPromoActive.checked =
            product.promo_active === true;

    }


    /* -----------------------------------------
       OPTIONS
    ----------------------------------------- */

    if (editFeatured) {

        editFeatured.checked =
            product.featured === true;

    }


    if (editActive) {

        editActive.checked =
            product.active === true;

    }


    /* -----------------------------------------
       AVAILABLE SIZES
    ----------------------------------------- */

    const availableSizes =
        getAvailableSizes(
            product
        );


    document
        .querySelectorAll(
            'input[name="editSize"]'
        )
        .forEach(
            checkbox => {

                checkbox.checked =
                    availableSizes.includes(
                        checkbox.value
                    );

            }
        );


    /* -----------------------------------------
       IMAGE
    ----------------------------------------- */

    if (editImage) {

        editImage.value =
            "";

    }


    if (
        editImagePreviewImage
    ) {

        const imageUrl =
            getImageUrl(
                product.image_path
            );


        editImagePreviewImage.src =
            imageUrl ||
            "";


        editImagePreviewImage.style.display =
            imageUrl
                ? "block"
                : "none";

    }


    if (editPreviewInfo) {

        editPreviewInfo.textContent =
            "Use Poster Editor for A6/A5/A4/A3 orientation, sizing and final image adjustment.";

    }


    /* -----------------------------------------
       SHOW
    ----------------------------------------- */

    editModal.classList.add(
        "show"
    );

    editModal.style.display =
        "flex";

    document.body.classList.add(
        "modal-open"
    );

}


/* =========================================================
   CLOSE EDIT MODAL
========================================================= */

function closeEditModal() {

    if (!editModal) {
        return;
    }


    editModal.classList.remove(
        "show"
    );

    editModal.style.display =
        "none";


    document.body.classList.remove(
        "modal-open"
    );


    editingProduct =
        null;


    if (previewObjectUrl) {

        URL.revokeObjectURL(
            previewObjectUrl
        );

        previewObjectUrl =
            null;

    }

}


/* =========================================================
   IMAGE PREVIEW
========================================================= */

if (editImage) {

    editImage.addEventListener(
        "change",
        () => {

            const file =
                editImage.files?.[0];


            if (
                !file ||
                !editImagePreviewImage
            ) {

                return;

            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                showMessage(
                    "Please choose an image file.",
                    "error"
                );

                editImage.value =
                    "";

                return;

            }


            if (previewObjectUrl) {

                URL.revokeObjectURL(
                    previewObjectUrl
                );

            }


            previewObjectUrl =
                URL.createObjectURL(
                    file
                );


            editImagePreviewImage.src =
                previewObjectUrl;


            editImagePreviewImage.style.display =
                "block";


            if (editPreviewInfo) {

                editPreviewInfo.textContent =
                    "New image selected. Save changes, then use Poster Editor for A6/A5/A4/A3 variants.";

            }

        }
    );

}


/* =========================================================
   UPLOAD REPLACEMENT IMAGE
========================================================= */

async function uploadReplacementImage(
    product,
    file,
    category,
    subcategory
) {

    if (!file) {

        return (
            product.image_path ||
            ""
        );

    }


    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        throw new Error(
            "Please choose a valid image file."
        );

    }


    const allowedExtensions = [

        "jpg",
        "jpeg",
        "png",
        "webp",
        "avif"

    ];


    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();


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
        category ||
        "uncategorized";


    if (subcategory) {

        folder +=
            `/${subcategory}`;

    }


    const imagePath =
        `${folder}/${uniqueName}`;


    const {
        error
    } =
        await db
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


    if (error) {
        throw error;
    }


    return imagePath;
}


/* =========================================================
   SAVE PRODUCT CHANGES
========================================================= */

async function saveProductChanges(
    event
) {

    event.preventDefault();


    if (
        !editingProduct ||
        !db
    ) {

        return;

    }


    if (saveEditBtn) {

        saveEditBtn.disabled =
            true;

        saveEditBtn.textContent =
            "SAVING...";

    }


    try {

        /* -----------------------------------------
           BASIC
        ----------------------------------------- */

        const title =
            editTitle?.value.trim() ||
            "";


        const category =
            editCategory?.value ||
            "";


        const subcategory =
            editSubcategory?.value ||
            "";


        const description =
            editDescription?.value.trim() ||
            "";


        if (!title) {

            throw new Error(
                "Poster title is required."
            );

        }


        if (!category) {

            throw new Error(
                "Please select a category."
            );

        }


        if (
            category !== "devotional" &&
            !subcategory
        ) {

            throw new Error(
                "Please select a subcategory."
            );

        }


        /* -----------------------------------------
           SIZES
        ----------------------------------------- */

        const selectedSizes =
            Array.from(
                document.querySelectorAll(
                    'input[name="editSize"]:checked'
                )
            )
                .map(
                    checkbox =>
                        checkbox.value
                );


        if (
            !selectedSizes.length
        ) {

            throw new Error(
                "Select at least one available poster size."
            );

        }


        /* -----------------------------------------
           PRICES
        ----------------------------------------- */

        const mrpA6 =
            Number(
                editMrpA6?.value ||
                0
            );


        const offerA6 =
            Number(
                editOfferA6?.value ||
                0
            );


        const mrpA5 =
            Number(
                editMrpA5?.value ||
                0
            );


        const offerA5 =
            Number(
                editOfferA5?.value ||
                0
            );


        const mrpA4 =
            Number(
                editMrpA4?.value ||
                0
            );


        const offerA4 =
            Number(
                editOfferA4?.value ||
                0
            );


        const mrpA3 =
            Number(
                editMrpA3?.value ||
                0
            );


        const offerA3 =
            Number(
                editOfferA3?.value ||
                0
            );


        /* -----------------------------------------
           OFFER
        ----------------------------------------- */

        const offerActive =
            editOfferActive?.checked ===
            true;


        const offerLabel =
            editOfferLabel?.value.trim() ||
            "";


        /* -----------------------------------------
           TAGS
        ----------------------------------------- */

        const tags =
            String(
                editTags?.value ||
                ""
            )
                .split(",")
                .map(
                    tag =>
                        tag.trim()
                )
                .filter(
                    Boolean
                );


        /* -----------------------------------------
           PROMOTION
        ----------------------------------------- */

        const promoActive =
            editPromoActive?.checked ===
            true;


        const promoBuy =
            Math.max(
                1,
                Number(
                    editPromoBuy?.value ||
                    1
                )
            );


        const promoGet =
            Math.max(
                0,
                Number(
                    editPromoGet?.value ||
                    0
                )
            );


        const promoLabel =
            editPromoLabel?.value.trim() ||
            "";


        /* -----------------------------------------
           IMAGE
        ----------------------------------------- */

        let newImagePath =
            editingProduct.image_path ||
            "";


        const newImageFile =
            editImage?.files?.[0];


        if (newImageFile) {

            newImagePath =
                await uploadReplacementImage(
                    editingProduct,
                    newImageFile,
                    category,
                    subcategory
                );

        }


        /* -----------------------------------------
           PRODUCT DATA

           Orientation is intentionally NOT included.
           Dimensions are intentionally NOT included.
        ----------------------------------------- */

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


            offer_active:
                offerActive,

            offer_label:
                offerLabel,


            badge:
                editBadge?.value ||
                "",


            available_sizes:
                selectedSizes,


            search_tags:
                tags,


            promo_active:
                promoActive,

            promo_buy_qty:
                promoActive
                    ? promoBuy
                    : 1,

            promo_get_qty:
                promoActive
                    ? promoGet
                    : 0,

            promo_label:
                promoLabel,


            featured:
                editFeatured?.checked ===
                true,

            active:
                editActive?.checked ===
                true,


            image_path:
                newImagePath,


            updated_at:
                new Date().toISOString()

        };


        /* -----------------------------------------
           DATABASE UPDATE
        ----------------------------------------- */

        const {
            data,
            error
        } =
            await db
                .from("products")
                .update(
                    productData
                )
                .eq(
                    "id",
                    editingProduct.id
                )
                .select()
                .single();


        if (error) {
            throw error;
        }


        /* -----------------------------------------
           DELETE OLD ORIGINAL

           Only after successful DB update.
           Saved A6/A5/A4/A3 variants remain untouched.
        ----------------------------------------- */

        if (

            newImageFile &&

            editingProduct.image_path &&

            editingProduct.image_path !==
                newImagePath

        ) {

            try {

                await db
                    .storage
                    .from("posters")
                    .remove([
                        editingProduct.image_path
                    ]);

            } catch (
                storageError
            ) {

                console.warn(
                    "OLD IMAGE DELETE WARNING:",
                    storageError
                );

            }

        }


        /* -----------------------------------------
           UPDATE LOCAL STATE
        ----------------------------------------- */

        const index =
            allProducts.findIndex(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        editingProduct.id
                    )
            );


        if (
            index !== -1
        ) {

            allProducts[index] =
                data ||
                {
                    ...editingProduct,
                    ...productData
                };

        }


        closeEditModal();

        renderProducts();


        showMessage(
            "Poster details updated successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "SAVE PRODUCT ERROR:",
            error
        );


        showMessage(
            error.message ||
            "Unable to save poster changes.",
            "error"
        );


    } finally {

        if (saveEditBtn) {

            saveEditBtn.disabled =
                false;

            saveEditBtn.textContent =
                "SAVE CHANGES";

        }

    }

}


/* =========================================================
   TOGGLE PUBLISH / HIDE
========================================================= */

async function toggleProduct(
    id
) {

    const product =
        allProducts.find(
            item =>
                String(
                    item.id
                ) ===
                String(
                    id
                )
        );


    if (!product) {
        return;
    }


    const newStatus =
        product.active !==
        true;


    try {

        const {
            error
        } =
            await db
                .from("products")
                .update({

                    active:
                        newStatus,

                    updated_at:
                        new Date().toISOString()

                })
                .eq(
                    "id",
                    id
                );


        if (error) {
            throw error;
        }


        product.active =
            newStatus;


        renderProducts();


        showMessage(

            newStatus
                ? "Poster published."
                : "Poster hidden.",

            "success"

        );


    } catch (error) {

        console.error(
            "TOGGLE PRODUCT ERROR:",
            error
        );


        showMessage(
            error.message ||
            "Unable to change poster status.",
            "error"
        );

    }

}


/* =========================================================
   REMOVE STORAGE IMAGE
========================================================= */

async function removeStorageImage(
    path
) {

    if (
        !path ||
        !db
    ) {

        return;

    }


    try {

        await db
            .storage
            .from("posters")
            .remove([
                path
            ]);

    } catch (error) {

        console.warn(
            "STORAGE DELETE WARNING:",
            error
        );

    }

}


/* =========================================================
   DELETE PRODUCT
========================================================= */

async function deleteProduct(
    id
) {

    const product =
        allProducts.find(
            item =>
                String(
                    item.id
                ) ===
                String(
                    id
                )
        );


    if (!product) {
        return;
    }


    const confirmed =
        confirm(

            `Delete "${product.title || "this poster"}" permanently?\n\n` +

            `This will remove the poster from the website.`

        );


    if (!confirmed) {
        return;
    }


    try {

        /* -----------------------------------------
           DELETE DATABASE RECORD
        ----------------------------------------- */

        const {
            error
        } =
            await db
                .from("products")
                .delete()
                .eq(
                    "id",
                    id
                );


        if (error) {
            throw error;
        }


        /* -----------------------------------------
           DELETE ORIGINAL
        ----------------------------------------- */

        if (
            product.image_path
        ) {

            await removeStorageImage(
                product.image_path
            );

        }


        /* -----------------------------------------
           DELETE VARIANTS
        ----------------------------------------- */

        const variantPaths = [

            `products/${id}/A6.png`,

            `products/${id}/A5.png`,

            `products/${id}/A4.png`,

            `products/${id}/A3.png`

        ];


        try {

            await db
                .storage
                .from("posters")
                .remove(
                    variantPaths
                );

        } catch (
            storageError
        ) {

            console.warn(
                "VARIANT DELETE WARNING:",
                storageError
            );

        }


        /* -----------------------------------------
           LOCAL STATE
        ----------------------------------------- */

        allProducts =
            allProducts.filter(
                item =>
                    String(
                        item.id
                    ) !==
                    String(
                        id
                    )
            );


        renderProducts();


        showMessage(
            "Poster deleted permanently.",
            "success"
        );


    } catch (error) {

        console.error(
            "DELETE PRODUCT ERROR:",
            error
        );


        showMessage(
            error.message ||
            "Unable to delete poster.",
            "error"
        );

    }

}


/* =========================================================
   SEARCH
========================================================= */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        renderProducts
    );

}


/* =========================================================
   FILTER
========================================================= */

if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        renderProducts
    );

}


/* =========================================================
   PRODUCT ACTIONS
========================================================= */

if (productsGrid) {

    productsGrid.addEventListener(
        "click",
        async event => {

            const button =
                event.target.closest(
                    "[data-action]"
                );


            if (!button) {
                return;
            }


            const action =
                button.dataset.action;


            const id =
                button.dataset.id;


            /* -------------------------------------
               EDIT DETAILS
            ------------------------------------- */

            if (
                action === "edit"
            ) {

                openEditModal(
                    id
                );

                return;

            }


            /* -------------------------------------
               POSTER EDITOR
            ------------------------------------- */

            if (
                action === "editor"
            ) {

                openPosterEditor(
                    id
                );

                return;

            }


            /* -------------------------------------
               TOGGLE
            ------------------------------------- */

            if (
                action === "toggle"
            ) {

                await toggleProduct(
                    id
                );

                return;

            }


            /* -------------------------------------
               DELETE
            ------------------------------------- */

            if (
                action === "delete"
            ) {

                await deleteProduct(
                    id
                );

            }

        }
    );

}


/* =========================================================
   CLOSE BUTTON
========================================================= */

if (closeModalBtn) {

    closeModalBtn.addEventListener(
        "click",
        closeEditModal
    );

}


/* =========================================================
   CANCEL BUTTON
========================================================= */

if (cancelEditBtn) {

    cancelEditBtn.addEventListener(
        "click",
        closeEditModal
    );

}


/* =========================================================
   FORM SUBMIT
========================================================= */

if (editForm) {

    editForm.addEventListener(
        "submit",
        saveProductChanges
    );

}


/* =========================================================
   CLICK OUTSIDE MODAL
========================================================= */

if (editModal) {

    editModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                editModal
            ) {

                closeEditModal();

            }

        }
    );

}


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (

            event.key ===
                "Escape" &&

            editModal?.classList.contains(
                "show"
            )

        ) {

            closeEditModal();

        }

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

async function initialize() {

    try {

        if (!db) {

            throw new Error(
                "Supabase client is not available."
            );

        }


        const admin =
            await checkAdmin();


        if (!admin) {

            window.location.replace(
                "admin-login.html"
            );

            return;

        }


        if (editModal) {

            editModal.style.display =
                "none";

        }


        await loadProducts();


    } catch (error) {

        console.error(
            "ADMIN PRODUCTS INITIALIZATION ERROR:",
            error
        );


        if (productsGrid) {

            productsGrid.innerHTML = `

                <div
                    style="
                        grid-column:1/-1;
                        padding:40px;
                        text-align:center;
                        color:#f87171;
                    "
                >

                    Admin page could not be loaded.

                    <br>

                    <small>
                        ${escapeHtml(
                            error.message
                        )}
                    </small>

                </div>

            `;

        }

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
        initialize
    );

} else {

    initialize();

}