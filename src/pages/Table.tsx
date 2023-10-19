import { TimelineEvent } from "../data/data";
import {
  ColumnSizingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  Table,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { isArray, isEmpty, startCase } from "lodash";
import styled, { css } from "styled-components";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { BACKGROUND_COLOR, MAIN_COLOR, SECONDARY_COLOR } from "../theme";
import { Anchor } from "../components/Anchor";
import { Tag } from "../components/Tag";
import { FlexFiller } from "../components/FlexFiller";
import { DebouncedInput } from "../components/DebouncedInput";

type EventField = keyof TimelineEvent;
type EventFieldValue = TimelineEvent[keyof TimelineEvent];

type Props = {
  events: TimelineEvent[];
};

const columnHelper = createColumnHelper<TimelineEvent>();

const columns = [
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

const defaultVisibleColumns: Record<EventField, boolean> = {
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

const defaultSorting: Partial<Record<EventField, "desc" | "asc">> = {
  year: "desc",
};

const Container = styled.div`
  margin-top: 2rem;
  padding: 0 1rem;
  overflow-x: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Box = styled.div<{ width?: number }>`
  width: ${({ width }) => (width ? `calc(${width}px - 2rem)` : "fit-content")};
  border: 2px solid ${SECONDARY_COLOR};
  padding: 1rem;
  display: flex;
  flex-direction: row;
  gap: 1rem;
  border-radius: 1rem;
  background-color: ${BACKGROUND_COLOR};
  align-items: center;
`;

const StyledTable = styled.table`
  border-collapse: collapse;

  tbody {
    tr {
      border-bottom: 1px solid ${BACKGROUND_COLOR};
    }

    td {
      padding: 0.25rem 0;
    }
  }

  .resizer {
    height: 100%;
    width: 4px;
    background: ${SECONDARY_COLOR};
    cursor: col-resize;
    user-select: none;
    touch-action: none;
  }

  .resizer.isResizing {
    background: ${MAIN_COLOR}
  }
;
  opacity: 1;
}

@media (hover: hover) {
  .resizer {
    opacity: 0;
  }

  *:hover > .resizer {
    opacity: 1;
  }
}
`;

const InlineList = styled.div<{ gap?: number }>`
  gap: ${({ gap }) => gap || 0.25}rem;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const SourcesSeparator = styled.span`
  color: ${SECONDARY_COLOR};
  user-select: none;
`;

const HeaderCell = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  border-radius: 4px;
  padding: 0.25rem;
  border-bottom: 2px solid ${SECONDARY_COLOR};
  background-color: ${BACKGROUND_COLOR};
`;

const StyledInput = styled(DebouncedInput)`
  width: 100%;
  background-color: white;
  border-radius: 4px;
  border: none;
  padding: 0.5rem;
`;

const renderCell = (field: EventField, value: EventFieldValue): ReactNode => {
  if (!value) {
    return value;
  }
  if (isArray(value)) {
    if (field === "details") {
      return value.map((v) => <div>{v}</div>);
    }
    if (field === "sources") {
      return (
        <InlineList>
          {value.map((v, i) => (
            <div>
              {v.startsWith("http") ? <Anchor url={v} /> : v}
              {i < value.length - 1 && <SourcesSeparator> ; </SourcesSeparator>}
            </div>
          ))}
        </InlineList>
      );
    }
    if (field === "tags") {
      return (
        <InlineList gap={0.5}>
          {value.map((v) => (
            <Tag key={v} tag={v} />
          ))}
        </InlineList>
      );
    }
    return value.map((v) => startCase(v)).join(", ");
  }
  return startCase(value.toString());
};

const VisibleOnlyCheckbox = styled.div`
  display: flex;
  flex-direction: row;
  font-size: 0.8rem;
  text-wrap: nowrap;
  align-items: center;
  gap: 0.25rem;
`;

const Label = styled.span`
  font-size: 0.8rem;
`

const Controls = styled.div`
display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: center;
  width: 100%;
`

const ControlsRows = styled.div<{collapsed: boolean}>`
  ${({collapsed}) => collapsed && css`
    height: 0;
    opacity: 0;
  `};
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const CollapseButton = styled.div<{collapse: boolean}>`
  align-self: center;
  justify-self: center;
  text-align: center;
  cursor: pointer;
  width: fit-content;
  background-color: ${BACKGROUND_COLOR};
  color: ${MAIN_COLOR};
  border-radius: 1rem;
  padding: 1rem;
  font-size: 2rem;
  border: 2px solid ${SECONDARY_COLOR};
  margin-left: 2rem;
  transform: rotate(${({collapse}) => collapse ? 90 : -90}deg);
`

const filterEvents = (
  events: TimelineEvent[],
  visibility: VisibilityState,
  freeText: string,
  freeTextOnlyForVisible: boolean,
  yearsRange: [number, number],
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

    return !( ev.year < yearsRange[0] || ev.year > yearsRange[1] );
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
  const [yearsRange, setYearsRange] = useState<[number, number]>([0,0]);
  const visibilityBoxRef = useRef<HTMLDivElement>(null);
  const [controlsCollapsed, setControlsCollapsed] = useState<boolean>(false)

  useEffect(() => {
    setYearsRange([minYear, maxYear])
  }, [maxYear, minYear]);

  useEffect(() => {
    setFilteredEvents(
      filterEvents(
        events,
        columnVisibility,
        globalFilter,
        globalFilterVisibleOnly,
        yearsRange,
      ),
    );
  }, [
    columnVisibility,
    events,
    globalFilter,
    globalFilterVisibleOnly,
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
    },
  });

  return (
    <Container>
      <Controls>
        <ControlsRows collapsed={controlsCollapsed}>
          <Box ref={visibilityBoxRef}>
            {table.getAllLeafColumns().map((column) => {
              return (
                  <div key={column.id}>
                    <input
                        type="checkbox"
                        checked={column.getIsVisible()}
                        onChange={column.getToggleVisibilityHandler()}
                    />{" "}
                    {startCase(column.id)}
                  </div>
              );
            })}
          </Box>
          <Box width={visibilityBoxRef.current?.clientWidth}>
            <StyledInput
                value={globalFilter ?? ""}
                onChange={(value) => setGlobalFilter(String(value))}
                placeholder={`Search ${
                    globalFilterVisibleOnly ? "visible" : "all"
                } columns...`}
            />
            <VisibleOnlyCheckbox>
              <span>Visible only:</span>
              <input
                  type="checkbox"
                  checked={globalFilterVisibleOnly}
                  onChange={() => setGlobalFilterVisibleOnly((check) => !check)}
              />
            </VisibleOnlyCheckbox>
          </Box>
          <Box width={visibilityBoxRef.current?.clientWidth}>
            <Label>From:</Label>
            <StyledInput
                onChange={year => setYearsRange(r => [year as number, r[1]])}
                value={yearsRange[0]}
                type="number"
                max={maxYear}
                min={minYear}
            />
            <Label>Until:</Label>
            <StyledInput
                onChange={year => setYearsRange(r => [r[0], year as number])}
                value={yearsRange[1]}
                type="number"
                max={maxYear}
                min={minYear}
            />
          </Box>
        </ControlsRows>
          <CollapseButton title={`${controlsCollapsed ? "Expand" : "Collapse"} controls`} collapse={controlsCollapsed} onClick={() => setControlsCollapsed(b => !b)}>➤</CollapseButton>
      </Controls>
      <StyledTable>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  style={{
                    width: header.getSize(),
                    ...(header.column.getCanSort()
                      ? { cursor: "pointer" }
                      : {}),
                  }}
                >
                  <HeaderCell>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {{
                      asc: " ⬆",
                      desc: " ⬇",
                    }[header.column.getIsSorted() as string] ?? null}
                    <FlexFiller />
                    <div
                      {...{
                        onMouseDown: header.getResizeHandler(),
                        onTouchStart: header.getResizeHandler(),
                        className: `resizer ${
                          header.column.getIsResizing() ? "isResizing" : ""
                        }`,
                        style: { height: 32 },
                      }}
                    />
                  </HeaderCell>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </Container>
  );
};
