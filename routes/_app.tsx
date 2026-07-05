import { PageProps } from "fresh";

const trackingScript = {
  __html: `(function(){var p=window.location.pathname;if(p.startsWith("/admin"))return;var s=localStorage.getItem("gs_s");if(!s){s=crypto.randomUUID();localStorage.setItem("gs_s",s)}fetch("/api/analytics/track",{method:"POST",body:JSON.stringify({path:p,referrer:document.referrer||"",session_id:s,user_agent:navigator.userAgent}),headers:{"Content-Type":"application/json"}}).catch(function(){})})()`,
};

export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="facebook-domain-verification"
          content="tiqws6d2bq5a9c8pniwi7g4l7jhtuv"
        />
        <title>Vertizontical Studios</title>
        <link rel="icon" href="/VSicon.svg" type="image/svg+xml"></link>
        <script dangerouslySetInnerHTML={trackingScript} />
      </head>
      <body class="pt-sans-regular bg-black">
        <Component />
      </body>
    </html>
  );
}
