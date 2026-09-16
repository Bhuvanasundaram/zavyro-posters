"use strict";

/* =========================================================
   ZAVYRO — ADMIN OFFERS
========================================================= */

let db = null;
let currentImagePath = "";


/* =========================================================
   DOM
========================================================= */

const offersContainer =
    document.getElementById("offersContainer");

const offerModal =
    document.getElementById("offerModal");

const offerForm =
    document.getElementById("offerForm");

const addOfferBtn =
    document.getElementById("addOfferBtn");

const closeModal =
    document.getElementById("closeModal");

const cancelOffer =
    document.getElementById("cancelOffer");

const offerType =
    document.getElementById("offerType");

const buyGetFields =
    document.getElementById("buyGetFields");

const comboFields =
    document.getElementById("comboFields");

const discountFields =
    document.getElementById("discountFields");

const offerImage =
    document.getElementById("offerImage");

const imagePreview =
    document.getElementById("imagePreview");

const previewImg =
    document.getElementById("previewImg");

const saveOfferBtn =
    document.getElementById("saveOfferBtn");


/* =========================================================
   HELPERS
========================================================= */

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function publicImageUrl(path) {

    if (!path || !db) {
        return "";
    }

    const result =
        db.storage
            .from("posters")
            .getPublicUrl(path);

    return result?.data?.publicUrl || "";
}


/* =========================================================
   ADMIN CHECK
========================================================= */

