import { isString, startCase } from "lodash";
import { BACKGROUND_COLOR, SECONDARY_COLOR } from "../theme";
import styled from "styled-components";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
} from "react";
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
  tagsWithCount: Record<string, number>;
  selectedTags: string[];
  setSelectedTags: Dispatch<SetStateAction<string[]>>;
};

const Box = styled.div<{ width: number }>`
  width: ${({ width }) => width}px;
  max-width: 1024px;
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

const StyledInput = styled.input`
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

const ControlsRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
  tagsWithCount,
  selectedTags,
  setSelectedTags,
}: Props) => {
  const { width } = useWindowSize();
  const boxWidth = width * 0.9;
  const columnOptions = useMemo(
    () =>
      table.getAllLeafColumns().map((column) => ({
        value: column.id,
        label: startCase(column.id),
        onChange: column.getToggleVisibilityHandler(),
      })),
    [table],
  );
  const tags = useMemo(
    () =>
      Object.keys(tagsWithCount).sort(
        (a, b) => tagsWithCount[b] - tagsWithCount[a] || a.localeCompare(b),
      ),
    [tagsWithCount],
  );
  const tagOptions = useMemo(
    () =>
      tags.map((tag) => ({
        value: tag,
        label: <Tag tag={tag} count={tagsWithCount[tag]} />,
      })),
    [tags, tagsWithCount],
  );

  const sanitizeYear = useCallback(
    (year: string | number, index: number): number => {
      if (maxYear < minYear) {
        return year as number;
      }
      if (isString(year)) {
        year = parseInt(year);
      }
      if (isNaN(year)) {
        year = index === 0 ? minYear : maxYear;
      }
      const inRangeYear = Math.min(Math.max(year, minYear), maxYear);
      if (inRangeYear !== year) {
        return index === 0 ? minYear : maxYear;
      }
      return inRangeYear;
    },
    [minYear, maxYear],
  );
  const [fromYear, untilYear] = yearsRange;
  useEffect(() => {
    setTimeout(() => {
      setYearsRange((range) => [
        sanitizeYear(range[0], 0),
        sanitizeYear(range[1], 1),
      ]);
    }, 1000);
  }, [sanitizeYear, setYearsRange, fromYear, untilYear]);

  return (
    <Controls>
      <ControlsRows>
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
                const nextState = { ...state };
                Object.keys(state).forEach(
                  (key) => (nextState[key] = selectedIds.includes(key)),
                );
                return nextState;
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
            onChange={(ev) => setGlobalFilter(String(ev.target.value))}
            placeholder={`Search ${
              globalFilterVisibleOnly ? "visible" : "all"
            } columns...`}
          />
          <VisibleOnlyCheckbox>
            <span>Search only in visible columns:</span>
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
            onChange={(e) =>
              setYearsRange((r) => [e.target.value as unknown as number, r[1]])
            }
            value={fromYear}
            type="number"
            max={maxYear}
            min={minYear}
          />
          <Label>Until:</Label>
          <StyledInput
            onChange={(e) =>
              setYearsRange((r) => [r[0], e.target.value as unknown as number])
            }
            value={untilYear}
            type="number"
            max={maxYear}
            min={minYear}
          />
        </Box>
      </ControlsRows>
    </Controls>
  );
};
