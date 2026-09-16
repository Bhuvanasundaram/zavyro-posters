const offersGrid = document.getElementById("offersGrid");
const offersLoading = document.getElementById("offersLoading");
const offersEmpty = document.getElementById("offersEmpty");
const offersError = document.getElementById("offersError");
const filterButtons = document.querySelectorAll(".offer-filter");

let allOffers = [];
let currentFilter = "all";


function getImageUrl(path) {
    if (!path) return "";

    const { data } = supabaseClient
        .storage
        .from("posters")
        .getPublicUrl(path);

    return data?.publicUrl || "";
}


function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function getOfferPrice(offer) {
    if (offer.offer_type === "combo") {
        return Number(offer.combo_price || 0);
    }

    return null;
}


function getOfferDetails(offer) {

    const details = [];

    if (offer.offer_type === "buy_get") {
        const buy = Number(offer.buy_qty || 0);
        const get = Number(offer.get_qty || 0);

        if (buy > 0 && get > 0) {
            details.push(`Buy ${buy} Get ${get} Free`);
        }
    }

    if (offer.offer_type === "combo") {
        const qty = Number(offer.combo_qty || 0);

        if (qty > 0) {
            details.push(`${qty} Posters`);
        }

        const price = getOfferPrice(offer);

        if (price > 0) {
            details.push(`₹${price}`);
        }
    }

    if (offer.offer_type === "discount") {
        const discount = Number(offer.discount_percent || 0);

        if (discount > 0) {
            details.push(`${discount}% OFF`);
        }
    }

    details.push("Same size within offer");

    return details;
}


function renderOffers() {

    offersGrid.innerHTML = "";

    let filteredOffers = allOffers;

    if (currentFilter !== "all") {
        filteredOffers = allOffers.filter(
            offer => offer.offer_type === currentFilter
        );
    }

    if (!filteredOffers.length) {
        offersEmpty.hidden = false;
        return;
    }

    offersEmpty.hidden = true;

    filteredOffers.forEach(offer => {

        const imageUrl = getImageUrl(offer.image_path);

        const details = getOfferDetails(offer);

        const detailsHtml = details
            .map(detail => `
                <span class="offer-detail">
                    ${escapeHtml(detail)}
                </span>
            `)
            .join("");

        let priceHtml = "";

        const offerPrice = getOfferPrice(offer);

        if (offerPrice) {
            priceHtml = `
                <div class="offer-price">
                    <strong>₹${offerPrice}</strong>
                    <span>Combo Price</span>
                </div>
            `;
        } else {
            priceHtml = `
                <div class="offer-price">
                    <strong>Special Deal</strong>
                    <span>Limited offer</span>
                </div>
            `;
        }


        const card = document.createElement("article");

        card.className = "offer-card";

        card.innerHTML = `
            <div class="offer-image ${imageUrl ? "" : "no-image"}">
                ${
                    imageUrl
                        ? `<img
                                src="${imageUrl}"
                                alt="${escapeHtml(offer.title)}"
                                loading="lazy"
                           >`
                        : "🔥"
                }
            </div>

            <div class="offer-body">

                <span class="offer-badge">
                    ${escapeHtml(offer.badge || "OFFER")}
                </span>

                <h2>
                    ${escapeHtml(offer.title)}
                </h2>

                <p>
                    ${escapeHtml(
                        offer.description ||
                        "Special Zavyro Posters offer."
                    )}
                </p>

                <div class="offer-details">
                    ${detailsHtml}
                </div>

                ${priceHtml}

                <a
                    class="offer-button"
                    href="offer.html?id=${encodeURIComponent(offer.id)}"
                >
                    VIEW OFFER →
                </a>

            </div>
        `;

        offersGrid.appendChild(card);
    });
}


async function loadOffers() {

    offersLoading.hidden = false;
    offersError.hidden = true;
    offersEmpty.hidden = true;

    try {

        const { data, error } = await supabaseClient
            .from("offers")
            .select("*")
            .eq("active", true)
            .order("featured", { ascending: false })
            .order("created_at", { ascending: false });

        if (error) {
            throw error;
        }

        allOffers = data || [];

        renderOffers();

    } catch (error) {

        console.error("OFFERS ERROR:", error);

        offersError.textContent =
            error.message || "Unable to load offers.";

        offersError.hidden = false;

    } finally {

        offersLoading.hidden = true;
    }
}


filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        filterButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        currentFilter =
            button.dataset.filter || "all";

        renderOffers();
    });

});


/* Mobile menu */
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {

    menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("open");
    });

}


loadOffers();