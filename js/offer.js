/* =========================================================
   ZAVYRO POSTERS — OFFER PAGE
========================================================= */

const params =
    new URLSearchParams(
        window.location.search
    );

const offerId =
    params.get("id");


/* =========================================================
   ELEMENTS
========================================================= */

const offerLoading =
    document.getElementById(
        "offerLoading"
    );

const offerError =
    document.getElementById(
        "offerError"
    );

const offerContent =
    document.getElementById(
        "offerContent"
    );

const offerMainImage =
    document.getElementById(
        "offerMainImage"
    );

const offerBadge =
    document.getElementById(
        "offerBadge"
    );

const offerTitle =
    document.getElementById(
        "offerTitle"
    );

const offerDescription =
    document.getElementById(
        "offerDescription"
    );

const offerHighlight =
    document.getElementById(
        "offerHighlight"
    );

const sizeButtons =
    document.getElementById(
        "sizeButtons"
    );

const productsGrid =
    document.getElementById(
        "productsGrid"
    );

const selectionCount =
    document.getElementById(
        "selectionCount"
    );

const offerPrice =
    document.getElementById(
        "offerPrice"
    );

const offerPriceLabel =
    document.getElementById(
        "offerPriceLabel"
    );

const addOfferBtn =
    document.getElementById(
        "addOfferBtn"
    );

const statusMessage =
    document.getElementById(
        "statusMessage"
    );


/* =========================================================
   STATE
========================================================= */

let currentOffer = null;

let offerProducts = [];

let selectedSize = null;

let selectedProducts = [];


/* =========================================================
   HELPERS
========================================================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function money(value) {

    return `₹${Math.round(
        Number(value || 0)
    )}`;
}


function getImageUrl(path) {

    if (!path) {
        return "";
    }

    try {

        const { data } =
            supabaseClient
                .storage
                .from("posters")
                .getPublicUrl(path);

        return data?.publicUrl || "";

    } catch (error) {

        console.error(
            "IMAGE ERROR:",
            error
        );

        return "";
    }
}


function getSizeKey(size) {

    const value =
        String(size || "A4")
            .trim()
            .toUpperCase();


    if (value === "A6") return "a6";
    if (value === "A5") return "a5";
    if (value === "A4") return "a4";
    if (value === "A3") return "a3";

    return "a4";
}


/* =========================================================
   SIZE-BASED PRODUCT PRICE
========================================================= */

function getProductSellingPrice(
    product,
    size
) {

    const key =
        getSizeKey(size);


    /*
     * Offer price first
     */

    if (
        product.offer_active === true &&
        Number(
            product[`offer_${key}`]
        ) > 0
    ) {

        return Number(
            product[`offer_${key}`]
        );
    }


    /*
     * Normal size price
     */

    if (
        Number(
            product[`price_${key}`]
        ) > 0
    ) {

        return Number(
            product[`price_${key}`]
        );
    }


    /*
     * Old fallback
     */

    return Number(
        product.price || 0
    );
}


function getProductMrp(
    product,
    size
) {

    const key =
        getSizeKey(size);


    if (
        Number(
            product[`mrp_${key}`]
        ) > 0
    ) {

        return Number(
            product[`mrp_${key}`]
        );
    }


    return getProductSellingPrice(
        product,
        size
    );
}


/* =========================================================
   REQUIRED POSTERS
========================================================= */

function getRequiredQuantity() {

    if (!currentOffer) {
        return 0;
    }


    if (
        currentOffer.offer_type ===
        "combo"
    ) {

        return Number(
            currentOffer.combo_qty || 0
        );
    }


    if (
        currentOffer.offer_type ===
        "buy_get"
    ) {

        return (
            Number(
                currentOffer.buy_qty || 0
            ) +
            Number(
                currentOffer.get_qty || 0
            )
        );
    }


    return 1;
}


/* =========================================================
   STATUS
========================================================= */

function setStatus(
    message,
    type = ""
) {

    if (!statusMessage) {
        return;
    }


    statusMessage.textContent =
        message;


    statusMessage.className =
        `status-message ${type}`;
}


/* =========================================================
   SHOW ERROR
========================================================= */

function showError(message) {

    if (offerLoading) {
        offerLoading.hidden = true;
    }

    if (offerContent) {
        offerContent.hidden = true;
    }

    if (offerError) {

        offerError.textContent =
            message;

        offerError.hidden = false;
    }
}


/* =========================================================
   RENDER BASIC OFFER
========================================================= */

