
/* =========================================================
   ZAVYRO POSTERS
   CART SYSTEM

   NORMAL PRODUCTS:
   - Different sizes are allowed in the same cart.
   - Each product keeps its own selected size.

   CUSTOM PRODUCTS:
   - Uploaded image is stored in item.imageUrl.
   - Custom image must be displayed directly.

   OFFERS / COMBOS:
   - Each offer has its own selected size.
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const cartContainer =
    document.getElementById("cartItems");

const emptyCart =
    document.getElementById("emptyCart");

const cartContent =
    document.getElementById("cartContent");

const summaryItems =
    document.getElementById("summaryItems");

const summarySubtotal =
    document.getElementById("summarySubtotal");

const summaryTotal =
    document.getElementById("summaryTotal");

const checkoutBtn =
    document.getElementById("checkoutBtn");

const cartCount =
    document.getElementById("cartCount");

const menuToggle =
    document.getElementById("menuToggle");

const navLinks =
    document.getElementById("navLinks");


/* =========================================================
   LOAD CART
========================================================= */

let cart = [];

try {

    cart =
        JSON.parse(
            localStorage.getItem("zavyroCart") || "[]"
        );

    if (!Array.isArray(cart)) {
        cart = [];
    }

} catch (error) {

    console.error(
        "Unable to read cart:",
        error
    );

    cart = [];
}


/* =========================================================
   STORAGE
========================================================= */

function saveCart() {

    localStorage.setItem(
        "zavyroCart",
        JSON.stringify(cart)
    );
}


/* =========================================================
   MONEY
========================================================= */

function money(value) {

    const amount =
        Number(value);

    if (!Number.isFinite(amount)) {
        return "₹0";
    }

    return `₹${Math.round(amount)}`;
}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   IMAGE URL
========================================================= */

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
            "Image URL error:",
            error
        );

        return "";
    }
}


/* =========================================================
   GET CART IMAGE
   CUSTOM IMAGE SUPPORT
========================================================= */

function getCartItemImage(item) {

    if (!item) {
        return "";
    }

    /* CUSTOM POSTER — NEVER CHANGE */
    if (
        item.custom === true &&
        item.imageUrl &&
        typeof item.imageUrl === "string"
    ) {
        return item.imageUrl;
    }

    /* OFFER — KEEP EXISTING OFFER IMAGE */
    if (
        item.type === "offer" &&
        item.imageUrl &&
        typeof item.imageUrl === "string"
    ) {
        return item.imageUrl;
    }

    /* NORMAL PRODUCT — CURRENT SELECTED SIZE */
    if (
        item.custom !== true &&
        item.type !== "offer"
    ) {

        const product =
            item.productData ||
            item.product ||
            null;

        const size =
            String(
                item.size || "A4"
            )
            .trim()
            .toUpperCase();

        if (product) {

            let variantPath = "";

            /*
             * First use the exact variant path saved
             * by Poster Editor.
             */
            if (
                product.poster_edits &&
                product.poster_edits[size]
            ) {

                const variant =
                    product.poster_edits[size];

                if (
                    typeof variant === "string"
                ) {
                    variantPath = variant;
                } else if (
                    variant.path
                ) {
                    variantPath =
                        variant.path;
                }
            }

            /*
             * Standard Poster Editor path.
             */
            if (!variantPath) {

                const productId =
                    product.id ||
                    item.product_id ||
                    item.productId;

                if (productId) {

                    variantPath =
                        `products/${productId}/${size}.png`;
                }
            }

            if (variantPath) {

                const {
                    data
                } =
                    supabaseClient
                        .storage
                        .from("posters")
                        .getPublicUrl(
                            variantPath
                        );

                let url =
                    data?.publicUrl || "";

                /*
                 * Prevent old browser cache.
                 */
                if (url) {

                    const version =
                        product.updated_at ||
                        Date.now();

                    url +=
                        `${url.includes("?") ? "&" : "?"}v=${encodeURIComponent(version)}`;
                }

                return url;
            }
        }
    }

    /* LEGACY FALLBACK */
    if (
        item.image_path &&
        typeof item.image_path === "string"
    ) {

        const {
            data
        } =
            supabaseClient
                .storage
                .from("posters")
                .getPublicUrl(
                    item.image_path
                );

        return data?.publicUrl || "";
    }

    /* OLD IMAGE FIELD */
    if (
        item.image &&
        typeof item.image === "string"
    ) {
        return item.image;
    }

    return "";
}


/* =========================================================
   SIZE KEY
========================================================= */

