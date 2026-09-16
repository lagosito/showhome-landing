"use client";

import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";

export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1200px] px-5 sm:px-8", className)}>
      {children}
    </div>
  );
}

/** Scroll reveal with IntersectionObserver. */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={cn("reveal", shown && "reveal-in", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

type BtnProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost" | "light";
  size?: "md" | "lg";
  className?: string;
  icon?: ReactNode;
};

export function Button({
  children,
  href = "#cta",
  variant = "primary",
  size = "md",
  className,
  icon,
}: BtnProps) {
  return (
    <a
      href={href}
      className={cn(
        "group inline-flex select-none items-center justify-center gap-2 rounded-full font-medium tracking-[-0.01em] transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay",
        size === "lg"
          ? "px-7 py-4 text-[15px] sm:text-base"
          : "px-5 py-2.5 text-[14.5px]",
        variant === "primary" &&
          "bg-ink text-paper shadow-[0_1px_2px_rgba(13,14,16,.2),0_12px_28px_-12px_rgba(13,14,16,.55)] hover:-translate-y-0.5 hover:bg-[#1b1d20] hover:shadow-[0_1px_2px_rgba(13,14,16,.2),0_20px_36px_-14px_rgba(13,14,16,.6)]",
        variant === "secondary" &&
          "border border-line-2 bg-white/70 text-ink backdrop-blur hover:-translate-y-0.5 hover:border-ink/25 hover:bg-white",
        variant === "light" &&
          "bg-paper text-ink hover:-translate-y-0.5 hover:bg-white",
        variant === "ghost" && "text-ink hover:text-clay",
        className,
      )}
    >
      {children}
      {icon}
    </a>
  );
}

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={cn(
        "h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5",
        className,
      )}
    >
      <path
        d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.18em] text-clay",
        className,
      )}
    >
      <span className="h-1 w-1 rounded-full bg-clay" aria-hidden="true" />
      {children}
    </span>
  );
}

export function SectionHead({
  eyebrow,
  title,
  sub,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  sub?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
      )}
      <Reveal delay={60}>
        <h2 className="mt-5 text-balance text-[clamp(2rem,4.4vw,3.35rem)] font-semibold leading-[1.03] tracking-[-0.035em] text-ink">
          {title}
        </h2>
      </Reveal>
      {sub && (
        <Reveal delay={120}>
          <p className="mt-5 text-pretty text-[17px] leading-relaxed text-ink-3">
            {sub}
          </p>
        </Reveal>
      )}
    </div>
  );
}

