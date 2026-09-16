/* =========================================================
   ZAVYRO POSTERS
   REVIEWS SYSTEM
========================================================= */

"use strict";


/* =========================================================
   HELPERS
========================================================= */

function reviewEscape(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function reviewStars(rating) {

    const value =
        Math.max(
            0,
            Math.min(
                5,
                Number(rating || 0)
            )
        );

    const rounded =
        Math.round(value);

    let output = "";

    for (let i = 1; i <= 5; i++) {

        output +=
            i <= rounded
                ? "★"
                : "☆";
    }

    return output;
}


function reviewDate(value) {

    if (!value) {
        return "";
    }

    try {

        return new Date(value)
            .toLocaleDateString(
                "en-IN",
                {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                }
            );

    } catch {

        return "";
    }
}


/* =========================================================
   PRODUCT PAGE
========================================================= */

async function loadFullProductReviews(productId) {

    const container =
        document.getElementById(
            "productReviews"
        );


    if (!container || !productId) {
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
                    customer_name,
                    rating,
                    review_text,
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


        if (error) {
            throw error;
        }


        const reviews =
            data || [];


        const total =
            reviews.reduce(
                (sum, review) =>
                    sum +
                    Number(
                        review.rating || 0
                    ),
                0
            );


        const average =
            reviews.length
                ? total / reviews.length
                : 0;


        const rounded =
            Math.round(
                average * 10
            ) / 10;


        let html = `

            <div class="zavyro-rating-summary">

                <div class="zavyro-rating-main">

                    <span class="zavyro-rating-stars">
                        ${
                            reviewStars(
                                average
                            )
                        }
                    </span>

                    <strong>
                        ${rounded.toFixed(1)}
                    </strong>

                    <span>
                        ${
                            reviews.length
                        }
                        ${
                            reviews.length === 1
                                ? "review"
                                : "reviews"
                        }
                    </span>

                </div>

            </div>

        `;


        if (!reviews.length) {

            html += `

                <div class="zavyro-no-reviews">
                    No reviews yet.
                </div>

            `;

            container.innerHTML =
                html;

            return;
        }


        html += `

            <div class="zavyro-review-list">

        `;


        reviews.forEach(
            review => {

                html += `

                    <article
                        class="zavyro-review-card"
                    >

                        <div
                            class="zavyro-review-top"
                        >

                            <strong>
                                ${
                                    reviewEscape(
                                        review.customer_name ||
                                        "Customer"
                                    )
                                }
                            </strong>

                            <span
                                class="zavyro-review-stars"
                            >
                                ${
                                    reviewStars(
                                        review.rating
                                    )
                                }
                            </span>

                        </div>


                        ${
                            review.review_text
                                ? `
                                    <p>
                                        ${
                                            reviewEscape(
                                                review.review_text
                                            )
                                        }
                                    </p>
                                  `
                                : ""
                        }


                        <small>
                            ${
                                reviewDate(
                                    review.created_at
                                )
                            }
                        </small>

                    </article>

                `;

            }
        );


        html += `
            </div>
        `;


        container.innerHTML =
            html;


    } catch (error) {

        console.error(
            "FULL REVIEW LOAD ERROR:",
            error
        );

    }
}


/* =========================================================
   TRACK ORDER REVIEW SECTION
========================================================= */

const reviewStyle =
    document.createElement("style");

reviewStyle.textContent = `

.zavyro-review-main {
    margin-top: 25px;
}

.zavyro-review-box {
    margin-top: 22px;
    padding: 22px;
    border: 1px solid #30204f;
    border-radius: 16px;
    background: #101010;
}

.zavyro-review-box h3 {
    margin: 0 0 8px;
    color: #fff;
}

.zavyro-review-box > p {
    color: #777;
    font-size: 13px;
    margin-bottom: 20px;
}

.zavyro-review-product {
    padding: 18px 0;
    border-top: 1px solid #252525;
}

.zavyro-review-product:first-child {
    border-top: 0;
}

.zavyro-review-product-title {
    font-weight: 800;
    margin-bottom: 10px;
}

.zavyro-star-picker {
    display: flex;
    gap: 5px;
    margin-bottom: 12px;
}

.zavyro-star-picker button {
    border: 0;
    background: transparent;
    color: #555;
    font-size: 27px;
    cursor: pointer;
    padding: 0;
}

.zavyro-star-picker button.selected {
    color: #ffd21f;
}

.zavyro-review-textarea {
    width: 100%;
    min-height: 85px;
    box-sizing: border-box;
    resize: vertical;
    background: #090909;
    color: #fff;
    border: 1px solid #292929;
    border-radius: 9px;
    padding: 12px;
    font-family: inherit;
    outline: none;
}

.zavyro-review-textarea:focus {
    border-color: #7c3aed;
}

.zavyro-review-submit {
    margin-top: 12px;
    padding: 11px 16px;
    border: 1px solid #8b5cf6;
    border-radius: 9px;
    background: #7c3aed;
    color: white;
    font-weight: 800;
    cursor: pointer;
}

.zavyro-review-submit:disabled {
    opacity: .5;
    cursor: not-allowed;
}

.zavyro-review-message {
    margin-top: 9px;
    font-size: 12px;
    color: #a78bfa;
}

.zavyro-rating-summary {
    margin-top: 10px;
}

.zavyro-rating-main {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 9px;
}

.zavyro-rating-stars,
.zavyro-review-stars {
    color: #ffd21f;
    letter-spacing: 2px;
}

.zavyro-rating-main strong {
    font-size: 16px;
}

.zavyro-rating-main span:last-child {
    color: #777;
    font-size: 12px;
}

.zavyro-review-list {
    margin-top: 18px;
    display: grid;
    gap: 10px;
}

.zavyro-review-card {
    padding: 16px;
    border: 1px solid #252525;
    border-radius: 12px;
    background: #0d0d0d;
}

.zavyro-review-top {
    display: flex;
    justify-content: space-between;
    gap: 15px;
    align-items: center;
}

.zavyro-review-card p {
    color: #bbb;
    font-size: 13px;
    line-height: 1.55;
    margin: 10px 0;
}

.zavyro-review-card small {
    color: #666;
    font-size: 11px;
}

.zavyro-no-reviews {
    color: #777;
    font-size: 12px;
    margin-top: 10px;
}

`;

document.head.appendChild(
    reviewStyle
);


/* =========================================================
   REVIEWABLE ORDER
========================================================= */

async function loadReviewableOrder(
    orderNumber,
    phone
) {

    const {
        data,
        error
    } =
        await supabaseClient.rpc(
            "get_reviewable_order",
            {
                p_order_number:
                    orderNumber,

                p_phone:
                    phone
            }
        );


    if (error) {
        throw error;
    }


    if (
        !data ||
        data.success !== true
    ) {

        throw new Error(
            data?.message ||
            "Unable to load review items."
        );

    }


    return data.order;
}


/* =========================================================
   GET PRODUCT ID FROM ORDER ITEM
========================================================= */

function getReviewProductId(item) {

    return (
        item.product_id ||
        item.productId ||
        item.id ||
        null
    );
}


/* =========================================================
   RENDER REVIEW FORM
========================================================= */

async function showReviewForm(
    orderNumber,
    phone,
    order
) {

    let section =
        document.getElementById(
            "reviewSection"
        );


    if (!section) {

        section =
            document.createElement(
                "section"
            );

        section.id =
            "reviewSection";

        section.className =
            "zavyro-review-main";


        const result =
            document.getElementById(
                "result"
            );

        if (result) {
            result.appendChild(section);
        }
    }


    if (!section) {
        return;
    }


    const items =
        Array.isArray(order.items)
            ? order.items
            : [];


    if (!items.length) {

        section.innerHTML = "";
        return;
    }


    const productIds =
        items
            .map(
                getReviewProductId
            )
            .filter(Boolean);


    if (!productIds.length) {

        section.innerHTML = "";
        return;
    }


    const {
        data: existing,
        error
    } =
        await supabaseClient
            .from("reviews")
            .select(
                "product_id"
            )
            .eq(
                "order_id",
                order.id
            );


    if (error) {
        console.error(
            "EXISTING REVIEW ERROR:",
            error
        );
    }


    const reviewed =
        new Set(
            (existing || [])
                .map(
                    review =>
                        String(
                            review.product_id
                        )
                )
        );


    section.innerHTML = `

        <div class="zavyro-review-box">

            <h3>
                ⭐ Rate Your Posters
            </h3>

            <p>
                Your order has been delivered.
                Share your experience with each poster.
            </p>

            <div id="zavyroReviewProducts"></div>

        </div>

    `;


    const productsContainer =
        document.getElementById(
            "zavyroReviewProducts"
        );


    if (!productsContainer) {
        return;
    }


    items.forEach(
        (item, index) => {

            const productId =
                getReviewProductId(item);


            if (!productId) {
                return;
            }


            const alreadyReviewed =
                reviewed.has(
                    String(productId)
                );


            const wrapper =
                document.createElement(
                    "div"
                );

            wrapper.className =
                "zavyro-review-product";


            if (alreadyReviewed) {

                wrapper.innerHTML = `

                    <div
                        class="zavyro-review-product-title"
                    >
                        ${
                            reviewEscape(
                                item.title ||
                                item.name ||
                                "Poster"
                            )
                        }
                    </div>

                    <div
                        class="zavyro-review-message"
                    >
                        ✓ You already reviewed this poster.
                    </div>

                `;

                productsContainer.appendChild(
                    wrapper
                );

                return;
            }


            wrapper.innerHTML = `

                <div
                    class="zavyro-review-product-title"
                >
                    ${
                        reviewEscape(
                            item.title ||
                            item.name ||
                            "Poster"
                        )
                    }

                    ${
                        item.size
                            ? `
                                <span
                                    style="
                                    color:#777;
                                    font-size:11px;
                                    margin-left:7px;
                                    "
                                >
                                    ${reviewEscape(
                                        item.size
                                    )}
                                </span>
                              `
                            : ""
                    }

                </div>


                <div
                    class="zavyro-star-picker"
                    data-product="${reviewEscape(
                        productId
                    )}"
                >

                    ${[1,2,3,4,5]
                        .map(
                            star => `
                                <button
                                    type="button"
                                    data-rating="${star}"
                                >
                                    ★
                                </button>
                            `
                        )
                        .join("")}

                </div>


                <textarea
                    class="zavyro-review-textarea"
                    placeholder="Write your review (optional)"
                    maxlength="1000"
                ></textarea>


                <button
                    type="button"
                    class="zavyro-review-submit"
                >
                    SUBMIT REVIEW
                </button>


                <div
                    class="zavyro-review-message"
                ></div>

            `;


            let selectedRating =
                0;


            const starButtons =
                wrapper.querySelectorAll(
                    ".zavyro-star-picker button"
                );


            starButtons.forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            selectedRating =
                                Number(
                                    button.dataset.rating
                                );


                            starButtons.forEach(
                                star => {

                                    star.classList.toggle(
                                        "selected",
                                        Number(
                                            star.dataset.rating
                                        ) <=
                                        selectedRating
                                    );

                                }
                            );

                        }
                    );

                }
            );


            const submit =
                wrapper.querySelector(
                    ".zavyro-review-submit"
                );


            const textarea =
                wrapper.querySelector(
                    ".zavyro-review-textarea"
                );


            const message =
                wrapper.querySelector(
                    ".zavyro-review-message"
                );


            submit.addEventListener(
                "click",
                async () => {

                    if (!selectedRating) {

                        message.textContent =
                            "Please select a star rating.";

                        return;
                    }


                    submit.disabled =
                        true;

                    submit.textContent =
                        "SUBMITTING...";


                    try {

                        const {
                            data,
                            error
                        } =
                            await supabaseClient
                                .rpc(
                                    "submit_product_review",
                                    {
                                        p_order_number:
                                            orderNumber,

                                        p_phone:
                                            phone,

                                        p_product_id:
                                            productId,

                                        p_rating:
                                            selectedRating,

                                        p_review_text:
                                            textarea.value
                                                .trim()
                                    }
                                );


                        if (error) {
                            throw error;
                        }


                        if (
                            !data ||
                            data.success !== true
                        ) {

                            throw new Error(
                                data?.message ||
                                "Unable to submit review."
                            );

                        }


                        message.textContent =
                            "✓ Review submitted successfully.";

                        submit.textContent =
                            "REVIEW SUBMITTED";

                        textarea.disabled =
                            true;

                        starButtons.forEach(
                            star =>
                                star.disabled =
                                    true
                        );


                    } catch (error) {

                        console.error(
                            "REVIEW SUBMIT ERROR:",
                            error
                        );

                        message.textContent =
                            error.message ||
                            "Unable to submit review.";

                        submit.disabled =
                            false;

                        submit.textContent =
                            "SUBMIT REVIEW";
                    }

                }
            );


            productsContainer.appendChild(
                wrapper
            );

        }
    );
}


/* =========================================================
   CONNECT TRACK ORDER
========================================================= */

window.zavyroReviewAfterTrack =
    async function (
        orderNumber,
        phone,
        order
    ) {

        if (
            !order ||
            String(
                order.order_status || ""
            ).toLowerCase() !==
            "delivered"
        ) {
            return;
        }


        try {

            const reviewOrder =
                await loadReviewableOrder(
                    orderNumber,
                    phone
                );


            await showReviewForm(
                orderNumber,
                phone,
                reviewOrder
            );

        } catch (error) {

            console.error(
                "REVIEW SECTION ERROR:",
                error
            );

        }

    };


/* =========================================================
   AUTO LOAD PRODUCT REVIEWS
========================================================= */

window.zavyroLoadProductReviews =
    loadFullProductReviews;