import React, { useState } from "react";
import JsonDataDisplay from "./JsonDataDisplay";

function EventForm() {
  const [newEvent, setNewEvent] = useState({ year: "", title: "", tags: [] });
  const [jsonData, setJsonData] = useState({});

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewEvent({ ...newEvent, [name]: value });
  };

  const handleAddEvent = () => {
    if (newEvent.year && newEvent.title) {
      setJsonData(newEvent);
    }
  };

  return (
    <div>
      <h2>Add New Event</h2>
      <form>
        <div>
          <label>Year:</label>
          <input
            type="number"
            name="year"
            value={newEvent.year}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Title:</label>
          <input
            type="text"
            name="title"
            value={newEvent.title}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Tags:</label>
          <input
            type="text"
            name="tags"
            value={newEvent.tags}
            onChange={handleInputChange}
            placeholder="Enter tags separated by commas (e.g., tag1, tag2)"
          />
        </div>
        <div>
          <button type="button" onClick={handleAddEvent}>
            To JSON
          </button>
        </div>
      </form>
      <JsonDataDisplay jsonData={jsonData} />
    </div>
  );
}

export default EventForm;
