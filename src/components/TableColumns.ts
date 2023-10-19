import { TimelineEvent } from "../data/data";
import { createColumnHelper } from "@tanstack/react-table";


export type EventField = keyof TimelineEvent;
export type EventFieldValue = TimelineEvent[keyof TimelineEvent];


const columnHelper = createColumnHelper<TimelineEvent>();

export const columns = [
    columnHelper.accessor("year", { sortingFn: "alphanumeric" }),
    columnHelper.accessor("title", {}),
    columnHelper.accessor("tags", { enableSorting: false }),
    columnHelper.accessor("author", {}),
    columnHelper.accessor("language", {}),
    columnHelper.accessor("details", {}),
    columnHelper.accessor("sources", { enableSorting: false }),
    columnHelper.accessor("city", {}),
    columnHelper.accessor("individuals", { enableSorting: false }),
];

export const defaultVisibleColumns: Record<EventField, boolean> = {
    year: true,
    author: true,
    tags: true,

    details: false,
    sources: false,
    title: false,
    language: false,
    city: false,
    individuals: false,
};

export const defaultSorting: Partial<Record<EventField, "desc" | "asc">> = {
    year: "desc",
};
