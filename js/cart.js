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

function getImageUrl(path, version = "") {

    if (!path) {
        return "";
    }

    try {

        const { data } =
            supabaseClient
                .storage
                .from("posters")
                .getPublicUrl(path);

        let url = data?.publicUrl || "";

        if (url && version) {
            url += `${url.includes("?") ? "&" : "?"}v=${encodeURIComponent(version)}`;
        }

        return url;

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


    /*
     * CUSTOM POSTER
     *
     * customize.js stores:
     *
     * imageUrl: photo.src
     *
     * This is usually:
     *
     * data:image/jpeg;base64,...
     */

    if (
        item.custom === true &&
        item.imageUrl &&
        typeof item.imageUrl === "string"
    ) {

        return item.imageUrl;
    }


    /*
     * NORMAL PRODUCT — ALWAYS USE THE CURRENT
     * SELECTED SIZE VARIANT FIRST.
     */

    if (
        item.custom !== true &&
        item.type !== "offer" &&
        item.variant_image_path
    ) {

        return getImageUrl(
            item.variant_image_path,
            item.variant_image_version || ""
        );
    }


    /*
     * Normal item with imageUrl
     */

    if (
        item.imageUrl &&
        typeof item.imageUrl === "string"
    ) {

        return item.imageUrl;
    }


    /*
     * Supabase poster
     */

    if (item.image_path) {

        return getImageUrl(
            item.image_path,
            item.updated_at || ""
        );
    }


    /*
     * Older image property
     */

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
                active,
                poster_edits,
                updated_at
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
                    (
                        product.poster_edits?.[size]?.path ||
                        (
                            typeof product.poster_edits?.[size] === "string"
                                ? product.poster_edits[size]
                                : product.image_path
                        )
                    ),

                variant_image_path:
                    (
                        product.poster_edits?.[size]?.path ||
                        (
                            typeof product.poster_edits?.[size] === "string"
                                ? product.poster_edits[size]
                                : ""
                        )
                    ),

                variant_image_version:
                    (
                        product.poster_edits?.[size]?.updated_at ||
                        product.updated_at ||
                        ""
                    ),

                imageUrl:
                    getImageUrl(
                        product.poster_edits?.[size]?.path ||
                        (
                            typeof product.poster_edits?.[size] === "string"
                                ? product.poster_edits[size]
                                : product.image_path
                        ),
                        product.poster_edits?.[size]?.updated_at ||
                        product.updated_at ||
                        ""
                    ),

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


    const imageUrl =
        getCartItemImage(item);


    card.className =
        "cart-item";


    card.innerHTML = `

        <div
            class="cart-item-image zavyro-cart-poster-box"
            style="
                width:110px !important;
                height:140px !important;
                min-width:0 !important;
                min-height:0 !important;
                flex:0 0 auto !important;
                display:flex !important;
                align-items:center !important;
                justify-content:center !important;
                overflow:hidden !important;
                background:#090909 !important;
                border:1px solid #292929 !important;
                border-radius:8px !important;
                padding:4px !important;
            "
        >

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
                            draggable="false"
                            style="
                                width:auto !important;
                                height:auto !important;
                                max-width:100% !important;
                                max-height:100% !important;
                                min-width:0 !important;
                                min-height:0 !important;
                                object-fit:contain !important;
                                object-position:center !important;
                                display:block !important;
                            "
                            onload="window.zavyroFitCartPoster && window.zavyroFitCartPoster(this);"
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
                            display:flex;
                            align-items:center;
                            justify-content:center;
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
                                            width:auto !important;
                                            height:auto !important;
                                            max-width:100% !important;
                                            max-height:100% !important;
                                            object-fit:contain !important;
                                            object-position:center !important;
                                            display:block !important;
                                        "
                                        onload="
                                            this.style.width='auto';
                                            this.style.height='auto';
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
   DELIVERY CHARGE
========================================================= */

const DELIVERY_CHARGE = 50;
const FREE_DELIVERY_THRESHOLD = 500;

function getDeliveryCharge(subtotal) {

    return Number(subtotal) >=
        FREE_DELIVERY_THRESHOLD

        ? 0

        : DELIVERY_CHARGE;
}


function getOrCreateDeliveryRow() {

    let row =
        document.getElementById(
            "deliveryChargeRow"
        );


    if (row) {
        return row;
    }


    if (!summaryTotal) {
        return null;
    }


    const totalRow =
        summaryTotal.parentElement;


    if (
        !totalRow ||
        !totalRow.parentElement
    ) {

        return null;
    }


    row =
        document.createElement(
            "div"
        );


    row.id =
        "deliveryChargeRow";


    row.style.display =
        "flex";


    row.style.alignItems =
        "center";


    row.style.justifyContent =
        "space-between";


    row.style.gap =
        "12px";


    row.style.padding =
        "12px 0";


    row.style.borderTop =
        "1px solid #292929";


    row.style.fontSize =
        "13px";


    totalRow.parentElement.insertBefore(
        row,
        totalRow
    );


    return row;
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


    const deliveryCharge =
        getDeliveryCharge(subtotal);

    const grandTotal =
        subtotal +
        deliveryCharge;


    const deliveryRow =
        getOrCreateDeliveryRow();

    if (deliveryRow) {

        deliveryRow.innerHTML = `
            <span style="color:#bbb;">
                Delivery Charge
            </span>

            <strong style="color:${deliveryCharge === 0 ? "#22c55e" : "#fff"};">
                ${deliveryCharge === 0 ? "FREE" : money(deliveryCharge)}
            </strong>
        `;
    }


    /* =====================================================
       FREE DELIVERY PROGRESS DISPLAY
       ONLY ADDITION
    ===================================================== */

    let freeDeliveryMessage =
        document.getElementById(
            "freeDeliveryMessage"
        );


    if (!freeDeliveryMessage) {

        freeDeliveryMessage =
            document.createElement(
                "div"
            );

        freeDeliveryMessage.id =
            "freeDeliveryMessage";

        freeDeliveryMessage.style.fontSize =
            "12px";

        freeDeliveryMessage.style.marginTop =
            "6px";

        freeDeliveryMessage.style.lineHeight =
            "1.4";

        freeDeliveryMessage.style.textAlign =
            "right";

        freeDeliveryMessage.style.width =
            "100%";


        if (summarySubtotal) {

            const subtotalParent =
                summarySubtotal.parentElement;

            if (
                subtotalParent &&
                subtotalParent.parentElement
            ) {

                subtotalParent.parentElement
                    .appendChild(
                        freeDeliveryMessage
                    );
            }
        }
    }


    if (freeDeliveryMessage) {

        if (
            subtotal >=
            FREE_DELIVERY_THRESHOLD
        ) {

            freeDeliveryMessage.innerHTML =
                "🎉 <strong>FREE delivery!</strong>";

            freeDeliveryMessage.style.color =
                "#22c55e";

        } else {

            const remaining =
                FREE_DELIVERY_THRESHOLD -
                subtotal;

            freeDeliveryMessage.innerHTML =
                `Purchase ${money(remaining)} more to get <strong>FREE delivery</strong>`;

            freeDeliveryMessage.style.color =
                "#aaa";
        }
    }


    /* =====================================================
       GRAND TOTAL
========================================================= */

    if (summaryTotal) {

        summaryTotal.textContent =
            money(
                grandTotal
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


    cartContainer.innerHTML =
        "";


    if (!cart.length) {

        if (cartContent) {

            cartContent.hidden =
                true;
        }


        if (emptyCart) {

            emptyCart.hidden =
                false;
        }


        updateSummary();

        return;
    }


    if (cartContent) {

        cartContent.hidden =
            false;
    }


    if (emptyCart) {

        emptyCart.hidden =
            true;
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


            if (
                item.type === "offer"
            ) {

                return;
            }


            if (
                action === "plus"
            ) {

                item.quantity =
                    Math.max(
                        1,
                        Number(
                            item.quantity ||
                            1
                        )
                    ) + 1;


                saveCart();

                renderCart();

                return;
            }


            if (
                action === "minus"
            ) {

                const current =
                    Math.max(
                        1,
                        Number(
                            item.quantity ||
                            1
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
   FINAL CART POSTER IMAGE FIT
========================================================= */

window.zavyroFitCartPoster =
    function(img) {

        if (
            !img ||
            !img.naturalWidth ||
            !img.naturalHeight
        ) {

            return;
        }


        const box =
            img.closest(
                ".zavyro-cart-poster-box"
            );


        if (!box) {
            return;
        }


        const mobile =
            window.innerWidth <= 768;


        const maxWidth =
            mobile
                ? 86
                : 110;


        const maxHeight =
            mobile
                ? 112
                : 140;


        const ratio =
            img.naturalWidth /
            img.naturalHeight;


        let width =
            maxWidth;


        let height =
            width /
            ratio;


        if (
            height >
            maxHeight
        ) {

            height =
                maxHeight;


            width =
                height *
                ratio;
        }


        const finalWidth =
            Math.max(
                48,
                Math.round(
                    width
                )
            );


        const finalHeight =
            Math.max(
                60,
                Math.round(
                    height
                )
            );


        box.style.setProperty(
            "width",
            `${finalWidth}px`,
            "important"
        );


        box.style.setProperty(
            "height",
            `${finalHeight}px`,
            "important"
        );


        box.style.setProperty(
            "min-width",
            `${finalWidth}px`,
            "important"
        );


        box.style.setProperty(
            "min-height",
            `${finalHeight}px`,
            "important"
        );


        box.style.setProperty(
            "flex",
            `0 0 ${finalWidth}px`,
            "important"
        );


        img.style.setProperty(
            "width",
            `${Math.round(width)}px`,
            "important"
        );


        img.style.setProperty(
            "height",
            `${Math.round(height)}px`,
            "important"
        );


        img.style.setProperty(
            "max-width",
            "100%",
            "important"
        );


        img.style.setProperty(
            "max-height",
            "100%",
            "important"
        );


        img.style.setProperty(
            "min-width",
            "0",
            "important"
        );


        img.style.setProperty(
            "min-height",
            "0",
            "important"
        );


        img.style.setProperty(
            "object-fit",
            "contain",
            "important"
        );


        img.style.setProperty(
            "object-position",
            "center",
            "important"
        );
    };


function fixAllZavyroCartPosters() {

    document
        .querySelectorAll(
            "#cartItems .zavyro-cart-poster-box img"
        )
        .forEach(
            img => {

                if (
                    img.complete &&
                    img.naturalWidth > 0
                ) {

                    window.zavyroFitCartPoster(
                        img
                    );
                }
            }
        );
}


window.addEventListener(
    "resize",
    fixAllZavyroCartPosters
);


/* =========================================================
   START
========================================================= */

async function initializeCart() {

    renderCart();


    await loadProductData();


    renderCart();


    setTimeout(
        fixAllZavyroCartPosters,
        50
    );


    setTimeout(
        fixAllZavyroCartPosters,
        250
    );


    setTimeout(
        fixAllZavyroCartPosters,
        500
    );
}


initializeCart();