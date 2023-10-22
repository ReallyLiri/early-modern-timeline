import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { BACKGROUND_COLOR, SECONDARY_COLOR } from "../theme";
import { Communities, TagDetails } from "../data/data";
import { get, isEmpty } from "lodash";
import { Tag } from "../components/Tag";
import { Paragraph, Sources } from "../components/TableComponent";
import { useWidthAnimation } from "../components/useWidthAnimation";
import { FlexRow } from "../components/FlexRow";

type Props = {
  tagsWithCount: Record<string, number>;
  tagDetails: Record<string, TagDetails>;
  communities: Communities;
};

const HINT_WIDTH = 3;
const HINT_WIDTH_EXTRA = 5;

const Container = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-items: center;
  top: 10rem;
  right: 0;
  border: 2px solid ${BACKGROUND_COLOR};
  border-right: none;
  border-radius: 1rem 0 0 1rem;
  background-color: ${SECONDARY_COLOR};
  color: white;
  z-index: 1;
`;

const Hint = styled.div`
  display: flex;
  flex-direction: initial;
  align-items: center;
  justify-items: center;
  height: 8rem;
  width: ${HINT_WIDTH}rem;
  transition: width 0.2s ease-out;
  user-select: none;
  cursor: pointer;
  padding-left: 1rem;
`;

const Pane = styled.div`
  width: 40vw;
  height: 60vh;
  margin: 1rem;
  background-color: white;
  border-radius: 1rem;
  color: black;
  padding: 0 0.5rem;
  overflow: auto;
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1rem 0;

  > :not(:first-child) {
    font-size: 0.8rem;
    margin-left: 0.5rem;
  }
`;

const Label = styled.div`
  font-weight: bold;
`;

const TagCard = ({
  tag,
  tagsWithCount,
  relatedTags,
  details,
  sources,
}: {
  tag: string;
  tagsWithCount: Record<string, number>;
  relatedTags: string[];
  details: string[];
  sources: string[];
}) => {
  return (
    <Card>
      <Tag tag={tag} count={tagsWithCount[tag]} />
      {details && (
        <Paragraph>
          {details.map((v) => (
            <div key={v}>{v}</div>
          ))}
        </Paragraph>
      )}
      {!isEmpty(relatedTags) && (
        <FlexRow>
          <Label>Related:</Label>{" "}
          {relatedTags
            .sort(
              (a, b) =>
                tagsWithCount[a] - tagsWithCount[b] || a.localeCompare(b),
            )
            .map((tag) => (
              <Tag key={tag} tag={tag} count={tagsWithCount[tag]} />
            ))}
        </FlexRow>
      )}
      {!isEmpty(sources) && (
        <>
          <Label>Sources:</Label>
          <Sources sources={sources} />
        </>
      )}
    </Card>
  );
};

const CloseButton = styled.div`
  position: fixed;
  margin-left: -1.25rem;
  margin-top: -0.75rem;
  background-color: white;
  border-radius: 50%;
  text-align: center;
  padding-bottom: 2px;
  color: ${SECONDARY_COLOR};
  height: 1rem;
  width: 1rem;
  cursor: pointer;
`;

const Divider = styled.div`
  width: 100%;
  height: 2px;
  border-radius: 1rem;
  background-color: ${BACKGROUND_COLOR};
`;

export const TagsPane = ({ tagsWithCount, tagDetails, communities }: Props) => {
  const [collapsed, setCollapsed] = useState(true);
  const paneRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const [openedOnce, setOpenedOnce] = useState(false);
  const shouldStopAnimation = useCallback(() => openedOnce, [openedOnce]);
  useWidthAnimation(hintRef, HINT_WIDTH, HINT_WIDTH_EXTRA, shouldStopAnimation);

  useEffect(() => {
    if (!collapsed) {
      setOpenedOnce(true);
      if (hintRef.current) {
        hintRef.current.style.width = `${HINT_WIDTH}rem`;
      }
    }
  }, [collapsed]);

  useEffect(() => {
    if (collapsed || !paneRef.current) {
      return;
    }
    const clickListener = (event: any) => {
      if (!paneRef.current!.contains(event.target)) {
        setCollapsed(true);
      }
    };
    setTimeout(
      () => document.addEventListener("click", clickListener, false),
      500,
    );
    return () => document.removeEventListener("click", clickListener);
  }, [collapsed]);

  return (
    <Container>
      {collapsed ? (
        <Hint ref={hintRef} onClick={() => setCollapsed(false)}>
          Tags
        </Hint>
      ) : (
        <Pane ref={paneRef}>
          <CloseButton title="Close" onClick={() => setCollapsed(true)}>
            X
          </CloseButton>
          {Object.keys(tagDetails).map((tag, index) => {
            const details = tagDetails[tag];
            return (
              <>
                {index > 0 && <Divider key={`${tag}_div`} />}
                <TagCard
                  key={tag}
                  tag={tag}
                  tagsWithCount={tagsWithCount}
                  relatedTags={details["related_tags"] || []}
                  details={get(details as any, "details") || []}
                  sources={get(details as any, "sources") || []}
                />
              </>
            );
          })}
        </Pane>
      )}
    </Container>
  );
};
