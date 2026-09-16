/* =====================================================
   ZAVYRO POSTERS
   SHOP — SUPABASE + RATINGS
===================================================== */

let products = [];
let reviews = [];


/* =====================================================
   CATEGORY DATA
===================================================== */

const shopSubcategories = {

    anime: [
        ["all", "All Anime"],
        ["naruto", "Naruto"],
        ["one piece", "One Piece"],
        ["dragon ball", "Dragon Ball"]
    ],

    movies: [
        ["all", "All Movies"],
        ["kollywood", "Kollywood"],
        ["bollywood", "Bollywood"],
        ["mollywood", "Mollywood"],
        ["tollywood", "Tollywood"],
        ["hollywood", "Hollywood"],
        ["marvel", "Marvel"],
        ["dc", "DC"]
    ],

    music: [
        ["all", "All Music"],
        ["tamil", "Tamil Songs"],
        ["telugu", "Telugu Songs"],
        ["hindi", "Hindi Songs"],
        ["malayalam", "Malayalam Songs"],
        ["english", "English Songs"]
    ],

    sports: [
        ["all", "All Sports"],
        ["cricket", "Cricket"],
        ["football", "Football"],
        ["formula1", "Formula 1"],
        ["others", "Other Sports"]
    ],

    cars: [
        ["all", "All Cars"],
        ["automotive", "Automotive"]
    ],

    aesthetic: [
        ["all", "All Aesthetic"],
        ["aesthetic", "Aesthetic"]
    ],

    devotional: [
        ["all", "Devotional"]
    ]

};


/* =====================================================
   ELEMENTS
===================================================== */

const shopGrid =
    document.getElementById("shopGrid");

const shopEmpty =
    document.getElementById("shopEmpty");

const categoryFilter =
    document.getElementById("categoryFilter");

const subcategoryFilter =
    document.getElementById("subcategoryFilter");

const sizeFilter =
    document.getElementById("sizeFilter");

const sortFilter =
    document.getElementById("sortFilter");

const searchInput =
    document.getElementById("searchInput");

const resultCount =
    document.getElementById("resultCount");

const resetFilters =
    document.getElementById("resetFilters");

const quickCategories =
    document.querySelectorAll(".quick-category");


/* =====================================================
   URL PARAMETERS
===================================================== */

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const urlCategory =
    urlParams.get("category");

const urlSubcategory =
    urlParams.get("subcategory");


/* =====================================================
   FORMAT TEXT
===================================================== */

function formatText(text) {

    if (!text) {
        return "";
    }

    return text.replace(
        /\b\w/g,
        letter => letter.toUpperCase()
    );

}


/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeHTML(text) {

    if (text === null || text === undefined) {
        return "";
    }

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =====================================================
   GET IMAGE URL
===================================================== */

function getImageUrl(imagePath) {

    if (!imagePath) {
        return "";
    }

    const { data } =
        supabaseClient
            .storage
            .from("posters")
            .getPublicUrl(imagePath);

    return data.publicUrl;

}


/* =====================================================
   GET CHEAPEST PRICE
===================================================== */

function getStartingPrice(product) {

    const prices = [

        Number(product.price_a6),

        Number(product.price_a5),

        Number(product.price_a4),

        Number(product.price_a3)

    ].filter(
        price =>
            Number.isFinite(price) &&
            price > 0
    );


    if (!prices.length) {

        return Number(
            product.price || 0
        );

    }


    return Math.min(...prices);

}


/* =====================================================
   LOAD REVIEWS
===================================================== */

async function loadReviews() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("reviews")
                .select(
                    "product_id, rating"
                )
                .eq(
                    "approved",
                    true
                );


        if (error) {

            console.error(
                "REVIEWS LOAD ERROR:",
                error
            );

            reviews = [];

            return;

        }


        reviews =
            data || [];


        console.log(
            "Zavyro approved reviews:",
            reviews
        );


    } catch (error) {

        console.error(
            "REVIEWS ERROR:",
            error
        );

        reviews = [];

    }

}


