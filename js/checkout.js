let cart =
    JSON.parse(
        localStorage.getItem("zavyroCart") || "[]"
    );

const checkoutContent =
    document.getElementById("checkoutContent");

const emptyCheckout =
    document.getElementById("emptyCheckout");

const summaryItems =
    document.getElementById("summaryItems");

const summaryTotal =
    document.getElementById("summaryTotal");

const checkoutForm =
    document.getElementById("checkoutForm");

const payBtn =
    document.getElementById("payBtn");

const checkoutMessage =
    document.getElementById("checkoutMessage");


function showError(message) {

    if (!checkoutMessage) {
        alert(message);
        return;
    }

    checkoutMessage.textContent = message;

    checkoutMessage.className =
        "checkout-message error";
}


/* =========================
   GET IMAGE
========================= */

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


function getProductId(item) {

    return (
        item?.product_id ||
        item?.productId ||
        item?.product?.id ||
        item?.productData?.id ||
        null
    );
}


function getVariantPath(product, size) {

    const saved =
        product?.poster_edits?.[size];

    if (saved && typeof saved === "object" && saved.path) {
        return saved.path;
    }

    if (typeof saved === "string") {
        return saved;
    }

    return product?.image_path || "";
}


function getVariantVersion(product, size) {

    return (
        product?.poster_edits?.[size]?.updated_at ||
        product?.updated_at ||
        ""
    );
}


function getPublicProductImage(path, version = "") {

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
        console.error("CHECKOUT IMAGE URL ERROR:", error);
        return "";
    }
}


function getProductImage(item) {

    /*
       CUSTOM POSTER

       Custom images must never be replaced.
    */

    if (
        item?.custom === true &&
        item.imageUrl &&
        typeof item.imageUrl === "string"
    ) {
        return item.imageUrl;
    }


    /*
       OFFERS keep their existing image.
    */

    if (
        item?.type === "offer" &&
        item.imageUrl &&
        typeof item.imageUrl === "string"
    ) {
        return item.imageUrl;
    }


    /*
       NORMAL PRODUCT — selected size variant.
    */

    if (item?.variant_image_path) {
        return getPublicProductImage(
            item.variant_image_path,
            item.variant_image_version || ""
        );
    }

    if (item?.productData) {
        const size = item.size || "A4";
        const path = getVariantPath(item.productData, size);
        const version = getVariantVersion(item.productData, size);

        return getPublicProductImage(path, version);
    }


    /*
       Legacy normal item fallback.
    */

    if (item?.image_path) {
        return getPublicProductImage(
            item.image_path,
            item.updated_at || ""
        );
    }


    /*
       Older image field
    */

    if (
        item &&
        item.image &&
        typeof item.image === "string"
    ) {
        return item.image;
    }


    return "";
}


/* =========================================================
   CHECKOUT POSTER IMAGE FIT
   ONLY IMAGE FITTING FIX
========================================================= */

function fitCheckoutPosterImage(imageElement) {

    if (
        !imageElement ||
        !imageElement.naturalWidth ||
        !imageElement.naturalHeight
    ) {
        return;
    }

    /*
       Maximum display area.

       The actual image keeps its
       original natural aspect ratio.
    */

    const maxWidth = 72;
    const maxHeight = 90;

    const ratio =
        imageElement.naturalWidth /
        imageElement.naturalHeight;

    let width =
        maxWidth;

    let height =
        width / ratio;


    /*
       If the image becomes too tall,
       scale it down while keeping
       its original aspect ratio.
    */

    if (height > maxHeight) {

        height =
            maxHeight;

        width =
            height * ratio;
    }


    /*
       If the image becomes too wide,
       scale it down again.
    */

    if (width > maxWidth) {

        width =
            maxWidth;

        height =
            width / ratio;
    }


    /*
       Inline !important overrides
       existing checkout CSS dimensions.
    */

    imageElement.style.setProperty(
        "width",
        `${Math.round(width)}px`,
        "important"
    );

    imageElement.style.setProperty(
        "height",
        `${Math.round(height)}px`,
        "important"
    );

    imageElement.style.setProperty(
        "max-width",
        `${maxWidth}px`,
        "important"
    );

    imageElement.style.setProperty(
        "max-height",
        `${maxHeight}px`,
        "important"
    );

    imageElement.style.setProperty(
        "object-fit",
        "contain",
        "important"
    );

    imageElement.style.setProperty(
        "object-position",
        "center center",
        "important"
    );

    imageElement.style.setProperty(
        "display",
        "block",
        "important"
    );

    imageElement.style.setProperty(
        "flex-shrink",
        "0",
        "important"
    );
}


