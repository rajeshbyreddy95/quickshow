import Stripe from "stripe";
import Booking from "../models/Booking.js";

export const stripeWebhooks = async (request, response) => {
    console.log("🎯 Stripe Webhook HIT");
    const stripeInstance = new Stripe(`${process.env.STRIPE_SECRET_KEY}`);
    const sig = request.headers["stripe-signature"];

    let event;
    try {
        event = stripeInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_KEY);
        console.log(event);
    } catch (error) {
        return response.status(400).send(`Webhook error : ${error.message}`);
    }

    try {
        switch (event.type) {
            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object;
                console.log(paymentIntent);
                const sessionList = await stripeInstance.checkout.sessions.list({
                    payment_intent: paymentIntent.id,
                })
                console.log("✅ PaymentIntent succeeded:", paymentIntent.id);
                console.log("🧾 Sessions found:", sessionList.data.length);

                const session = sessionList.data[0];
                console.log(session);
                const { bookingId } = session.metadata;
                console.log("🆔 Booking ID:", bookingId);
                console.log("🧪 Type of bookingId:", typeof bookingId);
                const booking = await Booking.findById(bookingId);
                console.log("🔍 Booking found in DB:", booking);
                const updatedBooking = await Booking.findByIdAndUpdate(bookingId, {
                    isPaid: true,
                    paymentLink: '',
                })
                const booking2 = await Booking.findById(bookingId);
                console.log(booking2);
                console.log("📘 Updated Booking:", updatedBooking);
                break;
            }

            default:
                console.log('Unhandled event type :', event.type)
                break;
        }
        response.json({ received: true });
    } catch (error) {
        console.log('Webhook processing error:', error);
        response.status(500).send("Internal Server Error");
    }
}