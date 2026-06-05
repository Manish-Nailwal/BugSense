import React from 'react';
import LegalLayout, { Section } from './LegalLayout';
import { CONTACT_EMAIL } from '../config/links';

const PrivacyPage = () => {
  return (
    <LegalLayout
      title="Privacy Policy"
      updated="June 5, 2026"
      intro="This policy explains what data Trace collects, how it is used, and the choices you have. Trace is operated by Manish Labs and built to be privacy-first — your debugging data is used to help you, not to be sold."
    >
      <Section title="Information we collect">
        <ul>
          <li><strong>Account data:</strong> your name and email address when you register.</li>
          <li><strong>Debugging content:</strong> the error logs, messages, and follow-ups you submit, plus the AI responses and any fixes you confirm.</li>
          <li><strong>Usage analytics:</strong> aggregate stats about your activity (categories, session counts, success rate) used to power your dashboard and skill recommendations.</li>
          <li><strong>Preferences:</strong> settings such as theme, accent, and personalization you configure.</li>
        </ul>
      </Section>

      <Section title="How we use your data">
        <ul>
          <li>To provide diagnostics and run your debugging conversations.</li>
          <li>To build your growth analytics, recommended skills, and learning paths.</li>
          <li>To publish articles to the shared Library — only when you explicitly choose to.</li>
          <li>To maintain, secure, and improve the service.</li>
        </ul>
      </Section>

      <Section title="AI processing">
        <p>
          To generate diagnostics, the content you submit is sent to third-party AI providers (such as
          Google's Gemini models) for processing. We send only what is needed to answer your request.
          Please avoid including secrets, credentials, or personal data in your error logs.
        </p>
      </Section>

      <Section title="Data retention">
        <p>
          Your conversations and recommendations are retained so your history and growth library stay
          available across sessions. Recommended skills and learning paths accumulate over time to help
          us refine your experience. You can delete your conversations at any time from Settings → Data
          Controls.
        </p>
      </Section>

      <Section title="Cookies & local storage">
        <p>
          Trace uses your browser's local storage for essentials like your session token and your theme
          preference. We do not use third-party advertising or tracking cookies.
        </p>
      </Section>

      <Section title="Sharing">
        <p>
          We do not sell your personal data. Data is shared only with the infrastructure and AI providers
          required to operate Trace, or when required by law. Content you publish to the Library is, by
          design, publicly visible.
        </p>
      </Section>

      <Section title="Your choices">
        <ul>
          <li>Edit your profile and preferences at any time.</li>
          <li>Delete your conversations from Data Controls.</li>
          <li>Choose to publish Library articles under your name or anonymously.</li>
          <li>Request account deletion by contacting us.</li>
        </ul>
      </Section>

      <Section title="Contact">
        <p>
          For privacy questions or data requests, email{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </Section>
    </LegalLayout>
  );
};

export default PrivacyPage;
