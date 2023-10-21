import { GeneratedSchemaForRoot as GeneratedTimelineEvents } from "./gen/events.schema";
import { GeneratedSchemaForRoot as GeneratedCommunities } from "./gen/communities.schema";
import { remove } from "lodash";

export type TimelineEvents = GeneratedTimelineEvents;
export type TimelineEvent = TimelineEvents["events"][0] & {
  publication: boolean;
};

type TagDetailsCollection = {
  "tags": Record<string, TagDetails>[]
}
export type TagDetails = {
  related_tags: string[];
  details?: string[];
  sources?: string[];
}

export type Communities = GeneratedCommunities["communities"];

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

export const fetchTagsAsync = async (): Promise<Record<string, TagDetails>> => {
  const { tags } = (await (
    await fetch("/data/tags.json")
  ).json()) as TagDetailsCollection;
  return tags[0];
};

export const fetchCommunitiesAsync = async (): Promise<Communities> => {
  const { communities } = (await (
    await fetch("/data/communities.json")
  ).json()) as GeneratedCommunities;
  return communities;
};
