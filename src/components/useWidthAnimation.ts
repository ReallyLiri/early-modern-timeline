import { RefObject, useEffect } from "react";

export const useWidthAnimation = (
  ref: RefObject<HTMLElement>,
  fromWidth: number,
  toWidth: number,
  stop: () => boolean,
) => {
  useEffect(() => {
    if (!ref.current || stop()) {
      return;
    }
    const element = ref.current;
    let index = 0;
    const it = setInterval(() => {
      element.style.width = (index === 0 ? toWidth : fromWidth) + "rem";
      index = 1 - index;
    }, 500);
    return () => clearInterval(it);
  }, [fromWidth, ref, stop, toWidth]);
};
