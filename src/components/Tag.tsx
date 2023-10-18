import styled from "styled-components";
import stc from "string-to-color";
import { startCase } from "lodash";

const TagCircle = styled.div<{ tag: string }>`
  display: inline-block;
  height: 0.5rem;
  width: 0.5rem;
  border-radius: 50%;
  margin-bottom: 2px;
  background-color: ${({ tag }) => stc(tag)};
`;

export const Tag = ({ tag }: { tag: string }) => {
    return (
        <span>
      <TagCircle tag={tag} /> {startCase(tag)}
    </span>
    );
};
