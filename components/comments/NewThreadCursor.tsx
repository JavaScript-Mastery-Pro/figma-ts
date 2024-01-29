"use client";

import { useEffect, useState } from "react";
import * as Portal from "@radix-ui/react-portal";

// display a custom cursor when placing a new thread
function NewThreadCursor({ display }: { display: boolean }) {
  const [coords, setCoords] = useState({
    x: -10000,
    y: -10000,
  });

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      // get canvas element
      const canvas = document.getElementById("canvas");

      if (canvas) {
        /**
         * getBoundingClientRect returns the size of an element and its position relative to the viewport
         *
         * getBoundingClientRect: https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
         */
        const canvasRect = canvas.getBoundingClientRect();

        // check if the mouse is outside the canvas
        // if so, hide the custom comment cursor
        if (
          e.clientX < canvasRect.left ||
          e.clientX > canvasRect.right ||
          e.clientY < canvasRect.top ||
          e.clientY > canvasRect.bottom
        ) {
          setCoords({
            x: -10000,
            y: -10000,
          });
          return;
        }
      }

      // set the coordinates of the cursor
      setCoords({
        x: e.clientX,
        y: e.clientY,
      });
    };

    document.addEventListener("mousemove", updatePosition, false);
    document.addEventListener("mouseenter", updatePosition, false);

    return () => {
      document.removeEventListener("mousemove", updatePosition);
      document.removeEventListener("mouseenter", updatePosition);
    };
  }, []);

  useEffect(() => {
    if (display) {
      document.documentElement.classList.add("hide-cursor");
    } else {
      document.documentElement.classList.remove("hide-cursor");
    }
  }, [display]);

  if (!display) {
    return null;
  }

  return (
    // Portal.Root is used to render a component outside of its parent component
    <Portal.Root>
      <div
        className="fixed top-0 left-0 pointer-events-none select-none w-9 h-9 shadow-2xl rounded-tl-md rounded-tr-full rounded-br-full rounded-bl-full cursor-grab bg-white"
        style={{
          transform: `translate(${coords.x}px, ${coords.y}px)`,
        }}
      />
    </Portal.Root>
  );
}

export default NewThreadCursor;
