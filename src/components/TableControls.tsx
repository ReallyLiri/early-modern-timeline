import { startCase } from "lodash";
import { BACKGROUND_COLOR, MAIN_COLOR, SECONDARY_COLOR } from "../theme";
import styled, { css } from "styled-components";
import { DebouncedInput } from "./DebouncedInput";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { Table, VisibilityState } from "@tanstack/react-table";
import { TimelineEvent } from "../data/data";
import Select from "react-select";
import { useWindowSize } from "usehooks-ts";
import { Tag } from "./Tag";

type Props = {
  table: Table<TimelineEvent>;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  globalFilterVisibleOnly: boolean;
  toggleGlobalFilterVisibleOnly: () => void;
  yearsRange: [number, number];
  setYearsRange: Dispatch<SetStateAction<[number, number]>>;
  minYear: number;
  maxYear: number;
  visibilityState: VisibilityState;
  setVisibilityState: Dispatch<SetStateAction<VisibilityState>>;
  tags: string[];
  selectedTags: string[];
  setSelectedTags: Dispatch<SetStateAction<string[]>>;
};

const Box = styled.div<{width: number}>`
  width: ${({width}) => width}px;
  border: 2px solid ${SECONDARY_COLOR};
  padding: 1rem;
  display: flex;
  flex-direction: row;
  gap: 1rem;
  border-radius: 1rem;
  background-color: ${BACKGROUND_COLOR};
  align-items: center;
  
  .select {
    width: 100%;
  }
`;

const StyledInput = styled(DebouncedInput)`
  width: 100%;
  background-color: white;
  border-radius: 4px;
  border: none;
  padding: 0.5rem;
`;

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
`;

const Controls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: center;
  width: 100%;
`;

const ControlsRows = styled.div<{ collapsed: boolean }>`
  ${({ collapsed }) =>
    collapsed &&
    css`
      height: 0;
      opacity: 0;
    `};
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CollapseButton = styled.div<{ collapse: boolean }>`
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
  transform: rotate(${({ collapse }) => (collapse ? 90 : -90)}deg);
`;


export const TableControls = ({
  table,
  globalFilter,
  setGlobalFilter,
  globalFilterVisibleOnly,
  toggleGlobalFilterVisibleOnly,
  yearsRange,
  setYearsRange,
  minYear,
  maxYear,
    visibilityState,
    setVisibilityState,
    tags,
    selectedTags,
    setSelectedTags,
}: Props) => {
  const {width} = useWindowSize()
  const boxWidth = width * 0.75
  const [controlsCollapsed, setControlsCollapsed] = useState<boolean>(false);
  const columnOptions = useMemo(
    () =>
      table
        .getAllLeafColumns()
        .map((column) => ({ value: column.id, label: startCase(column.id), onChange: column.getToggleVisibilityHandler() })),
    [table],
  );
  const tagOptions = useMemo(() => tags.map((tag) => ({ value: tag, label: <Tag tag={tag}/> })), [tags]);

  return (
    <Controls>
      <ControlsRows collapsed={controlsCollapsed}>
        <Box width={boxWidth}>
          <Label>Columns</Label>
          <Select
            value={columnOptions.filter(
              (option) => visibilityState[option.value],
            )}
            options={columnOptions}
            onChange={(options) => {
              const selectedIds = options.map((option) => option.value);
              setVisibilityState((state) => {
                Object.keys(state).forEach(
                  (key) => (state[key] = selectedIds.includes(key)),
                );
                return state;
              });
            }}
            isMulti
            className="select"
          />
          <Label>Tags</Label>
          <Select
            value={tagOptions.filter((option) =>
              selectedTags.includes(option.value),
            )}
            options={tagOptions}
            onChange={(options) =>
              setSelectedTags(options.map((option) => option.value))
            }
            isMulti
            className="select"
          />
        </Box>
        <Box width={boxWidth}>
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
              onChange={() => toggleGlobalFilterVisibleOnly()}
            />
          </VisibleOnlyCheckbox>
        </Box>
        <Box width={boxWidth}>
          <Label>From:</Label>
          <StyledInput
            onChange={(year) => setYearsRange((r) => [year as number, r[1]])}
            value={yearsRange[0]}
            type="number"
            max={maxYear}
            min={minYear}
          />
          <Label>Until:</Label>
          <StyledInput
            onChange={(year) => setYearsRange((r) => [r[0], year as number])}
            value={yearsRange[1]}
            type="number"
            max={maxYear}
            min={minYear}
          />
        </Box>
      </ControlsRows>
      <CollapseButton
        title={`${controlsCollapsed ? "Expand" : "Collapse"} controls`}
        collapse={controlsCollapsed}
        onClick={() => setControlsCollapsed((b) => !b)}
      >
        ➤
      </CollapseButton>
    </Controls>
  );
};
