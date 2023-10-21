import { RefObject, useEffect } from "react";

export const useWidthAnimation = (config: {
  ref: RefObject<HTMLElement>;
  initialWidth: string;
  finalWidth: string;
  animationDuration: number;
  repeatCount: number;
}) => {
  const { ref, initialWidth, finalWidth, animationDuration, repeatCount } =
    config;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleAnimationEnd = () => {
      if (repeatCount > 0) {
        element.style.transition = "none";
        element.style.width = initialWidth;
        setTimeout(() => {
          element.style.transition = `width ${
            animationDuration
          }s ease-out`;
          element.style.width = finalWidth;
        }, 10);
      }

      if (repeatCount > 0) {
        config.repeatCount--;
      }
    };

    element.style.width = initialWidth;
    element.style.transition = `width ${animationDuration}s ease-out`;

    element.addEventListener("transitionend", handleAnimationEnd);

    return () => {
      element.removeEventListener("transitionend", handleAnimationEnd);
    };
  }, [
    initialWidth,
    finalWidth,
    animationDuration,
    repeatCount,
    ref,
    config.repeatCount,
  ]);
};