async function checkAdmin() {

    if (!db) {

        showPageError(
            "Supabase client is not available. Check supabase.js."
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
        } = await db.rpc("check_admin");


        if (error) {

            console.error(
                "check_admin error:",
                error
            );

            window.location.href =
                "admin-login.html";

            return false;
        }


        if (!data) {

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
   PAGE ERROR
========================================================= */

function showPageError(message) {

    if (!offersContainer) {
        return;
    }

    offersContainer.innerHTML = `
        <div class="error-state">
            <h3>Unable to open Offers</h3>
            <p>${escapeHtml(message)}</p>
        </div>
    `;
}


/* =========================================================
   LOAD OFFERS
========================================================= */

async function loadOffers() {

    offersContainer.innerHTML = `
        <div class="loading">
            Loading offers...
        </div>
    `;


    try {

        const {
            data,
            error
        } = await db
            .from("offers")
            .select("*")
            .order("id", {
                ascending: false
            });


        if (error) {
            throw error;
        }


        if (!data || !data.length) {

            offersContainer.innerHTML = `
                <div class="empty-state">
                    <h3>No offers yet</h3>
                    <p>
                        Click "Create Offer" to create your first offer.
                    </p>
                </div>
            `;

            return;
        }


        offersContainer.innerHTML =
            data.map(createOfferCard).join("");

    } catch (error) {

        console.error(
            "LOAD OFFERS ERROR:",
            error
        );

        showPageError(
            error.message ||
            "Unable to load offers."
        );
    }
}


/* =========================================================
   OFFER CARD
========================================================= */

function createOfferCard(offer) {

    let offerText =
        "Special Offer";


    if (offer.offer_type === "buy_get") {

        offerText =
            `Buy ${Number(offer.buy_qty || 0)}
             Get ${Number(offer.get_qty || 0)}`;

    } else if (offer.offer_type === "combo") {

        offerText =
            `${Number(offer.combo_qty || 0)}
             Posters · ₹${Number(
                offer.combo_price || 0
            ).toFixed(0)}`;

    } else if (offer.offer_type === "discount") {

        offerText =
            `${Number(
                offer.discount_percent || 0
            )}% Discount`;
    }


    const imageUrl =
        publicImageUrl(
            offer.image_path
        );


    const statusClass =
        offer.active
            ? "active"
            : "inactive";


    const statusText =
        offer.active
            ? "ACTIVE"
            : "INACTIVE";


    return `
        <article class="offer-card">

            <div class="offer-image">

                ${
                    imageUrl
                        ? `
                            <img
                                src="${escapeHtml(imageUrl)}"
                                alt="${escapeHtml(
                                    offer.title ||
                                    "Offer"
                                )}"
                            >
                        `
                        : `
                            <span class="no-image">
                                No Image
                            </span>
                        `
                }

            </div>


            <div class="offer-content">

                ${
                    offer.badge
                        ? `
                            <span class="offer-badge">
                                ${escapeHtml(
                                    offer.badge
                                )}
                            </span>
                        `
                        : ""
                }


                <h3>
                    ${escapeHtml(
                        offer.title ||
                        "Untitled Offer"
                    )}
                </h3>


                ${
                    offer.description
                        ? `
                            <p>
                                ${escapeHtml(
                                    offer.description
                                )}
                            </p>
                        `
                        : ""
                }


                <p class="offer-type">
                    ${escapeHtml(
                        offerText
                    )}
                </p>


                <span
                    class="status ${statusClass}"
                >
                    ${statusText}
                </span>


                ${
                    offer.featured
                        ? `
                            <span class="featured">
                                FEATURED
                            </span>
                        `
                        : ""
                }


                <div class="offer-actions">

                    <button
                        type="button"
                        class="btn"
                        onclick="editOffer('${escapeHtml(
                            offer.id
                        )}')"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="btn"
                        onclick="toggleOffer(
                            '${escapeHtml(offer.id)}',
                            ${!!offer.active}
                        )"
                    >
                        ${
                            offer.active
                                ? "Disable"
                                : "Enable"
                        }
                    </button>

                    <button
                        type="button"
                        class="btn btn-danger"
                        onclick="deleteOffer('${escapeHtml(
                            offer.id
                        )}')"
                    >
                        Delete
                    </button>

                </div>

            </div>

        </article>
    `;
}


/* =========================================================
   CREATE MODAL
========================================================= */

function openCreateModal() {

    offerForm.reset();

    document.getElementById(
        "offerId"
    ).value = "";


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Create Offer";


    document.getElementById(
        "offerActive"
    ).checked = true;


    document.getElementById(
        "offerFeatured"
    ).checked = false;


    currentImagePath = "";

    imagePreview.style.display =
        "none";

    previewImg.src = "";

    updateOfferTypeFields();

    offerModal.classList.add(
        "active"
    );
}


/* =========================================================
   EDIT OFFER
========================================================= */

window.editOffer =
    async function(id) {

        try {

            const {
                data: offer,
                error
            } = await db
                .from("offers")
                .select("*")
                .eq("id", id)
                .single();


            if (error) {
                throw error;
            }


            if (!offer) {
                throw new Error(
                    "Offer not found."
                );
            }


            document.getElementById(
                "modalTitle"
            ).textContent =
                "Edit Offer";


            document.getElementById(
                "offerId"
            ).value =
                offer.id || "";


            document.getElementById(
                "offerTitle"
            ).value =
                offer.title || "";


            document.getElementById(
                "offerDescription"
            ).value =
                offer.description || "";


            document.getElementById(
                "offerType"
            ).value =
                offer.offer_type ||
                "buy_get";


            document.getElementById(
                "offerBadge"
            ).value =
                offer.badge || "";


            document.getElementById(
                "buyQty"
            ).value =
                offer.buy_qty || 1;


            document.getElementById(
                "getQty"
            ).value =
                offer.get_qty || 1;


            document.getElementById(
                "comboQty"
            ).value =
                offer.combo_qty || 1;


            document.getElementById(
                "comboPrice"
            ).value =
                offer.combo_price ?? "";


            document.getElementById(
                "discountPercent"
            ).value =
                offer.discount_percent ?? "";


            document.getElementById(
                "offerActive"
            ).checked =
                !!offer.active;


            document.getElementById(
                "offerFeatured"
            ).checked =
                !!offer.featured;


            currentImagePath =
                offer.image_path || "";


            if (currentImagePath) {

                const url =
                    publicImageUrl(
                        currentImagePath
                    );

                if (url) {

                    previewImg.src =
                        url;

                    imagePreview.style.display =
                        "flex";
                }

            } else {

                imagePreview.style.display =
                    "none";
            }


            updateOfferTypeFields();

            offerModal.classList.add(
                "active"
            );

        } catch (error) {

            console.error(
                "EDIT OFFER ERROR:",
                error
            );

            alert(
                "Unable to load offer:\n" +
                error.message
            );
        }
    };


/* =========================================================
   OFFER TYPE
========================================================= */

function updateOfferTypeFields() {

    buyGetFields.classList.remove(
        "active"
    );

    comboFields.classList.remove(
        "active"
    );

    discountFields.classList.remove(
        "active"
    );


    if (
        offerType.value ===
        "buy_get"
    ) {

        buyGetFields.classList.add(
            "active"
        );

    } else if (
        offerType.value ===
        "combo"
    ) {

        comboFields.classList.add(
            "active"
        );

    } else if (
        offerType.value ===
        "discount"
    ) {

        discountFields.classList.add(
            "active"
        );
    }
}


/* =========================================================
   IMAGE PREVIEW
========================================================= */

offerImage.addEventListener(
    "change",
    () => {

        const file =
            offerImage.files?.[0];


        if (!file) {
            return;
        }


        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            alert(
                "Please select an image file."
            );

            offerImage.value = "";

            return;
        }


        const reader =
            new FileReader();


        reader.onload =
            event => {

                previewImg.src =
                    event.target.result;

                imagePreview.style.display =
                    "flex";
            };


        reader.readAsDataURL(
            file
        );
    }
);


/* =========================================================
   UPLOAD IMAGE
========================================================= */

async function uploadOfferImage(
    file
) {

    if (!file) {

        return (
            currentImagePath ||
            null
        );
    }


    const extension =
        (
            file.name
                .split(".")
                .pop() ||
            "jpg"
        ).toLowerCase();


    const safeExtension =
        extension.replace(
            /[^a-z0-9]/g,
            ""
        ) || "jpg";


    const path =
        `offers/${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}.${safeExtension}`;


    const {
        error
    } =
        await db
            .storage
            .from("posters")
            .upload(
                path,
                file,
                {
                    cacheControl: "3600",
                    contentType:
                        file.type ||
                        "image/jpeg",
                    upsert: false
                }
            );


    if (error) {
        throw error;
    }


    return path;
}


