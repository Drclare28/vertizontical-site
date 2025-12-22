import { define } from "../utils.ts";

export default define.page(function App({ Component }) {
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
      </head>
      <body class="pt-sans-regular bg-black">
        <Component />
      </body>
    </html>
  );
});
