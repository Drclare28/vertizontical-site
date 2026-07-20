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
        .legal-container .last-updated { color: white; font-style: italic; }
        .legal-container a { color: white; }
        .legal-container ul { margin: 10px 0; }
        .legal-container li { margin: 5px 0; }
        p, li, ul { color: white; }
      `}
      </style>

      <h1>GapSucker Privacy Policy</h1>
      <p class="last-updated">Last Updated: July 20, 2026</p>

      <h2>1. Introduction</h2>
      <p>
        GapSucker ("we," "our," or "us") respects your privacy. This Privacy
        Policy explains how GapSucker handles information when you use the
        GapSucker macOS menu bar application ("App").
      </p>

      <h2>2. Information We Collect</h2>
      <p>
        <strong>GapSucker collects no personal information, no usage data, and
        no analytics.</strong> The App operates entirely on your local machine
        and does not transmit any data to external servers.
      </p>
      <p>Specifically, GapSucker does NOT:</p>
      <ul>
        <li>Collect your name, email, or any identifying information</li>
        <li>Track your screen contents or mouse positions beyond what is required for cursor warping</li>
        <li>Use analytics, crash reporting, or tracking SDKs</li>
        <li>Send any data over the network</li>
        <li>Use advertising or marketing identifiers</li>
        <li>Store data in any cloud service</li>
      </ul>

      <h2>3. Accessibility Permission</h2>
      <p>
        GapSucker requires macOS Accessibility access to function. This
        permission allows the App to monitor mouse cursor position and detect
        when the cursor reaches a screen edge, enabling it to warp the cursor
        to an adjacent display. The Accessibility permission is managed by macOS
        and can be revoked at any time in System Settings &gt; Privacy &amp;
        Security &gt; Accessibility.
      </p>

      <h2>4. Local Storage</h2>
      <p>
        GapSucker stores a single preference — whether you have manually
        disabled cursor warping — using macOS UserDefaults on your local
        machine. This data is never transmitted off your device.
      </p>

      <h2>5. Third-Party Services</h2>
      <p>
        GapSucker does not use any third-party services, SDKs, or APIs that
        collect data.
      </p>

      <h2>6. Children's Privacy</h2>
      <p>
        GapSucker is not directed at children under 13 and does not knowingly
        collect any information from anyone.
      </p>

      <h2>7. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Any changes will
        be reflected on this page with an updated date. Your continued use of
        the App after changes constitutes acceptance of the updated policy.
      </p>

      <h2>8. Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy, contact us at:
      </p>
      <p>
        Email:{" "}
        <a href="mailto:gapsucker@icloud.com">
          gapsucker@icloud.com
        </a>
      </p>

      <hr style="margin: 40px 0;" />
      <p style="text-align: center; color: white;">
        <a href="/apps/gap-sucker/terms">Terms of Use</a> |
        <a href="mailto:gapsucker@icloud.com">Contact Us</a>
      </p>
    </div>
  );
}
