/* =====================================================
   ZAVYRO POSTERS
   MAIN JAVASCRIPT
   FINAL HOMEPAGE VERSION
===================================================== */

"use strict";


/* =====================================================
   LOADER
===================================================== */

const loader =
    document.getElementById("loader");

window.addEventListener("load", () => {

    setTimeout(() => {

        loader?.classList.add("hide");

    }, 900);

});


/* =====================================================
   MOBILE MENU
===================================================== */

const menuToggle =
    document.getElementById("menuToggle");

const navLinks =
    document.getElementById("navLinks");


menuToggle?.addEventListener(
    "click",
    () => {

        navLinks?.classList.toggle("active");

    }
);


navLinks?.querySelectorAll("a")
    .forEach(link => {

        link.addEventListener(
            "click",
            () => {

                navLinks?.classList.remove("active");

            }
        );

    });


/* =====================================================
   CART COUNT
===================================================== */

function updateCartCount() {

    const cartCount =
        document.getElementById("cartCount");

    let cart = [];

    try {

        cart =
            JSON.parse(
                localStorage.getItem("zavyroCart")
            ) || [];

    } catch {

        cart = [];

    }


    if (cartCount) {

        /*
           Show total quantity,
           not just number of cart rows.
        */

        const count =
            cart.reduce(
                (total, item) =>
                    total +
                    Number(
                        item.quantity || 0
                    ),
                0
            );

        cartCount.textContent =
            count;

    }

}


updateCartCount();


/* =====================================================
   SURPRISE COUNT
===================================================== */

let surpriseCount =
    Number(
        localStorage.getItem(
            "zavyroSurpriseCount"
        )
    ) || 1;


/*
   Never allow below 1.
*/

if (
    surpriseCount < 1
) {

    surpriseCount = 1;

}


/* =====================================================
   UPDATE SURPRISE COUNT
===================================================== */

function updateSurpriseCount() {

    const number =
        document.getElementById(
            "homeSurpriseCount"
        );

    const badge =
        document.getElementById(
            "surpriseCountBadge"
        );


    if (number) {

        number.textContent =
            surpriseCount;

    }


    if (badge) {

        badge.textContent =
            surpriseCount;

    }


    localStorage.setItem(
        "zavyroSurpriseCount",
        surpriseCount
    );

}


updateSurpriseCount();


/* =====================================================
   PLUS
===================================================== */

document
    .getElementById("homePlus")
    ?.addEventListener(
        "click",
        () => {

            if (
                surpriseCount < 10
            ) {

                surpriseCount++;

                updateSurpriseCount();

            }

        }
    );


/* =====================================================
   MINUS
===================================================== */

document
    .getElementById("homeMinus")
    ?.addEventListener(
        "click",
        () => {

            if (
                surpriseCount > 1
            ) {

                surpriseCount--;

                updateSurpriseCount();

            }

        }
    );


/* =====================================================
   SURPRISE BUTTON
===================================================== */

const surpriseButton =
    document.getElementById(
        "homeSurpriseButton"
    );


surpriseButton?.addEventListener(
    "click",
    () => {

        localStorage.setItem(
            "zavyroSurpriseCount",
            surpriseCount
        );

    }
);


/* =====================================================
   HOMEPAGE PRODUCT STATE
===================================================== */

let homepageProducts = [];


/* =====================================================
   TRENDING GRID
===================================================== */

const trendingGrid =
    document.getElementById(
        "trendingGrid"
    );


/* =====================================================
   SUPABASE IMAGE URL
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


    try {

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

    } catch (
        error
    ) {

        console.error(
            "IMAGE URL ERROR:",
            error
        );

        return "";

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
   GET PRODUCT IMAGE PATH
===================================================== */

/*
   IMPORTANT:

   Homepage should show the edited A4 poster
   created by Poster Editor.

   Preferred:
   products/{productId}/A4.png

   Fallback:
   poster_edits A4 path

   Final fallback:
   original image_path
*/

