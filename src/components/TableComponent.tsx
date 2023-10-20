import { flexRender, Table } from "@tanstack/react-table";
import { FlexFiller } from "./FlexFiller";
import styled, { css } from "styled-components";
import { BACKGROUND_COLOR, MAIN_COLOR, SECONDARY_COLOR } from "../theme";
import { TimelineEvent } from "../data/data";
import { isArray, startCase } from "lodash";
import { EventField, EventFieldValue } from "./TableColumns";
import { ReactNode } from "react";
import { Anchor } from "./Anchor";
import { Tag } from "./Tag";

type Props = {
  table: Table<TimelineEvent>;
};

const StyledTable = styled.table`
  border-collapse: collapse;
  border-spacing: 20px 0;

  tbody {
    tr {
      border-bottom: 1px solid ${BACKGROUND_COLOR};
    }

    td {
      padding: 0.25rem;
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

const HeaderCell = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  border-radius: 4px;
  padding: 0.25rem;
  border-bottom: 2px solid ${SECONDARY_COLOR};
  background-color: ${BACKGROUND_COLOR};
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

const Paragraph = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const TableRow = styled.tr<{ publication: boolean }>`
  ${({ publication }) =>
    publication &&
    css`
      background-color: #f1f1f1;
    `};
`;

export const renderCell = (
  field: EventField,
  value: EventFieldValue,
): ReactNode => {
  if (!value) {
    return value;
  }
  if (isArray(value)) {
    if (field === "details") {
      return (
        <Paragraph>
          {value.map((v) => (
            <div>{v}</div>
          ))}
        </Paragraph>
      );
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
  if (field === "title") {
    return value;
  }
  return startCase(value.toString());
};

export const TableComponent = ({ table }: Props) => (
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
                ...(header.column.getCanSort() ? { cursor: "pointer" } : {}),
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
                }[header.column.getIsSorted() as string] ?? " ·"}
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
        <TableRow key={row.id} publication={row.original.publication}>
          {row.getVisibleCells().map((cell) => (
            <td key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </TableRow>
      ))}
    </tbody>
  </StyledTable>
);
