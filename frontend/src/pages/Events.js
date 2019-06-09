import React, { Component } from "react";

import Modal from "../components/Modal/Modal";
import BackgroundShadow from "../components/BackgroundShadow/BackgroundShadow";
import EventList from "../components/Events/EventList";
import AuthContext from "../context/auth-context";
import "./Events.css";
import Spinner from "../components/Spinner/Spinner";


class EventsPage extends Component {
    state = {
        creating: false,
        events : [],
        isLoading: false,
        selectedEvent: null
    };

    isActive = true;

    static contextType = AuthContext;

    constructor(props){
        super(props);

        this.titleInputRef = React.createRef();
        this.priceInputRef = React.createRef();
        this.dateInputRef = React.createRef();
        this.descriptionInputRef = React.createRef();
    }

    componentDidMount(){
        this.getEvents();
    }

    handleCreateEvent = () => {
        this.setState((prevState) => ({creating: !prevState.creating}))
    }

    handleModalCancel = () => {
        // when making an event if you cancel, creating : false 
        // & when closing the modal for view details, selectedEvent: null
        this.setState(() => ({creating : false, selectedEvent: null }));
    } 

    handleModalConfirm = () => {
        this.setState(() => ({creating: false}));
        const title = this.titleInputRef.current.value;
        const price = this.priceInputRef.current.value;
        const date = this.dateInputRef.current.value;
        const description = this.descriptionInputRef.current.value;
        
        // simple validation
        if( title.trim().length === 0 || price <= 0 || date.trim().length === 0 || description.trim().length === 0) {
            return;
        }


        // same key, value pairs
        const event = {title, price, date, description};
        console.log(event);

        let reqBody = {
            query: `
            mutation {
              createEvent(eventInput: {title: "${title}", description: "${description}", price: ${price}, date: "${date}"}) {
                _id
                title
                description
                date
                price
              }
            }
          `
        };
        // save token from context into token variable
        const token = this.context.token;       

        fetch("http://localhost:8000/graphql", {
            method: "POST",
            body: JSON.stringify(reqBody),
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        }).then(res => {
            if(res.status !== 200 && res.status !== 201){
                throw new Error("Failed");
            }
            return res.json();
        }).then(result => {
            // when user who is logged in created a new event, this reduces request from the database compared to the last code
            this.setState(prevState => {
                const updatedEvents = [...prevState.events];
                updatedEvents.push({
                    _id : result.data.createEvent._id,
                    title : result.data.createEvent.title,
                    price : result.data.createEvent.price,
                    date : result.data.createEvent.date,
                    description : result.data.createEvent.description,
                    creator :{
                        _id : this.context.userId
                    }
                });
                return { events: updatedEvents };
            })
        }).catch(err => {
            console.log(err);
        })
       
    }

    getEvents() {
        this.setState({ isLoading: true });
        const reqBody = {
            query: `
                query { 
                    events {
                        _id
                        title
                        price
                        date
                        description
                        creator {
                            _id
                            email
                        }
                    }
                }
            `
        };

        fetch("http://localhost:8000/graphql", {
            method: "POST",
            body: JSON.stringify(reqBody),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res => {
            if(res.status !== 200 && res.status !== 201){
                throw new Error("Failed to get events");
            }
            return res.json();
        }).then(result => {
            const events = result.data.events;
             // only when this component is active, update the state
           if(this.isActive){
            // if events list is updated when user creates a new event, override events of state
            this.setState({events, isLoading: false});
           }
        }).catch(err => {
            console.log(err);
            this.setState({isLoading: true});
            
        })
    }

    handleShowDetail = eventId => {
        this.setState(prevState => {
            const selectedEvent = prevState.events.find(e => e._id === eventId);
            return { selectedEvent : selectedEvent };
        })
    }   
    handleBookEvent = () => {
        if(!this.context.token){
            // when user is not logged in and close the modal clicking "Confirm" button, selectedEvent: null so that modal can get closed
            this.setState({selectedEvent: null})
            return;
        }
        let reqBody = {
            query: `
            mutation {
              bookEvent(eventID: "${this.state.selectedEvent._id}") {
                _id
                createdAt 
                updatedAt
              }
            }
          `
        };
        // save token from context into token variable
        const token = this.context.token;       

        fetch("http://localhost:8000/graphql", {
            method: "POST",
            body: JSON.stringify(reqBody),
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        }).then(res => {
            if(res.status !== 200 && res.status !== 201){
                throw new Error("Failed");
            }
            return res.json();
        }).then(result => {
           console.log(result);
            // after getting data, close the modal
            this.setState({selectedEvent: null})
        }).catch(err => {
            console.log(err);
        })
    }

    // this component is destroyed 
    componentWillUnmount(){
        this.isActive = false;
    }

    render() {
        return (
            <React.Fragment>
                {this.state.selectedEvent &&  <BackgroundShadow />}
                {
                 this.state.creating && <React.Fragment>
                    <BackgroundShadow />
                     <Modal title="Add Event" canCancel canConfirm handleModalCancel={this.handleModalCancel} handleModalConfirm={this.handleModalConfirm} buttonText="Confirm">
                        <p>This is Modal content</p>
                        <form>
                            <div className="form-control">
                                <label htmlFor="title">Title</label>
                                <input type="text" id="title" ref={this.titleInputRef}></input>
                            </div>
                            <div className="form-control">
                                <label htmlFor="price">Price</label>
                                <input type="number" id="price" ref={this.priceInputRef}></input>
                            </div>
                            <div className="form-control">
                                <label htmlFor="date">Date</label>
                                <input type="datetime-local" id="date" ref={this.dateInputRef}></input>
                            </div>    
                            <div className="form-control">
                                <label htmlFor="description">Description</label>
                                <textarea id="description" rows="4" ref={this.descriptionInputRef}></textarea>
                            </div>
                        </form>
                    </Modal>
                   </React.Fragment>
                }
                {this.state.selectedEvent && <Modal title={this.state.selectedEvent.title} canCancel canConfirm handleModalCancel={this.handleModalCancel} handleModalConfirm={this.handleBookEvent} buttonText={this.context.token ? "Book" : "Confirm"}>
                    <h1>{this.state.selectedEvent.title}</h1>
                    <h2>${this.state.selectedEvent.price} - {new Date(this.state.selectedEvent.date).toLocaleString("ko-KR")}</h2>
                    <p>{this.state.selectedEvent.description}</p>
                    </Modal>}
                {this.context.token && (
                    <div className="events-control">
                        <p>Share your events!</p>
                        <button className="btn" onClick={this.handleCreateEvent}>Create Event</button>
                    </div>
                )}
                {this.state.isLoading ? <Spinner /> : <EventList events={this.state.events} authUserId={this.context.userId} onViewDetail={this.handleShowDetail}/> }
            </React.Fragment>
        );
    }
}


export default EventsPage;