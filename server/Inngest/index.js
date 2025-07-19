import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";

export const inngest = new Inngest({ id: "movie-ticket-booking" });
 
   const userCreated = inngest.createFunction(
    {id: 'create-user'},
    {event: 'clerk/user.created'},
    async({event}) => {
        const {id,first_name,last_name,email_addresses,image_url} = event.data;
        const userdata = {
            _id:id,
            name: first_name + ' ' + last_name,
            email:email_addresses[0].email_address,
            image:image_url
        }
        await User.create(userdata);
    }
   )
   const userUpdated = inngest.createFunction(
    {id: 'update-user'},
    {event: 'clerk/user.updated'},
    async({event}) => {
        const {id,first_name,last_name,email_addresses,image_url} = event.data;
        const userdata = {
            _id:id,
            name: first_name + ' ' + last_name,
            email:email_addresses[0].email_address,
            image:image_url
        }
        await User.findByIdAndUpdate(id,userdata);
    }
   )
   const userDeleted = inngest.createFunction(
    {id: 'delete-user'},
    {event: 'clerk/user.deleted'},
    async({event}) => {
        const {id} = event.data;
        await User.findByIdAndDelete(id);
    }
   )

   const releaseSeatsandDeletebooking = inngest.createFunction(
    {id : 'relese-seats-delete-booking'},
    {event : 'app/checkpayment'},
    async ({event,step}) => {
        const tenminutes = new Date(Date.now() + 10 * 60 * 1000);
        await step.sleepUntil('Wait-for-10-minutes', tenminutes);
        await step.run('check-payment-status', async() => {
            const bookingId = event.data.bookingId;
            const booking = await Booking.findById(bookingId);
            if(!booking.isPaid) {
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
  async ({ event,step }) => {
    const bookingId = event.data.bookingId;
    const booking = await Booking.findById(bookingId);

    if (!booking) return;
    const show = await Show.findById(booking.show);
    if (!show) return;
    const showtime = new Date(show.showDateTime.getTime() + 5 * 60 * 1000);
    await step.sleepUntil('Wait-for-5-minutes', showtime);

    await step.run('check-booking', async() => {
        const updatebooking = await Booking.findById(bookingId);
        if(updatebooking.isPaid && showtime.getTime() < Date.now()) {
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


export const functions = [userCreated,userUpdated,userDeleted,releaseSeatsandDeletebooking,deleteBookingAfterShow];