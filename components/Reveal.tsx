"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  as?: keyof React.JSX.IntrinsicElements;
  once?: boolean;
};

export function Reveal({
  children,
  className = "",
  delayMs = 0,
  as = "div",
  once = true,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { rootMargin: "0px 0px -80px 0px", threshold: 0.1 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  const Tag = as as React.ElementType;
  return (
    <Tag
      ref={ref as React.RefObject<HTMLElement>}
      className={`reveal ${visible ? "revealed" : ""} ${className}`}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </Tag>
  );
}
