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
import { isEmpty, startCase } from "lodash";
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
import { FlexFiller } from "../components/FlexFiller";
import { TagCircle } from "../components/Tag";
import { BACKGROUND_COLOR, PUBLICATION_COLOR, SECONDARY_COLOR } from "../theme";
import stc from "string-to-color";

type Props = {
  events: TimelineEvent[];
  tagsWithCount: Record<string, number>;
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

const TableInsights = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 2rem;
  align-items: end;
  justify-items: center;
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
      let json = JSON.stringify(props).toLocaleLowerCase();
      json = json + " " + json.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (!json.includes(freeText.toLocaleLowerCase())) {
        return false;
      }
    }

    if (ev.year < yearsRange[0] || ev.year > yearsRange[1]) {
      return false;
    }

    if (
      selectedTags.length > 0 &&
      !selectedTags.some((tag) => ev.tags.includes(tag))
    ) {
      return false;
    }

    return true;
  });
};

const Legend = styled.div`
  align-items: center;
  justify-items: center;
  display: flex;
  gap: 0.25rem;
  font-size: 0.8rem;
`;

const PublicationCircle = styled.div`
  display: inline-block;
  height: 0.5rem;
  width: 0.5rem;
  background-color: ${PUBLICATION_COLOR};
  border: 2px solid ${SECONDARY_COLOR};
`;

export const TimelineTable = ({ events, tagsWithCount }: Props) => {
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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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
  }, [
    columnVisibility,
    events,
    globalFilter,
    globalFilterVisibleOnly,
    selectedTags,
    yearsRange,
  ]);

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
      size: 20,
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
        tagsWithCount={tagsWithCount}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
      />
      {Object.values(columnVisibility).every((v) => !v) ? (
        <div>No columns selected :(</div>
      ) : (
        <TableInsights>
          <Legend>
            Publications rows are highlighted in <PublicationCircle /> and
            non-publications in white.
          </Legend>
          <FlexFiller />
          <div>
            {filteredEvents.length} records
            {filteredEvents.length < events.length &&
              ` (${events.length} total)`}
          </div>
        </TableInsights>
      )}
      <TableComponent table={table} />
    </Container>
  );
};
