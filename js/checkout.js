const cart =
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


/* =========================================================
   ERROR MESSAGE
========================================================= */

function showError(message) {

    if (!checkoutMessage) {
        alert(message);
        return;
    }

    checkoutMessage.textContent =
        message;

    checkoutMessage.className =
        "checkout-message error";
}


/* =========================================================
   GET PRODUCT IMAGE
========================================================= */

function getProductImage(item) {

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

    /* OFFER — KEEP EXISTING IMAGE */
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
             * Use Poster Editor saved variant.
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
                 * Prevent old image cache.
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
   GET PRICE
========================================================= */

function getPrice(item) {

    if (
        item.price !== undefined
    ) {
        return Number(
            item.price
        );
    }

    if (
        item.offerPrice !== undefined
    ) {
        return Number(
            item.offerPrice
        );
    }

    return 0;
}


/* =========================================================
   CALCULATE ITEM TOTAL
========================================================= */

function calculateItemTotal(item) {

    const quantity =
        Number(
            item.quantity || 1
        );

    const price =
        getPrice(item);


    /*
       BUY X GET Y
    */

    if (
        item.promo_active &&
        Number(item.promo_buy_qty) > 0 &&
        Number(item.promo_get_qty) > 0
    ) {

        const buy =
            Number(
                item.promo_buy_qty
            );

        const get =
            Number(
                item.promo_get_qty
            );

        const groupSize =
            buy + get;

        const completeGroups =
            Math.floor(
                quantity /
                groupSize
            );

        const remainder =
            quantity %
            groupSize;

        const freeFromGroups =
            completeGroups *
            get;

        const freeFromRemainder =
            Math.max(
                0,
                remainder - buy
            );

        const freeQuantity =
            freeFromGroups +
            freeFromRemainder;

        const payableQuantity =
            quantity -
            freeQuantity;

        return (
            payableQuantity *
            price
        );
    }


    return (
        quantity *
        price
    );
}


/* =========================================================
   GRAND TOTAL
========================================================= */

function getGrandTotal() {

    return cart.reduce(
        function (
            total,
            item
        ) {

            return (
                total +
                calculateItemTotal(item)
            );

        },
        0
    );
}


/* =========================================================
   RENDER CHECKOUT SUMMARY
========================================================= */

function renderSummary() {

    if (!cart.length) {

        if (checkoutContent) {
            checkoutContent.hidden =
                true;
        }

        if (emptyCheckout) {
            emptyCheckout.hidden =
                false;
        }

        return;
    }


    if (checkoutContent) {
        checkoutContent.hidden =
            false;
    }

    if (emptyCheckout) {
        emptyCheckout.hidden =
            true;
    }


    if (!summaryItems) {
        return;
    }


    summaryItems.innerHTML =
        "";


    cart.forEach(
        function (item) {

            const quantity =
                Number(
                    item.quantity || 1
                );

            const itemTotal =
                calculateItemTotal(
                    item
                );

            const image =
                getProductImage(
                    item
                );


            const div =
                document.createElement(
                    "div"
                );

            div.className =
                "order-item";


            /* IMAGE */

            if (image) {

                const imageElement =
                    document.createElement(
                        "img"
                    );

                imageElement.className =
                    "order-poster";

                imageElement.alt =
                    item.custom
                        ? "Custom Poster"
                        : "Poster";

                imageElement.src =
                    image;

                imageElement.draggable =
                    false;

                div.appendChild(
                    imageElement
                );
            }


            /* INFORMATION */

            const info =
                document.createElement(
                    "div"
                );

            info.className =
                "order-info";


            const title =
                document.createElement(
                    "div"
                );

            title.className =
                "order-title";

            title.textContent =
                item.title ||
                "Poster";

            info.appendChild(
                title
            );


            const size =
                document.createElement(
                    "div"
                );

            size.className =
                "order-meta";

            size.textContent =
                "Size: " +
                (
                    item.size ||
                    "A4"
                );

            info.appendChild(
                size
            );


            const qty =
                document.createElement(
                    "div"
                );

            qty.className =
                "order-meta";

            qty.textContent =
                "Quantity: " +
                quantity;

            info.appendChild(
                qty
            );


            /* CUSTOM POSTER */

            if (item.custom) {

                const customLabel =
                    document.createElement(
                        "div"
                    );

                customLabel.className =
                    "order-meta";

                customLabel.textContent =
                    "Custom Uploaded Photo";

                info.appendChild(
                    customLabel
                );
            }


            /* PROMOTION */

            if (
                item.promo_active
            ) {

                const promo =
                    document.createElement(
                        "div"
                    );

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


            /* PRICE */

            const price =
                document.createElement(
                    "div"
                );

            price.className =
                "order-price";

            price.textContent =
                "₹" +
                itemTotal.toFixed(0);

            info.appendChild(
                price
            );


            div.appendChild(
                info
            );

            summaryItems.appendChild(
                div
            );
        }
    );


    /* TOTAL */

    if (summaryTotal) {

        summaryTotal.textContent =
            "₹" +
            getGrandTotal().toFixed(0);
    }
}


/* =========================================================
   CREATE RAZORPAY ORDER
========================================================= */

async function createRazorpayOrder(
    amount
) {

    const amountInPaise =
        Math.round(
            amount * 100
        );


    const {
        data,
        error
    } =
        await supabaseClient
            .functions
            .invoke(
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


    if (
        !data?.success
    ) {

        throw new Error(
            data?.error ||
            "Unable to create Razorpay order."
        );
    }


    console.log(
        "RAZORPAY ORDER CREATED:",
        data
    );


    return data;
}


/* =========================================================
   VERIFY RAZORPAY PAYMENT
========================================================= */

async function verifyPayment(
    response,
    customer
) {

    const {
        data,
        error
    } =
        await supabaseClient
            .functions
            .invoke(
                "verify-razorpay-payment",
                {
                    body: {

                        razorpay_order_id:
                            response
                                .razorpay_order_id,

                        razorpay_payment_id:
                            response
                                .razorpay_payment_id,

                        razorpay_signature:
                            response
                                .razorpay_signature,

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


    if (
        !data?.success
    ) {

        throw new Error(
            data?.error ||
            "Payment verification failed."
        );
    }


    console.log(
        "RAZORPAY PAYMENT VERIFIED:",
        data
    );


    return data;
}


/* =========================================================
   SEND NEW ORDER NOTIFICATION
   TO BROTHER
========================================================= */

async function notifyBrother(
    result,
    customer
) {

    console.log(
        "================================"
    );

    console.log(
        "ZAVYRO: STARTING ORDER NOTIFICATION"
    );

    console.log(
        "================================"
    );


    try {

        /*
           GET ORDER ID / NUMBER
        */

        const orderNumber =
            result?.order_number ||
            result?.order?.order_number ||
            result?.data?.order_number ||
            result?.order?.id ||
            result?.data?.id ||
            result?.id ||
            "NEW ORDER";


        const orderId =
            result?.id ||
            result?.order?.id ||
            result?.data?.id ||
            "";


        /*
           DELIVERY ADDRESS
        */

        const deliveryAddress =
            [
                customer.address,
                customer.pincode
            ]
                .filter(
                    Boolean
                )
                .join(", ");


        /*
           NOTIFICATION DATA
        */

        const notificationPayload = {

            order_number:
                orderNumber,

            id:
                orderId,

            customer_name:
                customer.name ||
                "Customer",

            customer_phone:
                customer.phone ||
                "Not provided",

            customer_email:
                customer.email ||
                "Not provided",

            total_amount:
                getGrandTotal(),

            payment_status:
                "paid",

            order_status:
                result?.order_status ||
                result?.order?.order_status ||
                result?.data?.order_status ||
                "pending",

            delivery_address:
                deliveryAddress,

            address:
                customer.address ||
                "",

            pincode:
                customer.pincode ||
                "",

            items:
                cart
        };


        console.log(
            "ZAVYRO NOTIFICATION PAYLOAD:",
            notificationPayload
        );


        /*
           CALL SUPABASE EDGE FUNCTION
        */

        const {
            data,
            error
        } =
            await supabaseClient
                .functions
                .invoke(
                    "notify-new-order",
                    {
                        body:
                            notificationPayload
                    }
                );


        /*
           SUPABASE INVOCATION ERROR
        */

        if (error) {

            console.error(
                "❌ BROTHER NOTIFICATION ERROR:",
                error
            );

            return {
                success:
                    false,

                error:
                    error.message ||
                    "Notification failed."
            };
        }


        /*
           EDGE FUNCTION ERROR
        */

        if (
            data &&
            data.success === false
        ) {

            console.error(
                "❌ NOTIFICATION FUNCTION FAILED:",
                data.error
            );

            return {
                success:
                    false,

                error:
                    data.error ||
                    "Notification failed."
            };
        }


        /*
           SUCCESS
        */

        console.log(
            "================================"
        );

        console.log(
            "✅ BROTHER NOTIFICATION SENT"
        );

        console.log(
            "ORDER:",
            orderNumber
        );

        console.log(
            "RESEND RESPONSE:",
            data
        );

        console.log(
            "================================"
        );


        return {
            success:
                true,

            data:
                data
        };


    } catch (error) {

        console.error(
            "❌ NOTIFICATION EXCEPTION:",
            error
        );


        return {

            success:
                false,

            error:
                error?.message ||
                "Notification failed."
        };
    }
}


/* =========================================================
   PAYMENT BUTTON
========================================================= */

if (payBtn) {

    payBtn.addEventListener(
        "click",
        async function () {

            try {

                /*
                   CART
                */

                if (!cart.length) {

                    showError(
                        "Your cart is empty."
                    );

                    return;
                }


                /*
                   FORM
                */

                if (
                    checkoutForm &&
                    !checkoutForm.checkValidity()
                ) {

                    checkoutForm.reportValidity();

                    return;
                }


                /*
                   CUSTOMER DETAILS
                */

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


                /*
                   PHONE VALIDATION
                */

                if (
                    !/^[0-9]{10}$/.test(
                        phone
                    )
                ) {

                    showError(
                        "Please enter a valid 10-digit phone number."
                    );

                    return;
                }


                /*
                   PINCODE VALIDATION
                */

                if (
                    !/^[0-9]{6}$/.test(
                        pincode
                    )
                ) {

                    showError(
                        "Please enter a valid 6-digit PIN code."
                    );

                    return;
                }


                /*
                   TOTAL
                */

                const total =
                    getGrandTotal();


                if (
                    !Number.isFinite(
                        total
                    ) ||
                    total < 1
                ) {

                    showError(
                        "Invalid order total."
                    );

                    return;
                }


                /*
                   CUSTOMER OBJECT
                */

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


                /*
                   SAVE CUSTOMER
                */

                localStorage.setItem(
                    "zavyroCheckoutCustomer",
                    JSON.stringify(
                        customer
                    )
                );


                /*
                   DISABLE BUTTON
                */

                payBtn.disabled =
                    true;

                payBtn.textContent =
                    "CREATING PAYMENT...";


                /*
                   CREATE RAZORPAY ORDER
                */

                const razorpayOrder =
                    await createRazorpayOrder(
                        total
                    );


                /*
                   RAZORPAY OPTIONS
                */

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


                    /*
                       PAYMENT SUCCESS
                    */

                    handler:
                        async function (
                            response
                        ) {

                            try {

                                console.log(
                                    "================================"
                                );

                                console.log(
                                    "RAZORPAY PAYMENT SUCCESS"
                                );

                                console.log(
                                    response
                                );

                                console.log(
                                    "================================"
                                );


                                /*
                                   VERIFY
                                */

                                payBtn.textContent =
                                    "VERIFYING PAYMENT...";


                                const result =
                                    await verifyPayment(
                                        response,
                                        customer
                                    );


                                console.log(
                                    "PAYMENT VERIFICATION RESULT:",
                                    result
                                );


                                /*
                                   IMPORTANT:
                                   PAYMENT IS VERIFIED.

                                   NOW SEND EMAIL.
                                */

                                payBtn.textContent =
                                    "SENDING ORDER...";


                                const notification =
                                    await notifyBrother(
                                        result,
                                        customer
                                    );


                                console.log(
                                    "FINAL NOTIFICATION RESULT:",
                                    notification
                                );


                                /*
                                   DO NOT CANCEL
                                   SUCCESSFUL PAYMENT
                                   IF EMAIL FAILS.
                                */

                                if (
                                    !notification.success
                                ) {

                                    console.warn(
                                        "⚠️ PAYMENT SUCCESSFUL, BUT BROTHER EMAIL FAILED."
                                    );

                                    console.warn(
                                        notification.error
                                    );
                                }


                                /*
                                   CLEAR CART
                                */

                                localStorage.removeItem(
                                    "zavyroCart"
                                );


                                /*
                                   SAVE LAST ORDER
                                */

                                localStorage.setItem(
                                    "zavyroLastOrder",
                                    JSON.stringify(
                                        result
                                    )
                                );


                                /*
                                   ORDER SUCCESS PAGE
                                */

                                window.location.href =
                                    "order-success.html";


                            } catch (error) {

                                console.error(
                                    "VERIFY / ORDER ERROR:",
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


                    /*
                       RAZORPAY CLOSED
                    */

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


                /*
                   CHECK RAZORPAY
                */

                if (
                    typeof Razorpay ===
                    "undefined"
                ) {

                    throw new Error(
                        "Razorpay checkout script did not load."
                    );
                }


                /*
                   OPEN RAZORPAY
                */

                const razorpay =
                    new Razorpay(
                        options
                    );


                /*
                   PAYMENT FAILED
                */

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


/* =========================================================
   START
========================================================= */

renderSummary();