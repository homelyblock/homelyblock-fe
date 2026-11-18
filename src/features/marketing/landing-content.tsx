import Link from "next/link";

const features = [
  ["Resident management", "Assign memberships and roles. Access stays limited to the societies a person belongs to."],
  ["Society and unit management", "Record buildings, units, and which home a membership is linked to."],
  ["Maintenance and billing", "Configure dues, generate bills, and publish them to the relevant homes."],
  ["Payment records", "Record cash, UPI, bank transfer, cheque, or other payments collected outside LivingSpace."],
  ["Notices and announcements", "Draft and publish notices for a society, building, or unit."],
  ["Complaints", "Raise a society complaint and follow its status. This is separate from platform support."],
  ["Visitor management", "Register expected visitors and walk-ins, then record approval, check-in, and check-out."],
  ["Household management", "Keep a list of people who live in the home without creating extra logins."],
  ["Society services", "Publish local contacts such as plumbers and electricians."],
  ["Administration", "Society administrators run their society. A platform owner is provisioned separately and can see the societies they are authorized to administer."],
] as const;

const problems = [
  "Manual resident records that live in spreadsheets and chats.",
  "Scattered communication when a notice has to reach every home.",
  "Maintenance tracking that is hard to reconcile at the end of the month.",
  "Complaints that are raised in one place and forgotten in another.",
  "Visitor coordination that depends on a paper register or a phone call.",
  "Little shared visibility into what the society has already decided.",
] as const;

export function LandingContent({ signedIn }: { signedIn: boolean }) {
  const primaryHref = signedIn ? "/societies" : "/sign-up";

  return (
    <>
      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
          <div className="space-y-6">
            <p className="text-xs font-medium tracking-wide text-primary-foreground/80 uppercase">
              Residential society management
            </p>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl sm:leading-[1.08]">
              Your Society. Better Managed.
            </h1>
            <p className="max-w-xl text-base leading-7 text-primary-foreground/85">
              Manage residents, maintenance, visitors, complaints and everyday society operations in one simple platform.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={primaryHref}
                className="inline-flex h-11 items-center rounded-xl bg-card px-5 text-sm font-medium text-foreground"
              >
                {signedIn ? "Open your societies" : "Get Started"}
              </Link>
              <Link
                href="/features"
                className="inline-flex h-11 items-center rounded-xl border border-primary-foreground/25 px-5 text-sm font-medium text-primary-foreground"
              >
                Explore Features
              </Link>
            </div>
          </div>
          <ProductPreview />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <SectionIntro
          eyebrow="The problem"
          title="Society work gets scattered long before it gets solved."
          description="LivingSpace is for the ordinary records a society already keeps. It does not add a payment gateway, gate hardware, or WhatsApp alerts."
        />
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {problems.map((problem) => (
            <li key={problem} className="rounded-2xl border border-border bg-card px-4 py-4 text-sm leading-6 text-foreground">
              {problem}
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <SectionIntro
            eyebrow="Features"
            title="What the product does today."
            description="Each item below is implemented. A fuller list is on the features page."
          />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {features.slice(0, 6).map(([title, description]) => (
              <li key={title} className="rounded-2xl border border-border bg-background p-5">
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </li>
            ))}
          </ul>
          <Link href="/features" className="mt-6 inline-flex text-sm font-medium underline-offset-4 hover:underline">
            See all features
          </Link>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Society administrators</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
            <li>Manage residents and units.</li>
            <li>Publish notices.</li>
            <li>Manage complaints.</li>
            <li>Track maintenance bills and recorded payments.</li>
            <li>Coordinate visitors, services, and society details.</li>
          </ul>
        </article>
        <article className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Residents</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
            <li>Access information for societies where membership is active.</li>
            <li>View maintenance bills and payment records.</li>
            <li>Raise complaints and follow their status.</li>
            <li>Manage household details.</li>
            <li>Submit visitor requests and read announcements.</li>
          </ul>
        </article>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <SectionIntro eyebrow="How it works" title="From a new society to daily use." />
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              "A society administrator creates an account.",
              "Society information is configured.",
              "Buildings and units are added.",
              "Residents register, then an administrator connects and activates them.",
              "Society operations begin inside that society.",
            ].map((step, index) => (
              <li key={step} className="rounded-2xl border border-border bg-background p-4 text-sm leading-6">
                <span className="font-semibold">{index + 1}.</span> {step}
              </li>
            ))}
          </ol>
          <Link href="/how-it-works" className="mt-6 inline-flex text-sm font-medium underline-offset-4 hover:underline">
            Read the full steps
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <SectionIntro
          eyebrow="Security"
          title="Access is checked on the server."
          description="Passwords are handled by the configured sign-in service. Society data is limited by role and membership. The security page lists the controls that are actually in the product."
        />
        <Link href="/security" className="mt-6 inline-flex text-sm font-medium underline-offset-4 hover:underline">
          Security and reporting
        </Link>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <SectionIntro eyebrow="Questions" title="A few answers before you start." />
          <div className="mt-8 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-background">
            {[
              ["Can anyone join a society by signing up?", "No. A resident account does not see society records until an administrator connects that account and activates the membership."],
              ["Does LivingSpace collect maintenance money?", "No. Bills and payments are records. The platform does not run a payment gateway."],
              ["Will I get an email for every notice?", "No. Society updates are read in the app. Account emails, such as password reset, come from the sign-in service."],
            ].map(([question, answer]) => (
              <details key={question} className="px-5 py-4">
                <summary className="cursor-pointer text-sm font-medium">{question}</summary>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>
          <Link href="/faq" className="mt-6 inline-flex text-sm font-medium underline-offset-4 hover:underline">
            Read the full FAQ
          </Link>
        </div>
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight">Bring your society operations together.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-primary-foreground/85">
            Create a society administrator account, or sign in if your administrator has already connected you.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={primaryHref} className="inline-flex h-11 items-center rounded-xl bg-card px-5 text-sm font-medium text-foreground">
              {signedIn ? "Open your societies" : "Get Started"}
            </Link>
            <Link href="/contact" className="inline-flex h-11 items-center rounded-xl border border-primary-foreground/25 px-5 text-sm font-medium">
              Contact
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
  const rows = [
    ["Notice", "Published for the society"],
    ["Visitor", "Awaiting approval"],
    ["Bill", "Recorded for the period"],
    ["Complaint", "Open on a unit"],
  ];
  return (
    <figure className="overflow-hidden rounded-2xl border border-border bg-card text-foreground">
      <figcaption className="border-b border-border px-4 py-3 text-xs text-muted-foreground">
        Simplified view of the society workspace. This is the product layout, not a stock dashboard.
      </figcaption>
      <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] sm:grid-cols-[9.5rem_minmax(0,1fr)]">
        <div className="space-y-1 bg-primary p-3 text-xs text-primary-foreground/80">
          {["Overview", "Notices", "Visitors", "Billing", "Complaints"].map((item, index) => (
            <p key={item} className={index === 0 ? "rounded-lg bg-sidebar-accent px-2 py-1.5 font-medium text-primary-foreground" : "px-2 py-1.5"}>
              {item}
            </p>
          ))}
        </div>
        <div className="space-y-2 p-3 sm:p-4">
          {rows.map(([title, detail]) => (
            <div key={title} className="rounded-xl border border-border bg-background px-3 py-2.5">
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs text-muted-foreground">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </figure>
  );
}