/* =====================================================
   GET PRODUCT RATING
===================================================== */

function getProductRating(productId) {

    const productReviews =
        reviews.filter(
            review =>
                review.product_id ===
                productId
        );


    if (!productReviews.length) {

        return {
            average: 0,
            count: 0
        };

    }


    const total =
        productReviews.reduce(
            (
                sum,
                review
            ) =>
                sum +
                Number(
                    review.rating || 0
                ),
            0
        );


    const average =
        total /
        productReviews.length;


    return {

        average:
            Math.round(
                average * 10
            ) / 10,

        count:
            productReviews.length

    };

}


/* =====================================================
   CREATE STAR DISPLAY
===================================================== */

function createStars(rating) {

    if (!rating) {

        return `
            <span class="shop-stars empty-stars">
                ☆☆☆☆☆
            </span>
        `;

    }


    let stars = "";


    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        stars +=
            i <= Math.round(rating)
                ? "★"
                : "☆";

    }


    return `
        <span class="shop-stars">
            ${stars}
        </span>
    `;

}


/* =====================================================
   CREATE RATING HTML
===================================================== */

function createRatingHTML(productId) {

    const rating =
        getProductRating(
            productId
        );


    if (!rating.count) {

        return `
            <div class="shop-rating no-reviews">

                ${createStars(0)}

                <span>
                    No reviews yet
                </span>

            </div>
        `;

    }


    return `
        <div class="shop-rating">

            ${createStars(
                rating.average
            )}

            <strong>
                ${rating.average.toFixed(1)}
            </strong>

            <span>
                (${rating.count})
            </span>

        </div>
    `;

}


/* =====================================================
   LOAD PRODUCTS
===================================================== */

async function loadProducts() {

    shopGrid.innerHTML = `
        <div class="shop-loading">
            Loading posters...
        </div>
    `;


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("products")
                .select("*")
                .eq(
                    "active",
                    true
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {
            throw error;
        }


        products =
            data || [];


        console.log(
            "Zavyro products:",
            products
        );


        /*
         * Load reviews after products.
         */
        await loadReviews();


        renderShop();


    } catch (error) {

        console.error(
            "SHOP LOAD ERROR:",
            error
        );


        shopGrid.innerHTML = `
            <div class="poster-placeholder">

                <span>
                    Unable to load posters
                </span>

            </div>
        `;


        resultCount.textContent =
            "0";

    }

}


/* =====================================================
   SUBCATEGORY
===================================================== */

function populateSubcategories(
    category,
    selected = "all"
) {

    subcategoryFilter.innerHTML =
        "";


    const list =
        shopSubcategories[category];


    if (!list) {

        subcategoryFilter.innerHTML = `
            <option value="all">
                All
            </option>
        `;

        return;

    }


    list.forEach(
        item => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                item[0];


            option.textContent =
                item[1];


            if (
                item[0] ===
                selected
            ) {

                option.selected =
                    true;

            }


            subcategoryFilter.appendChild(
                option
            );

        }
    );

}


/* =====================================================
   FILTER PRODUCTS
===================================================== */

