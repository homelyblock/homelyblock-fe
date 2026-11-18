import { LegalReviewNotice, OperatorBlock, PolicySection } from "@/features/marketing/legal-notice";

export function PrivacyPolicyBody() {
  return (
    <PolicySection>
      <LegalReviewNotice />
      <OperatorBlock />
      <h2>What this policy covers</h2>
      <p>
        HomelyBlock is a web application for residential society operations. This policy explains what the application stores and who can see it. It does not decide, for every society, whether the platform operator or the society is the data fiduciary. That depends on who determines the purpose and means of processing, and on the contract between them. Societies do not all have the same legal role.
      </p>
      <h2>Information the application stores</h2>
      <ul>
        <li>Account and authentication information: the sign-in identifier from the configured authentication service, display name, email, and optional phone. HomelyBlock does not store passwords.</li>
        <li>The registration choice of society administrator or resident. Platform owner is not a public registration choice.</li>
        <li>Society and membership information: society address, buildings, units, role, membership status, and the unit linked to a membership.</li>
        <li>Household information entered by a resident or administrator, including a name, relationship, and optional contact details. Household members do not receive separate logins. A record may describe a child who lives in the home.</li>
        <li>Billing and transaction records: maintenance configuration, bills, and payments an administrator records. HomelyBlock does not collect card or UPI payments and does not receive a bank confirmation.</li>
        <li>Complaint text, status, comments, and, only if the operator explicitly enables storage, complaint images.</li>
        <li>Visitor names and visit details entered for expected or walk-in visitors.</li>
        <li>Notices and whether a person has opened a notice.</li>
        <li>Service-directory contacts published by an administrator.</li>
        <li>Messages sent through the public contact form.</li>
        <li>An audit log of selected administrative actions, with the actor, action, resource, and time. The log is not a complete record of every login.</li>
        <li>Technical information needed to keep the session, including essential authentication cookies. The product does not run analytics or marketing tags.</li>
      </ul>
      <h2>Why this information is used</h2>
      <p>
        The application uses this information to create accounts, connect people to a society, show notices, visitors, bills, complaints, households, and services, and to keep an audit trail of selected changes. Contact messages are used to respond to platform questions.
      </p>
      <p>
        The Digital Personal Data Protection Act, 2023 (Act 22 of 2023) received assent on 11 August 2023. It does not apply all at once. Notification G.S.R. 843(E) dated 13 November 2025 brings the Act into force in stages. On 18 November 2026, the provisions in force are those that started on publication (including definitions and the establishment of the Data Protection Board) and the one-year group (section 6(9) and section 27(1)(d), concerning consent managers). The operative duties — application of the Act, grounds for processing, notice, most of the consent rules, fiduciary obligations, rights, children’s-data duties, cross-border rules, and penalties — are in the eighteen-month group. Counted from 13 November 2025, that date is 13 May 2027. The Digital Personal Data Protection Rules, 2025 (G.S.R. 846(E), 13 November 2025) follow the same stages. Rules 1, 2 and 17 to 21 started on publication. Rule 4, on consent managers, started one year later. Rules 3, 5 to 16, 22 and 23 start with the eighteen-month group. HomelyBlock is not a consent manager.
      </p>
      <p>
        Because those operative duties are not yet in force, this policy does not claim that a particular processing ground under section 4 or section 7 is already a legal requirement. The product still limits access by role because that is how the software is built. Counsel should confirm whether the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 continue to apply until section 44(2) of the DPDP Act, which amends other laws, comes into force.
      </p>
      <h2>Who can see records</h2>
      <p>
        The API checks the caller on each request. A resident sees the societies where their membership is active, and not another resident’s private household, complaint, or bill. A society administrator sees the society they administer. A platform owner can administer societies the product authorizes them to open. Hiding a button is not the control. Visitor details, bills, and complaints are not public pages.
      </p>
      <h2>Sharing and processors</h2>
      <p>
        The deployment uses an authentication service for sign-in and a database for society records. If the operator configures contact email, message content is sent through that email provider to the configured support address and a short confirmation is sent to the sender. Complaint images stay disabled unless the operator turns storage on. No advertising network is built into the product. The operator must name the actual subprocessors in the deployment configuration before launch. This policy does not invent that list.
      </p>
      <h2>Storage, transfers, and retention</h2>
      <p>
        Where the database and file storage run, and whether any copy leaves India, depends on the operator’s hosting. The software does not itself choose a region. There is no self-service button that erases an account or a society’s historical bills, notices, payments, or audit records. An administrator can suspend or remove a membership. Historical financial records remain. How long visitor logs and bills are kept is an operator decision that is not automated in the product. This gap should be reviewed before the erasure and retention duties scheduled for 13 May 2027, and earlier if another law already requires it.
      </p>
      <h2>Security</h2>
      <p>
        The application verifies sign-in tokens, checks roles on the server, isolates society queries, rate-limits requests, and writes an audit record for selected administrative changes. These are safeguards, not a promise that information cannot be compromised.
      </p>
      <h2>Children</h2>
      <p>
        HomelyBlock does not offer accounts for children. An adult may enter a household member who is a child. The product does not collect a date of birth or run a verifiable-consent flow. Section 9 of the DPDP Act is in the group scheduled for 13 May 2027. Until an adviser confirms the right approach, operators should not invite children to create their own logins.
      </p>
      <h2>Your requests</h2>
      <p>
        You can correct your own profile in the application. Membership, bills, and other society records are changed by an authorized administrator. A request to access, correct, or close information can be sent through the contact form. The product cannot complete every request itself, and the statutory request process under the DPDP Act is not yet in force. Withdrawal of a marketing consent does not arise, because the product does not send marketing messages. Essential sign-in cookies cannot be switched off without ending the session.
      </p>
      <h2>CERT-In and incidents</h2>
      <p>
        Directions issued by CERT-In on 28 April 2022 under section 70B(6) of the Information Technology Act, 2000 apply to service providers, intermediaries, data centres, body corporates, and government organisations. If the operator is in that class, the directions include reporting specified cyber incidents within six hours of noticing them, keeping ICT logs securely for a rolling 180 days inside India, synchronising clocks to NIC or NPL time, and designating a point of contact. A hosting company’s own compliance does not automatically discharge the operator. The legal category of this deployment cannot be settled until the operating entity is known. See the security page for how to report a vulnerability to the operator.
      </p>
      <h2>Updates</h2>
      <p>
        When this text changes, the last-updated date changes with it. Continued use after an update does not replace a consent the law requires the operator to obtain separately.
      </p>
    </PolicySection>
  );
}