/* =========================
   REFRESH CURRENT PRODUCT VARIANTS
========================= */

async function refreshCurrentProductVariants() {

    const ids =
        [...new Set(
            cart
                .filter(item =>
                    item &&
                    item.custom !== true &&
                    item.type !== "offer"
                )
                .map(getProductId)
                .filter(Boolean)
        )];

    if (!ids.length) {
        return;
    }

    try {
        const { data, error } =
            await supabaseClient
                .from("products")
                .select(`
                    id,
                    title,
                    description,
                    category,
                    subcategory,
                    image_path,
                    updated_at,
                    poster_edits,
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
                `)
                .in("id", ids);

        if (error) {
            throw error;
        }

        const productMap =
            new Map(
                (data || []).map(product =>
                    [product.id, product]
                )
            );

        cart = cart.map(item => {

            if (
                item.custom === true ||
                item.type === "offer"
            ) {
                return item;
            }

            const product =
                productMap.get(
                    getProductId(item)
                );

            if (!product) {
                return item;
            }

            const size =
                String(item.size || "A4").toUpperCase();

            const variantPath =
                getVariantPath(product, size);

            const variantVersion =
                getVariantVersion(product, size);

            return {
                ...item,
                product_id: product.id,
                title: product.title,
                description: product.description,
                category: product.category,
                subcategory: product.subcategory,
                productData: product,
                image_path: variantPath,
                variant_image_path: variantPath,
                variant_image_version: variantVersion,
                imageUrl: getPublicProductImage(
                    variantPath,
                    variantVersion
                )
            };
        });

        localStorage.setItem(
            "zavyroCart",
            JSON.stringify(cart)
        );

    } catch (error) {
        console.error(
            "CURRENT VARIANT REFRESH ERROR:",
            error
        );
    }
}


/* =========================
   PRICE
========================= */

function getPrice(item) {

    if (item.price !== undefined) {
        return Number(item.price);
    }

    if (item.offerPrice !== undefined) {
        return Number(item.offerPrice);
    }

    return 0;
}


/* =========================
   ITEM TOTAL
========================= */

function calculateItemTotal(item) {

    const quantity =
        Number(item.quantity || 1);

    const price =
        getPrice(item);

    if (
        item.promo_active &&
        Number(item.promo_buy_qty) > 0 &&
        Number(item.promo_get_qty) > 0
    ) {

        const buy =
            Number(item.promo_buy_qty);

        const get =
            Number(item.promo_get_qty);

        const groupSize =
            buy + get;

        const completeGroups =
            Math.floor(
                quantity / groupSize
            );

        const remainder =
            quantity % groupSize;

        const freeFromGroups =
            completeGroups * get;

        const freeFromRemainder =
            Math.max(
                0,
                remainder - buy
            );

        const freeQuantity =
            freeFromGroups +
            freeFromRemainder;

        const payableQuantity =
            quantity - freeQuantity;

        return payableQuantity * price;
    }

    return quantity * price;
}


/* =========================
   GRAND TOTAL
========================= */

function getGrandTotal() {

    return cart.reduce(
        function (total, item) {

            return total +
                calculateItemTotal(item);

        },
        0
    );
}


/* =========================
   RENDER SUMMARY
========================= */