function getSizeKey(size) {

    const normalized =
        String(size || "A4")
            .trim()
            .toUpperCase();


    if (normalized === "A6") return "a6";
    if (normalized === "A5") return "a5";
    if (normalized === "A4") return "a4";
    if (normalized === "A3") return "a3";

    return "a4";
}


/* =========================================================
   GET PRODUCT ID
========================================================= */

function getProductId(item) {

    return (
        item.product_id ||
        item.productId ||
        item.product?.id ||
        item.productData?.id ||
        (
            typeof item.id === "string" &&
            item.id.length >= 30
                ? item.id
                : null
        )
    );
}


/* =========================================================
   GET SELLING PRICE
========================================================= */

function getSellingPrice(
    product,
    size
) {

    if (!product) {
        return 0;
    }


    const key =
        getSizeKey(size);


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


    if (
        Number(
            product[`price_${key}`]
        ) > 0
    ) {

        return Number(
            product[`price_${key}`]
        );
    }


    if (
        Number(product.price) > 0
    ) {

        return Number(
            product.price
        );
    }


    return 0;
}


/* =========================================================
   GET MRP
========================================================= */

function getMrp(
    product,
    size
) {

    if (!product) {
        return 0;
    }


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


    return getSellingPrice(
        product,
        size
    );
}


/* =========================================================
   RECOVER PRODUCT DATA
========================================================= */

async function loadProductData() {

    const productIds = [];


    cart.forEach(item => {

        /*
         * CUSTOM ITEMS DO NOT EXIST
         * IN THE PRODUCTS TABLE.
         */

        if (
            item.custom === true ||
            item.type === "offer"
        ) {
            return;
        }


        const productId =
            getProductId(item);


        if (productId) {

            productIds.push(
                productId
            );
        }
    });


    const uniqueIds =
        [...new Set(productIds)];


    if (!uniqueIds.length) {
        return;
    }


    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("products")
            .select(`
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
                badge,
                active
            `)
            .in(
                "id",
                uniqueIds
            );


        if (error) {
            throw error;
        }


        const productMap =
            new Map();


        (data || []).forEach(
            product => {

                productMap.set(
                    product.id,
                    product
                );
            }
        );


        cart = cart.map(item => {

            /*
             * Never modify custom items.
             */

            if (
                item.custom === true ||
                item.type === "offer"
            ) {

                return item;
            }


            const productId =
                getProductId(item);


            const product =
                productMap.get(
                    productId
                );


            if (!product) {
                return item;
            }


            const size =
                item.size || "A4";


            const sellingPrice =
                getSellingPrice(
                    product,
                    size
                );


            const mrp =
                getMrp(
                    product,
                    size
                );


            return {

                ...item,

                product_id:
                    product.id,

                title:
                    product.title,

                description:
                    product.description,

                category:
                    product.category,

                subcategory:
                    product.subcategory,

                image_path:
                    product.image_path,

                productData:
                    product,

                price:
                    sellingPrice,

                mrp:
                    mrp
            };

        });


        saveCart();


    } catch (error) {

        console.error(
            "Could not recover product data:",
            error
        );
    }
}


/* =========================================================
   NORMAL PRODUCT DATA
========================================================= */

function getNormalData(item) {

    const quantity =
        Math.max(
            1,
            Number(
                item.quantity || 1
            )
        );


    const size =
        item.size || "A4";


    let sellingPrice =
        Number(
            item.price || 0
        );


    let mrp =
        Number(
            item.mrp || 0
        );


    /*
     * Custom poster:
     * use its stored price directly.
     */

    if (
        item.custom === true
    ) {

        sellingPrice =
            Number(
                item.price ||
                item.offerPrice ||
                0
            );

        mrp =
            Number(
                item.mrp ||
                sellingPrice
            );
    }


    /*
     * Normal product:
     * prefer current Supabase data.
     */

    else if (item.productData) {

        sellingPrice =
            getSellingPrice(
                item.productData,
                size
            );


        mrp =
            getMrp(
                item.productData,
                size
            );
    }


    if (!sellingPrice) {

        sellingPrice =
            Number(
                item.offerPrice ||
                item.price ||
                0
            );
    }


    if (!mrp) {

        mrp =
            Number(
                item.mrp ||
                sellingPrice
            );
    }


    const subtotal =
        sellingPrice *
        quantity;


    const mrpTotal =
        mrp *
        quantity;


    const savings =
        Math.max(
            0,
            mrpTotal -
            subtotal
        );


    return {

        quantity,
        size,
        sellingPrice,
        mrp,
        subtotal,
        mrpTotal,
        savings
    };
}