function renderOffer() {

    offerTitle.textContent =
        currentOffer.title || "Offer";


    offerDescription.textContent =
        currentOffer.description || "";


    offerBadge.textContent =
        currentOffer.badge || "OFFER";


    /*
     * Main image
     */

    if (
        currentOffer.image_path
    ) {

        const imageUrl =
            getImageUrl(
                currentOffer.image_path
            );


        if (imageUrl) {

            offerMainImage.classList.remove(
                "no-image"
            );

            offerMainImage.innerHTML = `
                <img
                    src="${imageUrl}"
                    alt="${escapeHtml(
                        currentOffer.title
                    )}"
                >
            `;

        } else {

            showOfferPlaceholder();

        }

    } else {

        showOfferPlaceholder();
    }


    /*
     * Offer description box
     */

    if (
        currentOffer.offer_type ===
        "buy_get"
    ) {

        const buy =
            Number(
                currentOffer.buy_qty || 0
            );


        const get =
            Number(
                currentOffer.get_qty || 0
            );


        offerHighlight.innerHTML = `

            🔥

            <strong>
                BUY ${buy} GET ${get} FREE
            </strong>

            <br>

            Choose
            ${buy + get}
            posters of the same size.

        `;
    }


    else if (
        currentOffer.offer_type ===
        "combo"
    ) {

        const qty =
            Number(
                currentOffer.combo_qty || 0
            );


        const price =
            Number(
                currentOffer.combo_price || 0
            );


        offerHighlight.innerHTML = `

            🔥

            <strong>
                ${qty} POSTER COMBO
            </strong>

            <br>

            Get ${qty}
            posters for
            ${money(price)}.

        `;
    }


    else {

        const discount =
            Number(
                currentOffer.discount_percent || 0
            );


        offerHighlight.innerHTML = `

            🔥

            <strong>
                ${discount}% OFF
            </strong>

        `;
    }
}


function showOfferPlaceholder() {

    offerMainImage.classList.add(
        "no-image"
    );

    offerMainImage.innerHTML =
        "🔥";
}


/* =========================================================
   RENDER SIZE BUTTONS
========================================================= */

function renderSizes() {

    sizeButtons.innerHTML = "";


    const sizes =
        Array.isArray(
            currentOffer.available_sizes
        )
            ? currentOffer.available_sizes
            : [
                "A3",
                "A4",
                "A5",
                "A6"
            ];


    sizes.forEach(
        size => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "size-btn";


            button.textContent =
                size;


            button.addEventListener(
                "click",
                () => {

                    selectedSize =
                        size;


                    selectedProducts =
                        [];


                    document
                        .querySelectorAll(
                            ".size-btn"
                        )
                        .forEach(
                            btn =>
                                btn.classList.remove(
                                    "active"
                                )
                        );


                    button.classList.add(
                        "active"
                    );


                    renderProducts();

                    updateSelectionUI();

                    setStatus("");
                }
            );


            sizeButtons.appendChild(
                button
            );
        }
    );


    /*
     * Default to A4 when available
     */

    const preferred =
        sizes.includes("A4")
            ? "A4"
            : sizes[0];


    const preferredButton =
        [...sizeButtons.children]
            .find(
                button =>
                    button.textContent ===
                    preferred
            );


    if (preferredButton) {
        preferredButton.click();
    }
}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts() {

    productsGrid.innerHTML = "";


    if (!selectedSize) {

        productsGrid.innerHTML = `
            <p style="color:#777">
                Choose a size first.
            </p>
        `;

        return;
    }


    if (!offerProducts.length) {

        productsGrid.innerHTML = `
            <p style="color:#777">
                No posters have been added
                to this offer yet.
            </p>
        `;

        return;
    }


    offerProducts.forEach(
        row => {

            const product =
                row.product;


            if (!product) {
                return;
            }


            const price =
                getProductSellingPrice(
                    product,
                    selectedSize
                );


            const imageUrl =
                getImageUrl(
                    product.image_path
                );


            const selected =
                selectedProducts.includes(
                    product.id
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "offer-product";


            if (selected) {
                card.classList.add(
                    "selected"
                );
            }


            card.innerHTML = `

                <div
                    class="offer-product-image"
                >

                    ${
                        imageUrl

                            ? `
                                <img
                                    src="${imageUrl}"
                                    alt="${escapeHtml(
                                        product.title
                                    )}"
                                    loading="lazy"
                                >
                              `

                            : `
                                <div
                                    style="
                                        width:100%;
                                        height:100%;
                                        display:flex;
                                        align-items:center;
                                        justify-content:center;
                                        color:#7c3aed;
                                        font-size:42px;
                                        font-weight:900;
                                    "
                                >
                                    Z
                                </div>
                              `
                    }

                </div>


                <div
                    class="offer-product-body"
                >

                    <h3>
                        ${escapeHtml(
                            product.title
                        )}
                    </h3>


                    <p>
                        ${escapeHtml(
                            product.category ||
                            ""
                        )}
                    </p>


                    <p
                        style="
                            color:#ffd84d;
                            font-weight:700;
                        "
                    >
                        ${money(price)}
                        <span
                            style="
                                color:#666;
                                font-size:11px;
                            "
                        >
                            ${selectedSize}
                        </span>
                    </p>


                    <button
                        type="button"
                        class="select-product-btn"
                    >

                        ${
                            selected
                                ? "✓ SELECTED"
                                : "SELECT POSTER"
                        }

                    </button>

                </div>

            `;


            const selectButton =
                card.querySelector(
                    ".select-product-btn"
                );


            selectButton.addEventListener(
                "click",
                () => {

                    const existingIndex =
                        selectedProducts.indexOf(
                            product.id
                        );


                    if (
                        existingIndex !== -1
                    ) {

                        selectedProducts.splice(
                            existingIndex,
                            1
                        );

                    } else {

                        const required =
                            getRequiredQuantity();


                        if (
                            required > 0 &&
                            selectedProducts.length >=
                            required
                        ) {

                            setStatus(
                                `This offer requires exactly ${required} posters.`,
                                "error"
                            );

                            return;
                        }


                        selectedProducts.push(
                            product.id
                        );
                    }


                    renderProducts();

                    updateSelectionUI();

                    setStatus("");
                }
            );


            productsGrid.appendChild(
                card
            );
        }
    );
}


