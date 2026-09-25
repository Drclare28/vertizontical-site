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

      <h1>DinnerBracket Privacy Policy</h1>
      <p class="last-updated">Last Updated: September 25, 2026</p>

      <h2>1. Introduction</h2>
      <p>
        DinnerBracket ("we," "our," or "us") respects your privacy. This Privacy
        Policy explains how DinnerBracket handles information when you use the
        DinnerBracket iOS application ("App").
      </p>

      <h2>2. Information We Collect</h2>
      <p>
        <strong>
          DinnerBracket collects no personal information, no usage data, and no
          analytics.
        </strong>{" "}
        The App has no accounts and no servers of its own. All of your brackets,
        saved restaurants, and settings live on your device.
      </p>
      <p>Specifically, DinnerBracket does NOT:</p>
      <ul>
        <li>Collect your name, email, or any identifying information</li>
        <li>Use analytics, crash reporting, or tracking SDKs</li>
        <li>Send your data to our servers (we have none)</li>
        <li>Use advertising or marketing identifiers</li>
        <li>Sell or share any information with data brokers</li>
      </ul>

      <h2>3. Location Information</h2>
      <p>
        DinnerBracket asks for your location (while using the App) solely to
        search for restaurants near you using Apple's MapKit service. Your
        location is used only to scope those search results and is never stored,
        logged, or transmitted to us. You can decline the location permission
        and still build brackets from your Saved Spots or manual entries.
      </p>
      <p>
        Restaurant searches are performed by Apple's Maps service and are
        subject to Apple's privacy policy. You can revoke location access at any
        time in Settings &gt; Privacy &amp; Security &gt; Location Services.
      </p>

      <h2>4. Local Storage</h2>
      <p>
        DinnerBracket stores your brackets, saved restaurants, tournament
        history, theme preferences, and purchase status locally on your device
        using iOS UserDefaults and on-device storage. This data never leaves
        your device except when you choose to share it (see Sharing below).
      </p>

      <h2>5. Sharing Your Brackets</h2>
      <p>
        When you use the Shared Partner Link feature, the App creates a link
        containing your bracket data and hands it to the iOS share sheet
        (iMessage, AirDrop, etc.). We never see this data — it travels directly
        between you and the people you share it with through Apple's services.
      </p>

      <h2>6. Purchases</h2>
      <p>
        The optional "Unlimited Pass" is a one-time purchase processed entirely
        by Apple through the App Store. We never receive your payment
        information. Your purchase status is stored on your device and verified
        through Apple's StoreKit service.
      </p>

      <h2>7. Third-Party Services</h2>
      <p>
        DinnerBracket uses only Apple platform services (MapKit for restaurant
        search and StoreKit for purchases). It does not use any third-party SDKs
        that collect data.
      </p>

      <h2>8. Children's Privacy</h2>
      <p>
        DinnerBracket is not directed at children under 13 and does not
        knowingly collect any information from anyone.
      </p>

      <h2>9. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Any changes will be
        reflected on this page with an updated date. Your continued use of the
        App after changes constitutes acceptance of the updated policy.
      </p>

      <h2>10. Contact Us</h2>
      <p>If you have questions about this Privacy Policy, contact us at:</p>
      <p>
        Email:{" "}
        <a href="mailto:drclare2884+dinnerbracket@icloud.com">
          drclare2884+dinnerbracket@icloud.com
        </a>
      </p>

      <hr style="margin: 40px 0;" />
      <p style="text-align: center; color: white;">
        <a href="/apps/dinner-bracket/terms">Terms of Use</a> |{" "}
        <a href="mailto:drclare2884+dinnerbracket@icloud.com">Contact Us</a>
      </p>
    </div>
  );
}
