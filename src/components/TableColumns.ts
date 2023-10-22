import { TimelineEvent } from "../data/data";
import { createColumnHelper } from "@tanstack/react-table";

export type EventField = keyof TimelineEvent;
export type EventFieldValue = TimelineEvent[keyof TimelineEvent];

const columnHelper = createColumnHelper<TimelineEvent>();

export const columns = [
  columnHelper.accessor("year", { sortingFn: "alphanumeric" }),
  columnHelper.accessor("title", {}),
  columnHelper.accessor("author", {}),
  columnHelper.accessor("language", {}),
  columnHelper.accessor("city", {}),
  columnHelper.accessor("individuals", { enableSorting: false }),
  columnHelper.accessor("tags", { enableSorting: false }),
  columnHelper.accessor("details", {}),
  columnHelper.accessor("sources", { enableSorting: false }),
];

export const defaultVisibleColumns: Record<EventField, boolean> = {
  year: true,
  title: true,
  tags: true,
  details: true,

  author: false,
  sources: false,
  language: false,
  city: false,
  individuals: false,
  publication: false,
};

export const defaultSorting: Partial<Record<EventField, "desc" | "asc">> = {
  year: "asc",
};
