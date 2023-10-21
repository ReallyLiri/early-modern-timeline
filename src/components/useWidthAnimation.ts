import { RefObject, useEffect } from "react";

const TRANSITION = "width 0.2s ease-out";

export const useWidthAnimation = (
  ref: RefObject<HTMLElement>,
  fromWidth: number,
  toWidth: number,
) => {
  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const element = ref.current;
    element.style.transition = TRANSITION;
    element.style.width = toWidth + "rem";
    setTimeout(() => {
      element.style.width = fromWidth + "rem";
    }, 500);
    setTimeout(() => {
      element.style.width = toWidth + "rem";
    }, 1000);
    setTimeout(() => {
      element.style.width = fromWidth + "rem";
    }, 1500);
  }, [fromWidth, ref, toWidth]);
};
