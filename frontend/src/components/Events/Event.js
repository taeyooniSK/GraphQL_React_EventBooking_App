import React from 'react';

import "./Event.css";

const Event = (props) => {
    return (
        <li key={props.id} className="events__list--item">
            <div>
                <h1>{props.title}</h1>
                <h2>${props.price} - {new Date(props.date).toLocaleString("ko-KR")}</h2>
            </div>
            <div>
                {
                  props.userId === props.creatorId 
                ? <p>This is your event</p> 
                : <button className="btn" onClick={props.onDetail.bind(this, props.eventId)}>View Details</button> 
                }
            </div>
        </li>
    );
};

export default Event;