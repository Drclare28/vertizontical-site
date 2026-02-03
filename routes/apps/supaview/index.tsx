import { Head } from "fresh/runtime";
import { define } from "../../../utils.ts";

export default define.page(function Supaview() {
  return (
    <div>
      <Head>
        <title>Supaview</title>
      </Head>
      <main class="flex flex-col justify-center items-center px-4 max-w-[1224px] mx-auto">
        <img
          src="/images/SupaView_Logo-no-bkgd.png"
          alt="Supaview"
          class="w-[370px] mt-12"
        />
        <a
          href="https://apps.apple.com/app/id6758403420"
          class="w-36 block mt-8"
        >
          <img
            src="/images/DownloadOnAppStore.svg"
            alt="Download on the App Store"
            class="w-full"
          />
        </a>
        {
          /* <a
          href="https://apps.apple.com/app/id6758403420"
          class="w-36 block mt-8 mb-8"
        >
          <img
            src="/images/DownloadOnAppStore.svg"
            alt="Download on the App Store"
            class="w-full"
          />
        </a> */
        }
        <div class="support mt-8 mb-48">
          <h2 class="text-2xl pt-serif-caption-regular text-center">Support</h2>
          <p class="mt-4">
            For help with the app, or to report bugs, please send an email to
            <a
              href="mailto:supaview@icloud.com"
              class="text-blue-400 ml-1"
            >
              supaview@icloud.com
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
});
