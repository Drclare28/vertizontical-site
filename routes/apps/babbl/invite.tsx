import { define } from "../../../utils.ts";
import { RouteConfig } from "fresh";

export const config: RouteConfig = {
  /**
   * Disable the main application wrapper (_app.tsx)
   */
  skipAppWrapper: true,
  /**
   * Disable any inherited _layout.tsx files
   */
  skipInheritedLayouts: true,
};

export default define.page(function InvitePage() {
  return (
    <>
      <head>
        <title>Join the Family on Babbl</title>
        <style
          // deno-lint-ignore react-no-danger
          dangerouslySetInnerHTML={{
            __html: `
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
            background-color: #f5f5f5 !important;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            text-align: center;
          }
          .card {
            background: white;
            padding: 40px;
            border-radius: 24px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            max-width: 400px;
            width: 100%;
          }
          h1 {
            color: #6200ee;
            margin-bottom: 16px;
            margin-top: 0;
          }
          p {
            color: #666;
            line-height: 1.5;
            margin-bottom: 32px;
          }
          .button {
            display: inline-block;
            background-color: #6200ee;
            color: white;
            padding: 16px 32px;
            border-radius: 100px;
            text-decoration: none;
            font-weight: bold;
            font-size: 18px;
            margin-bottom: 24px;
            width: 100%;
            box-sizing: border-box;
            cursor: pointer;
            border: none;
          }
          .button:hover {
            background-color: #5000c9;
          }
          .store-links {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin-top: 24px;
          }
          .store-button {
            height: 40px;
            opacity: 0.8;
            transition: opacity 0.2s;
          }
          .store-button:hover {
            opacity: 1;
          }
          .hidden {
            display: none;
          }
        `,
          }}
        />
        <script
          // deno-lint-ignore react-no-danger
          dangerouslySetInnerHTML={{
            __html: `
          window.onload = function () {
            // 1. Get the token from the URL query parameters
            const params = new URLSearchParams(window.location.search);
            const token = params.get("token");
            const btn = document.getElementById("open-app-btn");
            const statusText = document.getElementById("status-text");

            if (token) {
              // 2. Construct the deep link
              const deepLink = "babbl://invite?token=" + token;

              // 3. Set the button link
              btn.href = deepLink;

              // 4. Attempt to redirect immediately
              window.location.href = deepLink;

              // Optional: Fallback timeout if you wanted to redirect to App Store automatically
              // setTimeout(() => { ... }, 2000);
            } else {
              // Handle case where token is missing
              statusText.innerText = "Download the app to get started.";
              btn.innerText = "Open Babbl";
              btn.href = "#"; // Or link to App Store
              btn.onclick = function (e) {
                e.preventDefault();
                alert(
                  "No invitation token found. Please check your email link.",
                );
              };
            }
          };
        `,
          }}
        />
      </head>
      <div className="card">
        <h1>You've been invited!</h1>
        <p id="status-text">
          Tap the button below to join your family on Babbl.
        </p>

        <a id="open-app-btn" href="#" className="button">Open Babbl App</a>

        <p style={{ fontSize: "14px", marginBottom: "12px" }}>
          Don't have the app yet?
        </p>

        <div className="store-links">
          {/* Replace with your actual App Store URL */}
          <a
            href="https://apps.apple.com/us/app/babbl/id123456789"
            target="_blank"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
              alt="Download on the App Store"
              className="store-button"
            />
          </a>
          {/* Replace with your actual Google Play Store URL */}
          <a
            href="#"
            target="_blank"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
              alt="Get it on Google Play"
              className="store-button"
            />
          </a>
        </div>
      </div>
    </>
  );
});
