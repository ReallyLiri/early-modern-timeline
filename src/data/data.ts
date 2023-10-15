import { TimelineEvent } from "./TimelineEvent";

type Data = {
  events: TimelineEvent[];
  tags: any[]; // TODO
};

export const fetchDataAsync = async () => {
  return (await (await fetch("/events.json")).json()) as Data;
};
