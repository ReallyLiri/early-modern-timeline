import React, { useState } from "react";

function EventDetails({ event }) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpansion = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="event-details">
      <h2 onClick={toggleExpansion}>{event.title}</h2>
      {expanded && (
        <div>
          <p>Year: {event.year}</p>
          <p>Title: {event.title}</p>
        </div>
      )}
    </div>
  );
}

export default EventDetails;
