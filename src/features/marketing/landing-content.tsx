"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/provider";

export function LandingContent({ signedIn }: { signedIn: boolean }) {
  const { t } = useI18n();
  const primaryHref = signedIn ? "/societies" : "/sign-up";
  const problems = [
    t("landing.problem1"),
    t("landing.problem2"),
    t("landing.problem3"),
    t("landing.problem4"),
    t("landing.problem5"),
    t("landing.problem6"),
  ];
  const features = [
    [t("landing.feature1Title"), t("landing.feature1Body")],
    [t("landing.feature2Title"), t("landing.feature2Body")],
    [t("landing.feature3Title"), t("landing.feature3Body")],
    [t("landing.feature4Title"), t("landing.feature4Body")],
    [t("landing.feature5Title"), t("landing.feature5Body")],
    [t("landing.feature6Title"), t("landing.feature6Body")],
  ];

  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div className="space-y-6">
            <p className="text-xs font-medium tracking-wide text-primary uppercase">
              {t("landing.eyebrow")}
            </p>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl sm:leading-[1.08]">
              {t("landing.title")}
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground">
              {t("landing.subtitle")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={primaryHref}
                className="inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground"
              >
                {signedIn ? t("landing.openSocieties") : t("landing.getStarted")}
              </Link>
              <Link
                href="/features"
                className="inline-flex h-11 items-center rounded-lg border border-border bg-card px-5 text-sm font-medium text-foreground"
              >
                {t("landing.explore")}
              </Link>
            </div>
          </div>
          <ProductPreview />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <SectionIntro
          eyebrow={t("landing.problemEyebrow")}
          title={t("landing.problemTitle")}
          description={t("landing.problemBody")}
        />
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map((problem, index) => (
            <li key={problem} className="rounded-xl border border-border bg-card px-4 py-4 text-sm leading-6 text-foreground">
              <span className="text-xs font-semibold text-primary">{String(index + 1).padStart(2, "0")}</span>
              <p className="mt-2">{problem}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <SectionIntro
            eyebrow={t("landing.featuresEyebrow")}
            title={t("landing.featuresTitle")}
            description={t("landing.featuresBody")}
          />
          <ul className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {features.slice(0, 6).map(([title, description]) => (
              <li key={title} className="bg-card p-5">
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </li>
            ))}
          </ul>
          <Link href="/features" className="mt-6 inline-flex text-sm font-medium underline-offset-4 hover:underline">
            {t("landing.seeAll")}
          </Link>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">{t("landing.admins")}</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
            <li>{t("landing.admin1")}</li>
            <li>{t("landing.admin2")}</li>
            <li>{t("landing.admin3")}</li>
            <li>{t("landing.admin4")}</li>
            <li>{t("landing.admin5")}</li>
          </ul>
        </article>
        <article className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">{t("landing.residents")}</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
            <li>{t("landing.resident1")}</li>
            <li>{t("landing.resident2")}</li>
            <li>{t("landing.resident3")}</li>
            <li>{t("landing.resident4")}</li>
            <li>{t("landing.resident5")}</li>
          </ul>
        </article>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <SectionIntro eyebrow={t("landing.howEyebrow")} title={t("landing.howTitle")} />
          <ol className="mt-8 grid gap-4 lg:grid-cols-5">
            {[
              t("landing.step1"),
              t("landing.step2"),
              t("landing.step3"),
              t("landing.step4"),
              t("landing.step5"),
            ].map((step, index) => (
              <li key={step} className="text-sm leading-6">
                <span className="text-xs font-semibold tracking-wide text-primary uppercase">{index + 1}</span>
                <p className="mt-2">{step}</p>
              </li>
            ))}
          </ol>
          <Link href="/how-it-works" className="mt-6 inline-flex text-sm font-medium underline-offset-4 hover:underline">
            {t("landing.fullSteps")}
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <SectionIntro
          eyebrow={t("landing.securityEyebrow")}
          title={t("landing.securityTitle")}
          description={t("landing.securityBody")}
        />
        <Link href="/security" className="mt-6 inline-flex text-sm font-medium underline-offset-4 hover:underline">
          {t("landing.securityLink")}
        </Link>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <SectionIntro eyebrow={t("landing.questionsEyebrow")} title={t("landing.questionsTitle")} />
          <div className="mt-8 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-background">
            {[
              [t("landing.q1"), t("landing.a1")],
              [t("landing.q2"), t("landing.a2")],
              [t("landing.q3"), t("landing.a3")],
            ].map(([question, answer]) => (
              <details key={question} className="px-5 py-4">
                <summary className="cursor-pointer text-sm font-medium">{question}</summary>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>
          <Link href="/faq" className="mt-6 inline-flex text-sm font-medium underline-offset-4 hover:underline">
            {t("landing.fullFaq")}
          </Link>
        </div>
      </section>

      <section className="border-t border-border bg-card text-foreground">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight">{t("landing.ctaTitle")}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            {t("landing.ctaBody")}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={primaryHref} className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground">
              {signedIn ? t("landing.openSocieties") : t("landing.getStarted")}
            </Link>
            <Link href="/contact" className="inline-flex h-11 items-center rounded-xl border border-border bg-background px-5 text-sm font-medium text-foreground">
              {t("marketing.contact")}
            </Link>
          </div>
        </div>
      </section>
    </>
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
    <div className="max-w-2xl space-y-3">
      <p className="text-sm font-medium tracking-wide text-foreground uppercase">{eyebrow}</p>
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      {description ? <p className="text-sm leading-7 text-muted-foreground">{description}</p> : null}
    </div>
  );
}

function ProductPreview() {
  const { t } = useI18n();
  const rows = [
    [t("landing.previewNotice"), t("landing.previewNoticeDetail")],
    [t("landing.previewVisitor"), t("landing.previewVisitorDetail")],
    [t("landing.previewBill"), t("landing.previewBillDetail")],
    [t("landing.previewComplaint"), t("landing.previewComplaintDetail")],
  ];
  return (
    <figure className="overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-[var(--theme-shadow)]">
      <figcaption className="flex items-center justify-between border-b border-border px-4 py-3 text-xs text-muted-foreground">
        <span>{t("landing.previewCaption")}</span>
        <span className="rounded-md bg-muted px-2 py-0.5 font-medium text-foreground">{t("nav.overview")}</span>
      </figcaption>
      <div className="grid sm:grid-cols-[9.5rem_minmax(0,1fr)]">
        <div className="hidden space-y-1 border-r border-border bg-sidebar p-3 text-xs sm:block">
          {[t("nav.overview"), t("nav.notices"), t("nav.visitors"), t("nav.billing"), t("nav.complaints")].map((item, index) => (
            <p
              key={item}
              className={
                index === 0
                  ? "rounded-md bg-sidebar-accent px-2 py-1.5 font-semibold text-sidebar-accent-foreground"
                  : "px-2 py-1.5 text-muted-foreground"
              }
            >
              {item}
            </p>
          ))}
        </div>
        <div className="space-y-2 bg-background p-3 sm:p-4">
          {rows.map(([title, detail], index) => (
            <div key={title} className="rounded-lg border border-border bg-card px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{title}</p>
                <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                  {index === 0 ? t("status.PUBLISHED") : index === 1 ? t("status.PENDING") : t("status.OPEN")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </figure>
  );
}
