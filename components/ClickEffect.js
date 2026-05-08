"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

export default function ClickEffect() {
  const [clicks, setClicks] = useState([]);
  const pathname = usePathname();

  const handleDocumentClick = useCallback((e) => {
    // Check if the click is on a link, button, or input, or within one
    const target = e.target;
    const isClickable = target.closest(
      "a, button, input, select, textarea, [role='button']"
    );
    if (isClickable) return;

    // Create a new click effect
    const newClick = {
      id: Date.now() + Math.random(),
      x: e.clientX,
      y: e.clientY,
    };

    setClicks((prev) => [...prev, newClick]);

    // Remove the click effect after the animation duration (500ms)
    setTimeout(() => {
      setClicks((prev) => prev.filter((click) => click.id !== newClick.id));
    }, 500);
  }, []);

  useEffect(() => {
    if (pathname?.startsWith("/admin") || pathname?.startsWith("/supadmin")) return;

    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [handleDocumentClick, pathname]);

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/supadmin")) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {clicks.map((click) => (
        <div
          key={click.id}
          className="absolute"
          style={{ left: click.x, top: click.y }}
        >
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i * 360) / 6;
            return (
              <div
                key={i}
                className="absolute origin-left"
                style={{
                  transform: `rotate(${angle}deg)`,
                }}
              >
                {/* The line container to handle the outward animation */}
                <div
                  className="h-[2px] w-4 bg-black dark:bg-white rounded-full origin-left"
                  style={{
                    animation: "burst 0.5s ease-out forwards",
                  }}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
