import { Timeline } from "./components/Timeline";
import { useEffect, useState } from "react";
import { TimelineEvent } from "./data/TimelineEvent";
import { fetchDataAsync } from "./data/data";

function App() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    fetchDataAsync().then((data) => setEvents(data.events));
  }, []);

  return (
    <>
      <Timeline events={events} />
    </>
  );
}

export default App;