function getFilteredProducts() {

    let result =
        [...products];


    /* CATEGORY */

    const category =
        categoryFilter.value;


    if (
        category !== "all"
    ) {

        result =
            result.filter(
                product =>
                    (
                        product.category ||
                        ""
                    )
                        .toLowerCase()
                    ===
                    category.toLowerCase()
            );

    }


    /* SUBCATEGORY */

    const subcategory =
        subcategoryFilter.value;


    if (
        subcategory !== "all" &&
        subcategory !== ""
    ) {

        result =
            result.filter(
                product =>
                    (
                        product.subcategory ||
                        ""
                    )
                        .toLowerCase()
                    ===
                    subcategory.toLowerCase()
            );

    }


    /* SIZE */

    const size =
        sizeFilter.value;


    if (
        size !== "all"
    ) {

        result =
            result.filter(
                product => {

                    const sizes =
                        Array.isArray(
                            product.available_sizes
                        )
                            ? product.available_sizes
                            : [];


                    return sizes.includes(
                        size
                    );

                }
            );

    }


    /* SEARCH */

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    if (search) {

        result =
            result.filter(
                product => {

                    const tags =
                        Array.isArray(
                            product.search_tags
                        )
                            ? product.search_tags.join(" ")
                            : "";


                    const text = `

                        ${product.title || ""}

                        ${product.description || ""}

                        ${product.category || ""}

                        ${product.subcategory || ""}

                        ${tags}

                    `.toLowerCase();


                    return text.includes(
                        search
                    );

                }
            );

    }


    /* SORT */

    const sort =
        sortFilter.value;


    if (
        sort === "featured"
    ) {

        result.sort(
            (a, b) => {

                if (
                    a.featured ===
                    b.featured
                ) {

                    return new Date(
                        b.created_at
                    ) -
                    new Date(
                        a.created_at
                    );

                }


                return a.featured
                    ? -1
                    : 1;

            }
        );

    }


    if (
        sort === "low"
    ) {

        result.sort(
            (a, b) =>
                getStartingPrice(a) -
                getStartingPrice(b)
        );

    }


    if (
        sort === "high"
    ) {

        result.sort(
            (a, b) =>
                getStartingPrice(b) -
                getStartingPrice(a)
        );

    }


    if (
        sort === "az"
    ) {

        result.sort(
            (a, b) =>
                (
                    a.title || ""
                ).localeCompare(
                    b.title || ""
                )
        );

    }


    return result;

}


/* =====================================================
   PRODUCT CARD
===================================================== */

function createShopCard(product) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "shop-product-card";


    const imageUrl =
    getImageUrl(
        `products/${product.id}/A4.png`
    );


    const sizes =
        Array.isArray(
            product.available_sizes
        )
            ? product.available_sizes
            : [];


    const badge =
        product.badge || "";


    const startingPrice =
        getStartingPrice(
            product
        );


    const ratingHTML =
        createRatingHTML(
            product.id
        );


    card.innerHTML = `

        <a
            href="product.html?id=${encodeURIComponent(product.id)}"
            class="shop-product-link"
        >

            <div
                class="shop-product-image"
            >

                <img
                    src="${escapeHTML(imageUrl)}"
                    alt="${escapeHTML(
                        product.title ||
                        "Poster"
                    )}"
                    loading="lazy"
                >


                ${
                    badge
                        ? `
                            <span
                                class="shop-product-badge"
                            >
                                ${escapeHTML(
                                    badge
                                )}
                            </span>
                        `
                        : ""
                }


                <span
                    class="shop-product-view"
                >
                    VIEW →
                </span>

            </div>


            <div
                class="shop-product-details"
            >

                <div>

                    <small>
                        ${escapeHTML(
                            formatText(
                                product.category
                            )
                        )}
                    </small>


                    <h3>
                        ${escapeHTML(
                            product.title ||
                            "Untitled Poster"
                        )}
                    </h3>


                    <p>
                        ${escapeHTML(
                            formatText(
                                product.subcategory
                            )
                        )}
                    </p>


                    ${ratingHTML}

                </div>


                <strong>
                    FROM ₹${startingPrice.toFixed(0)}
                </strong>

            </div>


            <div
                class="shop-product-bottom"
            >

                ${
                    sizes.includes("A3")
                        ? "<span>A3</span>"
                        : ""
                }


                ${
                    sizes.includes("A4")
                        ? "<span>A4</span>"
                        : ""
                }


                ${
                    sizes.includes("A5")
                        ? "<span>A5</span>"
                        : ""
                }


                ${
                    sizes.includes("A6")
                        ? "<span>A6</span>"
                        : ""
                }

            </div>

        </a>

    `;


    /* IMAGE FALLBACK */

    const image =
        card.querySelector(
            "img"
        );


    image?.addEventListener(
        "error",
        () => {

            image.parentElement.innerHTML = `
                <div class="poster-placeholder">
                    <span>Z</span>
                </div>
            `;

        }
    );


    return card;

}