/* =========================================================
   SAVE OFFER
========================================================= */

offerForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        if (!db) {
            return;
        }


        saveOfferBtn.disabled =
            true;

        saveOfferBtn.textContent =
            "Saving...";


        try {

            const id =
                document.getElementById(
                    "offerId"
                ).value;


            const type =
                document.getElementById(
                    "offerType"
                ).value;


            const payload = {

                title:
                    document.getElementById(
                        "offerTitle"
                    ).value.trim(),

                description:
                    document.getElementById(
                        "offerDescription"
                    ).value.trim(),

                offer_type:
                    type,

                badge:
                    document.getElementById(
                        "offerBadge"
                    ).value.trim(),

                buy_qty:
                    type === "buy_get"
                        ? Number(
                            document.getElementById(
                                "buyQty"
                            ).value
                        ) || null
                        : null,

                get_qty:
                    type === "buy_get"
                        ? Number(
                            document.getElementById(
                                "getQty"
                            ).value
                        ) || null
                        : null,

                combo_qty:
                    type === "combo"
                        ? Number(
                            document.getElementById(
                                "comboQty"
                            ).value
                        ) || null
                        : null,

                combo_price:
                    type === "combo"
                        ? Number(
                            document.getElementById(
                                "comboPrice"
                            ).value
                        ) || null
                        : null,

                discount_percent:
                    type === "discount"
                        ? Number(
                            document.getElementById(
                                "discountPercent"
                            ).value
                        ) || null
                        : null,

                active:
                    document.getElementById(
                        "offerActive"
                    ).checked,

                featured:
                    document.getElementById(
                        "offerFeatured"
                    ).checked
            };


            if (!payload.title) {

                throw new Error(
                    "Please enter an offer title."
                );
            }


            const file =
                offerImage.files?.[0];


            if (file) {

                payload.image_path =
                    await uploadOfferImage(
                        file
                    );
            }


            let result;


            if (id) {

                result =
                    await db
                        .from("offers")
                        .update(payload)
                        .eq("id", id);

            } else {

                result =
                    await db
                        .from("offers")
                        .insert(payload);
            }


            if (result.error) {
                throw result.error;
            }


            alert(
                id
                    ? "Offer updated successfully!"
                    : "Offer created successfully!"
            );


            closeOfferModal();

            await loadOffers();

        } catch (error) {

            console.error(
                "SAVE OFFER ERROR:",
                error
            );

            alert(
                "Unable to save offer:\n" +
                error.message
            );

        } finally {

            saveOfferBtn.disabled =
                false;

            saveOfferBtn.textContent =
                "Save Offer";
        }
    }
);


/* =========================================================
   TOGGLE
========================================================= */

window.toggleOffer =
    async function(
        id,
        currentStatus
    ) {

        try {

            const {
                error
            } =
                await db
                    .from("offers")
                    .update({
                        active:
                            !currentStatus
                    })
                    .eq(
                        "id",
                        id
                    );


            if (error) {
                throw error;
            }


            await loadOffers();

        } catch (error) {

            console.error(
                "TOGGLE OFFER ERROR:",
                error
            );

            alert(
                "Unable to change offer status:\n" +
                error.message
            );
        }
    };


/* =========================================================
   DELETE
========================================================= */

window.deleteOffer =
    async function(id) {

        if (
            !confirm(
                "Delete this offer permanently?"
            )
        ) {
            return;
        }


        try {

            const {
                error
            } =
                await db
                    .from("offers")
                    .delete()
                    .eq(
                        "id",
                        id
                    );


            if (error) {
                throw error;
            }


            await loadOffers();

        } catch (error) {

            console.error(
                "DELETE OFFER ERROR:",
                error
            );

            alert(
                "Unable to delete offer:\n" +
                error.message
            );
        }
    };


/* =========================================================
   CLOSE
========================================================= */

function closeOfferModal() {

    offerModal.classList.remove(
        "active"
    );
}


/* =========================================================
   EVENTS
========================================================= */

offerType.addEventListener(
    "change",
    updateOfferTypeFields
);


addOfferBtn.addEventListener(
    "click",
    openCreateModal
);


closeModal.addEventListener(
    "click",
    closeOfferModal
);


cancelOffer.addEventListener(
    "click",
    closeOfferModal
);


offerModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            offerModal
        ) {

            closeOfferModal();
        }
    }
);


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeOfferModal();
        }
    }
);


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        db =
            window.supabaseClient ||
            window.supabase ||
            null;


        if (!db) {

            showPageError(
                "Supabase client was not loaded."
            );

            return;
        }


        const allowed =
            await checkAdmin();


        if (!allowed) {
            return;
        }


        await loadOffers();
    }
);