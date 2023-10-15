import {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
  WheelEvent,
} from "react";
import styled from "styled-components";
import { useWindowSize } from "usehooks-ts";

type Props = {
  className?: string;
  children: ReactNode;
};

const StyledContainer = styled.div<{
  isDragging: boolean;
  transformOffsetX: number;
  scale: number;
}>`
  cursor: ${({ isDragging }) => (isDragging ? "grabbing" : "grab")};
  transform-origin: 0 0;
  transform: ${({ transformOffsetX, scale }) =>
    `translate(${transformOffsetX}px, 0) scale(${scale})`};
`;

export const Transformable = ({ className, children }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width: windowWidth } = useWindowSize();
  const [containerInitialWidth, setContainerInitialWidth] =
    useState(windowWidth);
  const [isDragging, setIsDragging] = useState(false);
  const [initialX, setInitialX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (containerRef.current) {
      const timelineWidth = containerRef.current.offsetWidth;
      setContainerInitialWidth(timelineWidth);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;

    const handleMouseDown = (e: MouseEvent) => {
      setIsDragging(true);
      setInitialX(e.clientX - offsetX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) {
        return;
      }
      const x = e.clientX - initialX;
      const maxOffset = (container?.offsetWidth || 0) * scale - windowWidth;
      setOffsetX(Math.max(Math.min(0, x), -maxOffset));
    };

    if (container) {
      container.addEventListener("mousedown", handleMouseDown);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener("mousedown", handleMouseDown);
      }
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [
    containerInitialWidth,
    initialX,
    isDragging,
    offsetX,
    scale,
    windowWidth,
  ]);

  const handleWheel = useCallback((e: WheelEvent<HTMLDivElement>) => {
    setScale((current) => {
      const newScale = e.deltaY > 0 ? current * 0.9 : current * 1.1;
      if (newScale < 0.5) {
        return 0.5;
      } else if (newScale > 2) {
        return 2;
      } else {
        return newScale;
      }
    });
  }, []);

  return (
    <StyledContainer
      ref={containerRef}
      className={className}
      isDragging={isDragging}
      transformOffsetX={offsetX}
      scale={scale}
      onWheel={handleWheel}
    >
      {children}
    </StyledContainer>
  );
};
