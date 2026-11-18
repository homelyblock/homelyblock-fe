import { LegalReviewNotice, OperatorBlock, PolicySection } from "@/features/marketing/legal-notice";

export function TermsBody() {
  return (
    <PolicySection>
      <LegalReviewNotice />
      <OperatorBlock />
      <h2>Eligibility and accounts</h2>
      <p>
        LivingSpace is for adults managing or living in a residential society. Creating an account does not by itself give access to a society. You agree to give accurate information and to keep your sign-in confidential. You are responsible for activity under your account until you tell the operator it is no longer in your control.
      </p>
      <h2>Roles</h2>
      <ul>
        <li>Platform owner accounts are provisioned by an administrator. They cannot be created on the public sign-up page, and a user cannot grant this role to themselves.</li>
        <li>A society administrator may register and create a society, or be assigned to one. An administrator manages that society only. They do not gain another society by changing a screen.</li>
        <li>A resident may register and is connected to a society only when an administrator adds that existing account and activates the membership. Until then, society records stay hidden.</li>
      </ul>
      <h2>Acceptable use</h2>
      <p>
        Use the service for genuine society operations. The <a href="/acceptable-use">acceptable use</a> page lists what is prohibited, including attempting to read another society’s data, another household’s private records, or another person’s account.
      </p>
      <h2>Content and files</h2>
      <p>
        You are responsible for notices, visitor details, complaints, household records, and files you submit. Do not upload information you are not allowed to share. Complaint image storage is off unless the operator enables it. LivingSpace may remove access when misuse is found. It does not review every notice before publication.
      </p>
      <h2>Payments</h2>
      <p>
        Maintenance amounts in LivingSpace are records. The platform does not collect money, confirm a bank transfer or UPI payment, or issue refunds. There is no subscription checkout in the product. An authorized administrator can record a payment collected outside the app and can reverse that record under the billing rules. Any refund of money is between the society and the resident, outside this software. If the operator later charges a fee, that fee needs its own published terms. None are configured now.
      </p>
      <h2>Suspension</h2>
      <p>
        An administrator can suspend or remove a membership. A suspended membership loses society access. Historical bills and audit records are kept. There is no self-service button that deletes the login or the society’s financial history. The operator may also disable a deployment.
      </p>
      <h2>Availability and other services</h2>
      <p>
        The service can be unavailable during maintenance or when a dependency is down. Sign-in is provided by the configured authentication service. Email leaves the application only when the operator has configured a mail provider. LivingSpace does not promise uninterrupted access or delivery of a message.
      </p>
      <h2>Intellectual property</h2>
      <p>
        The LivingSpace application, its layout, and its copy belong to the operator once that operator is identified. Society records entered by users remain subject to the rights of the people who provided them. Do not copy the product or scrape society data.
      </p>
      <h2>Liability</h2>
      <p>
        To the extent Indian law allows a limitation, the operator is not liable for society decisions, for payments the software only records, or for loss caused by information a user entered incorrectly. Nothing here limits liability that the law does not allow to be limited, including liability for fraud or any mandatory consumer right. This sentence is not a substitute for advice on the Consumer Protection Act, 2019. That Act’s e-commerce rules are aimed at sellers of goods and services to consumers. This deployment does not sell goods or take platform payments. If that changes, counsel should revisit whether those rules apply.
      </p>
      <h2>Disputes and governing law</h2>
      <p>
        These terms are intended to be read with Indian law. The operator has not configured a court, city, or arbitration seat. No jurisdiction is chosen until that choice is published by the operating organisation. Society house rules may add obligations for residents. They cannot widen what the software permits.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about these terms go through the contact form. Account recovery uses the password-reset page, not the contact form.
      </p>
    </PolicySection>
  );
}
