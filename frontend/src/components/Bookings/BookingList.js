import React from "react";

import "./BookingList.css";

const BookingList = props => (
    <ul className="booking__list">
    {props.bookings.map(booking => (
        <li key={booking._id} className="booking__list-item">
            <div className="bookings__item-date">
                {booking.event.title} - {new Date(booking.createdAt).toLocaleDateString()}
            </div>
            <div className="bookings__item-actions">
                <button className="btn" onClick={props.handleCancelBooking.bind(this, booking._id)}>Cancel</button>
            </div>
        </li>
    ))}
    </ul>
    
);
  


export default BookingList;