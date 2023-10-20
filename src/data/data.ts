import { GeneratedSchemaForRoot as GeneratedTimelineEvents } from "./gen/events.schema";
import { remove } from "lodash";

export type TimelineEvents = GeneratedTimelineEvents;
export type TimelineEvent = TimelineEvents["events"][0] & {
  publication: boolean;
};

export const fetchEventsAsync = async (): Promise<TimelineEvent[]> => {
  const { events } = (await (
    await fetch("/data/events.json")
  ).json()) as TimelineEvents;
  return events.map((event) => {
    event.tags.sort();
    const publication = event.tags.includes("publication");
    if (publication) {
      remove(event.tags, (tag) => tag === "publication");
    }
    return {
      ...event,
      publication,
    };
  });
};
