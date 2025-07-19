import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import sendEmail from "../config/nodemailer.js";


export const inngest = new Inngest({ id: "movie-ticket-booking" });

const userCreated = inngest.createFunction(
    { id: 'create-user' },
    { event: 'clerk/user.created' },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data;
        const userdata = {
            _id: id,
            name: first_name + ' ' + last_name,
            email: email_addresses[0].email_address,
            image: image_url
        }
        await User.create(userdata);
    }
)
const userUpdated = inngest.createFunction(
    { id: 'update-user' },
    { event: 'clerk/user.updated' },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data;
        const userdata = {
            _id: id,
            name: first_name + ' ' + last_name,
            email: email_addresses[0].email_address,
            image: image_url
        }
        await User.findByIdAndUpdate(id, userdata);
    }
)
const userDeleted = inngest.createFunction(
    { id: 'delete-user' },
    { event: 'clerk/user.deleted' },
    async ({ event }) => {
        const { id } = event.data;
        await User.findByIdAndDelete(id);
    }
)

const releaseSeatsandDeletebooking = inngest.createFunction(
    { id: 'relese-seats-delete-booking' },
    { event: 'app/checkpayment' },
    async ({ event, step }) => {
        const tenminutes = new Date(Date.now() + 10 * 60 * 1000);
        await step.sleepUntil('Wait-for-10-minutes', tenminutes);
        await step.run('check-payment-status', async () => {
            const bookingId = event.data.bookingId;
            const booking = await Booking.findById(bookingId);
            if (!booking.isPaid) {
                const show = await Show.findById(booking.show);
                booking.bookedseats.forEach((seat) => {
                    return delete show.occupiedSeats[seat];
                })
                show.markModified('occupiedSeats');
                await show.save();
                await Booking.findByIdAndDelete(booking._id)
            }
        })
    }
)

export const deleteBookingAfterShow = inngest.createFunction(
    { id: "delete-booking-after-show" },
    { event: "app/delete-booking-after-show" },
    async ({ event, step }) => {
        const bookingId = event.data.bookingId;
        const booking = await Booking.findById(bookingId);

        if (!booking) return;
        const show = await Show.findById(booking.show);
        if (!show) return;
        const showtime = new Date(show.showDateTime.getTime() + 15 * 60 * 1000);
        await step.sleepUntil('Wait-for-5-minutes', showtime);

        await step.run('check-booking', async () => {
            const updatebooking = await Booking.findById(bookingId);
            if (updatebooking.isPaid && showtime.getTime() < Date.now()) {
                await Booking.findByIdAndDelete(booking._id);

                const otherBookings = await Booking.find({ show: show._id });
                if (otherBookings.length === 0) {
                    await Show.findByIdAndDelete(show._id);
                } else {
                    console.log("Show not deleted, other bookings still exist.");
                }
            } else {
                console.log("Booking unpaid or show not over yet.");
            }
        })
    }
);

const sendbookingEmail = inngest.createFunction(
    { id: "send-booking-confirmation-mail" },
    { event: 'app/show.booked' },
    async ({ event }) => {
        const { bookingId } = event.data;
        const booking = await Booking.findById(bookingId).populate({
            path: 'show',
            populate: {
                path: 'movie',
                model: 'Movie'
            }
        }).populate('user')

        await sendEmail({
            to: booking.user.email,
            subject: `Payment confirmation : '${booking.show.movie.originalTitle}' booked!`,
            body: `<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="background-color: #F84565; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">🎟️ QuickShow Booking Confirmed!</h1>
            </div>

            <div style="padding: 24px; font-size: 16px; color: #333;">
                <h2 style="margin-top: 0;">Hi ${booking.user.name},</h2>
                <p>Your booking for <strong style="color: #F84565;">"${booking.show.movie.originalTitle}"</strong> is confirmed.</p>

                <p>
                <strong>Date:</strong> ${new Date(booking.show.showDateTime).toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' })}<br>
                <strong>Time:</strong> ${new Date(booking.show.showDateTime).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' })}
                </p>

                <p>🎬 Enjoy the show and don’t forget to grab your popcorn!</p>
            </div>

            <div style="background-color: #f5f5f5; color: #777; padding: 16px; text-align: center; font-size: 14px;">
                <p style="margin: 0;">Thanks for booking with us!<br>— The QuickShow Team</p>
                <p style="margin: 4px 0 0;">📍 Visit us: <a href="https://quickshow.com" style="color: #F84565; text-decoration: none;">QuickShow</a></p>
            </div>
            </div>`
        })
    }
)

export const functions = [userCreated, userUpdated, userDeleted, releaseSeatsandDeletebooking, deleteBookingAfterShow,sendbookingEmail];