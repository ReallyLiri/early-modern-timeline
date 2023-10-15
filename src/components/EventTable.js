import React, { useState, useEffect } from 'react';
import EventDetails from './EventDetails';

function EventTable() {
    const [events, setEvents] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);

    useEffect(() => {
        fetch('/events.json')
            .then((response) => response.json())
            .then(({events}) => {
                setEvents(events);
                setFilteredEvents(events);
            })
            .catch((error) => console.error('Error fetching data:', error));
    }, []);

    const handleTagChange = (event) => {
        const selectedTag = event.target.value;
        if (selectedTags.includes(selectedTag)) {
            // Deselect the tag
            const updatedTags = selectedTags.filter((tag) => tag !== selectedTag);
            setSelectedTags(updatedTags);
        } else {
            // Select the tag
            setSelectedTags([...selectedTags, selectedTag]);
        }
    };

    useEffect(() => {
        // Filter events based on selected tags
        if (selectedTags.length === 0) {
            // If no tags are selected, show all events
            setFilteredEvents(events);
        } else {
            const filtered = events.filter((event) =>
                event.tags.some((tag) => selectedTags.includes(tag))
            );
            setFilteredEvents(filtered);
        }
    }, [selectedTags, events]);

// Create a Set to store unique tags
    const uniqueTags = new Set();

    events?.forEach((event) => {
        event.tags?.forEach((tag) => {
            uniqueTags.add(tag);
        });
    });

    const uniqueTagsArray = Array.from(uniqueTags);

    return (
        <div>
            <h1>Events</h1>
            <div>
                <label>Select Tags:</label>
                <select multiple value={selectedTags} onChange={handleTagChange}>
                    {uniqueTagsArray.map((tag, index) => (
                        <option key={index} value={tag}>
                            {tag}
                        </option>
                    ))}
                </select>
            </div>
            <table>
                <thead>
                <tr>
                    <th>Year</th>
                    <th>Title</th>
                </tr>
                </thead>
                <tbody>
                {filteredEvents.map((event, index) => (
                    <tr key={index}>
                        <td>{event.year}</td>
                        <td>
                            <EventDetails event={event}/>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default EventTable;