function renderSummary() {

    if (!cart.length) {

        if (checkoutContent) {
            checkoutContent.hidden = true;
        }

        if (emptyCheckout) {
            emptyCheckout.hidden = false;
        }

        return;
    }


    if (checkoutContent) {
        checkoutContent.hidden = false;
    }

    if (emptyCheckout) {
        emptyCheckout.hidden = true;
    }

    if (!summaryItems) {
        return;
    }


    summaryItems.innerHTML = "";


    cart.forEach(
        function (item) {

            const quantity =
                Number(
                    item.quantity || 1
                );

            const itemTotal =
                calculateItemTotal(item);

            const image =
                getProductImage(item);


            const div =
                document.createElement("div");

            div.className =
                "order-item";


            /* =========================
               IMAGE
            ========================= */

            if (image) {

                const imageElement =
                    document.createElement("img");

                imageElement.className =
                    "order-poster";

                imageElement.alt =
                    item.custom
                        ? "Custom Poster"
                        : "Poster";

                /*
                   MOST IMPORTANT PART

                   Directly assign src instead
                   of inserting it through
                   innerHTML.
                */

                imageElement.src =
                    image;

                imageElement.draggable =
                    false;


                /*
                   IMAGE FIT FIX

                   The image is fitted only after
                   the browser knows its natural
                   width and height.
                */

                imageElement.addEventListener(
                    "load",
                    function () {

                        fitCheckoutPosterImage(
                            imageElement
                        );

                    }
                );


                /*
                   If the image is already cached,
                   the load event may have already
                   happened.
                */

                if (
                    imageElement.complete &&
                    imageElement.naturalWidth
                ) {

                    fitCheckoutPosterImage(
                        imageElement
                    );
                }


                div.appendChild(
                    imageElement
                );
            }


            /* =========================
               INFORMATION
            ========================= */

            const info =
                document.createElement("div");

            info.className =
                "order-info";


            const title =
                document.createElement("div");

            title.className =
                "order-title";

            title.textContent =
                item.title ||
                "Poster";

            info.appendChild(title);


            const size =
                document.createElement("div");

            size.className =
                "order-meta";

            size.textContent =
                "Size: " +
                (item.size || "A4");

            info.appendChild(size);


            const qty =
                document.createElement("div");

            qty.className =
                "order-meta";

            qty.textContent =
                "Quantity: " +
                quantity;

            info.appendChild(qty);


            /* =========================
               CUSTOM POSTER LABEL
            ========================= */

            if (item.custom) {

                const customLabel =
                    document.createElement("div");

                customLabel.className =
                    "order-meta";

                customLabel.textContent =
                    "Custom Uploaded Photo";

                info.appendChild(
                    customLabel
                );
            }


            /* =========================
               PROMO
            ========================= */

            if (item.promo_active) {

                const promo =
                    document.createElement("div");

                promo.className =
                    "promo-text";

                promo.textContent =
                    "🎁 " +
                    (
                        item.promo_label ||
                        "Special Offer"
                    );

                info.appendChild(
                    promo
                );
            }


            /* =========================
               PRICE
            ========================= */

            const price =
                document.createElement("div");

            price.className =
                "order-price";

            price.textContent =
                "₹" +
                itemTotal.toFixed(0);

            info.appendChild(
                price
            );


            div.appendChild(info);

            summaryItems.appendChild(div);
        }
    );


    /* =========================
       TOTAL
    ========================= */

    if (summaryTotal) {

        summaryTotal.textContent =
            "₹" +
            getGrandTotal().toFixed(0);
    }
}


/* =========================
   CREATE RAZORPAY ORDER
========================= */

async function createRazorpayOrder(amount) {

    const amountInPaise =
        Math.round(amount * 100);

    const {
        data,
        error
    } =
        await supabaseClient.functions.invoke(
            "create-razorpay-order",
            {
                body: {
                    amount:
                        amountInPaise
                }
            }
        );

    if (error) {

        console.error(
            "CREATE ORDER ERROR:",
            error
        );

        throw new Error(
            error.message ||
            "Unable to create Razorpay order."
        );
    }

    if (!data?.success) {

        throw new Error(
            data?.error ||
            "Unable to create Razorpay order."
        );
    }

    return data;
}


/* =========================
   VERIFY PAYMENT
========================= */

async function verifyPayment(
    response,
    customer
) {

    const {
        data,
        error
    } =
        await supabaseClient.functions.invoke(
            "verify-razorpay-payment",
            {
                body: {

                    razorpay_order_id:
                        response.razorpay_order_id,

                    razorpay_payment_id:
                        response.razorpay_payment_id,

                    razorpay_signature:
                        response.razorpay_signature,

                    customer:
                        customer,

                    items:
                        cart
                }
            }
        );

    if (error) {

        console.error(
            "VERIFY ERROR:",
            error
        );

        throw new Error(
            error.message ||
            "Payment verification failed."
        );
    }

    if (!data?.success) {

        throw new Error(
            data?.error ||
            "Payment verification failed."
        );
    }

    return data;
}


/* =========================
   PAYMENT
========================= */

