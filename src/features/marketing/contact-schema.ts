export type ContactDraft = {
  fullName: string;
  email: string;
  subject: string;
  message: string;
  societyName: string;
  privacyAcknowledged: boolean;
};

export type ContactErrors = Partial<Record<keyof ContactDraft, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(input: ContactDraft): ContactErrors {
  const errors: ContactErrors = {};
  const fullName = input.fullName.trim();
  const email = input.email.trim();
  const subject = input.subject.trim();
  const message = input.message.trim();
  const societyName = input.societyName.trim();

  if (fullName.length < 2 || fullName.length > 120) {
    errors.fullName = "Enter your full name (2–120 characters).";
  }
  if (!emailPattern.test(email) || email.length > 254) {
    errors.email = "Enter a valid email address.";
  }
  if (subject.length < 3 || subject.length > 160) {
    errors.subject = "Enter a subject (3–160 characters).";
  }
  if (message.length < 10 || message.length > 4000) {
    errors.message = "Enter a message (10–4000 characters).";
  }
  if (societyName.length > 0 && (societyName.length < 2 || societyName.length > 160)) {
    errors.societyName = "Society name must be 2–160 characters, or left blank.";
  }
  if (!input.privacyAcknowledged) {
    errors.privacyAcknowledged = "Confirm that you have read the privacy policy.";
  }
  return errors;
}
