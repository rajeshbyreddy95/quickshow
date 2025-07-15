import React, { useEffect, useState } from 'react'
import { dummyBookingData } from '../../assets/assets';
import Loading from '../../components/Loading';
import Title from '../../components/Title';
import formatDateTime from '../../lib/DateCalculate';
import BlurCircle from '../../components/BlurCircle';

const Listbookings = () => {
  const currency = import.meta.env.VITE_CURRENCY;
  const [bookings,setBookings] = useState(null);
  const [loading,setLoading] = useState(true);

  const fetchbookings = async() => {
    try {
      setBookings(dummyBookingData);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchbookings();
  },[])

  return !loading ? (
    <div className="w-full md:px-4 max-md:px-0 relative">
      <Title text1="List" text2="Bookings" />
      <BlurCircle top='0' left='0'/>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full table-auto border-collapse text-sm text-white rounded-lg overflow-hidden max-md:text-xs">
          <thead>
            <tr className="bg-primary/20 text-left whitespace-nowrap">
              <th className="p-3 text-base font-semibold min-w-[140px]">User Name</th>
              <th className="p-3 text-base font-semibold min-w-[120px]">Movie Name</th>
              <th className="p-3 text-base font-semibold min-w-[120px]">Show Time</th>
              <th className="p-3 text-base font-semibold min-w-[100px]">Seats</th>
              <th className="p-3 text-base font-semibold min-w-[100px]">Amount</th>
            </tr>
          </thead>
          <tbody className="text-sm font-light">
            {bookings.map((show, index) => (
             <tr
                key={index}
                className="border-b border-primary/10 bg-primary/5 even:bg-primary/10 whitespace-nowrap"
              >
                <td className="p-3 max-w-[180px] truncate">{show.user.name}</td>
                <td className="p-3 max-w-[180px] truncate">{show.show.movie.title}</td>
                <td className="p-3 max-w-[160px] truncate">{formatDateTime(show.show.showDateTime).replace('•',' at')}</td>
                <td className="p-3">{show.bookedSeats.map((seat) => {
                   return seat
                }).join(' ,')}</td>
                <td className="p-3">
                  {currency} {show.bookedSeats.length * show.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ) : <Loading/>
}

export default Listbookings
