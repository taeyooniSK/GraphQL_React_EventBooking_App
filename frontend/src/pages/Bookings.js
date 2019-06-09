import React, { Component } from "react";

import AuthContext from "../context/auth-context";

import Spinner from "../components/Spinner/Spinner";

class BookingsPage extends Component {
    state = {
        isLoading: false,
        bookings: []
    };
    
    static contextType = AuthContext;

    componentDidMount(){
        this.getBookings();
    }

    getBookings = () => {
        this.setState({ isLoading: true });
        const reqBody = {
            query: `
                query { 
                    bookings {
                        _id
                        event {
                            _id
                            title
                            price
                            date
                            description
                        }
                        createdAt
                        updatedAt
                    }
                }
            `
        };

        fetch("http://localhost:8000/graphql", {
            method: "POST",
            body: JSON.stringify(reqBody),
            headers: {
                "Content-Type": "application/json",
                "Authorization" : "Bearer " + this.context.token
            }
        }).then(res => {
            if(res.status !== 200 && res.status !== 201){
                throw new Error("Failed to get events");
            }
            return res.json();
        }).then(result => {
            const bookings = result.data.bookings;
            // if booking list is updated after getting data from the db
            this.setState({bookings, isLoading: false});
        }).catch(err => {
            console.log(err);
            this.setState({isLoading: true});
            
        })
    }
    render() {
        return (
            
            <React.Fragment>
            {this.state.isLoading 
            ? <Spinner /> 
            : (<ul>
                {this.state.bookings.map(booking => (
                    <li key={booking._id}>{booking.event.title} - {new Date(booking.createdAt).toLocaleDateString()}</li>
                ))} 
              </ul>)
            } 
            </React.Fragment> 
        );
    }
}


export default BookingsPage;