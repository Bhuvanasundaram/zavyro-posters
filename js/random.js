/* =====================================================
   ZAVYRO POSTERS — RANDOM PAGE
   CURRENT POSTER EDITOR VARIANTS
   HORIZONTAL / VERTICAL PRESERVED
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* =================================================
       DOM
    ================================================= */

    const categorySelect =
        document.getElementById("randomCategory");

    const subcategorySelect =
        document.getElementById("randomSubcategory");

    const sizeSelect =
        document.getElementById("randomSize");

    const minusBtn =
        document.getElementById("randomMinus");

    const plusBtn =
        document.getElementById("randomPlus");

    const countDisplay =
        document.getElementById("randomCount");

    const generateBtn =
        document.getElementById("generateRandom");

    const generateAgainBtn =
        document.getElementById("generateAgain");

    const addToCartBtn =
        document.getElementById("addRandomToCart");

    const randomMessage =
        document.getElementById("randomMessage");

    const randomResults =
        document.getElementById("randomResults");

    const randomResultsMeta =
        document.getElementById("randomResultsMeta");

    const randomGrid =
        document.getElementById("randomGrid");

    const cartCount =
        document.getElementById("cartCount");

    const surpriseCountBadge =
        document.getElementById("surpriseCountBadge");

    const menuToggle =
        document.getElementById("menuToggle");

    const navLinks =
        document.getElementById("navLinks");


    /* =================================================
       STATE
    ================================================= */

    let allProducts = [];

    let selectedRandomProducts = [];

    let randomCount = 1;


    /* =================================================
       CATEGORY MAP
    ================================================= */

    const categoryMap = {

        anime: [
            "Naruto",
            "One Piece",
            "Dragon Ball"
        ],

        movies: [
            "Kollywood",
            "Bollywood",
            "Mollywood",
            "Tollywood",
            "Hollywood",
            "Marvel",
            "DC"
        ],

        music: [
            "Tamil",
            "Telugu",
            "Hindi",
            "Malayalam",
            "English"
        ],

        sports: [
            "Cricket",
            "Football",
            "Formula 1",
            "Others"
        ],

        cars: [
            "Automotive"
        ],

        aesthetic: [
            "Aesthetic"
        ],

        devotional: [
            "Devotional"
        ]

    };


    /* =================================================
       FORCE RANDOM POSTER CSS
       Overrides old random wall CSS
    ================================================= */

    function installRandomPosterCSS() {

        if (
            document.getElementById(
                "zavyroRandomPosterFix"
            )
        ) {
            return;
        }


        const style =
            document.createElement("style");

        style.id =
            "zavyroRandomPosterFix";


        style.textContent = `

            /* =========================================
               RANDOM WALL
            ========================================= */

            #randomGrid {

                display: grid !important;

                grid-template-columns:
                    repeat(
                        auto-fit,
                        minmax(180px, 1fr)
                    ) !important;

                align-items: start !important;

                justify-items: center !important;

                gap: 28px !important;

                width: 100% !important;

                min-height: 520px !important;

                padding: 20px !important;

                box-sizing: border-box !important;

            }


            /* =========================================
               REMOVE OLD WALL SIZE BEHAVIOUR
            ========================================= */

            #randomGrid.wall-1,
            #randomGrid.wall-2,
            #randomGrid.wall-3,
            #randomGrid.wall-4,
            #randomGrid.wall-5,
            #randomGrid.wall-6,
            #randomGrid.wall-7,
            #randomGrid.wall-8,
            #randomGrid.wall-9,
            #randomGrid.wall-10 {

                grid-template-columns:
                    repeat(
                        auto-fit,
                        minmax(180px, 1fr)
                    ) !important;

                grid-template-rows:
                    none !important;

            }


            #randomGrid.wall-5
            .random-poster:nth-child(1),
            #randomGrid.wall-5
            .random-poster:nth-child(2),
            #randomGrid.wall-5
            .random-poster:nth-child(3),
            #randomGrid.wall-5
            .random-poster:nth-child(4),
            #randomGrid.wall-5
            .random-poster:nth-child(5),

            #randomGrid.wall-7
            .random-poster:nth-child(1),
            #randomGrid.wall-7
            .random-poster:nth-child(2),
            #randomGrid.wall-7
            .random-poster:nth-child(3),
            #randomGrid.wall-7
            .random-poster:nth-child(4),
            #randomGrid.wall-7
            .random-poster:nth-child(5),
            #randomGrid.wall-7
            .random-poster:nth-child(6),
            #randomGrid.wall-7
            .random-poster:nth-child(7) {

                grid-column: auto !important;

                grid-row: auto !important;

            }


            /* =========================================
               POSTER CARD
            ========================================= */

            #randomGrid .random-poster {

                position: relative !important;

                width:
                    min(
                        100%,
                        330px
                    ) !important;

                height: auto !important;

                min-height: 0 !important;

                max-height: none !important;

                overflow: hidden !important;

                box-sizing: border-box !important;

                border:
                    1px solid
                    rgba(
                        139,
                        92,
                        246,
                        .55
                    ) !important;

                border-radius: 14px !important;

                background:
                    linear-gradient(
                        145deg,
                        rgba(
                            124,
                            58,
                            237,
                            .10
                        ),
                        #101010
                    ) !important;

                box-shadow:
                    0 12px 30px
                    rgba(
                        0,
                        0,
                        0,
                        .38
                    ) !important;

                transform:
                    none !important;

                transition:
                    transform .25s ease,
                    box-shadow .25s ease,
                    border-color .25s ease !important;

            }


            #randomGrid .random-poster:hover {

                transform:
                    translateY(-5px) !important;

                border-color:
                    #8b5cf6 !important;

                box-shadow:
                    0 20px 45px
                    rgba(
                        124,
                        58,
                        237,
                        .22
                    ) !important;

            }


            /* =========================================
               TRUE HORIZONTAL / VERTICAL IMAGE FRAME
            ========================================= */

            #randomGrid
            .random-card-image {

                width: 100% !important;

                height: auto !important;

                min-height: 0 !important;

                max-height: none !important;

                aspect-ratio:
                    210 / 297 !important;

                overflow: hidden !important;

                background:
                    #0b0b0b !important;

            }


            #randomGrid
            .random-card-image.horizontal {

                aspect-ratio:
                    297 / 210 !important;

            }


            #randomGrid
            .random-card-image.vertical {

                aspect-ratio:
                    210 / 297 !important;

            }


            /* =========================================
               IMAGE
            ========================================= */

            #randomGrid
            .random-card-image img {

                display: block !important;

                width: 100% !important;

                height: 100% !important;

                max-width: none !important;

                max-height: none !important;

                object-fit: contain !important;

                object-position: center !important;

                background:
                    #0b0b0b !important;

            }


            /* =========================================
               INFO
            ========================================= */

            #randomGrid
            .random-card-info {

                padding: 14px !important;

            }


            /* =========================================
               MOBILE
            ========================================= */

            @media (max-width: 700px) {

                #randomGrid {

                    grid-template-columns:
                        repeat(
                            2,
                            minmax(
                                0,
                                1fr
                            )
                        ) !important;

                    gap: 14px !important;

                    padding: 8px !important;

                }

                #randomGrid
                .random-poster {

                    width: 100% !important;

                }

            }


            @media (max-width: 430px) {

                #randomGrid {

                    grid-template-columns:
                        1fr !important;

                }

                #randomGrid
                .random-poster {

                    width:
                        min(
                            100%,
                            290px
                        ) !important;

                }

            }

        `;


        document.head.appendChild(style);

    }


    installRandomPosterCSS();


    /* =================================================
       MESSAGE
    ================================================= */

    function showMessage(
        message = ""
    ) {

        if (randomMessage) {

            randomMessage.textContent =
                message;

        }

    }


    /* =================================================
       NORMALIZE
    ================================================= */

    function normalize(
        value
    ) {

        return String(
            value || ""
        )
            .trim()
            .toLowerCase();

    }


    /* =================================================
       ESCAPE HTML
    ================================================= */

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


    /* =================================================
       SHUFFLE
    ================================================= */

    function shuffle(
        array
    ) {

        const result =
            [...array];


        for (
            let i =
                result.length - 1;
            i > 0;
            i--
        ) {

            const j =
                Math.floor(
                    Math.random() *
                    (i + 1)
                );


            [
                result[i],
                result[j]
            ] =
            [
                result[j],
                result[i]
            ];

        }


        return result;

    }


    /* =================================================
       PARSE POSTER EDITS
    ================================================= */

    function getPosterEdits(
        product
    ) {

        if (
            !product ||
            !product.poster_edits
        ) {

            return {};

        }


        let edits =
            product.poster_edits;


        if (
            typeof edits ===
            "string"
        ) {

            try {

                edits =
                    JSON.parse(
                        edits
                    );

            } catch {

                return {};

            }

        }


        if (
            !edits ||
            typeof edits !==
                "object" ||
            Array.isArray(edits)
        ) {

            return {};

        }


        return edits;

    }


    /* =================================================
       GET SIZE VARIANT
    ================================================= */

    function getSizeVariant(
        product,
        selectedSize
    ) {

        const size =
            String(
                selectedSize || "A4"
            )
                .toUpperCase();


        const edits =
            getPosterEdits(
                product
            );


        const saved =
            edits?.[size];


        /*
         * Poster Editor saves:
         *
         * poster_edits: {
         *   A4: {
         *      path: "products/id/A4.png",
         *      orientation: "vertical",
         *      ...
         *   }
         * }
         */


        let path =
            saved?.path ||
            "";


        /*
         * If metadata exists but path
         * wasn't stored for some reason,
         * use the exact Poster Editor
         * storage path.
         */

        if (!path) {

            path =
                `products/${product.id}/${size}.png`;

        }


        let orientation =
            normalize(
                saved?.orientation
            );


        if (
            orientation !==
                "horizontal" &&
            orientation !==
                "vertical"
        ) {

            orientation =
                normalize(
                    product.orientation
                );

        }


        if (
            orientation !==
                "horizontal" &&
            orientation !==
                "vertical"
        ) {

            orientation =
                "vertical";

        }


        return {

            size,

            path,

            orientation,

            updatedAt:
                saved?.updated_at ||
                product.updated_at ||
                ""

        };

    }


    /* =================================================
       PUBLIC IMAGE URL
    ================================================= */

    function getImageUrl(
        path,
        cacheVersion = ""
    ) {

        if (
            !path ||
            typeof supabaseClient ===
                "undefined"
        ) {

            return "";

        }


        try {

            const result =
                supabaseClient
                    .storage
                    .from("posters")
                    .getPublicUrl(
                        path
                    );


            let url =
                result?.data?.publicUrl ||
                "";


            /*
             * Important:
             * prevents browser from showing
             * an older saved poster.
             */

            if (
                url &&
                cacheVersion
            ) {

                const separator =
                    url.includes("?")
                        ? "&"
                        : "?";


                url +=
                    `${separator}v=${encodeURIComponent(
                        cacheVersion
                    )}`;

            }


            return url;

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


    /* =================================================
       SIZE CHECK
    ================================================= */

    function productHasSize(
        product,
        selectedSize
    ) {

        if (
            !product ||
            !selectedSize
        ) {

            return false;

        }


        /*
         * If available_sizes exists,
         * use it.
         */

        if (
            Array.isArray(
                product.available_sizes
            )
        ) {

            return product.available_sizes.some(
                size =>
                    normalize(size) ===
                    normalize(selectedSize)
            );

        }


        /*
         * Older products:
         * check poster_edits directly.
         */

        const edits =
            getPosterEdits(
                product
            );


        const key =
            String(
                selectedSize
            )
                .toUpperCase();


        return Boolean(
            edits?.[key]?.path
        );

    }


    /* =================================================
       PRICE
    ================================================= */

    function getProductPrice(
        product,
        selectedSize
    ) {

        const sizeKey =
            normalize(
                selectedSize
            );


        const specificPrice =
            product[
                `price_${sizeKey}`
            ];


        if (
            specificPrice !==
                null &&
            specificPrice !==
                undefined &&
            specificPrice !==
                "" &&
            !Number.isNaN(
                Number(
                    specificPrice
                )
            )
        ) {

            return Number(
                specificPrice
            );

        }


        return Number(
            product.price || 0
        );

    }


    /* =================================================
       COUNT DISPLAY
    ================================================= */

    function updateCountDisplay() {

        if (countDisplay) {

            countDisplay.textContent =
                randomCount;

        }


        if (surpriseCountBadge) {

            surpriseCountBadge.textContent =
                randomCount;

        }

    }


    /* =================================================
       COUNT MINUS
    ================================================= */

    if (minusBtn) {

        minusBtn.addEventListener(
            "click",
            () => {

                if (
                    randomCount > 1
                ) {

                    randomCount--;

                    updateCountDisplay();

                    showMessage("");

                }

            }
        );

    }


    /* =================================================
       COUNT PLUS
    ================================================= */

    if (plusBtn) {

        plusBtn.addEventListener(
            "click",
            () => {

                if (
                    randomCount < 10
                ) {

                    randomCount++;

                    updateCountDisplay();

                    showMessage("");

                }

            }
        );

    }


    /* =================================================
       SUBCATEGORY
    ================================================= */

    function populateSubcategories() {

        if (
            !subcategorySelect
        ) {

            return;

        }


        const category =
            normalize(
                categorySelect?.value
            );


        subcategorySelect.innerHTML = `
            <option value="">
                Select Category First
            </option>
        `;


        subcategorySelect.disabled =
            true;


        if (sizeSelect) {

            sizeSelect.disabled =
                true;

            sizeSelect.value =
                "";

            if (
                sizeSelect.options[0]
            ) {

                sizeSelect.options[0]
                    .textContent =
                    "Select Category First";

            }

        }


        if (
            !category ||
            !categoryMap[category]
        ) {

            return;

        }


        subcategorySelect.innerHTML = `
            <option value="">
                Select Subcategory
            </option>
        `;


        categoryMap[
            category
        ].forEach(
            subcategory => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    subcategory;

                option.textContent =
                    subcategory;


                subcategorySelect
                    .appendChild(
                        option
                    );

            }
        );


        subcategorySelect.disabled =
            false;

    }


    /* =================================================
       SIZE STATE
    ================================================= */

    function updateSizeState() {

        if (
            !sizeSelect
        ) {

            return;

        }


        const category =
            categorySelect?.value;


        const subcategory =
            subcategorySelect?.value;


        if (
            category &&
            subcategory
        ) {

            sizeSelect.disabled =
                false;


            if (
                sizeSelect.options[0]
            ) {

                sizeSelect.options[0]
                    .textContent =
                    "Select Size";

            }

        } else {

            sizeSelect.disabled =
                true;

            sizeSelect.value =
                "";


            if (
                sizeSelect.options[0]
            ) {

                sizeSelect.options[0]
                    .textContent =
                    "Select Category First";

            }

        }

    }


    /* =================================================
       CATEGORY EVENT
    ================================================= */

    if (
        categorySelect
    ) {

        categorySelect.addEventListener(
            "change",
            () => {

                populateSubcategories();

                selectedRandomProducts =
                    [];

                updateResultsState();

                showMessage("");

            }
        );

    }


    /* =================================================
       SUBCATEGORY EVENT
    ================================================= */

    if (
        subcategorySelect
    ) {

        subcategorySelect.addEventListener(
            "change",
            () => {

                updateSizeState();

                selectedRandomProducts =
                    [];

                updateResultsState();

                showMessage("");

            }
        );

    }


    /* =================================================
       SIZE EVENT
    ================================================= */

    if (
        sizeSelect
    ) {

        sizeSelect.addEventListener(
            "change",
            () => {

                selectedRandomProducts =
                    [];

                updateResultsState();

                showMessage("");

            }
        );

    }


    /* =================================================
       GET AVAILABLE PRODUCTS
    ================================================= */

    function getAvailableProducts() {

        const category =
            normalize(
                categorySelect?.value
            );


        const subcategory =
            normalize(
                subcategorySelect?.value
            );


        const selectedSize =
            normalize(
                sizeSelect?.value
            );


        if (
            !category ||
            !subcategory ||
            !selectedSize
        ) {

            return [];

        }


        return allProducts.filter(
            product => {

                const categoryMatch =
                    normalize(
                        product.category
                    ) ===
                    category;


                const subcategoryMatch =
                    normalize(
                        product.subcategory
                    ) ===
                    subcategory;


                const sizeMatch =
                    productHasSize(
                        product,
                        selectedSize
                    );


                return (
                    categoryMatch &&
                    subcategoryMatch &&
                    sizeMatch
                );

            }
        );

    }


    /* =================================================
       RESULT STATE
    ================================================= */

    function updateResultsState() {

        if (
            !selectedRandomProducts.length
        ) {

            randomResults?.classList.remove(
                "show"
            );


            if (
                generateAgainBtn
            ) {

                generateAgainBtn.disabled =
                    true;

            }


            if (
                addToCartBtn
            ) {

                addToCartBtn.disabled =
                    true;

            }


            return;

        }


        randomResults?.classList.add(
            "show"
        );


        if (
            generateAgainBtn
        ) {

            generateAgainBtn.disabled =
                false;

        }


        if (
            addToCartBtn
        ) {

            addToCartBtn.disabled =
                false;

        }

    }


    /* =================================================
       WALL CLASS
    ================================================= */

    function getWallClass(
        count
    ) {

        return `wall-${Math.min(
            Math.max(
                Number(count) || 1,
                1
            ),
            10
        )}`;

    }


    /* =================================================
       CREATE RANDOM CARD
    ================================================= */

    function createRandomCard(
        product,
        selectedSize
    ) {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "random-card random-poster";


        const variant =
            getSizeVariant(
                product,
                selectedSize
            );


        const orientation =
            variant.orientation ===
                "horizontal"
                ? "horizontal"
                : "vertical";


        const imageUrl =
            getImageUrl(
                variant.path,
                variant.updatedAt
            );


        /*
         * The image area itself gets
         * the correct A4 orientation.
         */

        const imageBox =
            document.createElement(
                "div"
            );


        imageBox.className =
            `random-card-image ${orientation}`;


        imageBox.dataset.orientation =
            orientation;


        /*
         * Force exact A-series visual
         * proportions.
         */

        imageBox.style.aspectRatio =
            orientation ===
                "horizontal"
                ? "297 / 210"
                : "210 / 297";


        if (imageUrl) {

            const img =
                document.createElement(
                    "img"
                );


            img.src =
                imageUrl;


            img.alt =
                product.title ||
                "Poster";


            img.loading =
                "eager";


            img.decoding =
                "async";


            img.style.objectFit =
                "contain";


            /*
             * Final safety check:
             * if metadata is wrong, use
             * actual image dimensions.
             */

            img.addEventListener(
                "load",
                () => {

                    const width =
                        img.naturalWidth;

                    const height =
                        img.naturalHeight;


                    if (
                        width &&
                        height
                    ) {

                        const detected =
                            width >
                            height
                                ? "horizontal"
                                : "vertical";


                        imageBox.classList.remove(
                            "horizontal",
                            "vertical"
                        );


                        imageBox.classList.add(
                            detected
                        );


                        imageBox.dataset.orientation =
                            detected;


                        imageBox.style.aspectRatio =
                            detected ===
                                "horizontal"
                                ? "297 / 210"
                                : "210 / 297";

                    }

                }
            );


            /*
             * If variant doesn't exist,
             * show a clean error instead of
             * old product.image_path.
             */

            img.addEventListener(
                "error",
                () => {

                    imageBox.innerHTML = `

                        <div
                            style="
                                width:100%;
                                height:100%;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                text-align:center;
                                color:#777;
                                font-size:12px;
                                padding:20px;
                                box-sizing:border-box;
                            "
                        >
                            Poster variant unavailable
                        </div>

                    `;

                }
            );


            imageBox.appendChild(
                img
            );

        } else {

            imageBox.innerHTML = `

                <div
                    style="
                        width:100%;
                        height:100%;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        text-align:center;
                        color:#777;
                        font-size:12px;
                        padding:20px;
                        box-sizing:border-box;
                    "
                >
                    Poster variant unavailable
                </div>

            `;

        }


        /* =============================================
           INFO
        ============================================= */

        const info =
            document.createElement(
                "div"
            );


        info.className =
            "random-card-info";


        const category =
            document.createElement(
                "span"
            );


        category.className =
            "random-card-category";


        category.textContent =
            product.category ||
            "";


        const title =
            document.createElement(
                "h3"
            );


        title.textContent =
            product.title ||
            "Poster";


        const subcategory =
            document.createElement(
                "div"
            );


        subcategory.className =
            "random-card-subcategory";


        subcategory.textContent =
            product.subcategory ||
            "";


        const price =
            document.createElement(
                "div"
            );


        price.className =
            "random-card-price";


        price.textContent =
            `₹${getProductPrice(
                product,
                selectedSize
            ).toFixed(0)}`;


        info.appendChild(
            category
        );


        info.appendChild(
            title
        );


        info.appendChild(
            subcategory
        );


        info.appendChild(
            price
        );


        card.appendChild(
            imageBox
        );


        card.appendChild(
            info
        );


        /*
         * Keep the selected size available
         * for debugging / future use.
         */

        card.dataset.productId =
            product.id || "";


        card.dataset.size =
            selectedSize;


        card.dataset.orientation =
            orientation;


        return card;

    }


    /* =================================================
       RENDER WALL
    ================================================= */

    function renderRandomWall(
        products
    ) {

        if (
            !randomGrid
        ) {

            return;

        }


        randomGrid.innerHTML =
            "";


        randomGrid.className =
            `random-grid ${getWallClass(
                products.length
            )}`;


        products.forEach(
            product => {

                const card =
                    createRandomCard(
                        product,
                        sizeSelect?.value
                    );


                randomGrid.appendChild(
                    card
                );

            }
        );


        randomResults?.classList.add(
            "show"
        );


        if (
            randomResultsMeta
        ) {

            randomResultsMeta.textContent =
                `${products.length} ${
                    products.length === 1
                        ? "poster"
                        : "posters"
                } selected`;

        }

    }


    /* =================================================
       GENERATE RANDOM
    ================================================= */

    async function generateRandom() {

        const category =
            categorySelect?.value;


        const subcategory =
            subcategorySelect?.value;


        const selectedSize =
            sizeSelect?.value;


        /* =============================================
           VALIDATION
        ============================================= */

        if (!category) {

            showMessage(
                "Please select a category."
            );

            return;

        }


        if (!subcategory) {

            showMessage(
                "Please select a subcategory."
            );

            return;

        }


        if (!selectedSize) {

            showMessage(
                "Please select a poster size."
            );

            return;

        }


        /* =============================================
           AVAILABLE PRODUCTS
        ============================================= */

        const availableProducts =
            getAvailableProducts();


        if (
            availableProducts.length ===
            0
        ) {

            selectedRandomProducts =
                [];


            if (
                randomGrid
            ) {

                randomGrid.innerHTML = `

                    <div class="random-empty">

                        <strong>
                            No posters available
                        </strong>

                        Try another
                        category, subcategory
                        or size.

                    </div>

                `;


                randomGrid.className =
                    "random-grid";

            }


            randomResults?.classList.add(
                "show"
            );


            if (
                randomResultsMeta
            ) {

                randomResultsMeta.textContent =
                    "0 posters selected";

            }


            updateResultsState();


            showMessage(
                "No posters are available for this selection."
            );


            return;

        }


        /* =============================================
           RANDOM UNIQUE SELECTION
        ============================================= */

        const shuffled =
            shuffle(
                availableProducts
            );


        const actualCount =
            Math.min(
                randomCount,
                shuffled.length
            );


        selectedRandomProducts =
            shuffled.slice(
                0,
                actualCount
            );


        /* =============================================
           RENDER
        ============================================= */

        renderRandomWall(
            selectedRandomProducts
        );


        updateResultsState();


        if (
            actualCount <
            randomCount
        ) {

            showMessage(
                `Only ${actualCount} poster${
                    actualCount === 1
                        ? ""
                        : "s"
                } available for this selection.`
            );

        } else {

            showMessage("");

        }

    }


    /* =================================================
       GENERATE BUTTON
    ================================================= */

    if (
        generateBtn
    ) {

        generateBtn.addEventListener(
            "click",
            event => {

                event.preventDefault();

                generateRandom();

            }
        );

    }


    /* =================================================
       GENERATE AGAIN
    ================================================= */

    if (
        generateAgainBtn
    ) {

        generateAgainBtn.disabled =
            true;


        generateAgainBtn.addEventListener(
            "click",
            event => {

                event.preventDefault();

                generateRandom();

            }
        );

    }


    /* =================================================
       CART
    ================================================= */

    function getCart() {

        try {

            const saved =
                localStorage.getItem(
                    "zavyroCart"
                );


            if (!saved) {

                return [];

            }


            const cart =
                JSON.parse(
                    saved
                );


            return Array.isArray(
                cart
            )
                ? cart
                : [];

        } catch (
            error
        ) {

            console.error(
                "Cart error:",
                error
            );


            return [];

        }

    }


    function saveCart(
        cart
    ) {

        localStorage.setItem(
            "zavyroCart",
            JSON.stringify(
                cart
            )
        );

    }


    function updateCartCount() {

        const cart =
            getCart();


        const total =
            cart.reduce(
                (
                    sum,
                    item
                ) =>
                    sum +
                    Number(
                        item.quantity ||
                        1
                    ),
                0
            );


        if (
            cartCount
        ) {

            cartCount.textContent =
                total;

        }

    }


    /* =================================================
       ADD ONE PRODUCT TO CART
    ================================================= */

    function addProductToCart(
        product,
        selectedSize
    ) {

        const cart =
            getCart();


        const price =
            getProductPrice(
                product,
                selectedSize
            );


        const existingIndex =
            cart.findIndex(
                item => {

                    const sameId =
                        String(
                            item.id
                        ) ===
                        String(
                            product.id
                        );


                    const existingSize =
                        normalize(
                            item.selectedSize ||
                            item.size
                        );


                    const currentSize =
                        normalize(
                            selectedSize
                        );


                    return (
                        sameId &&
                        existingSize ===
                        currentSize
                    );

                }
            );


        if (
            existingIndex !==
            -1
        ) {

            cart[
                existingIndex
            ].quantity =
                Number(
                    cart[
                        existingIndex
                    ].quantity || 0
                ) + 1;

        } else {

            /*
             * Keep the original image_path
             * for cart compatibility.
             *
             * Customer product pages can
             * still resolve the selected size.
             */

            cart.push({

                id:
                    product.id,

                title:
                    product.title ||
                    "Poster",

                price:
                    price,

                image_path:
                    product.image_path ||
                    "",

                category:
                    product.category ||
                    "",

                subcategory:
                    product.subcategory ||
                    "",

                quantity:
                    1,

                selectedSize:
                    selectedSize,

                size:
                    selectedSize,

                custom:
                    false

            });

        }


        saveCart(
            cart
        );

    }


    /* =================================================
       ADD ALL TO CART
    ================================================= */

    function addAllToCart() {

        if (
            !selectedRandomProducts.length
        ) {

            showMessage(
                "Generate posters first."
            );

            return;

        }


        const selectedSize =
            sizeSelect?.value;


        if (!selectedSize) {

            showMessage(
                "Please select a poster size."
            );

            return;

        }


        selectedRandomProducts.forEach(
            product => {

                addProductToCart(
                    product,
                    selectedSize
                );

            }
        );


        updateCartCount();


        if (
            addToCartBtn
        ) {

            const originalText =
                addToCartBtn.textContent;


            addToCartBtn.textContent =
                "✓ ADDED TO CART";


            setTimeout(
                () => {

                    addToCartBtn.textContent =
                        originalText;

                },
                1500
            );

        }


        showMessage(
            "All selected posters were added to your cart."
        );

    }


    /* =================================================
       ADD TO CART BUTTON
    ================================================= */

    if (
        addToCartBtn
    ) {

        addToCartBtn.disabled =
            true;


        addToCartBtn.addEventListener(
            "click",
            event => {

                event.preventDefault();

                addAllToCart();

            }
        );

    }


    /* =================================================
       MOBILE MENU
    ================================================= */

    if (
        menuToggle &&
        navLinks
    ) {

        menuToggle.addEventListener(
            "click",
            () => {

                navLinks.classList.toggle(
                    "active"
                );


                menuToggle.classList.toggle(
                    "active"
                );

            }
        );


        navLinks
            .querySelectorAll("a")
            .forEach(
                link => {

                    link.addEventListener(
                        "click",
                        () => {

                            navLinks.classList.remove(
                                "active"
                            );


                            menuToggle.classList.remove(
                                "active"
                            );

                        }
                    );

                }
            );

    }


    /* =================================================
       LOAD PRODUCTS
    ================================================= */

    async function loadProducts() {

        try {

            if (
                typeof supabaseClient ===
                "undefined"
            ) {

                console.error(
                    "supabaseClient is not available."
                );


                showMessage(
                    "Supabase connection is unavailable."
                );


                return;

            }


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
                    );


            if (
                error
            ) {

                console.error(
                    "Supabase error:",
                    error
                );


                showMessage(
                    "Unable to load posters."
                );


                return;

            }


            allProducts =
                Array.isArray(
                    data
                )
                    ? data
                    : [];


            console.log(
                "Zavyro Random — products loaded:",
                allProducts.length
            );


            /*
             * Useful debugging:
             * shows which current variant
             * is being used.
             */

            allProducts.forEach(
                product => {

                    const edits =
                        getPosterEdits(
                            product
                        );


                    console.log(
                        "Random product:",
                        product.title,
                        edits
                    );

                }
            );

        } catch (
            error
        ) {

            console.error(
                "Product loading failed:",
                error
            );


            showMessage(
                "Unable to load posters."
            );

        }

    }


    /* =================================================
       INITIALIZE
    ================================================= */

    randomCount =
        1;


    updateCountDisplay();

    updateCartCount();

    populateSubcategories();

    updateSizeState();

    updateResultsState();


    loadProducts();

});