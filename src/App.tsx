import { TimelineLine } from "./pages/TimelineLine";
import React, { useEffect, useMemo, useState } from "react";
import {
  Communities,
  fetchCommunitiesAsync,
  fetchEventsAsync,
  fetchTagsAsync,
  TagDetails,
  TimelineEvent,
} from "./data/data";
import styled from "styled-components";
import { Tabs } from "./components/Tabs";
import { TimelineTable } from "./pages/TimelineTable";
import { TagsPane } from "./pages/TagsPane";

const Title = styled.div`
  margin: 2rem 0;
  font-size: 1.4rem;
  text-align: center;
  font-weight: bold;
`;

function App() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [tagDetails, setTagDetails] = useState<Record<string, TagDetails>>();
  const [communities, setCommunities] = useState<Communities>();

  useEffect(() => {
    fetchEventsAsync().then((events) => setEvents(events));
  }, []);
  useEffect(() => {
    fetchTagsAsync().then((tagDetails) => setTagDetails(tagDetails));
  }, []);
  useEffect(() => {
    fetchCommunitiesAsync().then((communities) => setCommunities(communities));
  }, []);

  const tagsWithCount = useMemo(
    () =>
      events.reduce(
        (acc, ev) => {
          ev.tags.forEach((tag) => {
            acc[tag] = (acc[tag] || 0) + 1;
          });
          return acc;
        },
        {} as Record<string, number>,
      ),
    [events],
  );

  return (
    <>
      <Title>🗓️ Divide and Archive 📅</Title>
      {tagDetails && communities && (
        <TagsPane
          tagsWithCount={tagsWithCount}
          tagDetails={tagDetails}
          communities={communities}
        />
      )}
      <Tabs titles={["Records", "Timeline"]}>
        <TimelineTable events={events} tagsWithCount={tagsWithCount} />
        <TimelineLine events={events} />
      </Tabs>
    </>
  );
}

export default App;