export function Logo({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center",
        tone === "dark" ? "text-ink" : "text-white",
        className,
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 114.18 19.28"
        className="h-[19px] w-auto"
        aria-label="ShowHome"
      >
        <g>
          {/* house outline dots — invisible, cls-1 style: fill:none */}
          <path d="M75.48,7.85c-.47-.27-.99-.4-1.56-.4s-1.08.13-1.56.4c-.49.27-.88.65-1.17,1.15-.29.5-.44,1.1-.44,1.8s.15,1.31.44,1.81.68.88,1.17,1.15c.49.26,1.01.39,1.56.39s1.09-.13,1.56-.39.85-.64,1.15-1.15c.29-.5.44-1.11.44-1.81s-.15-1.31-.44-1.8c-.29-.49-.67-.88-1.15-1.15Z" fill="none" />
          <path d="M48.88,7.89c-.24-.23-.53-.41-.87-.55-.34-.14-.72-.21-1.16-.21-.57,0-1.09.15-1.56.45-.47.3-.84.72-1.11,1.25-.09.18-.15.39-.21.6h5.7c-.02-.25-.09-.52-.23-.79-.13-.27-.32-.52-.56-.74Z" fill="none" />
          <path d="M21.12,7.7c-.47-.27-.99-.4-1.56-.4s-1.08.13-1.56.4c-.49.27-.88.65-1.17,1.15-.29.5-.44,1.1-.44,1.8s.15,1.31.44,1.81.68.88,1.17,1.15c.49.26,1.01.39,1.56.39s1.09-.13,1.56-.39.85-.64,1.15-1.15c.29-.5.44-1.11.44-1.81s-.15-1.31-.44-1.8c-.29-.49-.67-.88-1.15-1.15Z" fill="none" />
          <path d="M98.55,7.85c-.47-.27-.99-.4-1.56-.4s-1.08.13-1.56.4c-.49.27-.88.65-1.17,1.15-.29.5-.44,1.1-.44,1.8s.15,1.31.44,1.81.68.88,1.17,1.15c.49.26,1.01.39,1.56.39s1.09-.13,1.56-.39.85-.64,1.15-1.15c.29-.5.44-1.11.44-1.81s-.15-1.31-.44-1.8c-.29-.49-.67-.88-1.15-1.15Z" fill="none" />
          {/* house icon */}
          <polygon points="9.81 6.71 3.04 6.71 3.04 .27 0 .27 0 16.38 3.04 16.38 3.04 9.59 9.81 9.59 9.81 16.38 12.85 16.38 12.85 .27 9.81 .27 9.81 6.71" fill="currentColor" />
          {/* "Show" */}
          <path d="M85.51,13.95c-.51,0-.88-.13-1.1-.39s-.34-.67-.34-1.23v-4.75h2.81v-2.52h-2.81V1.82h-2.95v3.24h-2v2.44c-.51-.82-1.18-1.49-2.03-1.99-.92-.54-1.97-.81-3.17-.81s-2.26.27-3.18.8c-.92.53-1.64,1.26-2.16,2.18-.52.92-.78,1.96-.78,3.12,0,.69.1,1.34.29,1.95-.38.47-.74.88-1.22,1.3.48-2.8.97-5.17,1.06-7.84.02-.65-.29-1.28-.84-1.48-.44-.16-1.2.07-1.54.5-1.49,1.88-2.74,3.83-4.02,5.86l-1.02,1.62c.03-2.08,1.81-5.79.42-6.74-1.41-.97-3.13,1.08-4.31,2.74.17-1.38.54-2.51.29-3.74-.14-.69-.68-1.36-1.16-1.53-1.74-.62-3.43,1.16-4.72,2.96-.31-.34-.68-.64-1.09-.9-.84-.52-1.88-.79-3.11-.79-1.14,0-2.15.28-3.04.84s-1.58,1.31-2.09,2.24c-.51.93-.77,1.94-.77,3.04,0,.65.09,1.26.25,1.83-.39.48-.76.9-1.25,1.33.48-2.8.97-5.17,1.06-7.84.02-.65-.29-1.28-.84-1.48-.44-.16-1.2.07-1.54.5-1.49,1.88-2.74,3.83-4.02,5.86l-1.02,1.62c.03-2.08,1.81-5.79.42-6.74-1.41-.97-3.13,1.08-4.31,2.74.17-1.38.54-2.51.29-3.74-.14-.69-.68-1.36-1.16-1.52-1.76-.62-3.47,1.21-4.76,3.03-.38-.41-.82-.77-1.32-1.06-.92-.54-1.97-.81-3.17-.81s-2.26.27-3.18.8c-.92.53-1.64,1.26-2.16,2.18-.52.92-.78,1.96-.78,3.12s.26,2.19.78,3.12c.52.92,1.24,1.65,2.16,2.18.92.53,1.98.8,3.18.8s2.26-.27,3.17-.8,1.63-1.26,2.15-2.18c.52-.92.78-1.96.78-3.12,0-.75-.12-1.45-.34-2.1.26-.4.53-.81.79-1.2.47-.71.99-1.38,1.8-1.64-.49,3.27-1.62,6.09-2.8,8.98-.3.74-.44,1.47.21,1.99.43.35,1.47.61,1.88-.06,1.5-2.44,2.86-4.8,4.63-7.12l-1.35,5.92c-.16.7-.24,1.45-.17,2.17.05.53.65.97,1.11,1,.44.03.95-.26,1.23-.63l1.16-1.58,4.59-6.98c-.29,2.83-.87,5.4-1.38,8.11-.14.76.04,1.37.84,1.67.5.19,1.06-.12,1.52-.67l3-3.64c.42.5.91.92,1.5,1.26.91.53,1.94.79,3.09.79,1.28,0,2.35-.27,3.22-.82.87-.55,1.58-1.29,2.12-2.24l-2.39-1.17c-.27.47-.65.85-1.12,1.16-.48.31-1.07.46-1.78.46-.6,0-1.14-.14-1.63-.42-.49-.28-.87-.68-1.16-1.21-.18-.33-.28-.73-.35-1.16h8.58c.01-.08.03-.2.04-.37.01-.17.02-.38.02-.62,0-.68-.1-1.32-.28-1.93.21-.3.46-.67.81-1.2.47-.71.99-1.38,1.8-1.64-.49,3.27-1.62,6.09-2.8,8.98-.3.74-.44,1.47.21,1.99.43.35,1.47.61,1.88-.06,1.5-2.44,2.86-4.8,4.63-7.12l-1.35,5.92c-.16.7-.24,1.45-.17,2.17.05.53.65.97,1.11,1,.44.03.95-.26,1.23-.63l1.16-1.58,4.59-6.98c-.29,2.83-.87,5.4-1.38,8.11-.14.76.04,1.37.84,1.67.5.19,1.06-.12,1.52-.67l3.01-3.65c.41.47.89.87,1.45,1.19.92.53,1.98.8,3.18.8s2.26-.27,3.17-.8,1.63-1.26,2.15-2.18c.52-.92.78-1.96.78-3.12s-.26-2.19-.78-3.11c-.02-.04-.05-.07-.07-.11h1.95v5.29c0,1.2.34,2.14,1.01,2.82s1.6,1.02,2.79,1.02c.36,0,.71-.03,1.05-.1s.67-.16,1-.28v-2.88c-.31.2-.58.33-.79.39-.21.07-.44.1-.68.1Z" fill="currentColor" />
          {/* "o" */}
          <path d="M22.27,12.46c-.29.5-.67.88-1.15,1.15s-.99.39-1.56.39-1.08-.13-1.56-.39c-.49-.26-.88-.64-1.17-1.15s-.44-1.11-.44-1.81.15-1.31.44-1.8c.29-.49.68-.88,1.17-1.15.49-.27,1.01-.4,1.56-.4s1.09.13,1.56.4c.47.27.85.65,1.15,1.15.29.5.44,1.1.44,1.8s-.15,1.31-.44,1.81Z" fill="currentColor" />
          <path d="M48.88,7.89c-.24-.23-.53-.41-.87-.55-.34-.14-.72-.21-1.16-.21-.57,0-1.09.15-1.56.45-.47.3-.84.72-1.11,1.25-.09.18-.15.39-.21.6h5.7c-.02-.25-.09-.52-.23-.79-.13-.27-.32-.52-.56-.74Z" fill="currentColor" />
          <path d="M43.97,9.42c.06-.21.12-.42.21-.6.27-.53.64-.95,1.11-1.25.47-.3.99-.45,1.56-.45.44,0,.82.07,1.16.21.34.14.63.33.87.55.24.22.43.47.56.74.14.27.21.53.23.79h-5.7Z" fill="currentColor" />
          {/* "H" */}
          <rect x="87.51" y="5.06" width="2.95" height="11.48" fill="currentColor" />
          <circle cx="89" cy="3.8" r="1.35" fill="currentColor" />
          {/* "om" */}
          <path d="M100.16,5.51c-.92-.54-1.97-.81-3.17-.81s-2.26.27-3.18.8c-.92.53-1.64,1.26-2.16,2.18-.52.92-.78,1.96-.78,3.12s.26,2.19.78,3.12c.52.92,1.24,1.65,2.16,2.18.92.53,1.98.8,3.18.8s2.26-.27,3.17-.8,1.63-1.26,2.15-2.18c.52-.92.78-1.96.78-3.12s-.26-2.19-.78-3.11-1.23-1.64-2.15-2.18Z" fill="currentColor" />
          <path d="M99.7,12.61c-.29.5-.67.88-1.15,1.15s-.99.39-1.56.39-1.08-.13-1.56-.39c-.49-.26-.88-.64-1.17-1.15s-.44-1.11-.44-1.81.15-1.31.44-1.8c.29-.49.68-.88,1.17-1.15.49-.27,1.01-.4,1.56-.4s1.09.13,1.56.4c.47.27.85.65,1.15,1.15.29.5.44,1.1.44,1.8s-.15,1.31-.44,1.81Z" fill="currentColor" />
          {/* "e" */}
          <path d="M113.12,5.99c-.71-.85-1.76-1.28-3.17-1.28-.74,0-1.42.16-2.05.48-.63.32-1.12.76-1.46,1.32h-.18v-1.44h-2.77v11.48h2.95v-5.85c0-.6.11-1.14.33-1.63s.52-.88.92-1.17c.4-.29.87-.44,1.41-.44.66,0,1.18.2,1.56.6.38.4.57.97.57,1.72v6.77h2.95v-7.13c0-1.42-.35-2.57-1.06-3.42Z" fill="currentColor" />
        </g>
      </svg>
    </span>
  );
}
