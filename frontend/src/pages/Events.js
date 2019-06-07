import React, { Component } from "react";

import Modal from "../components/Modal/Modal";
import BackgroundShadow from "../components/BackgroundShadow/BackgroundShadow";
import "./Events.css";
import AuthContext from "../context/auth-context";

class EventsPage extends Component {
    state = {
        creating: false,
        events : [],
        updated: false
    };

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
        this.setState(() => ({creating : false}));
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
                creator {
                  _id
                  email
                }
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
            this.getEvents();
        }).catch(err => {
            console.log(err);
        })
       
    }

    getEvents() {
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
            // if events list is updated when user creates a new event, override events of state
            this.setState({events});
        //    this.setState(prevState => ({ events: [...prevState.events, ...events ]}));
        }).catch(err => {
            throw err;
        })
    }

    render() {
        const events = this.state.events.map(event => (
            <li className="events__list--item" key={event._id}>{event.title}</li>
        ));
        return (
            <React.Fragment>
                {
                 this.state.creating && <React.Fragment>
                    <BackgroundShadow />
                     <Modal title="Add Event" canCancel canConfirm handleModalCancel={this.handleModalCancel} handleModalConfirm={this.handleModalConfirm}>
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
                {this.context.token && (
                    <div className="events-control">
                        <p>Share your events!</p>
                        <button className="btn" onClick={this.handleCreateEvent}>Create Event</button>
                    </div>
                )}
                <ul className="events__list">{events}</ul>
            </React.Fragment>
        );
    }
}


export default EventsPage;