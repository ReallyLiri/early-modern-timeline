import styled from "styled-components";
import stc from "string-to-color";
import { startCase } from "lodash";

export const TagCircle = styled.div<{
  tag: string;
  color?: string;
  border?: string;
}>`
  display: inline-block;
  height: 0.5rem;
  width: 0.5rem;
  border-radius: 50%;
  margin-bottom: 2px;
  background-color: ${({ tag, color }) => color || stc(tag)};
  border: ${({ border }) => (border ? `2px solid ${border}` : "none")};
`;

const getTagName = (tag: string) => {
  return startCase(tag)
    .replaceAll(" On ", " on ")
    .replaceAll(" Of ", " of ")
    .replaceAll(" And ", " and ");
};

export const Tag = ({ tag, count }: { tag: string; count?: number }) => {
  return (
    <span>
      <TagCircle tag={tag} /> {getTagName(tag)}
      {count && ` (${count})`}
    </span>
  );
};
