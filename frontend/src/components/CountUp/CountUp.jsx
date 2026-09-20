import { useEffect, useRef } from "react";

const CountUp = ({
  from = 0,
  to,
  duration = 2000,
  separator = "",
  className = "",
}) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) return;

    let startTime = null;
    let animationFrame;

    const formatNumber = (value) => {
      const roundedValue = Math.round(value);

      if (!separator) {
        return roundedValue.toString();
      }

      return roundedValue
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    };

    const animate = (currentTime) => {
      if (!startTime) {
        startTime = currentTime;
      }

      const elapsed = currentTime - startTime;

      const progress = Math.min(
        elapsed / duration,
        1
      );

      // Ease-out animation
      const easedProgress =
        1 - Math.pow(1 - progress, 3);

      const currentValue =
        from + (to - from) * easedProgress;

      element.textContent =
        formatNumber(currentValue);

      if (progress < 1) {
        animationFrame =
          requestAnimationFrame(animate);
      }
    };

    animationFrame =
      requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [from, to, duration, separator]);

  return (
    <span
      ref={elementRef}
      className={className}
    >
      {from}
    </span>
  );
};

export default CountUp;