/* =========================================================
   UPDATE SELECTION UI
========================================================= */

function updateSelectionUI() {

    const count =
        selectedProducts.length;


    const required =
        getRequiredQuantity();


    selectionCount.textContent =
        required > 0
            ? `${count} / ${required}`
            : count;


    addOfferBtn.disabled =
        !selectedSize ||
        (
            required > 0 &&
            count !== required
        );


    /*
     * Combo price
     */

    if (
        currentOffer?.offer_type ===
        "combo"
    ) {

        const price =
            Number(
                currentOffer.combo_price || 0
            );


        offerPrice.textContent =
            price > 0
                ? money(price)
                : "Special Deal";


        offerPriceLabel.textContent =
            `${required} posters • ${selectedSize || ""}`;


        return;
    }


    /*
     * Buy Get
     */

    if (
        currentOffer?.offer_type ===
        "buy_get"
    ) {

        const buy =
            Number(
                currentOffer.buy_qty || 0
            );


        const get =
            Number(
                currentOffer.get_qty || 0
            );


        offerPrice.textContent =
            "FREE OFFER";


        offerPriceLabel.textContent =
            `Buy ${buy} Get ${get} Free • ${selectedSize || ""}`;


        return;
    }


    /*
     * Discount
     */

    offerPrice.textContent =
        "SPECIAL DEAL";


    offerPriceLabel.textContent =
        selectedSize
            ? `Offer size: ${selectedSize}`
            : "Choose a size";
}


/* =========================================================
   LOAD OFFER
========================================================= */

async function loadOffer() {

    if (!offerId) {

        showError(
            "Offer not found."
        );

        return;
    }


    try {

        /*
         * Load offer
         */

        const {
            data: offer,
            error: offerErrorResult
        } =
            await supabaseClient
                .from("offers")
                .select("*")
                .eq(
                    "id",
                    offerId
                )
                .eq(
                    "active",
                    true
                )
                .single();


        if (offerErrorResult) {
            throw offerErrorResult;
        }


        currentOffer =
            offer;


        /*
         * Load products
         */

        const {
            data: rows,
            error: productsError
        } =
            await supabaseClient
                .from("offer_products")
                .select(`
                    id,
                    sort_order,
                    product:products (
                        id,
                        title,
                        description,
                        category,
                        subcategory,
                        image_path,
                        price,
                        price_a6,
                        price_a5,
                        price_a4,
                        price_a3,
                        mrp_a6,
                        mrp_a5,
                        mrp_a4,
                        mrp_a3,
                        offer_a6,
                        offer_a5,
                        offer_a4,
                        offer_a3,
                        offer_active,
                        offer_label,
                        active
                    )
                `)
                .eq(
                    "offer_id",
                    offerId
                )
                .order(
                    "sort_order",
                    {
                        ascending: true
                    }
                );


        if (productsError) {
            throw productsError;
        }


        offerProducts =
            (rows || [])
                .filter(
                    row =>
                        row.product &&
                        row.product.active !== false
                );


        /*
         * Render
         */

        renderOffer();

        renderSizes();

        updateSelectionUI();


        offerLoading.hidden =
            true;


        offerContent.hidden =
            false;


    } catch (error) {

        console.error(
            "OFFER LOAD ERROR:",
            error
        );


        showError(
            error.message ||
            "Unable to load offer."
        );
    }
}