function getPosterPath(
    product
) {

    if (
        !product
    ) {

        return "";

    }


    /*
       1. Saved Poster Editor A4 path
    */

    const editedPath =
        product
            ?.poster_edits
            ?.A4
            ?.path;


    if (
        editedPath
    ) {

        return editedPath;

    }


    /*
       2. Standard A4 variant
    */

    if (
        product.id
    ) {

        return (
            `products/${product.id}/A4.png`
        );

    }


    /*
       3. Original product image
    */

    return (
        product.image_path ||
        ""
    );

}


/* =====================================================
   LOAD FLEXIBLE IMAGE
===================================================== */

function loadFlexibleImage(
    image,
    path
) {

    if (
        !image
    ) {

        return;

    }


    if (
        !path
    ) {

        showImagePlaceholder(
            image
        );

        return;

    }


    const url =
        getStoragePublicUrl(
            path
        );


    if (
        !url
    ) {

        showImagePlaceholder(
            image
        );

        return;

    }


    image.loading =
        "lazy";

    image.decoding =
        "async";


    image.onload =
        () => {

            image.classList.add(
                "loaded"
            );

        };


    image.onerror =
        () => {

            /*
               If edited A4 doesn't exist,
               try the original product image.
            */

            const product =
                image.dataset.product
                    ? JSON.parse(
                        image.dataset.product
                    )
                    : null;


            if (
                product &&
                product.image_path &&
                path !== product.image_path
            ) {

                const fallbackUrl =
                    getStoragePublicUrl(
                        product.image_path
                    );


                if (
                    fallbackUrl
                ) {

                    image.onerror =
                        () => {

                            showImagePlaceholder(
                                image
                            );

                        };


                    image.src =
                        fallbackUrl;


                    return;

                }

            }


            showImagePlaceholder(
                image
            );

        };


    image.src =
        url;

}


/* =====================================================
   IMAGE PLACEHOLDER
===================================================== */

function showImagePlaceholder(
    image
) {

    if (
        !image
    ) {

        return;

    }


    const parent =
        image.parentElement;


    if (
        !parent
    ) {

        return;

    }


    image.style.display =
        "none";


    /*
       Don't destroy badge.
       Only add placeholder if one
       does not already exist.
    */

    if (
        parent.querySelector(
            ".poster-placeholder"
        )
    ) {

        return;

    }


    const placeholder =
        document.createElement(
            "div"
        );


    placeholder.className =
        "poster-placeholder";


    placeholder.innerHTML =
        "<span>Z</span>";


    parent.insertBefore(
        placeholder,
        image
    );

}


/* =====================================================
   GET RANDOM PRODUCTS
===================================================== */

function getRandomProducts(
    count,
    category = "all"
) {

    let list =
        [...homepageProducts];


    /*
       Category filter
    */

    if (
        category &&
        category !== "all"
    ) {

        list =
            list.filter(
                product =>
                    String(
                        product.category ||
                        ""
                    )
                        .toLowerCase() ===
                    String(
                        category
                    )
                        .toLowerCase()
            );

    }


    /*
       Fisher-Yates shuffle
    */

    for (
        let i = list.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            list[i],
            list[j]
        ] =
        [
            list[j],
            list[i]
        ];

    }


    return list.slice(
        0,
        count
    );

}


/* =====================================================
   GET DISPLAY PRICE
===================================================== */

function getProductStartingPrice(
    product
) {

    if (
        !product
    ) {

        return 0;

    }


    const prices = [

        Number(
            product.price_a6 ||
            0
        ),

        Number(
            product.price_a5 ||
            0
        ),

        Number(
            product.price_a4 ||
            0
        ),

        Number(
            product.price_a3 ||
            0
        )

    ].filter(
        price =>
            Number.isFinite(price) &&
            price > 0
    );


    /*
       If individual size prices exist,
       show the cheapest available size.
    */

    if (
        prices.length
    ) {

        return Math.min(
            ...prices
        );

    }


    /*
       Fallback to normal price.
    */

    return Number(
        product.price ||
        product.offer_price ||
        0
    );

}


/* =====================================================
   GET PRODUCT BADGE
===================================================== */

function getProductBadge(
    product
) {

    if (
        product?.badge
    ) {

        return product.badge;

    }


    if (
        product?.offer_active
    ) {

        return "OFFER";

    }


    return "ZAVYRO";

}


/* =====================================================
   CREATE POSTER CARD
===================================================== */

