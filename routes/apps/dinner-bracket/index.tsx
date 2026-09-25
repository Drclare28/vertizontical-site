import { Head } from "fresh/runtime";
import { define } from "../../../utils.ts";

export default define.page(function DinnerBracket() {
  return (
    <div>
      <Head>
        <title>DinnerBracket</title>
      </Head>
      <main class="flex flex-col justify-center items-center px-4 max-w-[1224px] mx-auto">
        <img
          src="/images/dinner-bracket-icon.png"
          alt="DinnerBracket"
          class="w-32 md:w-48 mt-12 mx-auto rounded-[27.5%] drop-shadow-xl"
        />
        <h1 class="text-4xl pt-serif-caption-regular mt-4">DinnerBracket</h1>
        <a
          href="https://apps.apple.com/app/id6816172758"
          target="_blank"
          class="h-12 block mt-8"
        >
          <img
            src="/images/DownloadOnAppStore.svg"
            alt="Download on the App Store"
            class="h-full w-auto"
          />
        </a>
        <div class="text max-w-3xl mt-8">
          <p class="mb-4">
            DinnerBracket settles the age-old question —{" "}
            <em>"Where should we eat tonight?"</em>{" "}
            — with a March Madness–style tournament of your favorite
            restaurants. Build a bracket, vote head-to-head, and let a golden
            coin flip break every tie.
          </p>
          <h2 class="text-2xl pt-serif-caption-regular">How It Works</h2>
          <ol class="list-decimal pl-4 mb-4 space-y-1">
            <li>
              Fill your bracket — search nearby restaurants by cuisine with
              Apple Maps, or pick from your Saved Spots
            </li>
            <li>Seed the contenders — order them yourself or shuffle</li>
            <li>Vote head-to-head through every round</li>
            <li>Crown the champion on the confetti podium</li>
          </ol>
          <h2 class="text-2xl pt-serif-caption-regular">Features</h2>
          <ul class="list-disc pl-4">
            <li>
              <strong>Pass &amp; Play:</strong>{" "}
              both of you vote on one phone, with instant tie-breakers
            </li>
            <li>
              <strong>Blind Voting:</strong>{" "}
              pick in secret — neither sees the other's choice until the reveal
            </li>
            <li>
              <strong>Solo Host:</strong> one person drives the picks
            </li>
            <li>
              <strong>Shared Partner Link:</strong>{" "}
              send your bracket over iMessage or AirDrop and sync from two
              phones
            </li>
            <li>
              <strong>Golden Coin Flip:</strong>{" "}
              animated tie-breaker that always produces an answer
            </li>
            <li>
              <strong>Saved Spots:</strong>{" "}
              every restaurant you enter is remembered with career stats —
              tournaments entered vs. championships won
            </li>
            <li>
              <strong>Tournament History:</strong>{" "}
              archive of past brackets with dates and champions
            </li>
            <li>
              <strong>Interactive Bracket Tree:</strong>{" "}
              real tournament diagram with live winner progression
            </li>
            <li>
              <strong>Themes:</strong>{" "}
              restyle the whole app, with optional themed artwork
            </li>
            <li>
              1-tap directions in Apple Maps or call the winning restaurant
            </li>
          </ul>
        </div>
        <ul class="screenshots flex gap-8 flex-wrap mt-10 mx-auto justify-center">
          <li class="md:w-[392px] max-w-[85%] md:max-w-[31%] block">
            <img
              src="/images/dinner-bracket-find-restaurants.jpeg"
              alt="Find restaurants nearby"
              class="rounded-xl"
            />
          </li>
          <li class="md:w-[392px] max-w-[85%] md:max-w-[31%] block">
            <img
              src="/images/dinner-bracket-customize-search.jpeg"
              alt="Customize your search"
              class="rounded-xl"
            />
          </li>
          <li class="md:w-[392px] max-w-[85%] md:max-w-[31%] block">
            <img
              src="/images/dinner-bracket-tournament-starting.jpeg"
              alt="Tournament ready to start"
              class="rounded-xl"
            />
          </li>
          <li class="md:w-[392px] max-w-[85%] md:max-w-[31%] block">
            <img
              src="/images/dinner-bracket-matchup.jpeg"
              alt="Head-to-head matchup voting"
              class="rounded-xl"
            />
          </li>
          <li class="md:w-[392px] max-w-[85%] md:max-w-[31%] block">
            <img
              src="/images/dinner-bracket-blue-theme.jpeg"
              alt="Themed bracket view"
              class="rounded-xl"
            />
          </li>
          <li class="md:w-[392px] max-w-[85%] md:max-w-[31%] block">
            <img
              src="/images/dinner-bracket-winner.jpeg"
              alt="Champion podium celebration"
              class="rounded-xl"
            />
          </li>
        </ul>
        <div class="flex mt-8 items-center">
          <a
            href="https://apps.apple.com/app/id6816172758"
            target="_blank"
            class="h-12 block"
          >
            <img
              src="/images/DownloadOnAppStore.svg"
              alt="Download on the App Store"
              class="h-full w-auto"
            />
          </a>
        </div>
        <div class="support mt-8 mb-48">
          <h2 class="text-2xl pt-serif-caption-regular text-center">Support</h2>
          <p class="mt-4">
            For help with the app, or to report bugs, please send an email to
            {" "}
            <a
              href="mailto:drclare2884+dinnerbracket@icloud.com"
              class="text-blue-400"
            >
              drclare2884+dinnerbracket@icloud.com
            </a>
            .
          </p>
          <p class="mt-2 text-gray-400 text-sm">
            DinnerBracket requires iOS 17 or later and is designed for iPhone
            and iPad.
          </p>
          <p class="mt-6 text-center text-gray-400 text-sm">
            <a href="/apps/dinner-bracket/privacy" class="text-blue-400">
              Privacy Policy
            </a>
            {" | "}
            <a href="/apps/dinner-bracket/terms" class="text-blue-400">
              Terms of Use
            </a>
          </p>
        </div>
      </main>
    </div>
  );
});
