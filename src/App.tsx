import { Timeline, TimelineNode } from "./components/Timeline";
import { useEffect, useMemo, useState } from "react";
import { TimelineEvent } from "./data/TimelineEvent";
import { fetchDataAsync } from "./data/data";
import { sortedUniq } from "lodash";

const nodeTitle = (events: TimelineEvent[]) => {
  if (events.length === 1) {
    return events[0].title;
  }
  return `${events[0].title} +${events.length - 1} more...`;
};

function App() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    fetchDataAsync().then((data) => setEvents(data.events));
  }, []);

  useEffect(() => {
    setFilteredEvents(events.filter((event) => !!event.year));
  }, [events]);

  const eventsByYear: Record<number, TimelineEvent[]> = useMemo(
    () =>
      filteredEvents.reduce(
        (acc, event) => {
          acc[event.year] = [...(acc[event.year] || []), event];
          return acc;
        },
        {} as Record<number, TimelineEvent[]>,
      ),
    [filteredEvents],
  );

  const years = useMemo(
    () => sortedUniq(filteredEvents.map((event) => event.year).sort()),
    [filteredEvents],
  );

  const nodes: TimelineNode[] = useMemo(
    () =>
      years.map((year) => ({
        year,
        tags: sortedUniq(eventsByYear[year].flatMap((event) => event.tags).sort()),
        title: nodeTitle(eventsByYear[year]),
      })),
    [eventsByYear, years],
  );

  return (
    <>
      <Timeline nodes={nodes} onYearSelected={() => {}} />
    </>
  );
}

export default App;
