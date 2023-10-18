import { ReactElement, useState } from "react";
import styled from "styled-components";
import { BACKGROUND_COLOR, MAIN_COLOR, SECONDARY_COLOR } from "../theme";

type Props = {
  titles: string[];
  children: ReactElement[];
};

const TitlesRow = styled.div`
    display: flex;
    flex-direction: row;
  align-items: center;
  justify-content: center;
`

const TabTitle = styled.div<{isFirst: boolean, isLast: boolean, selected: boolean}>`
  font-weight: bolder;
  border-radius: 1rem 1rem 0 0;
  width: 100%;
  background-color: ${({selected}) => selected ? 'unset' : BACKGROUND_COLOR};
  cursor: pointer;
  text-align: center;
  padding: 1rem 0;
  border: solid ${({selected}) => selected ? MAIN_COLOR : SECONDARY_COLOR};
  border-bottom: solid ${MAIN_COLOR};
  border-width: ${({isFirst, isLast, selected}) => `2px ${isLast ? 0 : 1}px ${selected ? 0 : 2}px ${isFirst ? 0 : 1}px}`};
`

export const Tabs = ({titles, children}: Props) => {
    const [selected, setSelected] = useState(0)
    return <>
        <TitlesRow>
            {
                titles.map((title, i) => {
                    return <TabTitle key={title} isFirst={i === 0} isLast={i === titles.length - 1} selected={i === selected} onClick={() => setSelected(i)}>{title}</TabTitle>
                })
            }
        </TitlesRow>
        {children[selected]}
    </>
}
