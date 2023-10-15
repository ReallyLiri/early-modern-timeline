import { TimelineEvent } from "../data/TimelineEvent";
import { useElementSize, useWindowSize } from "usehooks-ts";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { sortedUniq } from "lodash";
import styled from "styled-components";
import { Transformable } from "./Transformable";

type Props = {
  events: TimelineEvent[];
};

const Container = styled(Transformable)`
  height: 320px;
  width: fit-content;
  background: green;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
`;

export const Timeline = ({ events }: Props) => {
  const years = useMemo(
    () => sortedUniq(events.map((event) => event.year).sort()),
    [events],
  );

  const yearsWat = years
    .flatMap((year) => [year - 1, year, year + 1])
    .filter((y) => !isNaN(y));
  return (
    <Container>
      <Row>
        {" "}
        {yearsWat.map((year) => (
          <div key={year}>{year}</div>
        ))}
      </Row>
    </Container>
  );
};