/* =========================================================
   ADD OFFER TO CART
========================================================= */

addOfferBtn.addEventListener(
    "click",
    () => {

        if (
            !currentOffer ||
            !selectedSize
        ) {
            return;
        }


        const required =
            getRequiredQuantity();


        if (
            required > 0 &&
            selectedProducts.length !==
            required
        ) {

            setStatus(
                `Please select exactly ${required} posters.`,
                "error"
            );

            return;
        }


        /*
         * Convert selected product IDs
         * into detailed cart objects.
         */

        const selectedObjects =
            selectedProducts
                .map(
                    productId => {

                        const row =
                            offerProducts.find(
                                item =>
                                    item.product?.id ===
                                    productId
                            );


                        return row?.product ||
                            null;
                    }
                )
                .filter(Boolean);


        if (
            selectedObjects.length !==
            selectedProducts.length
        ) {

            setStatus(
                "Some selected posters could not be loaded.",
                "error"
            );

            return;
        }


        /*
         * IMPORTANT:
         * Store the selected size-specific
         * price and MRP with every poster.
         */

        const detailedProducts =
            selectedObjects.map(
                product => {

                    const price =
                        getProductSellingPrice(
                            product,
                            selectedSize
                        );


                    const mrp =
                        getProductMrp(
                            product,
                            selectedSize
                        );


                    return {

                        id:
                            product.id,

                        title:
                            product.title,

                        category:
                            product.category,

                        subcategory:
                            product.subcategory,

                        image_path:
                            product.image_path,

                        price:

                            price,

                        mrp:

                            mrp,

                        size:
                            selectedSize

                    };
                }
            );


        /*
         * Original prices for combo
         */

        const originalPrices =
            detailedProducts.map(
                product =>
                    Number(
                        product.price || 0
                    )
            );


        /*
         * Create cart item
         */

        const cartItem = {

            /*
             * Local cart ID
             */

            id:
                `offer-${currentOffer.id}-${Date.now()}`,

            type:
                "offer",


            offerId:
                currentOffer.id,


            offerTitle:
                currentOffer.title,


            offerType:
                currentOffer.offer_type,


            size:
                selectedSize,


            quantity:
                1,


            products:
                detailedProducts,


            originalPrices:
                originalPrices,


            promo: {

                active:
                    currentOffer.offer_type ===
                    "buy_get",

                buy:
                    Number(
                        currentOffer.buy_qty || 0
                    ),

                get:
                    Number(
                        currentOffer.get_qty || 0
                    )

            },


            combo: {

                quantity:
                    Number(
                        currentOffer.combo_qty || 0
                    ),

                price:
                    Number(
                        currentOffer.combo_price || 0
                    )

            },


            offerLabel:
                currentOffer.offer_label || "",


            addedAt:
                new Date().toISOString()

        };


        /*
         * Read current cart
         */

        let currentCart = [];


        try {

            currentCart =
                JSON.parse(
                    localStorage.getItem(
                        "zavyroCart"
                    ) || "[]"
                );


            if (
                !Array.isArray(
                    currentCart
                )
            ) {

                currentCart = [];
            }

        } catch {

            currentCart = [];
        }


        /*
         * Add offer
         */

        currentCart.push(
            cartItem
        );


        localStorage.setItem(
            "zavyroCart",
            JSON.stringify(
                currentCart
            )
        );


        setStatus(
            "Offer added to cart successfully!",
            "success"
        );


        addOfferBtn.disabled =
            true;


        addOfferBtn.textContent =
            "✓ ADDED TO CART";


        /*
         * Go to cart
         */

        setTimeout(
            () => {

                window.location.href =
                    "cart.html";

            },
            700
        );
    }
);


/* =========================================================
   MOBILE MENU
========================================================= */

const menuToggle =
    document.getElementById(
        "menuToggle"
    );

const navLinks =
    document.getElementById(
        "navLinks"
    );


if (
    menuToggle &&
    navLinks
) {

    menuToggle.addEventListener(
        "click",
        () => {

            navLinks.classList.toggle(
                "open"
            );
        }
    );
}


/* =========================================================
   START
========================================================= */

loadOffer();