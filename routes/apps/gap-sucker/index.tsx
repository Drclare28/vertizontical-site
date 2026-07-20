import { Head } from "fresh/runtime";
import { define } from "../../../utils.ts";

export default define.page(function GapSucker() {
  return (
    <div>
      <Head>
        <title>GapSucker</title>
      </Head>
      <main class="flex flex-col justify-center items-center px-4 max-w-[1224px] mx-auto">
        <img
          src="/images/gapsucker-logo.svg"
          alt="GapSucker"
          class="w-[300px] mt-12"
        />
        <h1 class="text-4xl pt-serif-caption-regular mt-4">GapSucker</h1>
        <a
          href="https://drclare.gumroad.com/l/gapsucker"
          target="_blank"
          class="bg-green-600 hover:bg-green-500 text-white font-semibold py-3 px-8 rounded-xl mt-8 text-lg transition-colors"
        >
          Buy
        </a>
        <div class="text max-w-3xl mt-8">
          <p class="mb-4">
            GapSucker is a macOS menu bar utility that seamlessly warps your
            mouse cursor across gaps between displays in a multi-monitor setup.
            No more getting stuck on bezels — your cursor glides effortlessly
            from screen to screen as if you're using one continuous display.
          </p>
          <h2 class="text-2xl pt-serif-caption-regular">Features</h2>
          <ul class="list-disc pl-4">
            <li>
              Automatic cursor warping: Teleports your cursor across display
              gaps when it reaches any screen edge
            </li>
            <li>
              Multi-monitor support: Works seamlessly with any display
              arrangement
            </li>
            <li>
              Smart detection: Warps only when moving toward an adjacent screen
            </li>
            <li>
              Menu bar status indicator: Shows running, disabled, or
              needs-permission state
            </li>
            <li>
              Enable/disable toggle: Quickly turn warping on and off from the
              menu bar
            </li>
            <li>
              Lightweight: Runs quietly in the background with minimal resource
              usage
            </li>
          </ul>
        </div>
        <ul class="screenshots flex gap-8 flex-wrap mt-10 mx-auto justify-center">
        </ul>
        <div class="support mt-8 mb-48">
          <h2 class="text-2xl pt-serif-caption-regular text-center">Support</h2>
          <p class="mt-4">
            For help with the app, or to report bugs, please send an email to
            <a
              href="mailto:gapsucker@icloud.com"
              class="text-blue-400 ml-1"
            >
              gapsucker@icloud.com
            </a>.
          </p>
          <p class="mt-2 text-gray-400 text-sm">
            GapSucker requires macOS 10.15 or later and Accessibility access
            permission.
          </p>
          <p class="mt-6 text-center text-gray-400 text-sm">
            <a href="/apps/gap-sucker/privacy" class="text-blue-400">Privacy Policy</a>
            {" | "}
            <a href="/apps/gap-sucker/terms" class="text-blue-400">Terms of Use</a>
          </p>
        </div>
      </main>
    </div>
  );
});
