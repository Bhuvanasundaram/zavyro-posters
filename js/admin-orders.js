"use strict";

/* =========================================================
   ZAVYRO — ADMIN ORDERS
   Orders + Custom Poster Preview + Download
========================================================= */

let db = null;
let allOrders = [];


/* =========================================================
   ADMIN CHECK
========================================================= */

async function checkAdmin() {

    if (!db) {

        showOrdersError(
            "Supabase client was not loaded."
        );

        return false;
    }


    try {

        const {
            data: { session },
            error: sessionError
        } = await db.auth.getSession();


        if (sessionError) {
            throw sessionError;
        }


        if (!session) {

            window.location.href =
                "admin-login.html";

            return false;
        }


        const {
            data,
            error
        } = await db.rpc(
            "check_admin"
        );


        if (error || !data) {

            console.error(
                "Admin check:",
                error
            );

            window.location.href =
                "admin-login.html";

            return false;
        }


        return true;

    } catch (error) {

        console.error(
            "ADMIN CHECK ERROR:",
            error
        );

        window.location.href =
            "admin-login.html";

        return false;
    }
}


/* =========================================================
   ERROR
========================================================= */

function showOrdersError(
    message
) {

    const container =
        document.getElementById(
            "ordersList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `
        <div class="error-orders">

            <h3>
                Unable to load orders
            </h3>

            <p>
                ${escapeHtml(
                    message
                )}
            </p>

        </div>
    `;
}


/* =========================================================
   LOAD ORDERS
========================================================= */

async function loadOrders() {

    const container =
        document.getElementById(
            "ordersList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `
        <div class="loading">
            Loading orders...
        </div>
    `;


    try {

        const {
            data,
            error
        } = await db
            .from("orders")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {
            throw error;
        }


        allOrders =
            data || [];


        updateStats(
            allOrders
        );


        renderOrders(
            allOrders
        );

    } catch (error) {

        console.error(
            "LOAD ORDERS ERROR:",
            error
        );

        showOrdersError(
            error.message ||
            "Unable to load orders."
        );
    }
}


/* =========================================================
   STATS
========================================================= */

function updateStats(
    orders
) {

    const total =
        document.getElementById(
            "totalOrders"
        );

    const paid =
        document.getElementById(
            "paidOrders"
        );

    const pending =
        document.getElementById(
            "pendingOrders"
        );

    const revenue =
        document.getElementById(
            "totalRevenue"
        );


    const paidOrders =
        orders.filter(
            order =>
                String(
                    order.payment_status ||
                    ""
                ).toLowerCase() ===
                "paid"
        );


    const pendingOrders =
        orders.filter(
            order =>
                String(
                    order.payment_status ||
                    ""
                ).toLowerCase() ===
                "pending"
        );


    const totalRevenue =
        paidOrders.reduce(
            (
                sum,
                order
            ) =>
                sum +
                Number(
                    order.total_amount ||
                    0
                ),
            0
        );


    if (total) {
        total.textContent =
            orders.length;
    }


    if (paid) {
        paid.textContent =
            paidOrders.length;
    }


    if (pending) {
        pending.textContent =
            pendingOrders.length;
    }


    if (revenue) {

        revenue.textContent =
            "₹" +
            totalRevenue.toFixed(2);
    }
}


/* =========================================================
   RENDER ORDERS
========================================================= */

function renderOrders(
    orders
) {

    const container =
        document.getElementById(
            "ordersList"
        );


    if (!container) {
        return;
    }


    if (!orders.length) {

        container.innerHTML = `
            <div class="empty-orders">
                No orders found.
            </div>
        `;

        return;
    }


    container.innerHTML = "";


    orders.forEach(
        order => {

            const items =
                parseItems(
                    order.items
                );


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "order-card";


            const payment =
                String(
                    order.payment_status ||
                    "pending"
                ).toLowerCase();


            let paymentClass =
                "payment-pending";


            if (
                payment === "paid"
            ) {

                paymentClass =
                    "payment-paid";

            } else if (
                payment === "failed" ||
                payment === "cancelled"
            ) {

                paymentClass =
                    "payment-failed";
            }


            card.innerHTML = `

                <div class="order-top">

                    <div>

                        <div class="order-id">
                            ${escapeHtml(
                                order.order_number ||
                                order.id ||
                                "Order"
                            )}
                        </div>

                        <div class="order-date">
                            ${escapeHtml(
                                formatDate(
                                    order.created_at
                                )
                            )}
                        </div>

                    </div>


                    <div
                        class="
                            payment-status
                            ${paymentClass}
                        "
                    >
                        ${escapeHtml(
                            order.payment_status ||
                            "pending"
                        )}
                    </div>

                </div>


                <div class="order-body">

                    <div class="customer-section">

                        <div class="customer-box">

                            <h3>
                                Customer
                            </h3>

                            <div class="customer-info">

                                <div>
                                    <strong>Name:</strong>
                                    ${escapeHtml(
                                        order.customer_name ||
                                        "-"
                                    )}
                                </div>

                                <div>
                                    <strong>Phone:</strong>
                                    ${escapeHtml(
                                        order.customer_phone ||
                                        "-"
                                    )}
                                </div>

                                <div>
                                    <strong>Email:</strong>
                                    ${escapeHtml(
                                        order.customer_email ||
                                        "-"
                                    )}
                                </div>

                            </div>

                        </div>


                        <div class="customer-box">

                            <h3>
                                Delivery Address
                            </h3>

                            <div class="customer-info">

                                <div>
                                    ${escapeHtml(
                                        order.delivery_address ||
                                        order.address ||
                                        "-"
                                    )}
                                </div>

                                <div>
                                    <strong>Pincode:</strong>
                                    ${escapeHtml(
                                        order.pincode ||
                                        "-"
                                    )}
                                </div>

                            </div>

                        </div>

                    </div>


                    <div class="items-title">
                        Order Items
                    </div>


                    <div class="order-items-list"></div>


                    <div class="order-bottom">

                        <div>

                            <div class="order-total-label">
                                Order Total
                            </div>

                            <div class="order-total">
                                ₹${Number(
                                    order.total_amount ||
                                    order.total ||
                                    0
                                ).toFixed(2)}
                            </div>

                        </div>


                        <div>

                            <div class="status-control">

                                <label>
                                    Order Status
                                </label>

                                <select
                                    class="order-status-select"
                                >

                                    <option value="pending">
                                        Pending
                                    </option>

                                    <option value="confirmed">
                                        Confirmed
                                    </option>

                                    <option value="processing">
                                        Processing
                                    </option>

                                    <option value="shipped">
                                        Shipped
                                    </option>

                                    <option value="out_for_delivery">
                                        Out for Delivery
                                    </option>

                                    <option value="delivered">
                                        Delivered
                                    </option>

                                </select>

                            </div>


                            <div class="status-message">
                                Status updated successfully.
                            </div>

                        </div>

                    </div>

                </div>
            `;


            /* STATUS */

            const statusSelect =
                card.querySelector(
                    ".order-status-select"
                );


            if (statusSelect) {

                statusSelect.value =
                    order.order_status ||
                    "pending";


                statusSelect.addEventListener(
                    "change",
                    () => {

                        updateOrderStatus(
                            order,
                            statusSelect,
                            card
                        );
                    }
                );
            }


            /* ITEMS */

            const itemsContainer =
                card.querySelector(
                    ".order-items-list"
                );


            items.forEach(
                item => {

                    const row =
                        document.createElement(
                            "div"
                        );


                    row.className =
                        "order-item";


                    const isCustom =
                        item.custom === true ||
                        item.custom === "true" ||
                        !!item.customStoragePath ||
                        !!item.custom_path ||
                        !!item.storagePath &&
                        (
                            item.type === "custom" ||
                            item.isCustom
                        );


                    /* IMAGE */

                    const image =
                        document.createElement(
                            "img"
                        );


                    image.alt =
                        item.customFileName ||
                        item.title ||
                        item.name ||
                        "Poster";


                    if (isCustom) {

                        image.classList.add(
                            "custom-label"
                        );


                        image.src =
                            item.imageUrl ||
                            "";


                        const customPath =
                            item.customStoragePath ||
                            item.storagePath ||
                            item.custom_path ||
                            "";


                        if (customPath) {

                            loadCustomPreview(
                                customPath,
                                image
                            );
                        }


                        image.onerror =
                            () => {

                                image.style.display =
                                    "none";
                            };

                    } else {

                        const path =
                            item.image_path ||
                            item.imagePath;


                        if (path) {

                            const {
                                data
                            } =
                                db
                                    .storage
                                    .from("posters")
                                    .getPublicUrl(
                                        path
                                    );


                            image.src =
                                data?.publicUrl ||
                                "";

                        } else if (
                            item.imageUrl
                        ) {

                            image.src =
                                item.imageUrl;

                        } else {

                            image.style.display =
                                "none";
                        }
                    }


                    /* INFO */

                    const info =
                        document.createElement(
                            "div"
                        );


                    info.className =
                        "item-info";


                    const title =
                        document.createElement(
                            "strong"
                        );


                    title.textContent =
                        item.customFileName ||
                        item.title ||
                        item.name ||
                        "Poster";


                    const details =
                        document.createElement(
                            "span"
                        );


                    details.textContent =
                        `${item.size || "-"} × Qty: ${
                            Number(
                                item.quantity ||
                                item.qty ||
                                1
                            )
                        }`;


                    if (isCustom) {

                        details.classList.add(
                            "custom-label"
                        );

                        details.textContent +=
                            " • CUSTOM POSTER";
                    }


                    info.appendChild(
                        title
                    );

                    info.appendChild(
                        details
                    );


                    /* PRICE */

                    const price =
                        document.createElement(
                            "div"
                        );


                    price.className =
                        "item-price";


                    price.textContent =
                        "₹" +
                        Number(
                            item.price ||
                            item.total_price ||
                            0
                        ).toFixed(2);


                    row.appendChild(
                        image
                    );

                    row.appendChild(
                        info
                    );

                    row.appendChild(
                        price
                    );


                    /* CUSTOM DOWNLOAD */

                    if (isCustom) {

                        const download =
                            document.createElement(
                                "button"
                            );


                        download.type =
                            "button";


                        download.className =
                            "download-btn";


                        download.textContent =
                            "DOWNLOAD POSTER";


                        info.appendChild(
                            download
                        );


                        download.addEventListener(
                            "click",
                            async () => {

                                download.disabled =
                                    true;

                                download.textContent =
                                    "DOWNLOADING...";


                                try {

                                    await downloadCustomPoster(
                                        item
                                    );


                                    download.textContent =
                                        "DOWNLOADED ✓";

                                } catch (error) {

                                    console.error(
                                        "DOWNLOAD ERROR:",
                                        error
                                    );

                                    download.textContent =
                                        "FAILED";

                                    alert(
                                        "Unable to download custom poster:\n" +
                                        error.message
                                    );

                                } finally {

                                    setTimeout(
                                        () => {

                                            download.disabled =
                                                false;

                                            download.textContent =
                                                "DOWNLOAD POSTER";

                                        },
                                        1800
                                    );
                                }
                            }
                        );
                    }


                    itemsContainer.appendChild(
                        row
                    );
                }
            );


            container.appendChild(
                card
            );
        }
    );
}


/* =========================================================
   CUSTOM PREVIEW
========================================================= */

async function loadCustomPreview(
    storagePath,
    imageElement
) {

    try {

        const {
            data,
            error
        } =
            await db
                .storage
                .from("custom-posters")
                .createSignedUrl(
                    storagePath,
                    3600
                );


        if (
            error ||
            !data?.signedUrl
        ) {

            console.warn(
                "Custom preview unavailable:",
                error
            );

            return;
        }


        imageElement.src =
            data.signedUrl;

    } catch (error) {

        console.warn(
            "CUSTOM PREVIEW ERROR:",
            error
        );
    }
}


/* =========================================================
   DOWNLOAD CUSTOM POSTER
========================================================= */

async function downloadCustomPoster(
    item
) {

    let url =
        item.imageUrl ||
        item.url ||
        "";


    const storagePath =
        item.customStoragePath ||
        item.storagePath ||
        item.custom_path ||
        "";


    /* PRIVATE STORAGE */

    if (storagePath) {

        const {
            data,
            error
        } =
            await db
                .storage
                .from("custom-posters")
                .createSignedUrl(
                    storagePath,
                    3600
                );


        if (
            !error &&
            data?.signedUrl
        ) {

            url =
                data.signedUrl;
        }
    }


    if (!url) {

        throw new Error(
            "Custom poster file not found."
        );
    }


    /* DATA URL */

    if (
        url.startsWith(
            "data:"
        )
    ) {

        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =
            getDownloadName(
                item
            );


        document.body.appendChild(
            link
        );


        link.click();

        link.remove();

        return;
    }


    /* FETCH */

    const response =
        await fetch(url);


    if (!response.ok) {

        throw new Error(
            `File request failed (${response.status})`
        );
    }


    const blob =
        await response.blob();


    if (!blob.size) {

        throw new Error(
            "Downloaded file is empty."
        );
    }


    const blobUrl =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        blobUrl;


    link.download =
        getDownloadName(
            item
        );


    document.body.appendChild(
        link
    );


    link.click();

    link.remove();


    setTimeout(
        () => {

            URL.revokeObjectURL(
                blobUrl
            );

        },
        2000
    );
}


/* =========================================================
   DOWNLOAD NAME
========================================================= */

function getDownloadName(
    item
) {

    let name =
        item.customFileName ||
        item.title ||
        "zavyro-custom-poster";


    name =
        String(name)
            .replace(
                /\.[^/.]+$/,
                ""
            )
            .replace(
                /[<>:"/\\|?*]+/g,
                "_"
            )
            .trim();


    return (
        name ||
        "zavyro-custom-poster"
    ) + ".jpg";
}


/* =========================================================
   UPDATE STATUS
========================================================= */

async function updateOrderStatus(
    order,
    select,
    card
) {

    const newStatus =
        select.value;


    const message =
        card.querySelector(
            ".status-message"
        );


    const oldStatus =
        order.order_status ||
        "pending";


    select.disabled =
        true;


    try {

        const {
            error
        } =
            await db
                .from("orders")
                .update({
                    order_status:
                        newStatus,

                    updated_at:
                        new Date()
                            .toISOString()
                })
                .eq(
                    "id",
                    order.id
                );


        if (error) {
            throw error;
        }


        order.order_status =
            newStatus;


        if (message) {

            message.textContent =
                "Status updated successfully.";

            message.style.color =
                "#86efac";

            message.style.display =
                "block";


            setTimeout(
                () => {

                    message.style.display =
                        "none";

                },
                2500
            );
        }

    } catch (error) {

        console.error(
            "STATUS UPDATE ERROR:",
            error
        );


        select.value =
            oldStatus;


        if (message) {

            message.textContent =
                "Unable to update status.";

            message.style.color =
                "#f87171";

            message.style.display =
                "block";


            setTimeout(
                () => {

                    message.style.display =
                        "none";

                },
                3000
            );
        }
    }


    select.disabled =
        false;
}


/* =========================================================
   PARSE ITEMS
========================================================= */

function parseItems(
    items
) {

    if (
        Array.isArray(items)
    ) {

        return items;
    }


    if (
        typeof items ===
        "string"
    ) {

        try {

            const parsed =
                JSON.parse(items);


            return Array.isArray(
                parsed
            )
                ? parsed
                : [];

        } catch {

            return [];
        }
    }


    return [];
}


/* =========================================================
   SEARCH + FILTER
========================================================= */

function applyFilters() {

    const search =
        document.getElementById(
            "orderSearch"
        );


    const filter =
        document.getElementById(
            "statusFilter"
        );


    const query =
        search
            ? search.value
                .trim()
                .toLowerCase()
            : "";


    const status =
        filter
            ? filter.value
            : "all";


    let filtered =
        [...allOrders];


    if (query) {

        filtered =
            filtered.filter(
                order => {

                    const text = [

                        order.order_number,

                        order.id,

                        order.customer_name,

                        order.customer_email,

                        order.customer_phone,

                        order.delivery_address,

                        order.address,

                        order.pincode,

                        order.order_status,

                        order.payment_status

                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                    return text.includes(
                        query
                    );
                }
            );
    }


    if (
        status &&
        status !== "all"
    ) {

        filtered =
            filtered.filter(
                order =>
                    String(
                        order.order_status ||
                        "pending"
                    ) === status
            );
    }


    updateStats(
        filtered
    );


    renderOrders(
        filtered
    );
}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(
    value
) {

    if (!value) {
        return "-";
    }


    try {

        return new Date(
            value
        ).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    } catch {

        return String(
            value
        );
    }
}


/* =========================================================
   ESCAPE
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
   EVENTS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        db =
            window.supabaseClient ||
            window.supabase ||
            null;


        if (!db) {

            showOrdersError(
                "Supabase client was not loaded. Check supabase.js."
            );

            return;
        }


        const allowed =
            await checkAdmin();


        if (!allowed) {
            return;
        }


        const search =
            document.getElementById(
                "orderSearch"
            );


        const filter =
            document.getElementById(
                "statusFilter"
            );


        if (search) {

            search.addEventListener(
                "input",
                applyFilters
            );
        }


        if (filter) {

            filter.addEventListener(
                "change",
                applyFilters
            );
        }


        await loadOrders();
    }
);
/* =========================================================
   ZAVYRO POSTERS
   LIVE NEW ORDER NOTIFICATION
========================================================= */

let zavyroOrderNotificationChannel = null;


/* =========================================================
   NOTIFICATION STYLE
========================================================= */

(function addNotificationStyle() {

    const style =
        document.createElement("style");

    style.textContent = `

        #zavyroOrderToast {

            position: fixed;

            right: 24px;

            bottom: 24px;

            width: min(
                390px,
                calc(100vw - 30px)
            );

            padding: 18px;

            border:
                1px solid
                #7c3aed;

            border-radius: 15px;

            background:
                #111;

            color: white;

            box-shadow:
                0 20px 60px
                rgba(0,0,0,.45);

            z-index: 999999;

            transform:
                translateY(30px);

            opacity: 0;

            pointer-events: none;

            transition:
                .3s ease;

        }


        #zavyroOrderToast.show {

            transform:
                translateY(0);

            opacity: 1;

        }


        #zavyroOrderToast strong {

            display: block;

            color:
                #a78bfa;

            margin-bottom: 7px;

        }


        #zavyroOrderToast span {

            color:
                #bbb;

            font-size:
                13px;

            line-height:
                1.5;

        }


        #zavyroOrderToast button {

            margin-top:
                12px;

            border:
                1px solid
                #7c3aed;

            border-radius:
                8px;

            padding:
                8px 12px;

            background:
                #171717;

            color:
                white;

            cursor:
                pointer;

            font-weight:
                700;

        }

    `;

    document.head.appendChild(
        style
    );

})();


/* =========================================================
   SHOW TOAST
========================================================= */

function showNewOrderNotification(
    order
) {

    let toast =
        document.getElementById(
            "zavyroOrderToast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );

        toast.id =
            "zavyroOrderToast";

        document.body.appendChild(
            toast
        );

    }


    toast.innerHTML = `

        <strong>
            🔔 NEW ORDER RECEIVED
        </strong>

        <span>
            Order:
            ${
                escapeHtml(
                    order.order_number ||
                    order.id ||
                    "New Order"
                )
            }

            <br>

            Customer:
            ${
                escapeHtml(
                    order.customer_name ||
                    "Customer"
                )
            }

            <br>

            Total:
            ₹${
                Number(
                    order.total_amount || 0
                ).toFixed(2)
            }
        </span>

        <button
            type="button"
            id="zavyroNotificationView"
        >
            VIEW ORDERS
        </button>

    `;


    toast.classList.add(
        "show"
    );


    document
        .getElementById(
            "zavyroNotificationView"
        )
        ?.addEventListener(
            "click",
            () => {

                toast.classList.remove(
                    "show"
                );

                loadOrders();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        10000
    );


    /* Browser notification */

    if (
        "Notification" in window &&
        Notification.permission ===
            "granted"
    ) {

        new Notification(
            "New Zavyro Order",
            {
                body:
                    `${
                        order.order_number ||
                        "New order"
                    } — ${
                        order.customer_name ||
                        "Customer"
                    } — ₹${
                        Number(
                            order.total_amount ||
                            0
                        ).toFixed(2)
                    }`
            }
        );

    }

}


/* =========================================================
   REQUEST BROWSER NOTIFICATION
========================================================= */

async function enableZavyroNotifications() {

    if (
        !("Notification" in window)
    ) {
        return;
    }


    if (
        Notification.permission ===
        "default"
    ) {

        try {

            await Notification.requestPermission();

        } catch (error) {

            console.warn(
                "Notification permission:",
                error
            );

        }

    }

}


/* =========================================================
   REALTIME NEW ORDERS
========================================================= */

function startZavyroOrderRealtime() {

    if (
        typeof supabaseClient ===
        "undefined"
    ) {
        return;
    }


    try {

        zavyroOrderNotificationChannel =
            supabaseClient
                .channel(
                    "zavyro-admin-orders-live"
                )
                .on(
                    "postgres_changes",
                    {
                        event: "INSERT",

                        schema: "public",

                        table: "orders"
                    },

                    payload => {

                        console.log(
                            "NEW ORDER:",
                            payload.new
                        );


                        showNewOrderNotification(
                            payload.new
                        );


                        /* Refresh order list */

                        if (
                            typeof loadOrders ===
                            "function"
                        ) {

                            loadOrders();

                        }

                    }
                )
                .subscribe();

    } catch (error) {

        console.error(
            "ORDER REALTIME ERROR:",
            error
        );

    }

}


/* =========================================================
   START NOTIFICATION SYSTEM
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        enableZavyroNotifications();

        startZavyroOrderRealtime();

    }
);