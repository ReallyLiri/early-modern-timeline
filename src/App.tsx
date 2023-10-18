import { Timeline } from "./pages/Timeline";
import React, { useEffect, useState } from "react";
import { fetchEventsAsync, TimelineEvent } from "./data/data";
import styled from "styled-components";
import { Tabs } from "./components/Tabs";
import { TimelineTable } from "./pages/Table";

const Title = styled.div`
  margin: 2rem 0;
  font-size: 1.4rem;
  text-align: center;
  font-weight: bold;
`;


function App() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    fetchEventsAsync().then((events) => setEvents(events));
  }, []);

  return (
    <>
      <Title>🗓️ Early Modern Timeline 📅</Title>
      <Tabs titles={["Table", "Timeline"]}>
          <TimelineTable events={events} />
          <Timeline events={events} />
      </Tabs>
    </>
  );
}

export default App;
