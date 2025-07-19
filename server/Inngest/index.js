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

  const cleanUpOldPaidBookings = inngest.createFunction(
  { id: "cleanup-paid-bookings-after-show" },
  { cron: "0 * * * *" },
  async ({ step }) => {
    const now = new Date();

    await step.run("delete-paid-bookings-after-show", async () => {
     const bookings = await Booking.find({}).populate('show');

      for (const booking of bookings) {
        if (!booking.show) continue;

        if (new Date(booking.show.showDateTime) < now) {
          await Booking.findByIdAndDelete(booking._id);
        }
      }
    });
  }
);

export const functions = [userCreated,userUpdated,userDeleted,releaseSeatsandDeletebooking,cleanUpOldPaidBookings];