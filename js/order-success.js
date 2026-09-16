const data =
    JSON.parse(
        localStorage.getItem("zavyroLastOrder") || "null"
    );

const orderNumber =
    document.getElementById("orderNumber");

const paymentStatus =
    document.getElementById("paymentStatus");

const orderAmount =
    document.getElementById("orderAmount");

const paymentId =
    document.getElementById("paymentId");


if (!data) {

    orderNumber.textContent =
        "Not available";

    paymentStatus.textContent =
        "Paid";

    orderAmount.textContent =
        "—";

    paymentId.textContent =
        "—";

} else {

    const order =
        data.order || data;


    orderNumber.textContent =
        order.order_number ||
        "—";


    paymentStatus.textContent =
        order.payment_status === "paid"
            ? "Paid"
            : "Processing";


    const amount =
        Number(
            order.total_amount ??
            data.total_amount ??
            0
        );


    orderAmount.textContent =
        `₹${amount.toFixed(2)}`;


    paymentId.textContent =
        order.payment_id ||
        data.payment_id ||
        "—";
}