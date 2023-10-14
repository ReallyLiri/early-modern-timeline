import React from 'react';
import './App.css';
import EventTable from './EventTable';
import EventForm from "./EventForm";

function App() {
    return (
        <div className="App">
            <EventTable />
            <EventForm />
        </div>
    );
}

export default App;