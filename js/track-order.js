/* =========================================================
   ZAVYRO POSTERS
   TRACK ORDER
========================================================= */

"use strict";


const trackForm =
    document.getElementById(
        "trackForm"
    );

const trackBtn =
    document.getElementById(
        "trackBtn"
    );

const trackMessage =
    document.getElementById(
        "trackMessage"
    );

const result =
    document.getElementById(
        "result"
    );

const resultTitle =
    document.getElementById(
        "resultTitle"
    );

const resultSubtitle =
    document.getElementById(
        "resultSubtitle"
    );

const showOrderNumber =
    document.getElementById(
        "showOrderNumber"
    );

const showPayment =
    document.getElementById(
        "showPayment"
    );

const showTotal =
    document.getElementById(
        "showTotal"
    );

const showStatus =
    document.getElementById(
        "showStatus"
    );

const statusSteps =
    document.querySelectorAll(
        ".status-step"
    );


/* =========================================================
   MESSAGE
========================================================= */

function clearMessage() {

    if (trackMessage) {
        trackMessage.textContent = "";
    }

}


function showMessage(message) {

    if (!trackMessage) {
        return;
    }

    trackMessage.textContent =
        message;
}


/* =========================================================
   STATUS
========================================================= */

function resetStatusSteps() {

    statusSteps.forEach(
        step => {

            step.classList.remove(
                "active"
            );

            step.classList.remove(
                "done"
            );

        }
    );
}


function updateStatus(status) {

    resetStatusSteps();


    const statuses = [

        "confirmed",

        "processing",

        "shipped",

        "out_for_delivery",

        "delivered"

    ];


    const current =
        String(
            status || "pending"
        )
            .toLowerCase();


    const currentIndex =
        statuses.indexOf(
            current
        );


    if (currentIndex === -1) {
        return;
    }


    statusSteps.forEach(
        (
            step,
            index
        ) => {

            if (
                index <
                currentIndex
            ) {

                step.classList.add(
                    "done"
                );

            }

            else if (
                index ===
                currentIndex
            ) {

                step.classList.add(
                    "active"
                );

            }

        }
    );
}


/* =========================================================
   FORMAT
========================================================= */

function formatStatus(value) {

    if (!value) {
        return "—";
    }


    return String(value)
        .replace(
            /_/g,
            " "
        )
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );
}


/* =========================================================
   DISPLAY ORDER
========================================================= */

function displayOrder(
    order,
    orderNumber,
    phone
) {

    if (!order) {
        return;
    }


    if (result) {
        result.classList.add(
            "show"
        );
    }


    if (resultTitle) {

        resultTitle.textContent =
            "Order Found";
    }


    if (resultSubtitle) {

        resultSubtitle.textContent =
            order.customer_name
                ? `Order for ${order.customer_name}`
                : "Your order details are below.";
    }


    if (showOrderNumber) {

        showOrderNumber.textContent =
            order.order_number ||
            "—";
    }


    if (showPayment) {

        showPayment.textContent =
            formatStatus(
                order.payment_status
            );
    }


    if (showTotal) {

        showTotal.textContent =
            "₹" +
            Number(
                order.total_amount || 0
            ).toFixed(2);
    }


    if (showStatus) {

        showStatus.textContent =
            formatStatus(
                order.order_status
            );
    }


    updateStatus(
        order.order_status
    );


    /* =====================================================
       REVIEW AFTER DELIVERY
    ===================================================== */

    if (
        window.zavyroReviewAfterTrack
    ) {

        window.zavyroReviewAfterTrack(
            orderNumber,
            phone,
            order
        );

    }
}


/* =========================================================
   TRACK
========================================================= */

if (trackForm) {

    trackForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            clearMessage();


            if (result) {

                result.classList.remove(
                    "show"
                );

            }


            const reviewSection =
                document.getElementById(
                    "reviewSection"
                );


            if (reviewSection) {
                reviewSection.innerHTML =
                    "";
            }


            resetStatusSteps();


            const orderNumber =
                document
                    .getElementById(
                        "orderNumber"
                    )
                    ?.value
                    .trim();


            const phone =
                document
                    .getElementById(
                        "phone"
                    )
                    ?.value
                    .trim();


            if (
                !orderNumber ||
                !phone
            ) {

                showMessage(
                    "Please enter your order number and phone number."
                );

                return;
            }


            const cleanPhone =
                phone.replace(
                    /\D/g,
                    ""
                );


            if (
                cleanPhone.length !==
                10
            ) {

                showMessage(
                    "Please enter a valid 10-digit phone number."
                );

                return;
            }


            if (trackBtn) {

                trackBtn.disabled =
                    true;

                trackBtn.textContent =
                    "CHECKING...";

            }


            try {

                const {
                    data,
                    error
                } =
                    await supabaseClient.rpc(
                        "track_order",
                        {

                            p_order_number:
                                orderNumber,

                            p_phone:
                                cleanPhone

                        }
                    );


                if (error) {
                    throw error;
                }


                if (
                    !data ||
                    data.success !== true
                ) {

                    showMessage(
                        data?.message ||
                        "Order not found. Check your order number and phone number."
                    );

                    return;
                }


                displayOrder(
                    data.order,
                    orderNumber,
                    cleanPhone
                );


            } catch (error) {

                console.error(
                    "TRACK ORDER ERROR:",
                    error
                );


                showMessage(
                    "Unable to check your order right now. Please try again."
                );


            } finally {

                if (trackBtn) {

                    trackBtn.disabled =
                        false;

                    trackBtn.textContent =
                        "TRACK ORDER";

                }

            }

        }
    );

}