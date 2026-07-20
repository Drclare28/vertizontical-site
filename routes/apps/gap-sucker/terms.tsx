export default function Terms() {
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

      <h1>GapSucker Terms of Use</h1>
      <p class="last-updated">Last Updated: July 20, 2026</p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By downloading, installing, or using the GapSucker macOS application
        ("App"), you agree to be bound by these Terms of Use ("Terms"). If you
        do not agree to these Terms, do not use the App.
      </p>

      <h2>2. Description of Service</h2>
      <p>
        GapSucker is a macOS menu bar utility that automatically warps your
        mouse cursor across gaps between displays in a multi-monitor setup. The
        App runs locally on your Mac and requires Accessibility access to
        function.
      </p>

      <h2>3. License</h2>
      <p>
        GapSucker is provided to you as a personal, non-commercial license. You
        may install and use the App on Macs that you own or control. You may not
        redistribute, sell, decompile, reverse-engineer, or create derivative
        works of the App.
      </p>

      <h2>4. System Requirements</h2>
      <ul>
        <li>macOS 10.15 (Catalina) or later</li>
        <li>Accessibility access permission (granted via System Settings)</li>
        <li>Multi-monitor setup for full functionality</li>
      </ul>

      <h2>5. Accessibility Permission</h2>
      <p>
        GapSucker requires macOS Accessibility access to monitor mouse cursor
        position and warp it across display gaps. You may revoke this permission
        at any time in System Settings &gt; Privacy &amp; Security &gt;
        Accessibility. Revoking the permission will prevent the App from
        functioning.
      </p>

      <h2>6. Purchases and Refunds</h2>
      <p>
        GapSucker is sold through{" "}
        <a href="https://drclare.gumroad.com/l/gapsucker" target="_blank">
          Gumroad
        </a>{" "}
        and is also available through{" "}
        <a href="https://setapp.com" target="_blank">
          Setapp
        </a>
        . All purchases and refunds are handled by the respective platform's
        policies. We do not process payments directly.
      </p>

      <h2>7. Disclaimer of Warranties</h2>
      <p>
        THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR
        IMPLIED. WE DO NOT GUARANTEE THAT THE APP WILL BE UNINTERRUPTED,
        ERROR-FREE, OR COMPATIBLE WITH ALL HARDWARE CONFIGURATIONS. WE ARE NOT
        RESPONSIBLE FOR ANY DAMAGE CAUSED BY THE USE OF THE APP.
      </p>

      <h2>8. Limitation of Liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, VERTizontical STUDIOS SHALL NOT
        BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL
        DAMAGES ARISING OUT OF YOUR USE OF THE APP, INCLUDING BUT NOT LIMITED TO
        LOSS OF DATA, SERVICE INTERRUPTION, OR COMPUTER DAMAGE.
      </p>

      <h2>9. Termination</h2>
      <p>
        You may stop using the App at any time by quitting it and optionally
        revoking Accessibility access. Your license to use the App terminates if
        you violate these Terms.
      </p>

      <h2>10. Changes to Terms</h2>
      <p>
        We may update these Terms from time to time. Changes will be posted on
        this page with an updated date. Your continued use of the App after
        changes are posted constitutes acceptance of the new Terms.
      </p>

      <h2>11. Contact Information</h2>
      <p>For questions about these Terms, please contact us at:</p>
      <p>
        Email:{" "}
        <a href="mailto:gapsucker@icloud.com">
          gapsucker@icloud.com
        </a>
      </p>

      <h2>12. Governing Law</h2>
      <p>
        These Terms are governed by the laws of the State of North Carolina,
        without regard to conflict of law principles.
      </p>

      <hr style="margin: 40px 0;" />
      <p style="text-align: center; color: white;">
        <a href="/apps/gap-sucker/privacy">Privacy Policy</a> |
        <a href="mailto:gapsucker@icloud.com">Contact Us</a>
      </p>
    </div>
  );
}
