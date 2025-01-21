"use client";

import React from "react";

export default function useMouseMove() {
  React.useEffect(() => {
    function mouseMoveEvent(e: MouseEvent) {
      const scale = window.visualViewport?.scale;
      // Disable mouse movement on viewport zoom - causes page to slow down
      if (scale === 1) {
        const body = document.body;

        // Add a slight offset to the mouse position
        const offsetX = 10;
        const offsetY = 10;
        const targetX = e.clientX + offsetX;
        const targetY = e.clientY + offsetY;

        // Update CSS variables for mouse position
        body.style.setProperty('--x', `${targetX}px`);
        body.style.setProperty('--y', `${targetY}px`);
      }
    }

    document.addEventListener("mousemove", mouseMoveEvent);
    return () => {
      document.removeEventListener("mousemove", mouseMoveEvent);
    };
  }, []);
}