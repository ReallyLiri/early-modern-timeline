import { TimelineEvent } from "../data/data";
import {
  ColumnSizingState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  Table,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { isEmpty, sortedUniq, startCase } from "lodash";
import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import { renderCell, TableComponent } from "../components/TableComponent";
import { TableControls } from "../components/TableControls";
import {
  columns,
  defaultSorting,
  defaultVisibleColumns,
  EventField,
  EventFieldValue,
} from "../components/TableColumns";

type Props = {
  events: TimelineEvent[];
};

const Container = styled.div`
  height: 100vh;
  margin-top: 2rem;
  padding: 0 1rem;
  overflow-x: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const filterEvents = (
  events: TimelineEvent[],
  visibility: VisibilityState,
  freeText: string,
  freeTextOnlyForVisible: boolean,
  yearsRange: [number, number],
  selectedTags: string[],
) => {
  return events.filter((ev) => {
    if (!isEmpty(freeText)) {
      const props: TimelineEvent = { ...ev };
      if (freeTextOnlyForVisible) {
        Object.keys(visibility)
          .filter((key) => !visibility[key])
          .forEach((key) => delete props[key as EventField]);
      }
      const json = JSON.stringify(props).toLocaleLowerCase();
      if (!json.includes(freeText.toLocaleLowerCase())) {
        return false;
      }
    }

    if (ev.year < yearsRange[0] || ev.year > yearsRange[1]) {
      return false
    }

    if (selectedTags.length > 0 && !selectedTags.some(tag => ev.tags.includes(tag))) {
      return false
    }

    return true
  });
};

export const TimelineTable = ({ events }: Props) => {
  const [filteredEvents, setFilteredEvents] = useState<TimelineEvent[]>([]);
  const [columnVisibility, setColumnVisibility] = useState(
    defaultVisibleColumns as Partial<Record<EventField, boolean>>,
  );
  const [columnSorting, setColumnSorting] = useState<SortingState>(
    Object.keys(defaultSorting).map((key) => ({
      id: key,
      desc: defaultSorting[key as EventField] === "desc",
    })),
  );
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const [globalFilterVisibleOnly, setGlobalFilterVisibleOnly] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const minYear = useMemo(
    () => Math.min(...events.map((ev) => ev.year)),
    [events],
  );
  const maxYear = useMemo(
    () => Math.max(...events.map((ev) => ev.year)),
    [events],
  );
  const [yearsRange, setYearsRange] = useState<[number, number]>([0, 0]);
  const tags = useMemo(() => sortedUniq(events.flatMap(e => e.tags).sort()), [events])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  useEffect(() => {
    setYearsRange([minYear, maxYear]);
  }, [maxYear, minYear]);

  useEffect(() => {
    setFilteredEvents(
      filterEvents(
        events,
        columnVisibility,
        globalFilter,
        globalFilterVisibleOnly,
        yearsRange,
          selectedTags,
      ),
    );
  }, [columnVisibility, events, globalFilter, globalFilterVisibleOnly, selectedTags, yearsRange]);

  const table: Table<TimelineEvent> = useReactTable({
    data: filteredEvents,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnVisibility,
      sorting: columnSorting,
      columnSizing,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setColumnSorting,
    onColumnSizingChange: setColumnSizing,
    columnResizeMode: "onChange",
    defaultColumn: {
      cell: (info) =>
        renderCell(
          info.column.id as EventField,
          info.getValue() as EventFieldValue,
        ),
      header: (info) => startCase(info.column.id),
    },
  });

  return (
    <Container>
      <TableControls
        table={table}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        globalFilterVisibleOnly={globalFilterVisibleOnly}
        toggleGlobalFilterVisibleOnly={() =>
          setGlobalFilterVisibleOnly((b) => !b)
        }
        yearsRange={yearsRange}
        setYearsRange={setYearsRange}
        minYear={minYear}
        maxYear={maxYear}
        visibilityState={columnVisibility}
        setVisibilityState={setColumnVisibility}
        tags={tags}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
      />
      {Object.values(columnVisibility).every((v) => !v) && <div>No columns selected :(</div>}
      <TableComponent table={table} />
    </Container>
  );
};
