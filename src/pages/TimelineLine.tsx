import React, { useMemo, useRef } from "react";
import styled from "styled-components";
import { BACKGROUND_COLOR, MAIN_COLOR } from "../theme";
import { useHover } from "usehooks-ts";
import { TimelineEvent } from "../data/data";
import { sortedUniq } from "lodash";
import { Transformable } from "../components/Transformable";

type Props = {
  events: TimelineEvent[];
};

type TimelineNode = {
  year: number;
  tags: string[];
  title: string;
};

const NODE_WIDTH_REM = 1.5;
const NODE_YEAR_DIFF_PX = 10;
const MAX_Z_INDEX = 1000;

const Container = styled(Transformable)`
  width: fit-content;
  border: solid black;
  border-width: 2px 0;
  margin: 3rem 0;
  padding: 3rem 0;
  background-color: ${BACKGROUND_COLOR};
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  padding: 0 2rem 0 1rem;
`;

const HorizontalLine = styled.div`
  position: relative;
  height: 4px;
  background-color: ${MAIN_COLOR};
  top: ${NODE_WIDTH_REM * 0.7}rem;
  z-index: 0;
  margin: 0 1rem;
  border-radius: 1rem;
`;

const YearNodeCircle = styled.div<{ diffFromPrevYear: number }>`
  cursor: pointer;
  height: ${NODE_WIDTH_REM}rem;
  width: ${NODE_WIDTH_REM}rem;
  border-radius: 50%;
  background-color: white;
  border: solid ${MAIN_COLOR};
  z-index: 1;
  margin-left: ${({ diffFromPrevYear }) =>
    (diffFromPrevYear - 1) * NODE_YEAR_DIFF_PX}px;
`;

const YearNodeLine = styled.div<{ index: number; top: number; left: number }>`
  position: absolute;
  top: ${({ top, index }) =>
    `calc(${top}px + ${index % 2 === 0 ? -1 : 1.7}rem )`};
  left: ${({ left }) => `calc(${left}px + 0.8rem)`};
  height: 1rem;
  width: 4px;
  background-color: ${MAIN_COLOR};
  z-index: ${MAX_Z_INDEX};
`;

const YearNodeTitle = styled.div<{ index: number; top: number; left: number }>`
  position: absolute;
  top: ${({ top, index }) =>
    `calc(${top}px + ${index % 2 === 0 ? -2.5 : 2.5}rem )`};
  left: ${({ left }) => left}px;
  font-size: 0.8rem;
  text-wrap: nowrap;
  color: white;
  padding: 4px;
  border-radius: 8px;
  background-color: ${MAIN_COLOR};
  border: 2px solid white;
  pointer-events: none;
  user-select: none;
  z-index: ${({ index }) => MAX_Z_INDEX - index};
`;

const YearNodeHover = styled.div<{ index: number; top: number; left: number }>`
  position: absolute;
  top: ${({ top, index }) =>
    `calc(${top}px + ${index % 2 === 0 ? 2 : -2}rem )`};
  left: ${({ left }) => left}px;
  color: white;
  padding: 4px;
  border-radius: 8px;
  background-color: ${MAIN_COLOR};
  border: solid white;
  z-index: 2;
`;

const YearNode = ({
  index,
  diffFromPrevYear,
  node,
}: {
  index: number;
  diffFromPrevYear: number;
  node: TimelineNode;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const position = {
    top: ref.current?.offsetTop || 0,
    left: ref.current?.offsetLeft || 0,
  };
  const isHover = useHover(ref);
  return (
    <>
      <YearNodeTitle index={index} {...position}>
        {node.title}
      </YearNodeTitle>
      <YearNodeLine index={index} {...position} />
      {isHover && (
        <YearNodeHover index={index} {...position}>
          {node.year}
        </YearNodeHover>
      )}
      <YearNodeCircle ref={ref} diffFromPrevYear={diffFromPrevYear} />
    </>
  );
};

const RefreshButton = styled.div`
  margin: 0.5rem 1rem;
  font-size: 0.8rem;
  width: fit-content;
  border-radius: 1rem;
  padding: 1rem 0.5rem;
  background-color: ${BACKGROUND_COLOR};
  cursor: pointer;
`;

const ConstructionWarning = styled.div`
  width: 100%;
  text-align: center;
  font-weight: bold;
`;

const nodeTitle = (events: TimelineEvent[]) => {
  if (events.length === 1) {
    return events[0].title;
  }
  return `${events[0].title} +${events.length - 1} more...`;
};

export const TimelineLine = ({ events }: Props) => {
  const rerender = React.useReducer(() => ({}), {})[1];

  const eventsByYear: Record<number, TimelineEvent[]> = useMemo(
    () =>
      events.reduce(
        (acc, event) => {
          acc[event.year] = [...(acc[event.year] || []), event];
          return acc;
        },
        {} as Record<number, TimelineEvent[]>,
      ),
    [events],
  );

  const years = useMemo(
    () => sortedUniq(events.map((event) => event.year).sort()),
    [events],
  );

  const nodes: TimelineNode[] = useMemo(
    () =>
      years.map((year) => ({
        year,
        tags: sortedUniq(
          eventsByYear[year].flatMap((event) => event.tags).sort(),
        ),
        title: nodeTitle(eventsByYear[year]),
      })),
    [eventsByYear, years],
  );

  return (
    <>
      <RefreshButton onClick={() => rerender()} title="Web is hard">
        Re-Render
      </RefreshButton>
      <ConstructionWarning>🚧 Under construction 🚧</ConstructionWarning>
      <Container>
        <HorizontalLine />
        <Row>
          {" "}
          {nodes.map((node, index) => (
            <>
              <YearNode
                key={node.year}
                index={index}
                node={node}
                diffFromPrevYear={
                  index === 0 ? 1 : node.year - nodes[index - 1].year
                }
              />
            </>
          ))}
        </Row>
      </Container>
    </>
  );
};
