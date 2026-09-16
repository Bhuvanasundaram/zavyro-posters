/* =========================================================
   ZAVYRO SHOP LAYOUT SYSTEM
   Admin controlled gallery layout
========================================================= */

(() => {

    "use strict";

    /* =====================================================
       SETTINGS
    ===================================================== */

    const DEFAULT_LAYOUT = "vhvh";

    const LAYOUTS = {

        vhvh: {
            name: "Vertical + Horizontal",
            short: "V + H + V + H",
            pattern: ["v", "h", "v", "h"]
        },

        hvhv: {
            name: "Horizontal + Vertical",
            short: "H + V + H + V",
            pattern: ["h", "v", "h", "v"]
        },

        vvhh: {
            name: "Vertical + Vertical",
            short: "V + V + H + H",
            pattern: ["v", "v", "h", "h"]
        },

        hhvv: {
            name: "Horizontal + Horizontal",
            short: "H + H + V + V",
            pattern: ["h", "h", "v", "v"]
        }

    };


    /* =====================================================
       INJECT SHOP LAYOUT CSS
    ===================================================== */

    function injectStyles() {

        if (
            document.getElementById(
                "zavyroShopLayoutStyles"
            )
        ) {
            return;
        }

        const style =
            document.createElement("style");

        style.id =
            "zavyroShopLayoutStyles";

        style.textContent = `

            /* =============================================
               SHOP GRID
            ============================================= */

            .shop-grid {
                align-items: start !important;
            }


            /* =============================================
               VERTICAL POSTER
            ============================================= */

            .shop-product-card.z-layout-v
            .shop-product-image {

                aspect-ratio: 2 / 3 !important;

                min-height: 0 !important;

            }


            /* =============================================
               HORIZONTAL POSTER
            ============================================= */

            .shop-product-card.z-layout-h
            .shop-product-image {

                aspect-ratio: 3 / 2 !important;

                min-height: 0 !important;

            }


            /* =============================================
               IMAGE
            ============================================= */

            .shop-product-card
            .shop-product-image {

                overflow: hidden;

                display: flex;

                align-items: center;

                justify-content: center;

                background:
                    #0d0d0d;

                border-radius:
                    12px;

            }


            .shop-product-card
            .shop-product-image img {

                width: 100% !important;

                height: 100% !important;

                object-fit: contain !important;

                display: block;

            }


            /* =============================================
               DESKTOP SPACING
            ============================================= */

            .shop-grid {

                column-gap: 18px !important;

                row-gap: 30px !important;

            }


            /* =============================================
               ADMIN LAYOUT PANEL
            ============================================= */

            .zavyro-layout-panel {

                margin-top: 25px;

                padding: 25px;

                border:
                    1px solid #30204f;

                border-radius: 20px;

                background:
                    linear-gradient(
                        145deg,
                        #111,
                        #0c0c0c
                    );

                box-shadow:
                    0 0 45px
                    rgba(124,58,237,.08);

            }


            .zavyro-layout-header {

                display: flex;

                align-items: center;

                justify-content: space-between;

                gap: 20px;

                margin-bottom: 20px;

            }


            .zavyro-layout-header h2 {

                margin: 0;

                font-size: 21px;

                color: #fff;

            }


            .zavyro-layout-header p {

                margin:
                    6px 0 0;

                color: #777;

                font-size: 12px;

            }


            .zavyro-layout-status {

                padding:
                    7px 11px;

                border:
                    1px solid
                    rgba(124,58,237,.35);

                border-radius:
                    999px;

                color:
                    #a78bfa;

                font-size:
                    10px;

                font-weight:
                    800;

                white-space:
                    nowrap;

            }


            /* =============================================
               LAYOUT OPTIONS
            ============================================= */

            .zavyro-layout-options {

                display: grid;

                grid-template-columns:
                    repeat(4, 1fr);

                gap: 12px;

            }


            .zavyro-layout-option {

                position: relative;

                padding:
                    15px;

                border:
                    1px solid #292929;

                border-radius:
                    14px;

                background:
                    #0b0b0b;

                cursor:
                    pointer;

                transition:
                    .25s ease;

            }


            .zavyro-layout-option:hover {

                border-color:
                    rgba(124,58,237,.55);

                transform:
                    translateY(-2px);

            }


            .zavyro-layout-option.active {

                border-color:
                    #7c3aed;

                background:
                    rgba(124,58,237,.08);

                box-shadow:
                    0 0 25px
                    rgba(124,58,237,.12);

            }


            .zavyro-layout-option input {

                position:
                    absolute;

                opacity:
                    0;

                pointer-events:
                    none;

            }


            .zavyro-layout-preview {

                height:
                    105px;

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    center;

                gap:
                    5px;

                margin-bottom:
                    13px;

            }


            .zavyro-layout-preview span {

                display:
                    block;

                border:
                    1px solid
                    #7c3aed;

                background:
                    rgba(124,58,237,.12);

                border-radius:
                    3px;

                flex:
                    1;

                max-width:
                    35px;

            }


            .zavyro-layout-preview .pv-v {

                height:
                    75px;

            }


            .zavyro-layout-preview .pv-h {

                height:
                    45px;

            }


            .zavyro-layout-option strong {

                display:
                    block;

                color:
                    #fff;

                font-size:
                    12px;

                margin-bottom:
                    5px;

            }


            .zavyro-layout-option small {

                color:
                    #666;

                font-size:
                    10px;

            }


            /* =============================================
               SAVE BUTTON
            ============================================= */

            .zavyro-layout-actions {

                display:
                    flex;

                align-items:
                    center;

                gap:
                    12px;

                margin-top:
                    18px;

            }


            #zavyroLayoutSave {

                border:
                    0;

                border-radius:
                    9px;

                padding:
                    11px 18px;

                background:
                    #7c3aed;

                color:
                    white;

                font-size:
                    11px;

                font-weight:
                    800;

                cursor:
                    pointer;

                transition:
                    .2s ease;

            }


            #zavyroLayoutSave:hover {

                background:
                    #8b5cf6;

                transform:
                    translateY(-1px);

            }


            #zavyroLayoutSave:disabled {

                opacity:
                    .55;

                cursor:
                    wait;

            }


            #zavyroLayoutMessage {

                color:
                    #777;

                font-size:
                    11px;

            }


            /* =============================================
               MOBILE
            ============================================= */

            @media (max-width: 850px) {

                .zavyro-layout-options {

                    grid-template-columns:
                        repeat(2, 1fr);

                }

                .zavyro-layout-header {

                    align-items:
                        flex-start;

                    flex-direction:
                        column;

                }

            }


            @media (max-width: 500px) {

                .zavyro-layout-panel {

                    padding:
                        18px;

                }

                .zavyro-layout-options {

                    grid-template-columns:
                        1fr 1fr;

                    gap:
                        8px;

                }

                .zavyro-layout-preview {

                    height:
                        80px;

                }

                .zavyro-layout-preview .pv-v {

                    height:
                        55px;

                }

                .zavyro-layout-preview .pv-h {

                    height:
                        35px;

                }

            }

        `;

        document.head.appendChild(style);

    }


    /* =====================================================
       SUPABASE HELPERS
    ===================================================== */

    async function getLayout() {

        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("shop_settings")
                    .select("layout_pattern")
                    .eq("id", 1)
                    .single();

            if (error) {

                console.error(
                    "SHOP LAYOUT LOAD ERROR:",
                    error
                );

                return DEFAULT_LAYOUT;

            }

            return (
                LAYOUTS[data?.layout_pattern]
                    ? data.layout_pattern
                    : DEFAULT_LAYOUT
            );

        } catch (error) {

            console.error(
                "SHOP LAYOUT ERROR:",
                error
            );

            return DEFAULT_LAYOUT;

        }

    }


    async function saveLayout(layout) {

        const {
            error
        } =
            await supabaseClient
                .from("shop_settings")
                .update({
                    layout_pattern:
                        layout,

                    updated_at:
                        new Date().toISOString()
                })
                .eq("id", 1);

        if (error) {

            throw error;

        }

    }


    /* =====================================================
       APPLY SHOP LAYOUT
    ===================================================== */

    function applyShopLayout(layout) {

        const settings =
            LAYOUTS[layout] ||
            LAYOUTS[DEFAULT_LAYOUT];

        const cards =
            document.querySelectorAll(
                ".shop-product-card"
            );

        cards.forEach(
            (card, index) => {

                card.classList.remove(
                    "z-layout-v",
                    "z-layout-h"
                );

                const type =
                    settings.pattern[
                        index %
                        settings.pattern.length
                    ];

                card.classList.add(
                    type === "v"
                        ? "z-layout-v"
                        : "z-layout-h"
                );

                card.dataset.layoutType =
                    type;

            }
        );

    }


    /* =====================================================
       WATCH SHOP RENDERING
    ===================================================== */

    function watchShop() {

        const grid =
            document.querySelector(
                ".shop-grid"
            );

        if (!grid) {

            return;

        }

        let currentLayout =
            DEFAULT_LAYOUT;


        getLayout()
            .then(
                layout => {

                    currentLayout =
                        layout;

                    applyShopLayout(
                        currentLayout
                    );

                }
            );


        const observer =
            new MutationObserver(
                () => {

                    applyShopLayout(
                        currentLayout
                    );

                }
            );


        observer.observe(
            grid,
            {
                childList: true
            }
        );

    }


    /* =====================================================
       CREATE ADMIN PANEL
    ===================================================== */

    function createAdminPanel(
        currentLayout
    ) {

        if (
            document.getElementById(
                "zavyroLayoutPanel"
            )
        ) {

            return;

        }


        const quickActions =
            document.querySelector(
                ".admin-quick-actions"
            );

        if (!quickActions) {

            return;

        }


        const panel =
            document.createElement(
                "section"
            );

        panel.id =
            "zavyroLayoutPanel";

        panel.className =
            "zavyro-layout-panel";


        const settings =
            LAYOUTS[currentLayout] ||
            LAYOUTS[DEFAULT_LAYOUT];


        panel.innerHTML = `

            <div
                class="zavyro-layout-header"
            >

                <div>

                    <h2>
                        Shop Gallery Layout
                    </h2>

                    <p>
                        Choose how posters are arranged
                        on the customer Shop page.
                    </p>

                </div>

                <span
                    class="zavyro-layout-status"
                    id="zavyroLayoutStatus"
                >
                    CURRENT:
                    ${settings.short}
                </span>

            </div>


            <div
                class="zavyro-layout-options"
                id="zavyroLayoutOptions"
            >

                ${createLayoutOption(
                    "vhvh",
                    "V + H + V + H",
                    "Alternating",
                    currentLayout
                )}

                ${createLayoutOption(
                    "hvhv",
                    "H + V + H + V",
                    "Reverse alternating",
                    currentLayout
                )}

                ${createLayoutOption(
                    "vvhh",
                    "V + V + H + H",
                    "Two vertical, two horizontal",
                    currentLayout
                )}

                ${createLayoutOption(
                    "hhvv",
                    "H + H + V + V",
                    "Two horizontal, two vertical",
                    currentLayout
                )}

            </div>


            <div
                class="zavyro-layout-actions"
            >

                <button
                    type="button"
                    id="zavyroLayoutSave"
                >
                    Save Layout
                </button>

                <span
                    id="zavyroLayoutMessage"
                ></span>

            </div>

        `;


        quickActions.after(
            panel
        );


        setupAdminControls(
            currentLayout
        );

    }


    /* =====================================================
       CREATE OPTION
    ===================================================== */

    function createLayoutOption(
        value,
        title,
        description,
        current
    ) {

        const pattern =
            LAYOUTS[value].pattern;

        const active =
            value === current
                ? "active"
                : "";


        return `

            <label
                class="
                    zavyro-layout-option
                    ${active}
                "
                data-layout="${value}"
            >

                <input
                    type="radio"
                    name="zavyroLayout"
                    value="${value}"
                    ${value === current
                        ? "checked"
                        : ""}
                >


                <div
                    class="zavyro-layout-preview"
                >

                    ${pattern
                        .map(
                            type =>
                                `
                                <span
                                    class="
                                        ${
                                            type === "v"
                                                ? "pv-v"
                                                : "pv-h"
                                        }
                                    "
                                ></span>
                                `
                        )
                        .join("")
                    }

                </div>


                <strong>
                    ${title}
                </strong>

                <small>
                    ${description}
                </small>

            </label>

        `;

    }


    /* =====================================================
       ADMIN CONTROLS
    ===================================================== */

    function setupAdminControls(
        currentLayout
    ) {

        const options =
            document.querySelectorAll(
                ".zavyro-layout-option"
            );

        const saveButton =
            document.getElementById(
                "zavyroLayoutSave"
            );

        const message =
            document.getElementById(
                "zavyroLayoutMessage"
            );

        const status =
            document.getElementById(
                "zavyroLayoutStatus"
            );


        options.forEach(
            option => {

                option.addEventListener(
                    "click",
                    () => {

                        options.forEach(
                            item =>
                                item.classList.remove(
                                    "active"
                                )
                        );


                        option.classList.add(
                            "active"
                        );


                        const radio =
                            option.querySelector(
                                "input"
                            );

                        if (radio) {

                            radio.checked =
                                true;

                        }


                        const selected =
                            radio?.value ||
                            DEFAULT_LAYOUT;


                        const selectedSettings =
                            LAYOUTS[
                                selected
                            ];


                        if (status) {

                            status.textContent =
                                `CURRENT: ${
                                    selectedSettings.short
                                }`;

                        }


                        if (message) {

                            message.textContent =
                                "Click Save Layout to apply.";

                        }

                    }
                );

            }
        );


        saveButton?.addEventListener(
            "click",
            async () => {

                const selected =
                    document.querySelector(
                        'input[name="zavyroLayout"]:checked'
                    )?.value ||
                    DEFAULT_LAYOUT;


                saveButton.disabled =
                    true;

                saveButton.textContent =
                    "Saving...";


                if (message) {

                    message.textContent =
                        "";

                }


                try {

                    await saveLayout(
                        selected
                    );


                    const selectedSettings =
                        LAYOUTS[selected];


                    if (message) {

                        message.textContent =
                            "✓ Layout saved successfully.";

                        message.style.color =
                            "#86efac";

                    }


                    if (status) {

                        status.textContent =
                            `CURRENT: ${
                                selectedSettings.short
                            }`;

                    }

                } catch (error) {

                    console.error(
                        "SHOP LAYOUT SAVE ERROR:",
                        error
                    );


                    if (message) {

                        message.textContent =
                            error?.message ||
                            "Unable to save layout.";

                        message.style.color =
                            "#f87171";

                    }

                } finally {

                    saveButton.disabled =
                        false;

                    saveButton.textContent =
                        "Save Layout";

                }

            }
        );

    }


    /* =====================================================
       START ADMIN
    ===================================================== */

    async function startAdmin() {

        const quickActions =
            document.querySelector(
                ".admin-quick-actions"
            );

        if (!quickActions) {

            return;

        }


        injectStyles();


        const layout =
            await getLayout();


        createAdminPanel(
            layout
        );

    }


    /* =====================================================
       START SHOP
    ===================================================== */

    function startShop() {

        const shopGrid =
            document.querySelector(
                ".shop-grid"
            );

        if (!shopGrid) {

            return;

        }


        injectStyles();

        watchShop();

    }


    /* =====================================================
       START
    ===================================================== */

    function start() {

        startAdmin();

        startShop();

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            start
        );

    } else {

        start();

    }

})();