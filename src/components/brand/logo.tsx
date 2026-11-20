import Link from "next/link";

type LogoProps = {
  href?: string;
  tone?: "default" | "inverse";
};

export function Logo({ href = "/", tone = "default" }: LogoProps) {
  const inverse = tone === "inverse";
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2.5 text-sm font-semibold tracking-tight ${
        inverse ? "text-forest-foreground" : "text-foreground"
      }`}
    >
      <span
        aria-hidden
        className={`flex size-8 items-center justify-center rounded-md ${
          inverse ? "bg-forest-foreground text-forest" : "bg-forest text-forest-foreground"
        }`}
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1Z" strokeLinejoin="round" />
        </svg>
      </span>
      HomelyBlock
    </Link>
  );
}
