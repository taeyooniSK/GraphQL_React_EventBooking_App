import React, { Component } from "react";

import Modal from "../components/Modal/Modal";
import BackgroundShadow from "../components/BackgroundShadow/BackgroundShadow";
import "./Events.css";

class EventsPage extends Component {
    state = {
        creating: false
    };

    handleCreateEvent = () => {
        this.setState((prevState) => ({creating: !prevState.creating}))
    }

    handleModalCancel = () => {
        this.setState(() => ({creating : false}));
    } 

    handleModalConfirm = () => {
        this.setState(() => ({creating: false}));
    }

    render() {
        return (
            <React.Fragment>
                {
                 this.state.creating && <React.Fragment>
                    <BackgroundShadow />
                     <Modal title="Add Event" canCancel canConfirm handleModalCancel={this.handleModalCancel} handleModalConfirm={this.handleModalConfirm}>
                            <p>This is Modal content</p>
                    </Modal>
                   </React.Fragment>
                }
                <div className="events-control">
                    <p>Share your events!</p>
                    <button className="btn" onClick={this.handleCreateEvent}>Create Event</button>
                </div>
            </React.Fragment>
        );
    }
}


export default EventsPage;