/* =========================================================
   RENDER NORMAL PRODUCT
========================================================= */

function renderNormalProduct(
    card,
    item,
    index
) {

    const data =
        getNormalData(item);


    /*
     * THIS IS THE IMPORTANT FIX.
     *
     * Custom posters use item.imageUrl.
     * Normal posters use Supabase image_path.
     */

    const imageUrl =
        getCartItemImage(item);


    card.className =
        "cart-item";


    card.innerHTML = `

        <div class="cart-item-image">

            ${
                imageUrl

                    ? `
                        <img
                            src="${imageUrl}"
                            alt="${escapeHtml(
                                item.custom
                                    ? "Custom Poster"
                                    : (
                                        item.title ||
                                        "Poster"
                                    )
                            )}"
                            onerror="
                                this.style.display='none';
                            "
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


        <div class="cart-item-info">

            <h3>
                ${escapeHtml(
                    item.title ||
                    "Poster"
                )}
            </h3>


            ${
                item.custom

                    ? `
                        <p>
                            Custom Poster
                        </p>
                      `

                    : (
                        item.category
                            ? `
                                <p>
                                    ${escapeHtml(
                                        item.category
                                    )}
                                </p>
                              `
                            : ""
                    )
            }


            ${
                !item.custom &&
                item.subcategory

                    ? `
                        <p>
                            ${escapeHtml(
                                item.subcategory
                            )}
                        </p>
                      `

                    : ""
            }


            <p class="cart-item-size">
                Size:
                <strong>
                    ${escapeHtml(
                        data.size
                    )}
                </strong>
            </p>


            ${
                item.custom &&
                item.customFileName

                    ? `
                        <p>
                            ${escapeHtml(
                                item.customFileName
                            )}
                        </p>
                      `

                    : ""
            }


            <div class="cart-price-line">

                ${
                    data.mrp >
                    data.sellingPrice

                        ? `
                            <span class="cart-mrp">
                                ${money(
                                    data.mrp
                                )}
                            </span>
                          `

                        : ""
                }


                <span class="cart-offer-price">
                    ${money(
                        data.sellingPrice
                    )}
                </span>

            </div>


            ${
                data.savings > 0

                    ? `
                        <div class="cart-save">
                            Save
                            ${money(
                                data.savings
                            )}
                        </div>
                      `

                    : ""
            }


            <div class="cart-per-poster">
                Price per poster
            </div>

        </div>


        <div class="cart-item-actions">

            <div class="cart-quantity">

                <button
                    type="button"
                    data-action="minus"
                    data-index="${index}"
                >
                    −
                </button>

                <span>
                    ${data.quantity}
                </span>

                <button
                    type="button"
                    data-action="plus"
                    data-index="${index}"
                >
                    +
                </button>

            </div>


            <strong class="cart-item-total">
                ${money(
                    data.subtotal
                )}
            </strong>


            <button
                type="button"
                class="remove-item"
                data-action="remove"
                data-index="${index}"
            >
                Remove
            </button>

        </div>

    `;
}


/* =========================================================
   OFFER CALCULATION
========================================================= */

function calculateOffer(
    item
) {

    const products =
        Array.isArray(
            item.products
        )
            ? item.products
            : [];


    const type =
        item.offerType ||
        item.offer_type ||
        "";


    /* =========================
       COMBO
    ========================= */

    if (
        type === "combo"
    ) {

        const comboPrice =
            Number(
                item.combo?.price || 0
            );


        let originalTotal = 0;


        products.forEach(
            product => {

                originalTotal +=
                    Number(
                        product.price ||
                        product.offerPrice ||
                        0
                    );
            }
        );


        return {

            total:
                comboPrice,

            savings:
                Math.max(
                    0,
                    originalTotal -
                    comboPrice
                ),

            count:
                products.length
        };
    }


    /* =========================
       BUY X GET Y
    ========================= */

    if (
        type === "buy_get"
    ) {

        const buy =
            Number(
                item.promo?.buy || 0
            );


        const get =
            Number(
                item.promo?.get || 0
            );


        if (
            buy <= 0 ||
            get <= 0
        ) {

            const total =
                products.reduce(
                    (
                        sum,
                        product
                    ) =>
                        sum +
                        Number(
                            product.price ||
                            0
                        ),
                    0
                );


            return {

                total,

                savings: 0,

                count:
                    products.length
            };
        }


        const prices =
            products
                .map(
                    product =>
                        Number(
                            product.price ||
                            product.offerPrice ||
                            0
                        )
                );


        const fullTotal =
            prices.reduce(
                (
                    sum,
                    price
                ) =>
                    sum + price,
                0
            );


        const groupSize =
            buy + get;


        let payableTotal = 0;


        for (
            let start = 0;
            start < prices.length;
            start += groupSize
        ) {

            const group =
                prices.slice(
                    start,
                    start + groupSize
                );


            const sorted =
                [...group].sort(
                    (
                        a,
                        b
                    ) =>
                        b - a
                );


            const freeCount =
                Math.min(
                    get,
                    Math.max(
                        0,
                        sorted.length -
                        buy
                    )
                );


            const freeValue =
                sorted
                    .slice(
                        0,
                        freeCount
                    )
                    .reduce(
                        (
                            sum,
                            price
                        ) =>
                            sum + price,
                        0
                    );


            payableTotal +=
                group.reduce(
                    (
                        sum,
                        price
                    ) =>
                        sum + price,
                    0
                ) -
                freeValue;
        }


        return {

            total:
                payableTotal,

            savings:
                Math.max(
                    0,
                    fullTotal -
                    payableTotal
                ),

            count:
                products.length
        };
    }


    return {

        total:
            Number(
                item.total ||
                item.price ||
                0
            ),

        savings:
            0,

        count:
            1
    };
}


/* =========================================================
   RENDER OFFER
========================================================= */

function renderOffer(
    card,
    item,
    index
) {

    const products =
        Array.isArray(
            item.products
        )
            ? item.products
            : [];


    const offerType =
        item.offerType ||
        item.offer_type ||
        "";


    const result =
        calculateOffer(
            item
        );


    let description =
        "Special Zavyro offer";


    if (
        offerType === "combo"
    ) {

        const quantity =
            Number(
                item.combo?.quantity ||
                products.length
            );


        description =
            `${quantity} Posters Combo`;
    }


    if (
        offerType === "buy_get"
    ) {

        const buy =
            Number(
                item.promo?.buy || 0
            );

        const get =
            Number(
                item.promo?.get || 0
            );

        description =
            `Buy ${buy} Get ${get} Free`;
    }


    let productsHtml = "";


    products.forEach(
        product => {

            const imageUrl =
                getCartItemImage(
                    product
                );


            productsHtml += `

                <div
                    style="
                        display:flex;
                        align-items:center;
                        gap:10px;
                        padding:8px 0;
                        border-bottom:1px solid #202020;
                    "
                >

                    <div
                        style="
                            width:48px;
                            height:62px;
                            border-radius:6px;
                            overflow:hidden;
                            background:#090909;
                            border:1px solid #292929;
                            flex-shrink:0;
                        "
                    >

                        ${
                            imageUrl

                                ? `
                                    <img
                                        src="${imageUrl}"
                                        alt="${escapeHtml(
                                            product.title ||
                                            "Poster"
                                        )}"
                                        style="
                                            width:100%;
                                            height:100%;
                                            object-fit:cover;
                                        "
                                    >
                                  `

                                : `
                                    <div
                                        style="
                                            display:flex;
                                            align-items:center;
                                            justify-content:center;
                                            width:100%;
                                            height:100%;
                                            color:#7c3aed;
                                            font-weight:900;
                                        "
                                    >
                                        Z
                                    </div>
                                  `
                        }

                    </div>


                    <span
                        style="
                            color:#bbb;
                            font-size:13px;
                        "
                    >
                        ${escapeHtml(
                            product.title ||
                            "Poster"
                        )}
                    </span>

                </div>

            `;
        }
    );


    card.className =
        "cart-item";


    card.style.display =
        "block";


    card.innerHTML = `

        <div
            style="
                display:flex;
                justify-content:space-between;
                gap:20px;
                align-items:flex-start;
                margin-bottom:15px;
            "
        >

            <div>

                <div class="cart-promo">

                    <strong>
                        🔥
                        ${escapeHtml(
                            item.offerTitle ||
                            "SPECIAL OFFER"
                        )}
                    </strong>

                    <span>
                        ${escapeHtml(
                            description
                        )}
                    </span>

                </div>


                <div
                    class="cart-item-size"
                    style="margin-top:10px"
                >
                    Size:
                    <strong>
                        ${escapeHtml(
                            item.size ||
                            "-"
                        )}
                    </strong>
                </div>

            </div>


            <button
                type="button"
                class="remove-item"
                data-action="remove"
                data-index="${index}"
            >
                Remove
            </button>

        </div>


        <div>

            ${productsHtml}

        </div>


        <div
            style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                margin-top:18px;
                padding-top:15px;
                border-top:1px solid #292929;
            "
        >

            <div>

                ${
                    result.savings > 0

                        ? `
                            <div class="cart-save">
                                Save
                                ${money(
                                    result.savings
                                )}
                            </div>
                          `

                        : ""
                }

                <span
                    style="
                        display:block;
                        margin-top:4px;
                        color:#777;
                        font-size:12px;
                    "
                >
                    Offer Total
                </span>

            </div>


            <strong class="cart-item-total">
                ${money(
                    result.total
                )}
            </strong>

        </div>

    `;
}


/* =========================================================
   UPDATE SUMMARY
========================================================= */

function updateSummary() {

    let totalItems = 0;

    let subtotal = 0;


    cart.forEach(
        item => {

            /* =========================
               NORMAL / CUSTOM PRODUCT
            ========================= */

            if (
                item.type !== "offer"
            ) {

                const data =
                    getNormalData(
                        item
                    );


                totalItems +=
                    data.quantity;


                subtotal +=
                    data.subtotal;


                return;
            }


            /* =========================
               OFFER
            ========================= */

            const result =
                calculateOffer(
                    item
                );


            totalItems +=
                Number(
                    result.count || 1
                );


            subtotal +=
                Number(
                    result.total || 0
                );
        }
    );


    if (summaryItems) {

        summaryItems.textContent =
            totalItems;
    }


    if (summarySubtotal) {

        summarySubtotal.textContent =
            money(
                subtotal
            );
    }


    if (summaryTotal) {

        summaryTotal.textContent =
            money(
                subtotal
            );
    }


    if (checkoutBtn) {

        checkoutBtn.disabled =
            cart.length === 0;
    }


    if (cartCount) {

        cartCount.textContent =
            totalItems;
    }
}


/* =========================================================
   RENDER CART
========================================================= */

function renderCart() {

    if (!cartContainer) {
        return;
    }


    cartContainer.innerHTML = "";


    if (!cart.length) {

        if (cartContent) {
            cartContent.hidden = true;
        }

        if (emptyCart) {
            emptyCart.hidden = false;
        }


        updateSummary();

        return;
    }


    if (cartContent) {
        cartContent.hidden = false;
    }

    if (emptyCart) {
        emptyCart.hidden = true;
    }


    cart.forEach(
        (
            item,
            index
        ) => {

            const card =
                document.createElement(
                    "div"
                );


            if (
                item.type === "offer"
            ) {

                renderOffer(
                    card,
                    item,
                    index
                );

            } else {

                renderNormalProduct(
                    card,
                    item,
                    index
                );
            }


            cartContainer.appendChild(
                card
            );
        }
    );


    updateSummary();
}


/* =========================================================
   CART EVENTS
========================================================= */

if (cartContainer) {

    cartContainer.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-action]"
                );


            if (!button) {
                return;
            }


            const index =
                Number(
                    button.dataset.index
                );


            const action =
                button.dataset.action;


            if (
                Number.isNaN(index) ||
                !cart[index]
            ) {
                return;
            }


            const item =
                cart[index];


            /* REMOVE */

            if (
                action === "remove"
            ) {

                cart.splice(
                    index,
                    1
                );


                saveCart();

                renderCart();

                return;
            }


            /*
             * Offers are not quantity-editable.
             */

            if (
                item.type === "offer"
            ) {
                return;
            }


            /* PLUS */

            if (
                action === "plus"
            ) {

                item.quantity =
                    Math.max(
                        1,
                        Number(
                            item.quantity || 1
                        )
                    ) + 1;


                saveCart();

                renderCart();

                return;
            }


            /* MINUS */

            if (
                action === "minus"
            ) {

                const current =
                    Math.max(
                        1,
                        Number(
                            item.quantity || 1
                        )
                    );


                if (
                    current > 1
                ) {

                    item.quantity =
                        current - 1;


                    saveCart();

                    renderCart();
                }
            }

        }
    );
}


/* =========================================================
   CHECKOUT
========================================================= */

if (checkoutBtn) {

    checkoutBtn.addEventListener(
        "click",
        () => {

            if (!cart.length) {
                return;
            }


            window.location.href =
                "checkout.html";
        }
    );
}


/* =========================================================
   MOBILE MENU
========================================================= */

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

async function initializeCart() {

    /*
     * Render immediately.
     */

    renderCart();


    /*
     * Recover only normal products.
     * Custom posters are skipped.
     */

    await loadProductData();


    /*
     * Render again with latest
     * normal product information.
     */

    renderCart();
}


initializeCart();

