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
        className,
      )}
      style={tone === "dark" ? { color: "var(--ink)" } : { color: "white" }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 108.57 19.17"
        className="h-[24px] w-auto"
        aria-label="ShowHome"
      >
        <path d="M8.22,5.72c-.64-.36-1.37-.54-2.19-.54s-1.56.18-2.19.54c-.34.19-.63.42-.89.69V0H0v16.27h2.95v-6.23c0-.44.09-.82.28-1.15.19-.33.45-.59.78-.77.33-.18.71-.27,1.12-.27.64,0,1.17.2,1.58.61s.61.93.61,1.58v6.23h2.95v-6.89c0-.83-.18-1.55-.54-2.18-.36-.63-.86-1.13-1.5-1.49Z" fill="currentColor" />
        <path d="M85.01,3.8c.5,0,.9-.16,1.2-.48.31-.32.46-.72.46-1.2s-.15-.86-.46-1.19-.71-.5-1.2-.5-.88.17-1.19.5c-.32.33-.47.73-.47,1.19s.16.88.47,1.2c.31.32.71.48,1.19.48Z" fill="currentColor" />
        <path d="M83.52,5.56h-2.41V1.03h-2.95v4.52h-2.54v2.01c-.46-.61-1.03-1.11-1.72-1.5-.88-.5-1.87-.75-2.98-.75s-2.06.25-2.95.75c-.88.5-1.58,1.18-2.09,2.02-.51.85-.76,1.8-.76,2.87,0,.67.11,1.3.32,1.89-.32.38-.64.74-1.05,1.09.48-2.8.97-5.17,1.06-7.84.02-.65-.29-1.28-.84-1.48-.44-.16-1.2.07-1.54.5-1.49,1.88-2.74,3.83-4.02,5.86l-1.02,1.62c.03-2.08,1.81-5.79.42-6.74-1.41-.97-3.13,1.08-4.31,2.74.17-1.38.54-2.51.29-3.74-.14-.69-.68-1.36-1.16-1.52-1.99-.71-3.93,1.74-5.26,3.75-.36-.41-.77-.77-1.26-1.05-.8-.47-1.73-.71-2.78-.71s-2.03.25-2.9.75-1.56,1.18-2.06,2.02c-.5.85-.75,1.81-.75,2.89,0,.64.1,1.23.27,1.78-.33.39-.65.75-1.07,1.11.48-2.8.97-5.17,1.06-7.84.02-.65-.29-1.28-.84-1.48-.44-.16-1.2.07-1.54.5-1.49,1.88-2.74,3.83-4.02,5.86l-1.02,1.62c.03-2.08,1.81-5.79.42-6.74-1.41-.97-3.13,1.08-4.31,2.74.17-1.38.54-2.51.29-3.74-.14-.69-.68-1.36-1.16-1.52-2.01-.71-3.97,1.78-5.29,3.81-.41-.46-.89-.86-1.45-1.18-.88-.5-1.87-.75-2.98-.75s-2.06.25-2.95.75c-.88.5-1.58,1.18-2.09,2.02-.51.85-.76,1.8-.76,2.87s.26,2.03.78,2.89c.52.86,1.21,1.55,2.09,2.05.88.5,1.86.75,2.96.75s2.08-.25,2.96-.75c.88-.5,1.57-1.18,2.08-2.05.51-.86.77-1.83.77-2.89,0-.51-.06-1-.18-1.46.44-.72.91-1.42,1.36-2.11.47-.71.99-1.38,1.8-1.64-.49,3.27-1.62,6.09-2.8,8.98-.3.74-.44,1.47.21,1.99.43.35,1.47.61,1.88-.06,1.5-2.44,2.86-4.8,4.63-7.12l-1.35,5.92c-.16.7-.24,1.45-.17,2.17.05.53.65.97,1.11,1,.44.03.95-.26,1.23-.63l1.16-1.58,4.59-6.98c-.29,2.83-.87,5.4-1.38,8.11-.14.76.04,1.37.84,1.67.5.19,1.06-.12,1.52-.67l2.9-3.52c.39.41.84.77,1.36,1.06.89.49,1.9.73,3.04.73.89,0,1.71-.16,2.46-.47.76-.32,1.4-.78,1.92-1.4l-1.73-1.73c-.33.38-.72.66-1.17.84s-.95.28-1.51.28c-.62,0-1.16-.13-1.62-.39-.46-.26-.82-.64-1.07-1.12-.1-.19-.16-.41-.22-.62l7.93-.02c.06-.25.1-.48.12-.69.02-.2.03-.4.03-.6,0-.49-.05-.94-.16-1.38.33-.56.66-.98,1.38-2.08.47-.71.99-1.38,1.8-1.64-.49,3.27-1.62,6.09-2.8,8.98-.3.74-.44,1.47.21,1.99.43.35,1.47.61,1.88-.06,1.5-2.44,2.86-4.8,4.63-7.12l-1.35,5.92c-.16.7-.24,1.45-.17,2.17.05.53.65.97,1.11,1,.44.03.95-.26,1.23-.63l1.16-1.58,4.59-6.98c-.29,2.83-.87,5.4-1.38,8.11-.14.76.04,1.37.84,1.67.5.19,1.06-.12,1.52-.67l2.92-3.54c.37.38.79.71,1.27.99.88.5,1.86.75,2.96.75s2.08-.25,2.96-.75c.88-.5,1.57-1.18,2.08-2.05.51-.86.77-1.83.77-2.89s-.25-1.98-.74-2.81h2.15v8.28h2.95v-8.28h2.41v8.28h2.97V5.56h-2.97ZM19.07,12.34c-.23.44-.56.79-.99,1.04-.43.25-.92.37-1.47.37s-1.02-.12-1.44-.37c-.42-.25-.75-.59-.99-1.04-.24-.44-.36-.95-.36-1.52s.12-1.07.36-1.51c.24-.43.57-.78.99-1.02s.9-.37,1.44-.37,1.04.12,1.46.37.75.59.99,1.02c.24.44.36.94.36,1.51s-.12,1.08-.35,1.52ZM41.24,9.84c.05-.2.11-.4.19-.57.23-.47.57-.84,1-1.1.43-.26.95-.39,1.53-.39.55,0,1.02.12,1.41.35.38.23.68.57.88,1,.1.21.17.44.23.7l-5.24.02ZM73.38,12.5c-.23.44-.56.79-.99,1.04-.43.25-.92.37-1.47.37s-1.02-.12-1.44-.37c-.42-.25-.75-.59-.99-1.04-.24-.44-.36-.95-.36-1.52s.12-1.07.36-1.51c.24-.43.57-.78.99-1.02s.9-.37,1.44-.37,1.04.12,1.46.37.75.59.99,1.02c.24.44.36.94.36,1.51s-.12,1.08-.35,1.52Z" fill="currentColor" />
        <path d="M95.37,6.06c-.88-.5-1.87-.75-2.98-.75s-2.06.25-2.95.75c-.88.5-1.58,1.18-2.09,2.02-.51.85-.76,1.8-.76,2.87s.26,2.03.78,2.89c.52.86,1.21,1.55,2.09,2.05.88.5,1.86.75,2.96.75s2.08-.25,2.96-.75c.88-.5,1.57-1.18,2.08-2.05.51-.86.77-1.83.77-2.89s-.26-2.02-.77-2.87c-.51-.85-1.2-1.52-2.08-2.02ZM94.85,12.5c-.23.44-.56.79-.99,1.04-.43.25-.92.37-1.47.37s-1.02-.12-1.44-.37c-.42-.25-.75-.59-.99-1.04-.24-.44-.36-.95-.36-1.52s.12-1.07.36-1.51c.24-.43.57-.78.99-1.02s.9-.37,1.44-.37,1.04.12,1.46.37.75.59.99,1.02c.24.44.36.94.36,1.51s-.12,1.08-.35,1.52Z" fill="currentColor" />
        <path d="M108.03,7.48c-.36-.64-.85-1.15-1.49-1.55-.63-.4-1.34-.6-2.14-.6s-1.56.18-2.22.54c-.36.2-.66.44-.93.72v-1.04h-2.95v10.87h2.95v-6.23c0-.44.09-.82.28-1.15s.45-.59.78-.77.71-.27,1.12-.27c.65,0,1.17.2,1.58.61.41.41.61.93.61,1.58v6.23h2.95v-6.89c0-.74-.18-1.42-.54-2.06Z" fill="currentColor" />
      </svg>
    </span>
  );
}
