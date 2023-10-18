import { GeneratedSchemaForRoot as GeneratedTimelineEvents } from "./gen/events.schema";

export type TimelineEvents = GeneratedTimelineEvents;
export type TimelineEvent = TimelineEvents["events"][0];

export const fetchEventsAsync = async () => {
  const { events } = (await (
    await fetch("/data/events.json")
  ).json()) as TimelineEvents;
  events.forEach((event) => {
    event.tags.sort();
  });
  return events;
};
