import { TimelineEvent } from "../data/data";
import {
  ColumnSizingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { isArray, startCase } from "lodash";
import styled from "styled-components";
import { ReactNode, useState } from "react";
import { BACKGROUND_COLOR, MAIN_COLOR, SECONDARY_COLOR } from "../theme";
import stc from "string-to-color";

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

const Box = styled.div`
  width: fit-content;
  border: 2px solid ${SECONDARY_COLOR};
  padding: 1rem;
  display: flex;
  flex-direction: row;
  gap: 1rem;
  border-radius: 1rem;
  background-color: ${BACKGROUND_COLOR};
`;

const StyledTable = styled.table`
  .resizer {
    height: 100%;
    width: 4px;
    background: ${SECONDARY_COLOR};
    cursor: col-resize;
    user-select: none;
    touch-action: none;
  }

  .resizer.isResizing {
    background: ${MAIN_COLOR}};
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

const THead = styled.thead`
  background-color: ${BACKGROUND_COLOR};

  th {
  }
`;

const Anchor = ({ url }: { url: string }) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      style={{ cursor: "pointer" }}
    >
      {url}
    </a>
  );
};

const InlineList = styled.div<{gap?: number}>`
  gap: ${({gap}) => gap || 0.25}rem;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const SourcesSeparator = styled.span`
  color: ${SECONDARY_COLOR};
  user-select: none;
`;

const TagCircle = styled.div<{ tag: string }>`
  display: inline-block;
  height: 0.5rem;
  width: 0.5rem;
  border-radius: 50%;
  margin-bottom: 2px;
  background-color: ${({ tag }) => stc(tag)};
`;

const Tag = ({ tag }: { tag: string }) => {
  return (
    <span>
      <TagCircle tag={tag} /> {startCase(tag)}
    </span>
  );
};

const HeaderCell = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  border-radius: 4px;
  padding: 0.25rem 0;
  border-bottom: 2px solid ${SECONDARY_COLOR};
`

const FlexFiller = styled.div`
  flex: 1; 
`

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

export const Table = ({ events }: Props) => {
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

  const table = useReactTable({
    data: events,
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
      enableHiding: true,
      enableResizing: true,
      enableSorting: true,
    },
  });
  return (
    <Container>
      <Box>
        {table.getAllLeafColumns().map((column) => {
          return (
            <div key={column.id}>
              <input
                {...{
                  type: "checkbox",
                  checked: column.getIsVisible(),
                  onChange: column.getToggleVisibilityHandler(),
                }}
              />{" "}
              {startCase(column.id)}
            </div>
          );
        })}
      </Box>
      <StyledTable>
        <THead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  style={
                    {
                      width: header.getSize(),
                      ...(header.column.getCanSort() ? { cursor: "pointer" } : {})
                    }
                  }
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
                    <FlexFiller/>
                    <div
                        {...{
                          onMouseDown: header.getResizeHandler(),
                          onTouchStart: header.getResizeHandler(),
                          className: `resizer ${
                              header.column.getIsResizing() ? 'isResizing' : ''
                          }`,
                          style: {height: 32},
                        }}
                    />
                  </HeaderCell>
                </th>
              ))}
            </tr>
          ))}
        </THead>
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
