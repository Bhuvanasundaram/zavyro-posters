/* =====================================================
   ZAVYRO POSTERS
   PRODUCT PAGE
   FINAL VERSION
   - Fast size switching
   - Correct A-series preview
   - No black image box
   - Full navigation support
   - Working reviews
===================================================== */

"use strict";


/* =====================================================
   PRODUCT ID
===================================================== */

const params =
    new URLSearchParams(
        window.location.search
    );

const productId =
    params.get("id");


/* =====================================================
   ELEMENTS
===================================================== */

const productContent =
    document.getElementById(
        "productContent"
    );

const productError =
    document.getElementById(
        "productError"
    );

const productStatus =
    document.getElementById(
        "productStatus"
    );

const addCartBtn =
    document.getElementById(
        "addCartBtn"
    );

const minusBtn =
    document.getElementById(
        "minusBtn"
    );

const plusBtn =
    document.getElementById(
        "plusBtn"
    );

const productImage =
    document.getElementById(
        "productImage"
    );

const productPosterFrame =
    document.getElementById(
        "productPosterFrame"
    );


/* =====================================================
   STATE
===================================================== */

let product = null;

let selectedSize = "A4";

let quantity = 1;

let imageOrientation = "vertical";

let showingVariant = false;


/*
   Image cache.

   Once a size has been loaded,
   changing back to that size is
   practically instant.
*/

const variantImageCache =
    new Map();


const variantLoading =
    new Map();


let originalImageUrl =
    "";


/* =====================================================
   A-SERIES DIMENSIONS
===================================================== */

