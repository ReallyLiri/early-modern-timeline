import React from "react";
import styled, { css } from "styled-components";
import { Transformable } from "./Transformable";
import { TIMELINE_COLOR } from "../theme";

export type TimelineNode = {
    year: number;
    tags: string[];
    title: string;
};

type Props = {
    nodes: TimelineNode[];
    onYearSelected: (year: number) => void;
};

const NodeWidthRem = 1.5
const NodeYearDiffPx = 10

const Container = styled(Transformable)`
  width: fit-content;
  border: solid black;
  border-width: 1px 0;
  margin: 2rem 0;
  padding: 2rem 0;
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
  background-color: ${TIMELINE_COLOR};
  top: ${ NodeWidthRem * 0.7 }rem;
  z-index: 0;
  margin: 0 1rem;
  border-radius: 1rem;
`;

const YearNode = styled.div<{ diffFromPrevYear: number }>`
  cursor: pointer;
  height: ${ NodeWidthRem }rem;
  width: ${ NodeWidthRem }rem;
  border-radius: 50%;
  background-color: white;
  border: solid ${TIMELINE_COLOR};
  z-index: 1;
  margin-left: ${ ({ diffFromPrevYear }) => ( diffFromPrevYear - 1 ) * NodeYearDiffPx }px;
`;

const YearNodeTitle = styled.div<{index: number}>`
  position: relative;
  width: 0;
  font-size: 0.8rem;
  text-wrap: nowrap;
  ${({index}) => index %2 === 0 && css`top: 2rem;`}
  ${({index}) => index %2 === 1 && css`bottom: 1rem;`}
`

export const Timeline = ({ nodes }: Props) => {
    return (
        <Container>
        <HorizontalLine/>
        <Row>
            { " " }
            { nodes.map((node, index) => (
                <>
                    <YearNodeTitle index={index}>{ node.title }</YearNodeTitle>
                    <YearNode key={ node.year } title={ `${ node.year }` } diffFromPrevYear={ index === 0 ? 1 : node.year - nodes[index - 1].year }/>
                </>
            )) }
        </Row>
        </Container>
    );
};