if (payBtn) {

    payBtn.addEventListener(
        "click",
        async function () {

            try {

                if (!cart.length) {

                    showError(
                        "Your cart is empty."
                    );

                    return;
                }


                await refreshCurrentProductVariants();

                renderSummary();


                if (
                    checkoutForm &&
                    !checkoutForm.checkValidity()
                ) {

                    checkoutForm.reportValidity();

                    return;
                }


                const name =
                    document
                        .getElementById(
                            "customerName"
                        )
                        .value
                        .trim();


                const phone =
                    document
                        .getElementById(
                            "phone"
                        )
                        .value
                        .trim();


                const email =
                    document
                        .getElementById(
                            "email"
                        )
                        .value
                        .trim();


                const address =
                    document
                        .getElementById(
                            "address"
                        )
                        .value
                        .trim();


                const pincode =
                    document
                        .getElementById(
                            "pincode"
                        )
                        .value
                        .trim();


                if (
                    !/^[0-9]{10}$/.test(phone)
                ) {

                    showError(
                        "Please enter a valid 10-digit phone number."
                    );

                    return;
                }


                if (
                    !/^[0-9]{6}$/.test(pincode)
                ) {

                    showError(
                        "Please enter a valid 6-digit PIN code."
                    );

                    return;
                }


                const total =
                    getGrandTotal();


                if (
                    !Number.isFinite(total) ||
                    total < 1
                ) {

                    showError(
                        "Invalid order total."
                    );

                    return;
                }


                const customer = {

                    name:
                        name,

                    phone:
                        phone,

                    email:
                        email,

                    address:
                        address,

                    pincode:
                        pincode
                };


                localStorage.setItem(
                    "zavyroCheckoutCustomer",
                    JSON.stringify(
                        customer
                    )
                );


                payBtn.disabled =
                    true;

                payBtn.textContent =
                    "CREATING PAYMENT...";


                const razorpayOrder =
                    await createRazorpayOrder(
                        total
                    );


                const options = {

                    key:
                        razorpayOrder.key_id,

                    amount:
                        razorpayOrder.amount,

                    currency:
                        razorpayOrder.currency,

                    name:
                        "Zavyro Posters",

                    description:
                        "Wall Poster Order",

                    order_id:
                        razorpayOrder.order_id,


                    prefill: {

                        name:
                            customer.name,

                        email:
                            customer.email,

                        contact:
                            customer.phone
                    },


                    theme: {

                        color:
                            "#7c3aed"
                    },


                    handler:
                        async function (
                            response
                        ) {

                            try {

                                payBtn.textContent =
                                    "VERIFYING PAYMENT...";


                                const result =
                                    await verifyPayment(
                                        response,
                                        customer
                                    );


                                localStorage.removeItem(
                                    "zavyroCart"
                                );


                                localStorage.setItem(
                                    "zavyroLastOrder",
                                    JSON.stringify(
                                        result
                                    )
                                );


                                window.location.href =
                                    "order-success.html";


                            } catch (error) {

                                console.error(
                                    "VERIFY ERROR:",
                                    error
                                );

                                showError(
                                    error.message ||
                                    "Payment verification failed."
                                );

                                payBtn.disabled =
                                    false;

                                payBtn.textContent =
                                    "PAY NOW";
                            }
                        },


                    modal: {

                        ondismiss:
                            function () {

                                payBtn.disabled =
                                    false;

                                payBtn.textContent =
                                    "PAY NOW";
                            }
                    }
                };


                if (
                    typeof Razorpay ===
                    "undefined"
                ) {

                    throw new Error(
                        "Razorpay checkout script did not load."
                    );
                }


                const razorpay =
                    new Razorpay(
                        options
                    );


                razorpay.on(
                    "payment.failed",
                    function (
                        response
                    ) {

                        console.error(
                            "PAYMENT FAILED:",
                            response.error
                        );

                        showError(
                            response.error
                                ?.description ||
                            "Payment failed. Please try again."
                        );

                        payBtn.disabled =
                            false;

                        payBtn.textContent =
                            "PAY NOW";
                    }
                );


                razorpay.open();


            } catch (error) {

                console.error(
                    "PAYMENT ERROR:",
                    error
                );

                showError(
                    error.message ||
                    "Unable to start payment."
                );

                payBtn.disabled =
                    false;

                payBtn.textContent =
                    "PAY NOW";
            }
        }
    );
}


/* =========================
   START
========================= */

async function initializeCheckout() {

    await refreshCurrentProductVariants();

    renderSummary();
}

initializeCheckout();