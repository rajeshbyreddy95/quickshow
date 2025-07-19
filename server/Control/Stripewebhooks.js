import Stripe from "stripe";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";

export const stripeWebhooks = async (request, response) => {
    console.log("🎯 Stripe Webhook HIT");
    const stripeInstance = new Stripe(`${process.env.STRIPE_SECRET_KEY}`);
    const sig = request.headers["stripe-signature"];

    let event;
    try {
        event = stripeInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_KEY)
    } catch (error) {
        return response.status(400).send(`Webhook error : ${error.message}`);
    }

    try {
        switch (event.type) {
            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object;
                const sessionList = await stripeInstance.checkout.sessions.list({
                    payment_intent: paymentIntent.id,
                })
                console.log("✅ PaymentIntent succeeded:", paymentIntent.id);
                console.log("📦 Looking up session for payment_intent:", paymentIntent.id);
                console.log("🧾 Sessions found:", sessionList.data.length);

                const session = sessionList.data[0];
                const { bookingId } = session.metadata;
                console.log("🆔 Booking ID:", bookingId);
                console.log("🧪 Type of bookingId:", typeof bookingId);
                const { ObjectId } = mongoose.Types;
                if (!ObjectId.isValid(bookingId)) {
                    console.log("❌ Invalid booking ID:", bookingId);
                    return response.status(400).send("Invalid booking ID");
                }
                const updatedBooking = await Booking.findByIdAndUpdate(new ObjectId(bookingId), {
                    isPaid: true,
                    paymentLink: '',
                }, { new: true })
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