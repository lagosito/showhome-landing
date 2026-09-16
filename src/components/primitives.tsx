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
        viewBox="0 0 115.4 19.9"
        className="h-[28px] w-auto"
        aria-label="ShowHome"
      >
        <polygon points="10.3 7 3.5 7 3.5 .5 .5 .5 .5 16.6 3.5 16.6 3.5 9.8 10.3 9.8 10.3 16.6 13.3 16.6 13.3 .5 10.3 .5 10.3 7" fill="currentColor" />
        <path d="M86,14.2c-.5,0-.9-.1-1.1-.4s-.3-.7-.3-1.2v-4.7h2.8v-2.5h-2.8v-3.2h-2.9v3.2h-2v2.4c-.5-.8-1.2-1.5-2-2-.9-.5-2-.8-3.2-.8s-2.3.3-3.2.8c-.9.5-1.6,1.3-2.2,2.2-.5.9-.8,2-.8,3.1s.1,1.3.3,1.9c-.4.5-.7.9-1.2,1.3.5-2.8,1-5.2,1.1-7.8,0-.7-.3-1.3-.8-1.5-.4-.2-1.2,0-1.5.5-1.5,1.9-2.7,3.8-4,5.9l-1,1.6c0-2.1,1.8-5.8.4-6.7-1.4-1-3.1,1.1-4.3,2.7.2-1.4.5-2.5.3-3.7-.1-.7-.7-1.4-1.2-1.5-1.7-.6-3.4,1.2-4.7,3-.3-.3-.7-.6-1.1-.9-.8-.5-1.9-.8-3.1-.8s-2.2.3-3,.8-1.6,1.3-2.1,2.2c-.5.9-.8,1.9-.8,3s0,1.3.2,1.8c-.4.5-.8.9-1.2,1.3.5-2.8,1-5.2,1.1-7.8,0-.7-.3-1.3-.8-1.5-.4-.2-1.2,0-1.5.5-1.5,1.9-2.7,3.8-4,5.9l-1,1.6c0-2.1,1.8-5.8.4-6.7-1.4-1-3.1,1.1-4.3,2.7.2-1.4.5-2.5.3-3.7-.1-.7-.7-1.4-1.2-1.5-1.8-.6-3.5,1.2-4.8,3-.4-.4-.8-.8-1.3-1.1-.9-.5-2-.8-3.2-.8s-2.3.3-3.2.8c-.9.5-1.6,1.3-2.2,2.2-.5.9-.8,2-.8,3.1s.3,2.2.8,3.1c.5.9,1.2,1.7,2.2,2.2.9.5,2,.8,3.2.8s2.3-.3,3.2-.8,1.6-1.3,2.1-2.2c.5-.9.8-2,.8-3.1s-.1-1.4-.3-2.1c.3-.4.5-.8.8-1.2.5-.7,1-1.4,1.8-1.6-.5,3.3-1.6,6.1-2.8,9-.3.7-.4,1.5.2,2,.4.3,1.5.6,1.9,0,1.5-2.4,2.9-4.8,4.6-7.1l-1.4,5.9c-.2.7-.2,1.4-.2,2.2,0,.5.7,1,1.1,1,.4,0,1-.3,1.2-.6l1.2-1.6,4.6-7c-.3,2.8-.9,5.4-1.4,8.1-.1.8,0,1.4.8,1.7.5.2,1.1-.1,1.5-.7l3-3.6c.4.5.9.9,1.5,1.3.9.5,1.9.8,3.1.8s2.3-.3,3.2-.8c.9-.5,1.6-1.3,2.1-2.2l-2.4-1.2c-.3.5-.6.9-1.1,1.2-.5.3-1.1.5-1.8.5s-1.1-.1-1.6-.4c-.5-.3-.9-.7-1.2-1.2-.2-.3-.3-.7-.3-1.2h8.6c0,0,0-.2,0-.4,0-.2,0-.4,0-.6,0-.7,0-1.3-.3-1.9.2-.3.5-.7.8-1.2.5-.7,1-1.4,1.8-1.6-.5,3.3-1.6,6.1-2.8,9-.3.7-.4,1.5.2,2,.4.3,1.5.6,1.9,0,1.5-2.4,2.9-4.8,4.6-7.1l-1.4,5.9c-.2.7-.2,1.4-.2,2.2,0,.5.7,1,1.1,1,.4,0,1-.3,1.2-.6l1.2-1.6,4.6-7c-.3,2.8-.9,5.4-1.4,8.1-.1.8,0,1.4.8,1.7.5.2,1.1-.1,1.5-.7l3-3.6c.4.5.9.9,1.4,1.2.9.5,2,.8,3.2.8s2.3-.3,3.2-.8,1.6-1.3,2.1-2.2c.5-.9.8-2,.8-3.1s-.3-2.2-.8-3.1c0,0,0,0,0-.1h2v5.3c0,1.2.3,2.1,1,2.8s1.6,1,2.8,1,.7,0,1-.1.7-.2,1-.3v-2.9c-.3.2-.6.3-.8.4-.2,0-.4.1-.7.1ZM22.7,12.7c-.3.5-.7.9-1.1,1.1s-1,.4-1.6.4-1.1-.1-1.6-.4c-.5-.3-.9-.6-1.2-1.1s-.4-1.1-.4-1.8.1-1.3.4-1.8c.3-.5.7-.9,1.2-1.1.5-.3,1-.4,1.6-.4s1.1.1,1.6.4c.5.3.9.7,1.1,1.1.3.5.4,1.1.4,1.8s-.1,1.3-.4,1.8ZM44.4,9.7c0-.2.1-.4.2-.6.3-.5.6-.9,1.1-1.2.5-.3,1-.5,1.6-.5s.8,0,1.2.2c.3.1.6.3.9.6.2.2.4.5.6.7.1.3.2.5.2.8h-5.7ZM77.1,12.9c-.3.5-.7.9-1.1,1.1s-1,.4-1.6.4-1.1-.1-1.6-.4c-.5-.3-.9-.6-1.2-1.1s-.4-1.1-.4-1.8.1-1.3.4-1.8c.3-.5.7-.9,1.2-1.1.5-.3,1-.4,1.6-.4s1.1.1,1.6.4c.5.3.9.7,1.1,1.1.3.5.4,1.1.4,1.8s-.1,1.3-.4,1.8Z" fill="currentColor" />
        <rect x="88" y="5.3" width="2.9" height="11.5" fill="currentColor" />
        <path d="M89.5,4c.5,0,1-.2,1.3-.6.4-.4.6-.8.6-1.4s-.2-1-.6-1.3c-.4-.4-.8-.6-1.3-.6s-1,.2-1.4.6-.6.8-.6,1.3.2,1,.6,1.4c.4.4.8.6,1.4.6Z" fill="currentColor" />
        <path d="M100.6,5.8c-.9-.5-2-.8-3.2-.8s-2.3.3-3.2.8c-.9.5-1.6,1.3-2.2,2.2-.5.9-.8,2-.8,3.1s.3,2.2.8,3.1c.5.9,1.2,1.7,2.2,2.2.9.5,2,.8,3.2.8s2.3-.3,3.2-.8,1.6-1.3,2.1-2.2c.5-.9.8-2,.8-3.1s-.3-2.2-.8-3.1-1.2-1.6-2.1-2.2ZM100.2,12.9c-.3.5-.7.9-1.1,1.1s-1,.4-1.6.4-1.1-.1-1.6-.4c-.5-.3-.9-.6-1.2-1.1s-.4-1.1-.4-1.8.1-1.3.4-1.8c.3-.5.7-.9,1.2-1.1.5-.3,1-.4,1.6-.4s1.1.1,1.6.4c.5.3.9.7,1.1,1.1.3.5.4,1.1.4,1.8s-.1,1.3-.4,1.8Z" fill="currentColor" />
        <path d="M113.6,6.2c-.7-.9-1.8-1.3-3.2-1.3s-1.4.2-2,.5c-.6.3-1.1.8-1.5,1.3h-.2v-1.4h-2.8v11.5h2.9v-5.9c0-.6.1-1.1.3-1.6s.5-.9.9-1.2c.4-.3.9-.4,1.4-.4s1.2.2,1.6.6c.4.4.6,1,.6,1.7v6.8h2.9v-7.1c0-1.4-.4-2.6-1.1-3.4Z" fill="currentColor" />
      </svg>
    </span>
  );
}
