export default function Privacy() {
  return (
    <div class="legal-container">
      <style>
        {`
        .legal-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          color: #333;
        }
        .legal-container h1 { color: white; margin-top: 40px; }
        .legal-container h2 { color: white; margin-top: 30px; }
        .legal-container h3 { color: white; margin-top: 20px; font-size: 1.1em; }
        .legal-container .last-updated { color: white; font-style: italic; }
        .legal-container a { color: white; }
        .legal-container ul { margin: 10px 0; }
        .legal-container li { margin: 5px 0; }
      `}
      </style>

      <h1>Babbl Privacy Policy</h1>
      <p class="last-updated">Last Updated: January 5, 2026</p>

      <h2>1. Introduction</h2>
      <p>
        Babbl ("we," "our," or "us") respects your privacy and is committed to
        protecting your personal information. This Privacy Policy explains how
        we collect, use, and safeguard your data when you use the Babbl mobile
        application.
      </p>

      <h2>2. Information We Collect</h2>

      <h3>2.1 Information You Provide</h3>
      <ul>
        <li>
          <strong>Account Information:</strong>{" "}
          Name, email address, profile photo
        </li>
        <li>
          <strong>User Content:</strong>{" "}
          Photos, quotes, and text you upload to the App
        </li>
        <li>
          <strong>Family Information:</strong>{" "}
          Names and relationships of family members you add
        </li>
        <li>
          <strong>Children's Information:</strong>{" "}
          Names, birthdates, and photos of children (with parental consent)
        </li>
      </ul>

      <h3>2.2 Automatically Collected Information</h3>
      <ul>
        <li>
          <strong>Device Information:</strong>{" "}
          Device type, operating system, unique device identifiers
        </li>
        <li>
          <strong>Usage Data:</strong>{" "}
          App features used, time spent in the App, crash reports
        </li>
        <li>
          <strong>Location Data:</strong>{" "}
          We do NOT collect precise location data
        </li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <p>We use your information to:</p>
      <ul>
        <li>Provide and maintain the Babbl service</li>
        <li>Enable you to share content with your family members</li>
        <li>Process premium subscriptions</li>
        <li>Send you important service updates and notifications</li>
        <li>Improve the App and develop new features</li>
        <li>Ensure the security and integrity of the App</li>
      </ul>

      <h2>4. Information Sharing</h2>
      <p>
        <strong>We do NOT sell your personal information.</strong>
      </p>

      <p>We share your information only in the following circumstances:</p>
      <ul>
        <li>
          <strong>With Family Members:</strong>{" "}
          Content you upload is shared with members of your family groups
        </li>
        <li>
          <strong>Service Providers:</strong>{" "}
          We use third-party services including:
          <ul>
            <li>Supabase (database and authentication)</li>
            <li>RevenueCat (subscription management)</li>
            <li>Cloudinary (image hosting and optimization)</li>
            <li>Expo (push notifications)</li>
            <li>Resend (email delivery)</li>
          </ul>
        </li>
        <li>
          <strong>Legal Requirements:</strong>{" "}
          When required by law or to protect our rights
        </li>
      </ul>

      <h2>5. Children's Privacy</h2>
      <p>
        Babbl is a family app that allows parents and guardians to share photos
        and quotes of children. We comply with the Children's Online Privacy
        Protection Act (COPPA):
      </p>
      <ul>
        <li>Only adults (18+) may create accounts</li>
        <li>
          Parents/guardians are responsible for all content uploaded about
          children
        </li>
        <li>
          We do not knowingly collect personal information directly from
          children under 13
        </li>
        <li>
          We do not use children's information for advertising or marketing
        </li>
      </ul>

      <h2>6. Data Security</h2>
      <p>
        We implement industry-standard security measures to protect your data:
      </p>
      <ul>
        <li>Encrypted data transmission (HTTPS/TLS)</li>
        <li>Secure cloud storage with access controls</li>
        <li>Regular security audits and updates</li>
      </ul>
      <p>
        However, no method of transmission over the internet is 100% secure. We
        cannot guarantee absolute security.
      </p>

      <h2>7. Data Retention</h2>
      <p>
        We retain your information for as long as your account is active or as
        needed to provide services. When you delete your account:
      </p>
      <ul>
        <li>Your profile and content are permanently deleted within 30 days</li>
        <li>Some data may be retained in backups for up to 90 days</li>
        <li>We may retain certain information as required by law</li>
      </ul>

      <h2>8. Your Rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>
          <strong>Access:</strong> Request a copy of your personal data
        </li>
        <li>
          <strong>Correction:</strong>{" "}
          Update or correct your information through the App
        </li>
        <li>
          <strong>Deletion:</strong> Delete your account and associated data
        </li>
        <li>
          <strong>Data Portability:</strong> Export your photos and quotes
        </li>
        <li>
          <strong>Opt-Out:</strong>{" "}
          Disable push notifications in your device settings
        </li>
      </ul>

      <h2>9. International Users</h2>
      <p>
        Babbl is operated in the United States. If you are located outside the
        U.S., your information will be transferred to and processed in the
        United States. By using the App, you consent to this transfer.
      </p>

      <h2>10. Third-Party Links</h2>
      <p>
        The App may contain links to third-party websites or services. We are
        not responsible for the privacy practices of these third parties.
      </p>

      <h2>11. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you
        of material changes through the App or via email. Your continued use of
        the App after changes constitutes acceptance of the updated policy.
      </p>

      <h2>12. Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy or want to exercise your
        rights, contact us at:
      </p>
      <p>
        Email:{" "}
        <a href="mailto:babbl@vertizonticalstudios.com">
          babbl@vertizonticalstudios.com
        </a>
      </p>

      <h2>13. California Privacy Rights</h2>
      <p>
        California residents have additional rights under the California
        Consumer Privacy Act (CCPA). Contact us to exercise these rights.
      </p>

      <hr style="margin: 40px 0;" />
      <p style="text-align: center; color: white;">
        <a href="/apps/babbl/terms">Terms of Service</a> |
        <a href="mailto:babbl@vertizonticalstudios.com">Contact Us</a>
      </p>
    </div>
  );
}
