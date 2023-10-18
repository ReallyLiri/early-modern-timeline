import { TimelineEvent } from "./TimelineEvent";

type TimelineEvents = {
  events: TimelineEvent[];
};

export const fetchEventsAsync = async () => {
  return (await (await fetch("/events.json")).json()) as TimelineEvents;
};
