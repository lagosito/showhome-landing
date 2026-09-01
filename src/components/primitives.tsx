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
        "inline-flex items-center gap-2.5 text-[17px] font-semibold tracking-[-0.03em]",
        tone === "dark" ? "text-ink" : "text-paper",
        className,
      )}
    >
      <span
        className={cn(
          "grid h-7 w-7 place-items-center rounded-[9px]",
          tone === "dark" ? "bg-ink text-paper" : "bg-paper text-ink",
        )}
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
          <path
            d="M3 8.6 10 3.2l7 5.4V16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8.6Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
            fill="none"
          />
          <path d="M8.6 9.4v3.6l3.4-1.8-3.4-1.8Z" fill="currentColor" />
        </svg>
      </span>
      ShowHome
    </span>
  );
}