const verticalSizes = {

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


const horizontalSizes = {

    A6: {
        width: 148,
        height: 105
    },

    A5: {
        width: 210,
        height: 148
    },

    A4: {
        width: 297,
        height: 210
    },

    A3: {
        width: 420,
        height: 297
    }

};


/* =====================================================
   PREVIEW SCALE
===================================================== */

function getPreviewScale() {

    if (
        window.innerWidth <= 500
    ) {

        return 0.58;
    }


    if (
        window.innerWidth <= 800
    ) {

        return 0.78;
    }


    return 1.15;
}


/* =====================================================
   UPDATE POSTER PREVIEW SIZE
===================================================== */

function updatePosterPreviewSize() {

    if (
        !productPosterFrame
    ) {

        return;
    }


    const sizeMap =
        imageOrientation === "horizontal"
            ? horizontalSizes
            : verticalSizes;


    const dimensions =
        sizeMap[selectedSize] ||
        sizeMap.A4;


    const scale =
        getPreviewScale();


    let finalWidth =
        Math.round(
            dimensions.width *
            scale
        );


    let finalHeight =
        Math.round(
            dimensions.height *
            scale
        );


    /*
       Available visual area.
    */

    const maxWidth =
        window.innerWidth <= 800
            ? Math.max(
                260,
                window.innerWidth - 70
            )
            : 500;


    const maxHeight =
        window.innerWidth <= 800
            ? 560
            : 590;


    /*
       IMPORTANT:

       Calculate from the exact A-series
       ratio so the poster itself never
       gets distorted.
    */

    const ratio =
        finalWidth /
        finalHeight;


    if (
        finalWidth > maxWidth
    ) {

        finalWidth =
            maxWidth;

        finalHeight =
            Math.round(
                finalWidth /
                ratio
            );
    }


    if (
        finalHeight > maxHeight
    ) {

        finalHeight =
            maxHeight;

        finalWidth =
            Math.round(
                finalHeight *
                ratio
            );
    }


    productPosterFrame.style.width =
        `${finalWidth}px`;


    productPosterFrame.style.height =
        `${finalHeight}px`;


    productPosterFrame.classList.remove(
        "horizontal",
        "vertical"
    );


    productPosterFrame.classList.add(
        imageOrientation
    );


    productPosterFrame.dataset.size =
        selectedSize;
}


/* =====================================================
   DETECT IMAGE ORIENTATION
===================================================== */

function detectImageOrientation() {

    if (
        !productImage
    ) {

        return;
    }


    const width =
        productImage.naturalWidth;


    const height =
        productImage.naturalHeight;


    if (
        !width ||
        !height
    ) {

        return;
    }


    imageOrientation =
        width > height
            ? "horizontal"
            : "vertical";


    updatePosterPreviewSize();
}


/* =====================================================
   STORAGE PUBLIC URL
===================================================== */

function getStoragePublicUrl(
    path
) {

    if (
        !path ||
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

        return "";
    }


    const {
        data
    } =
        supabaseClient
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


/* =====================================================
   GET VARIANT PATH
===================================================== */

function getVariantPath(
    size
) {

    if (
        !productId
    ) {

        return "";
    }


    return (
        `products/${productId}/${size}.png`
    );
}


/* =====================================================
   GET ORIGINAL IMAGE URL
===================================================== */

function getOriginalImageUrl() {

    if (
        originalImageUrl
    ) {

        return originalImageUrl;
    }


    if (
        !product ||
        !product.image_path
    ) {

        return "";
    }


    originalImageUrl =
        getStoragePublicUrl(
            product.image_path
        );


    return originalImageUrl;
}


/* =====================================================
   SET IMAGE WITHOUT RELOADING IF SAME
===================================================== */

function setProductImage(
    url,
    isVariant,
    onComplete
) {

    if (
        !productImage ||
        !url
    ) {

        if (
            typeof onComplete === "function"
        ) {

            onComplete(false);
        }

        return;
    }


    /*
       If exactly the same image is already
       displayed, don't reload it.
    */

    if (
        productImage.dataset.currentUrl ===
        url
    ) {

        showingVariant =
            isVariant;

        productPosterFrame?.classList.remove(
            "loading"
        );

        detectImageOrientation();

        if (
            typeof onComplete === "function"
        ) {

            onComplete(true);
        }

        return;
    }


    productPosterFrame?.classList.add(
        "loading"
    );


    const finish =
        () => {

            productPosterFrame?.classList.remove(
                "loading"
            );

            if (
                typeof onComplete === "function"
            ) {

                onComplete(true);
            }
        };


    productImage.onload =
        () => {

            productImage.dataset.currentUrl =
                url;

            showingVariant =
                isVariant;

            detectImageOrientation();

            finish();
        };


    productImage.onerror =
        () => {

            productPosterFrame?.classList.remove(
                "loading"
            );

            if (
                typeof onComplete === "function"
            ) {

                onComplete(false);
            }
        };


    productImage.src =
        url;


    productImage.alt =
        product?.title ||
        "Poster";
}


/* =====================================================
   LOAD ORIGINAL IMAGE
===================================================== */

function loadOriginalImage() {

    const url =
        getOriginalImageUrl();


    if (
        !url
    ) {

        return Promise.resolve(
            false
        );
    }


    /*
       Show the original immediately.
       This means the user never sees an
       empty poster area while variants load.
    */

    return new Promise(
        resolve => {

            setProductImage(
                url,
                false,
                resolve
            );

        }
    );
}


/* =====================================================
   PRELOAD ONE VARIANT
===================================================== */

function preloadVariant(
    size
) {

    if (
        !product ||
        !productId
    ) {

        return Promise.resolve(
            false
        );
    }


    size =
        String(
            size
        )
            .toUpperCase();


    /*
       Already successfully cached.
    */

    if (
        variantImageCache.has(
            size
        )
    ) {

        return Promise.resolve(
            true
        );
    }


    /*
       Already being loaded.
    */

    if (
        variantLoading.has(
            size
        )
    ) {

        return variantLoading.get(
            size
        );
    }


    const path =
        getVariantPath(
            size
        );


    const url =
        getStoragePublicUrl(
            path
        );


    if (
        !url
    ) {

        return Promise.resolve(
            false
        );
    }


    const promise =
        new Promise(
            resolve => {

                const image =
                    new Image();


                image.decoding =
                    "async";


                image.onload =
                    () => {

                        variantImageCache.set(
                            size,
                            {
                                url,
                                width:
                                    image.naturalWidth,
                                height:
                                    image.naturalHeight
                            }
                        );


                        variantLoading.delete(
                            size
                        );


                        resolve(
                            true
                        );
                    };


                image.onerror =
                    () => {

                        variantLoading.delete(
                            size
                        );


                        resolve(
                            false
                        );
                    };


                /*
                   IMPORTANT:

                   No Date.now() here.

                   Browser can cache the image,
                   making size switching fast.
                */

                image.src =
                    url;
            }
        );


    variantLoading.set(
        size,
        promise
    );


    return promise;
}


/* =====================================================
   PRELOAD ALL AVAILABLE VARIANTS
===================================================== */

function preloadAllVariants() {

    if (
        !product
    ) {

        return;
    }


    const sizes =
        getAvailableSizes();


    /*
       Start all requests together.

       The customer doesn't have to wait
       until they click each size.
    */

    sizes.forEach(
        size => {

            preloadVariant(
                size
            );

        }
    );
}


/* =====================================================
   GET AVAILABLE SIZES
===================================================== */

function getAvailableSizes() {

    if (
        Array.isArray(
            product?.available_sizes
        )
    ) {

        return product.available_sizes
            .map(
                size =>
                    String(
                        size
                    )
                        .toUpperCase()
            )
            .filter(
                size =>
                    [
                        "A6",
                        "A5",
                        "A4",
                        "A3"
                    ].includes(
                        size
                    )
            );
    }


    return [
        "A3",
        "A4",
        "A5",
        "A6"
    ];
}


/* =====================================================
   DISPLAY CACHED VARIANT
===================================================== */

function displayCachedVariant(
    size
) {

    const cached =
        variantImageCache.get(
            size
        );


    if (
        !cached
    ) {

        return false;
    }


    /*
       Instant switch.

       Since the image is already loaded
       in memory, there is no network wait.
    */

    if (
        productImage
    ) {

        productImage.onload =
            null;

        productImage.onerror =
            null;

        productImage.src =
            cached.url;

        productImage.dataset.currentUrl =
            cached.url;

        productImage.alt =
            product?.title ||
            "Poster";
    }


    showingVariant =
        true;


    imageOrientation =
        cached.width >
        cached.height
            ? "horizontal"
            : "vertical";


    updatePosterPreviewSize();


    return true;
}


/* =====================================================
   LOAD SIZE VARIANT
===================================================== */

async function loadSizeVariant(
    size
) {

    size =
        String(
            size
        )
            .toUpperCase();


    /*
       First try memory cache.
       This is the fast path.
    */

    if (
        displayCachedVariant(
            size
        )
    ) {

        return true;
    }


    /*
       If not cached yet, preload it.
    */

    const exists =
        await preloadVariant(
            size
        );


    if (
        exists
    ) {

        return displayCachedVariant(
            size
        );
    }


    /*
       Variant doesn't exist.
       Fall back to original product image.
    */

    await loadOriginalImage();

    return false;
}


/* =====================================================
   LOAD PRODUCT
===================================================== */

async function loadProduct() {

    if (
        !productId
    ) {

        showError(
            "Product not found."
        );

        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("products")
                .select("*")
                .eq(
                    "id",
                    productId
                )
                .eq(
                    "active",
                    true
                )
                .single();


        if (
            error ||
            !data
        ) {

            console.error(
                "PRODUCT ERROR:",
                error
            );

            showError(
                "Unable to load this poster."
            );

            return;
        }


        product =
            data;


        productError.hidden =
            true;


        productContent.hidden =
            false;


        const available =
            getAvailableSizes();


        /*
           Prefer A4 when available.
        */

        if (
            available.includes(
                "A4"
            )
        ) {

            selectedSize =
                "A4";

        } else {

            selectedSize =
                available[0] ||
                "A4";
        }


        /*
           Display all text/UI first.
        */

        displayProduct();


        /*
           Load original first.

           This provides immediate visual
           feedback.
        */

        await loadOriginalImage();


        /*
           Preload every available variant
           in the background.

           This fixes slow A-size switching.
        */

        preloadAllVariants();


        /*
           Now load selected size.

           If preload has completed already,
           this is instant.
        */

        await loadSizeVariant(
            selectedSize
        );


        /*
           Reviews load independently.
        */

        await loadReviews();


        updateCartCount();


    } catch (
        error
    ) {

        console.error(
            "LOAD PRODUCT ERROR:",
            error
        );

        showError(
            "Unable to load this poster."
        );
    }
}


/* =====================================================
   DISPLAY PRODUCT
===================================================== */

function displayProduct() {

    const title =
        document.getElementById(
            "productTitle"
        );


    const category =
        document.getElementById(
            "productCategory"
        );


    const subcategory =
        document.getElementById(
            "productSubcategory"
        );


    const description =
        document.getElementById(
            "productDescription"
        );


    if (
        title
    ) {

        title.textContent =
            product.title ||
            "Poster";
    }


    if (
        category
    ) {

        category.textContent =
            product.category ||
            "POSTER";
    }


    if (
        subcategory
    ) {

        subcategory.textContent =
            product.subcategory ||
            "";
    }


    if (
        description
    ) {

        description.textContent =
            product.description ||
            "";
    }


    setupSizes();

    displayPromotion();

    updatePrice();

    updatePosterPreviewSize();
}


/* =====================================================
   SIZE BUTTONS
===================================================== */

function setupSizes() {

    const sizeContainer =
        document.getElementById(
            "sizeOptions"
        );


    if (
        !sizeContainer
    ) {

        return;
    }


    sizeContainer.innerHTML =
        "";


    const sizes = [
        "A6",
        "A5",
        "A4",
        "A3"
    ];


    const available =
        getAvailableSizes();


    sizes.forEach(
        size => {

            if (
                !available.includes(
                    size
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
                "size-btn";


            if (
                size ===
                selectedSize
            ) {

                button.classList.add(
                    "active"
                );
            }


            button.textContent =
                `${size} • ₹${getSizePrice(size)}`;


            button.addEventListener(
                "click",
                async () => {

                    /*
                       Prevent duplicate loading.
                    */

                    if (
                        selectedSize ===
                        size
                    ) {

                        return;
                    }


                    selectedSize =
                        size;


                    document
                        .querySelectorAll(
                            "#sizeOptions .size-btn"
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


                    /*
                       Update size dimensions
                       immediately.

                       This happens BEFORE image
                       loading so the preview shape
                       changes instantly.
                    */

                    updatePosterPreviewSize();


                    updatePrice();


                    if (
                        productStatus
                    ) {

                        productStatus.textContent =
                            "";
                    }


                    /*
                       Fast path:

                       If preloaded, switch
                       immediately.
                    */

                    if (
                        displayCachedVariant(
                            selectedSize
                        )
                    ) {

                        return;
                    }


                    /*
                       Variant is not ready yet.

                       Load it.
                    */

                    await loadSizeVariant(
                        selectedSize
                    );


                    updatePosterPreviewSize();
                }
            );


            sizeContainer.appendChild(
                button
            );
        }
    );
}


/* =====================================================
   SIZE PRICE
===================================================== */

function getSizePrice(
    size
) {

    const key =
        String(
            size
        )
            .toLowerCase();


    const normalPrice =
        Number(
            product[
                `price_${key}`
            ] ||
            0
        );


    const offer =
        Number(
            product[
                `offer_${key}`
            ] ||
            0
        );


    if (
        product.offer_active &&
        offer > 0
    ) {

        return offer;
    }


    return normalPrice;
}


/* =====================================================
   SIZE MRP
===================================================== */

function getSizeMrp(
    size
) {

    const key =
        String(
            size
        )
            .toLowerCase();


    const mrp =
        Number(
            product[
                `mrp_${key}`
            ] ||
            0
        );


    const normalPrice =
        Number(
            product[
                `price_${key}`
            ] ||
            0
        );


    if (
        mrp > 0
    ) {

        return mrp;
    }


    return normalPrice;
}


/* =====================================================
   CURRENT PRICE
===================================================== */

function getCurrentPrice() {

    return getSizePrice(
        selectedSize
    );
}


/* =====================================================
   PRICE DISPLAY
===================================================== */

function updatePrice() {

    const price =
        getCurrentPrice();


    const mrp =
        getSizeMrp(
            selectedSize
        );


    const priceElement =
        document.getElementById(
            "productPrice"
        );


    if (
        !priceElement
    ) {

        return;
    }


    if (
        product.offer_active &&
        mrp > price &&
        price > 0
    ) {

        const saving =
            mrp -
            price;


        const percent =
            Math.round(
                (
                    saving /
                    mrp
                ) * 100
            );


        priceElement.innerHTML = `

            <div class="offer-price-line">

                <span class="mrp-price">
                    ₹${mrp}
                </span>

                <span class="selling-price">
                    ₹${price}
                </span>

            </div>

            <div class="saving-line">
                Save ₹${saving} • ${percent}% OFF
            </div>

        `;

    } else {

        priceElement.innerHTML = `

            <div class="offer-price-line">

                <span class="selling-price">
                    ₹${price}
                </span>

            </div>

        `;
    }


    updateTotal();
}


/* =====================================================
   PROMOTION CALCULATION
===================================================== */

function calculatePromotion(
    qty
) {

    if (
        !product ||
        !product.promo_active
    ) {

        return {
            freeQuantity: 0,
            payableQuantity: qty
        };
    }


    const buy =
        Number(
            product.promo_buy_qty ||
            0
        );


    const get =
        Number(
            product.promo_get_qty ||
            0
        );


    if (
        buy <= 0 ||
        get <= 0
    ) {

        return {
            freeQuantity: 0,
            payableQuantity: qty
        };
    }


    const groupSize =
        buy +
        get;


    const completeGroups =
        Math.floor(
            qty /
            groupSize
        );


    const remainder =
        qty %
        groupSize;


    const freeFromGroups =
        completeGroups *
        get;


    const freeFromRemainder =
        Math.max(
            0,
            remainder -
            buy
        );


    const freeQuantity =
        freeFromGroups +
        freeFromRemainder;


    return {

        freeQuantity,

        payableQuantity:
            qty -
            freeQuantity
    };
}


/* =====================================================
   PROMOTION DISPLAY
===================================================== */

function displayPromotion() {

    const promoBox =
        document.getElementById(
            "productPromo"
        );


    if (
        !promoBox
    ) {

        return;
    }


    if (
        !product.promo_active ||
        Number(
            product.promo_buy_qty
        ) <= 0 ||
        Number(
            product.promo_get_qty
        ) <= 0
    ) {

        promoBox.style.display =
            "none";

        promoBox.innerHTML =
            "";

        return;
    }


    const buy =
        Number(
            product.promo_buy_qty
        );


    const get =
        Number(
            product.promo_get_qty
        );


    const label =
        product.promo_label ||
        `BUY ${buy} GET ${get} FREE`;


    promoBox.style.display =
        "block";


    promoBox.innerHTML = `

        <div class="product-promo-box">

            <div class="promo-main">

                <span class="promo-icon">
                    🔥
                </span>

                <strong>
                    ${escapeHtml(label)}
                </strong>

            </div>

            <div class="promo-free">
                Buy ${buy} poster${buy > 1 ? "s" : ""}
                and get ${get} poster${get > 1 ? "s" : ""} FREE
            </div>

            <div
                class="promo-saving"
                id="promoSaving"
            ></div>

        </div>

    `;


    updatePromotionText();
}


/* =====================================================
   PROMOTION TEXT
===================================================== */

function updatePromotionText() {

    const savingElement =
        document.getElementById(
            "promoSaving"
        );


    if (
        !savingElement
    ) {

        return;
    }


    const result =
        calculatePromotion(
            quantity
        );


    if (
        result.freeQuantity > 0
    ) {

        const saving =
            result.freeQuantity *
            getCurrentPrice();


        savingElement.textContent =
            `You get ${result.freeQuantity} FREE • Save ₹${saving}`;

    } else {

        savingElement.textContent =
            "Add more posters to unlock the free offer.";
    }
}


/* =====================================================
   TOTAL
===================================================== */

function updateTotal() {

    const price =
        getCurrentPrice();


    const result =
        calculatePromotion(
            quantity
        );


    const total =
        result.payableQuantity *
        price;


    const totalElement =
        document.getElementById(
            "productTotal"
        );


    if (
        totalElement
    ) {

        totalElement.textContent =
            `₹${total}`;
    }


    const quantityElement =
        document.getElementById(
            "quantity"
        );


    if (
        quantityElement
    ) {

        quantityElement.textContent =
            quantity;
    }


    updatePromotionText();
}


/* =====================================================
   QUANTITY MINUS
===================================================== */

if (
    minusBtn
) {

    minusBtn.addEventListener(
        "click",
        () => {

            if (
                quantity > 1
            ) {

                quantity--;

                updateTotal();
            }
        }
    );
}


/* =====================================================
   QUANTITY PLUS
===================================================== */

if (
    plusBtn
) {

    plusBtn.addEventListener(
        "click",
        () => {

            quantity++;

            updateTotal();
        }
    );
}


/* =====================================================
   REVIEWS
===================================================== */

let selectedReviewRating =
    0;


/* =====================================================
   LOAD REVIEWS
===================================================== */

async function loadReviews() {

    const summary =
        document.getElementById(
            "productReviews"
        );


    const reviewList =
        document.getElementById(
            "reviewsList"
        );


    if (
        !reviewList
    ) {

        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("reviews")
                .select(`
                    id,
                    rating,
                    review_text,
                    customer_name,
                    created_at
                `)
                .eq(
                    "product_id",
                    productId
                )
                .eq(
                    "approved",
                    true
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (
            error
        ) {

            throw error;
        }


        const reviews =
            Array.isArray(data)
                ? data
                : [];


        /* =================================================
           RATING SUMMARY
        ================================================= */

        if (
            summary
        ) {

            if (
                reviews.length === 0
            ) {

                summary.innerHTML = `

                    <div class="rating-summary">

                        <span class="rating-stars">
                            ☆☆☆☆☆
                        </span>

                        <strong>
                            0.0
                        </strong>

                        <span>
                            (0 reviews)
                        </span>

                    </div>

                `;

            } else {

                const total =
                    reviews.reduce(
                        (
                            sum,
                            review
                        ) =>
                            sum +
                            Number(
                                review.rating
                            ),
                        0
                    );


                const average =
                    total /
                    reviews.length;


                const rounded =
                    Math.round(
                        average * 10
                    ) / 10;


                let stars =
                    "";


                for (
                    let i = 1;
                    i <= 5;
                    i++
                ) {

                    stars +=
                        i <=
                        Math.round(
                            average
                        )
                            ? "★"
                            : "☆";
                }


                summary.innerHTML = `

                    <div class="rating-summary">

                        <span class="rating-stars">
                            ${stars}
                        </span>

                        <strong>
                            ${rounded.toFixed(1)}
                        </strong>

                        <span>
                            (${reviews.length}
                            review${reviews.length === 1 ? "" : "s"})
                        </span>

                    </div>

                `;
            }
        }


        /* =================================================
           NO REVIEWS
        ================================================= */

        if (
            reviews.length === 0
        ) {

            reviewList.innerHTML = `

                <div class="reviews-empty">

                    <strong>
                        No reviews yet.
                    </strong>

                    <span>
                        Be the first customer to review this poster.
                    </span>

                </div>

            `;

            return;
        }


        /* =================================================
           RENDER REVIEWS
        ================================================= */

        reviewList.innerHTML =
            reviews.map(
                review => {

                    const rating =
                        Math.max(
                            1,
                            Math.min(
                                5,
                                Number(
                                    review.rating
                                ) || 1
                            )
                        );


                    const stars =
                        "★".repeat(
                            rating
                        ) +
                        "☆".repeat(
                            5 -
                            rating
                        );


                    const date =
                        review.created_at
                            ? new Date(
                                review.created_at
                              )
                                .toLocaleDateString(
                                    "en-IN",
                                    {
                                        day:
                                            "numeric",
                                        month:
                                            "short",
                                        year:
                                            "numeric"
                                    }
                                )
                            : "";


                    return `

                        <article class="review-item">

                            <div class="review-item-top">

                                <span class="reviewer-name">
                                    ${escapeHtml(
                                        review.customer_name ||
                                        "Customer"
                                    )}
                                </span>

                                <span class="review-date">
                                    ${escapeHtml(
                                        date
                                    )}
                                </span>

                            </div>


                            <div class="review-item-stars">
                                ${stars}
                            </div>


                            <p class="review-item-text">
                                ${escapeHtml(
                                    review.review_text ||
                                    ""
                                )}
                            </p>

                        </article>

                    `;
                }
            )
            .join("");


    } catch (
        error
    ) {

        console.error(
            "REVIEW LOAD ERROR:",
            error
        );


        reviewList.innerHTML = `

            <div class="reviews-empty">

                <strong>
                    Reviews are temporarily unavailable.
                </strong>

                <span>
                    Please try again later.
                </span>

            </div>

        `;
    }
}


/* =====================================================
   REVIEW STAR SELECTOR
===================================================== */

function setupReviewStars() {

    const stars =
        document.querySelectorAll(
            '.review-stars-select input[name="rating"]'
        );


    if (
        !stars.length
    ) {

        return;
    }


    stars.forEach(
        radio => {

            radio.addEventListener(
                "change",
                () => {

                    selectedReviewRating =
                        Number(
                            radio.value
                        );
                }
            );
        }
    );
}


/* =====================================================
   REVIEW MESSAGE
===================================================== */

function showReviewMessage(
    message,
    type = ""
) {

    const box =
        document.getElementById(
            "reviewMessage"
        );


    if (
        !box
    ) {

        return;
    }


    box.textContent =
        message;


    box.className =
        "review-message";


    if (
        type
    ) {

        box.classList.add(
            type
        );
    }
}


/* =====================================================
   RESET REVIEW STAR SELECTOR
===================================================== */

function resetReviewStars() {

    document
        .querySelectorAll(
            '.review-stars-select input[name="rating"]'
        )
        .forEach(
            radio => {

                radio.checked =
                    false;
            }
        );


    selectedReviewRating =
        0;
}


/* =====================================================
   SUBMIT REVIEW
===================================================== */

async function submitReview() {

    const button =
        document.getElementById(
            "reviewSubmitBtn"
        );


    const orderNumber =
        document.getElementById(
            "reviewOrderNumber"
        )?.value
            .trim();


    const email =
        document.getElementById(
            "reviewEmail"
        )?.value
            .trim();


    const name =
        document.getElementById(
            "reviewName"
        )?.value
            .trim();


    const reviewText =
        document.getElementById(
            "reviewText"
        )?.value
            .trim();


    /* =================================================
       VALIDATION
    ================================================= */

    if (
        !orderNumber
    ) {

        showReviewMessage(
            "Please enter your order number.",
            "error"
        );

        return;
    }


    if (
        !email
    ) {

        showReviewMessage(
            "Please enter the email used for your order.",
            "error"
        );

        return;
    }


    if (
        !name
    ) {

        showReviewMessage(
            "Please enter your name.",
            "error"
        );

        return;
    }


    if (
        selectedReviewRating < 1 ||
        selectedReviewRating > 5
    ) {

        showReviewMessage(
            "Please select a star rating.",
            "error"
        );

        return;
    }


    if (
        !reviewText ||
        reviewText.length < 3
    ) {

        showReviewMessage(
            "Please write at least 3 characters.",
            "error"
        );

        return;
    }


    if (
        reviewText.length > 1000
    ) {

        showReviewMessage(
            "Review must be 1000 characters or less.",
            "error"
        );

        return;
    }


    /* =================================================
       SUBMITTING
    ================================================= */

    if (
        button
    ) {

        button.disabled =
            true;

        button.textContent =
            "SUBMITTING...";
    }


    showReviewMessage(
        "",
        ""
    );


    try {

        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "submit_product_review",
                {
                    p_product_id:
                        productId,

                    p_order_number:
                        orderNumber,

                    p_customer_name:
                        name,

                    p_customer_email:
                        email,

                    p_rating:
                        selectedReviewRating,

                    p_review_text:
                        reviewText
                }
            );


        if (
            error
        ) {

            throw error;
        }


        /*
           RPC may return a message.
           We don't need it for success.
        */

        console.log(
            "REVIEW SUBMITTED:",
            data
        );


        showReviewMessage(
            "✓ Review submitted successfully!",
            "success"
        );


        const reviewTextInput =
            document.getElementById(
                "reviewText"
            );


        if (
            reviewTextInput
        ) {

            reviewTextInput.value =
                "";
        }


        resetReviewStars();


        /*
           Reload reviews immediately.
        */

        await loadReviews();


    } catch (
        error
    ) {

        console.error(
            "SUBMIT REVIEW ERROR:",
            error
        );


        let message =
            "Unable to submit review.";


        /*
           Convert common database errors
           into customer-friendly messages.
        */

        const rawMessage =
            String(
                error?.message ||
                ""
            );


        if (
            rawMessage
                .toLowerCase()
                .includes(
                    "already"
                )
        ) {

            message =
                "You have already reviewed this poster for this order.";

        } else if (
            rawMessage
                .toLowerCase()
                .includes(
                    "delivered"
                )
        ) {

            message =
                "You can review this poster after your order is delivered.";

        } else if (
            rawMessage
        ) {

            message =
                rawMessage;
        }


        showReviewMessage(
            message,
            "error"
        );


    } finally {

        if (
            button
        ) {

            button.disabled =
                false;

            button.textContent =
                "SUBMIT REVIEW";
        }
    }
}


/* =====================================================
   REVIEW FORM
===================================================== */

function setupReviewForm() {

    setupReviewStars();


    const form =
        document.getElementById(
            "reviewForm"
        );


    if (
        form
    ) {

        form.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                await submitReview();

            }
        );
    }


    /*
       Prefill customer details from
       previous checkout.
    */

    try {

        const saved =
            JSON.parse(
                localStorage.getItem(
                    "zavyroCheckoutCustomer"
                ) ||
                "null"
            );


        if (
            saved
        ) {

            const nameInput =
                document.getElementById(
                    "reviewName"
                );


            const emailInput =
                document.getElementById(
                    "reviewEmail"
                );


            if (
                nameInput &&
                !nameInput.value &&
                saved.name
            ) {

                nameInput.value =
                    saved.name;
            }


            if (
                emailInput &&
                !emailInput.value &&
                saved.email
            ) {

                emailInput.value =
                    saved.email;
            }
        }


    } catch (
        error
    ) {

        console.warn(
            "Unable to load saved customer details."
        );
    }
}


/* =====================================================
   ADD TO CART
===================================================== */

if (
    addCartBtn
) {

    addCartBtn.addEventListener(
        "click",
        () => {

            addToCart();

        }
    );
}


function addToCart() {

    if (
        !product
    ) {

        return;
    }


    const price =
        getCurrentPrice();


    if (
        price <= 0
    ) {

        showStatus(
            "This size is currently unavailable.",
            true
        );

        return;
    }


    const promotion =
        calculatePromotion(
            quantity
        );


    let cart =
        [];


    try {

        cart =
            JSON.parse(
                localStorage.getItem(
                    "zavyroCart"
                )
            ) ||
            [];


    } catch (
        error
    ) {

        cart =
            [];
    }


    const existingIndex =
        cart.findIndex(
            item =>
                item.productId ===
                    product.id &&
                item.size ===
                    selectedSize &&
                !item.custom
        );


    if (
        existingIndex !== -1
    ) {

        cart[
            existingIndex
        ].quantity +=
            quantity;


        cart[
            existingIndex
        ].price =
            price;


        cart[
            existingIndex
        ].offerPrice =
            price;


        cart[
            existingIndex
        ].mrp =
            getSizeMrp(
                selectedSize
            );


        cart[
            existingIndex
        ].product =
            product;

    } else {

        cart.push({

            id:
                `${product.id}-${selectedSize}-${Date.now()}`,

            productId:
                product.id,

            title:
                product.title,

           image_path:
    (
        product.poster_edits &&
        product.poster_edits[selectedSize] &&
        product.poster_edits[selectedSize].path
    )
        ? product.poster_edits[selectedSize].path
        : `products/${product.id}/${selectedSize}.png`,

variant_path:
    (
        product.poster_edits &&
        product.poster_edits[selectedSize] &&
        product.poster_edits[selectedSize].path
    )
        ? product.poster_edits[selectedSize].path
        : `products/${product.id}/${selectedSize}.png`,

orientation:
    (
        product.poster_edits &&
        product.poster_edits[selectedSize] &&
        (
            product.poster_edits[selectedSize].orientation === "horizontal" ||
            product.poster_edits[selectedSize].orientation === "vertical"
        )
    )
        ? product.poster_edits[selectedSize].orientation
        : "vertical",


            category:
                product.category,

            subcategory:
                product.subcategory,

            size:
                selectedSize,

            quantity:
                quantity,

            price:
                price,

            offerPrice:
                price,

            mrp:
                getSizeMrp(
                    selectedSize
                ),

            product:
                product,

            promo_active:
                Boolean(
                    product.promo_active
                ),

            promo_buy_qty:
                Number(
                    product.promo_buy_qty ||
                    0
                ),

            promo_get_qty:
                Number(
                    product.promo_get_qty ||
                    0
                ),

            promo_label:
                product.promo_label ||
                "",

            freeQuantity:
                promotion.freeQuantity
        });
    }


    localStorage.setItem(
        "zavyroCart",
        JSON.stringify(
            cart
        )
    );


    updateCartCount();


    showStatus(
        "✓ Added to cart!"
    );


    const oldText =
        addCartBtn.textContent;


    addCartBtn.textContent =
        "✓ ADDED TO CART";


    addCartBtn.disabled =
        true;


    setTimeout(
        () => {

            addCartBtn.textContent =
                oldText;

            addCartBtn.disabled =
                false;

        },
        1200
    );
}


/* =====================================================
   CART COUNT
===================================================== */

function updateCartCount() {

    const countElement =
        document.getElementById(
            "cartCount"
        );


    if (
        !countElement
    ) {

        return;
    }


    let cart =
        [];


    try {

        cart =
            JSON.parse(
                localStorage.getItem(
                    "zavyroCart"
                )
            ) ||
            [];


    } catch (
        error
    ) {

        cart =
            [];
    }


    const count =
        cart.reduce(
            (
                total,
                item
            ) =>
                total +
                Number(
                    item.quantity ||
                    0
                ),
            0
        );


    countElement.textContent =
        count;
}


/* =====================================================
   STATUS
===================================================== */

function showStatus(
    message,
    isError = false
) {

    if (
        !productStatus
    ) {

        return;
    }


    productStatus.textContent =
        message;


    productStatus.style.color =
        isError
            ? "#f87171"
            : "#86efac";


    clearTimeout(
        window.zavyroStatusTimer
    );


    window.zavyroStatusTimer =
        setTimeout(
            () => {

                productStatus.textContent =
                    "";

            },
            2500
        );
}


/* =====================================================
   ERROR
===================================================== */

function showError(
    message
) {

    if (
        !productError
    ) {

        return;
    }


    productError.hidden =
        false;


    productError.innerHTML = `

        <h1>
            Poster not found
        </h1>

        <p>
            ${escapeHtml(
                message
            )}
        </p>

        <br>

        <a
            href="shop.html"
            class="primary-btn"
        >
            Back to Shop
        </a>

    `;


    if (
        productContent
    ) {

        productContent.hidden =
            true;
    }
}


/* =====================================================
   ESCAPE HTML
===================================================== */

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


/* =====================================================
   RESIZE
===================================================== */

window.addEventListener(
    "resize",
    () => {

        updatePosterPreviewSize();

    }
);


/* =====================================================
   MOBILE MENU
===================================================== */

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

            menuToggle.classList.toggle(
                "active"
            );


            navLinks.classList.toggle(
                "active"
            );

        }
    );


    navLinks
        .querySelectorAll(
            "a"
        )
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    () => {

                        menuToggle.classList.remove(
                            "active"
                        );


                        navLinks.classList.remove(
                            "active"
                        );

                    }
                );
            }
        );
}


/* =====================================================
   START
===================================================== */

setupReviewForm();

loadProduct();