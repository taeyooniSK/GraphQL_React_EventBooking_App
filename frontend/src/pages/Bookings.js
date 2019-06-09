import React, { Component } from "react";


import AuthContext from "../context/auth-context";
import Spinner from "../components/Spinner/Spinner";
import BookingList from "../components/Bookings/BookingList";

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

    handleCancelBooking = (bookingId) => {
        this.setState({ isLoading: true });
        const reqBody = {
            query: `
                mutation { 
                    cancelBooking(bookingID: "${bookingId}") {
                        _id
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
            // booking._id and bookingId(the booking I click) is differnet (which means the booking I'm about to delete is equal)
            this.setState(prevState => {
                const updatedBookings = prevState.bookings.filter(booking => {
                    return booking._id !== bookingId;
                })
                return {bookings: updatedBookings, isLoading: false};
            });
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
            : <BookingList bookings={this.state.bookings} handleCancelBooking={this.handleCancelBooking}/>
            } 
            </React.Fragment> 
        );
    }
}


export default BookingsPage;