function createPosterCard(
    product
) {

    const card =
        document.createElement(
            "a"
        );


    card.className =
        "poster-card";


    card.href =
        `product.html?id=${encodeURIComponent(
            product.id
        )}`;


    const title =
        escapeHtml(
            product.title ||
            "Poster"
        );


    const category =
        escapeHtml(
            product.category ||
            "POSTER"
        );


    const badge =
        escapeHtml(
            getProductBadge(
                product
            )
        );


    const price =
        getProductStartingPrice(
            product
        );


    card.innerHTML = `

        <div class="poster-image">

            <img
                alt="${title}"
                loading="lazy"
            >

            <span class="poster-badge">
                ${badge}
            </span>

        </div>


        <div class="poster-info">

            <div>

                <small>
                    ${category}
                </small>

                <h3>
                    ${title}
                </h3>

            </div>

            <span class="poster-price">
                ₹${price}
            </span>

        </div>

    `;


    const image =
        card.querySelector(
            "img"
        );


    /*
       Store product safely for
       fallback image handling.
    */

    if (
        image
    ) {

        try {

            image.dataset.product =
                JSON.stringify(
                    {
                        id:
                            product.id,

                        image_path:
                            product.image_path ||
                            ""
                    }
                );

        } catch {

            image.dataset.product =
                "";

        }

    }


    /*
       Load current edited A4 poster.
    */

    loadFlexibleImage(
        image,
        getPosterPath(
            product
        )
    );


    return card;

}


/* =====================================================
   LOAD TRENDING PRODUCTS
===================================================== */

async function loadTrendingProducts() {

    if (
        !trendingGrid
    ) {

        return;

    }


    /*
       Show loading state while
       Supabase is being queried.
    */

    trendingGrid.innerHTML = `

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

        if (
            typeof supabaseClient === "undefined" ||
            !supabaseClient
        ) {

            throw new Error(
                "Supabase client is not available."
            );

        }


        /*
           Load only active products.

           Newest products are fetched first.
        */

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


        if (
            error
        ) {

            throw error;

        }


        homepageProducts =
            Array.isArray(data)
                ? data
                : [];


        console.log(
            "Zavyro homepage products:",
            homepageProducts
        );


        /*
           No products.
        */

        if (
            homepageProducts.length === 0
        ) {

            trendingGrid.innerHTML = `

                <div
                    style="
                        grid-column:1/-1;
                        padding:50px 20px;
                        text-align:center;
                        color:#777;
                    "
                >

                    <strong
                        style="
                            display:block;
                            color:#aaa;
                            margin-bottom:8px;
                        "
                    >
                        No posters available yet.
                    </strong>

                    <span>
                        Add active posters from the Admin panel.
                    </span>

                </div>

            `;

            return;

        }


        /*
           Pick up to four random active posters.
        */

        const selected =
            getRandomProducts(
                4,
                "all"
            );


        /*
           Render.
        */

        trendingGrid.innerHTML =
            "";


        selected.forEach(
            product => {

                trendingGrid.appendChild(
                    createPosterCard(
                        product
                    )
                );

            }
        );


        /*
           If fewer than four products exist,
           show whatever is available.
        */

    } catch (
        error
    ) {

        console.error(
            "TRENDING LOAD ERROR:",
            error
        );


        trendingGrid.innerHTML = `

            <div
                style="
                    grid-column:1/-1;
                    padding:50px 20px;
                    text-align:center;
                    color:#777;
                "
            >

                <strong
                    style="
                        display:block;
                        color:#f87171;
                        margin-bottom:8px;
                    "
                >
                    Unable to load posters.
                </strong>

                <span>
                    Please refresh the page.
                </span>

            </div>

        `;

    }

}


/* =====================================================
   START TRENDING
===================================================== */

loadTrendingProducts();


/* =====================================================
   CATEGORY FROM URL
===================================================== */

const params =
    new URLSearchParams(
        window.location.search
    );


const selectedCategory =
    params.get(
        "category"
    );


/* =====================================================
   CONSOLE
===================================================== */

console.log(
    "Zavyro Posters loaded successfully."
);


console.log(
    "Current surprise count:",
    surpriseCount
);