/* =====================================================
   RENDER SHOP
===================================================== */

function renderShop() {

    const filtered =
        getFilteredProducts();


    shopGrid.innerHTML =
        "";


    resultCount.textContent =
        filtered.length;


    if (
        !filtered.length
    ) {

        shopEmpty.hidden =
            false;

        return;

    }


    shopEmpty.hidden =
        true;


    filtered.forEach(
        product => {

            shopGrid.appendChild(
                createShopCard(
                    product
                )
            );

        }
    );

}


/* =====================================================
   ACTIVE CATEGORY
===================================================== */

function setActiveQuickCategory(
    category
) {

    quickCategories.forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.category
                ===
                category
            );

        }
    );

}


/* =====================================================
   CATEGORY CHANGE
===================================================== */

categoryFilter.addEventListener(
    "change",
    () => {

        const category =
            categoryFilter.value;


        populateSubcategories(
            category
        );


        setActiveQuickCategory(
            category
        );


        renderShop();

    }
);


/* =====================================================
   SUBCATEGORY CHANGE
===================================================== */

subcategoryFilter.addEventListener(
    "change",
    renderShop
);


/* =====================================================
   SIZE CHANGE
===================================================== */

sizeFilter.addEventListener(
    "change",
    renderShop
);


/* =====================================================
   SORT CHANGE
===================================================== */

sortFilter.addEventListener(
    "change",
    renderShop
);


/* =====================================================
   SEARCH
===================================================== */

searchInput.addEventListener(
    "input",
    renderShop
);


/* =====================================================
   QUICK CATEGORY BUTTONS
===================================================== */

quickCategories.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const category =
                    button.dataset.category;


                categoryFilter.value =
                    category;


                populateSubcategories(
                    category
                );


                setActiveQuickCategory(
                    category
                );


                renderShop();

            }
        );

    }
);


/* =====================================================
   RESET
===================================================== */

resetFilters?.addEventListener(
    "click",
    () => {

        categoryFilter.value =
            "all";


        populateSubcategories(
            "all"
        );


        sizeFilter.value =
            "all";


        sortFilter.value =
            "featured";


        searchInput.value =
            "";


        setActiveQuickCategory(
            "all"
        );


        renderShop();

    }
);


/* =====================================================
   CART COUNT
===================================================== */

function updateShopCartCount() {

    const cartCount =
        document.getElementById(
            "cartCount"
        );


    if (!cartCount) {
        return;
    }


    let cart = [];


    try {

        cart =
            JSON.parse(
                localStorage.getItem(
                    "zavyroCart"
                )
            ) || [];

    } catch {

        cart = [];

    }


    const count =
        cart.reduce(
            (
                total,
                item
            ) =>
                total +
                Number(
                    item.quantity || 0
                ),
            0
        );


    cartCount.textContent =
        count;

}


/* =====================================================
   MOBILE MENU
===================================================== */

const shopMenuToggle =
    document.getElementById(
        "menuToggle"
    );

const shopNavLinks =
    document.getElementById(
        "navLinks"
    );


shopMenuToggle?.addEventListener(
    "click",
    () => {

        shopNavLinks?.classList.toggle(
            "active"
        );

    }
);


shopNavLinks
    ?.querySelectorAll("a")
    .forEach(
        link => {

            link.addEventListener(
                "click",
                () => {

                    shopNavLinks.classList.remove(
                        "active"
                    );

                }
            );

        }
    );


/* =====================================================
   INITIALIZE
===================================================== */

async function initializeShop() {

    if (urlCategory) {

        const exists =
            [...categoryFilter.options]
                .some(
                    option =>
                        option.value ===
                        urlCategory
                );


        if (exists) {

            categoryFilter.value =
                urlCategory;

        }

    }


    populateSubcategories(
        categoryFilter.value,
        urlSubcategory ||
        "all"
    );


    setActiveQuickCategory(
        categoryFilter.value
    );


    updateShopCartCount();


    await loadProducts();

}


initializeShop();