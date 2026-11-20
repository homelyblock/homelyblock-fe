"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  ChevronDown,
  IdCard,
  KeyRound,
  LayoutDashboard,
  Megaphone,
  MessageSquareWarning,
  Receipt,
  Users,
  type LucideIcon,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Metric } from "@/features/dashboard/components/metric";
import { useI18n } from "@/i18n/provider";

const primaryLink =
  "inline-flex h-12 items-center justify-center rounded-lg bg-primary px-5 text-base font-medium text-primary-foreground hover:bg-[var(--theme-primary-hover)]";
const secondaryLink =
  "inline-flex h-12 items-center justify-center rounded-lg border border-border bg-card px-5 text-base font-medium text-foreground hover:bg-accent";
const textLink = "inline-flex text-base font-medium text-accent-strong underline-offset-4 hover:underline";

const PREVIEW_NAV: { key: string; icon: LucideIcon }[] = [
  { key: "overview", icon: LayoutDashboard },
  { key: "residents", icon: Users },
  { key: "notices", icon: Megaphone },
  { key: "visitors", icon: IdCard },
  { key: "billing", icon: Receipt },
  { key: "complaints", icon: MessageSquareWarning },
];

export function LandingContent({ signedIn }: { signedIn: boolean }) {
  const { t } = useI18n();
  const primaryHref = signedIn ? "/societies" : "/sign-up";
  const primaryLabel = signedIn ? t("landing.openSocieties") : t("landing.getStarted");

  const values: { title: string; body: string; icon: LucideIcon }[] = [
    { title: t("landing.value1Title"), body: t("landing.value1Body"), icon: Receipt },
    { title: t("landing.value2Title"), body: t("landing.value2Body"), icon: Users },
    { title: t("landing.value3Title"), body: t("landing.value3Body"), icon: KeyRound },
    { title: t("landing.value4Title"), body: t("landing.value4Body"), icon: Megaphone },
  ];

  const problems = [
    [t("landing.problem1Before"), t("landing.problem1After")],
    [t("landing.problem2Before"), t("landing.problem2After")],
    [t("landing.problem3Before"), t("landing.problem3After")],
    [t("landing.problem4Before"), t("landing.problem4After")],
    [t("landing.problem5Before"), t("landing.problem5After")],
    [t("landing.problem6Before"), t("landing.problem6After")],
  ];

  const features: { title: string; body: string; icon: LucideIcon }[] = [
    { title: t("landing.group1Title"), body: t("landing.group1Body"), icon: Users },
    { title: t("landing.group2Title"), body: t("landing.group2Body"), icon: Receipt },
    { title: t("landing.group3Title"), body: t("landing.group3Body"), icon: IdCard },
    { title: t("landing.group4Title"), body: t("landing.group4Body"), icon: MessageSquareWarning },
    { title: t("landing.group5Title"), body: t("landing.group5Body"), icon: Megaphone },
    { title: t("landing.group6Title"), body: t("landing.group6Body"), icon: LayoutDashboard },
  ];

  const steps = [
    [t("landing.step1Title"), t("landing.step1Body")],
    [t("landing.step2Title"), t("landing.step2Body")],
    [t("landing.step3Title"), t("landing.step3Body")],
  ];

  const audiences = [
    [t("landing.adminTitle"), t("landing.adminBody")],
    [t("landing.residentTitle"), t("landing.residentBody")],
    [t("landing.gateTitle"), t("landing.gateBody")],
  ];

  const safeguards = [
    [t("landing.security1Title"), t("landing.security1Body")],
    [t("landing.security2Title"), t("landing.security2Body")],
    [t("landing.security3Title"), t("landing.security3Body")],
    [t("landing.security4Title"), t("landing.security4Body")],
  ];

  const questions = [
    [t("landing.q1"), t("landing.a1")],
    [t("landing.q2"), t("landing.a2")],
    [t("landing.q3"), t("landing.a3")],
    [t("landing.q4"), t("landing.a4")],
    [t("landing.q5"), t("landing.a5")],
    [t("landing.q6"), t("landing.a6")],
  ];

  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:py-24">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-primary">{t("landing.eyebrow")}</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl sm:leading-[1.12]">
              {t("landing.title")}
            </h1>
            <p className="mt-5 text-base leading-7 text-foreground sm:text-lg sm:leading-8">{t("landing.subtitle")}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={primaryHref} className={primaryLink}>
                {primaryLabel}
              </Link>
              <Link href="/how-it-works" className={secondaryLink}>
                {t("landing.secondaryCta")}
              </Link>
            </div>
          </div>
          <WorkspacePreview variant="list" />
        </div>
      </section>

      <Section>
        <SectionIntro eyebrow={t("landing.valueEyebrow")} title={t("landing.valueTitle")} />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2">
          {values.map((item) => (
            <li key={item.title} className="rounded-xl border border-border bg-card p-6">
              <span className="flex size-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <item.icon aria-hidden className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-2 text-base leading-7 text-muted-foreground">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="solutions" tone="surface">
        <SectionIntro
          eyebrow={t("landing.problemEyebrow")}
          title={t("landing.problemTitle")}
          description={t("landing.problemBody")}
        />
        <ol className="mt-12 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {problems.map(([before, after], index) => (
            <li key={before} className="grid gap-5 px-5 py-6 sm:px-6 lg:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1fr)] lg:gap-8">
              <span className="text-sm font-semibold tabular-nums text-primary">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">{t("landing.problemToday")}</p>
                <p className="mt-2 text-base leading-7">{before}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">{t("landing.problemInstead")}</p>
                <p className="mt-2 text-base leading-7">{after}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="features">
        <SectionIntro
          eyebrow={t("landing.featuresEyebrow")}
          title={t("landing.featuresTitle")}
          description={t("landing.featuresBody")}
        />
        <ul className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <li key={feature.title} className="rounded-xl border border-border bg-card p-6">
              <span className="flex size-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <feature.icon aria-hidden className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tight">{feature.title}</h3>
              <p className="mt-2 text-base leading-7 text-muted-foreground">{feature.body}</p>
            </li>
          ))}
        </ul>
        <Link href="/features" className={`${textLink} mt-8`}>
          {t("landing.seeAll")}
        </Link>
      </Section>

      <Section id="workspace" tone="surface">
        <SectionIntro
          eyebrow={t("landing.workspaceEyebrow")}
          title={t("landing.workspaceTitle")}
          description={t("landing.workspaceBody")}
        />
        <div className="mt-12">
          <WorkspacePreview variant="overview" />
        </div>
      </Section>

      <Section id="how">
        <SectionIntro eyebrow={t("landing.howEyebrow")} title={t("landing.howTitle")} />
        <ol className="mt-12 grid gap-10 lg:grid-cols-3">
          {steps.map(([title, body], index) => (
            <li key={title}>
              <span className="flex size-11 items-center justify-center rounded-full bg-accent text-base font-semibold text-accent-foreground">
                {index + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-base leading-7 text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
        <Link href="/how-it-works" className={`${textLink} mt-8`}>
          {t("landing.fullSteps")}
        </Link>
      </Section>

      <Section id="audiences" tone="surface">
        <SectionIntro eyebrow={t("landing.audienceEyebrow")} title={t("landing.audienceTitle")} />
        <ul className="mt-12 grid gap-4 lg:grid-cols-3">
          {audiences.map(([title, body]) => (
            <li key={title} className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
              <p className="mt-3 text-base leading-7 text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="security">
        <SectionIntro
          eyebrow={t("landing.securityEyebrow")}
          title={t("landing.securityTitle")}
          description={t("landing.securityBody")}
        />
        <ul className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
          {safeguards.map(([title, body]) => (
            <li key={title} className="bg-card p-6">
              <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-base leading-7 text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
        <Link href="/security" className={`${textLink} mt-8`}>
          {t("landing.securityLink")}
        </Link>
      </Section>

      <Section id="faq" tone="surface">
        <SectionIntro eyebrow={t("landing.questionsEyebrow")} title={t("landing.questionsTitle")} />
        <div className="mt-12 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {questions.map(([question, answer]) => (
            <details key={question} className="group">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-5 text-base font-semibold marker:content-none sm:px-6 [&::-webkit-details-marker]:hidden">
                <h3 className="text-base font-semibold leading-7">{question}</h3>
                <ChevronDown
                  aria-hidden
                  className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="px-5 pb-5 text-base leading-7 text-muted-foreground sm:px-6">{answer}</p>
            </details>
          ))}
        </div>
        <Link href="/faq" className={`${textLink} mt-8`}>
          {t("landing.fullFaq")}
        </Link>
      </Section>

      <section className="bg-forest text-forest-foreground">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">{t("landing.ctaTitle")}</h2>
          <p className="mt-4 max-w-2xl text-base leading-7">{t("landing.ctaBody")}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={primaryHref}
              className="inline-flex h-12 items-center justify-center rounded-lg bg-forest-foreground px-5 text-base font-medium text-forest hover:bg-forest-foreground/90"
            >
              {primaryLabel}
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-forest-foreground/40 px-5 text-base font-medium text-forest-foreground hover:bg-forest-foreground/10"
            >
              {t("marketing.contact")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Section({
  id,
  tone = "plain",
  children,
}: {
  id?: string;
  tone?: "plain" | "surface";
  children: ReactNode;
}) {
  return (
    <section id={id} className={tone === "surface" ? "scroll-mt-20 border-y border-border bg-card" : "scroll-mt-20"}>
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">{children}</div>
    </section>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-semibold text-primary">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-7 text-muted-foreground">{description}</p> : null}
    </div>
  );
}

function WorkspacePreview({ variant }: { variant: "list" | "overview" }) {
  const { t } = useI18n();
  const rows: { title: string; detail: string; status: string }[] = [
    { title: t("landing.previewNotice"), detail: t("landing.previewNoticeDetail"), status: "PUBLISHED" },
    { title: t("landing.previewVisitor"), detail: t("landing.previewVisitorDetail"), status: "PENDING" },
    { title: t("landing.previewBill"), detail: t("landing.previewBillDetail"), status: "UNPAID" },
    { title: t("landing.previewComplaint"), detail: t("landing.previewComplaintDetail"), status: "OPEN" },
  ];

  return (
    <figure className="overflow-hidden rounded-xl border border-border bg-card text-foreground shadow-[var(--theme-shadow)]">
      <figcaption className="border-b border-border px-4 py-3 text-sm leading-6 text-muted-foreground">
        {variant === "overview" ? t("landing.previewDisclaimer") : t("landing.previewCaption")}
      </figcaption>
      <div className="grid sm:grid-cols-[11.5rem_minmax(0,1fr)]">
        <div className="hidden border-r border-sidebar-border bg-sidebar p-3 sm:block">
          <p className="px-3 pb-2 text-xs font-medium text-muted-foreground">{t("common.society")}</p>
          <ul className="space-y-0.5">
            {PREVIEW_NAV.map((item) => {
              const active = item.key === "overview";
              const Icon = item.icon;
              return (
                <li key={item.key}>
                  <div
                    className={
                      active
                        ? "flex min-h-10 items-center gap-2.5 rounded-lg bg-sidebar-accent px-3 text-sm font-semibold text-sidebar-accent-foreground shadow-[inset_2px_0_0_var(--theme-nav-indicator)]"
                        : "flex min-h-10 items-center gap-2.5 px-3 text-sm font-medium text-sidebar-foreground"
                    }
                  >
                    <Icon aria-hidden className="size-4 shrink-0" />
                    <span className="truncate">{t(`nav.${item.key}`)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="space-y-3 bg-background p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">{t("nav.overview")}</p>
            <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
              {t("landing.example")}
            </span>
          </div>
          {variant === "overview" ? (
            <div className="grid grid-cols-2 gap-3">
              <Metric label={t("dashboard.buildings")} value={3} />
              <Metric label={t("dashboard.units")} value={48} />
              <Metric label={t("dashboard.occupied")} value={41} />
              <Metric label={t("dashboard.vacant")} value={7} />
            </div>
          ) : null}
          <ul className="space-y-2">
            {rows.map((row) => (
              <li key={row.title} className="rounded-lg border border-border bg-card px-3 py-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium">{row.title}</p>
                  <StatusBadge value={row.status} />
                </div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{row.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </figure>
  );
}
