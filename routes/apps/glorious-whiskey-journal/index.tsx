import { Head } from "fresh/runtime";
import { define } from "../../../utils.ts";

export default define.page(function GWJ() {
  return (
    <div>
      <Head>
        <title>The Glorious Whiskey Journal</title>
      </Head>
      <main class="flex flex-col justify-center items-center px-4 max-w-[1224px] mx-auto">
        <img
          src="/images/GWJlogo.svg"
          alt="The Glorious Whiskey Journal"
          class="w-[370px] mt-12"
        />
        <a href="#" class="w-36 block mt-8">
          <img
            src="/images/DownloadOnAppStore.svg"
            alt="Download on the App Store"
            class="w-full"
          />
        </a>
        <div class="text max-w-3xl mt-8">
          <p class="mb-4">
            The Glorious Whiskey Journal is your personal companion for
            exploring and documenting your whiskey collection. Whether you're a
            casual enthusiast or a serious connoisseur, this app helps you
            track, organize, and remember every bottle you taste.
          </p>
          <h2 class="text-2xl pt-serif-caption-regular">Features</h2>
          <ul class="list-disc pl-4">
            <li>
              Digital Journal: Catalog your entire whiskey collection with
              detailed information about each bottle
            </li>
            <li>
              Photo integration: Capture and store photos of your favorite
              bottles.
            </li>
            <li>
              Tasting notes: Record detailed tasting notes including nose,
              palate, and finish
            </li>
            <li>
              Collection insights: View your collection organized by category,
              region, and style
            </li>
            <li>
              Smart each: Quickly find any whiskey with powerful search and
              filtering
            </li>
            <li>
              Custom sorting: Organize your collection by date, brand, proof,
              age, or rating
            </li>
          </ul>
        </div>
        <ul class="screenshots flex gap-8 flex-wrap mt-10 mx-auto justify-center">
          <li class="md:w-[392px] max-w-[85%] md:max-w-[31%] block">
            <img src="/images/HomeScreenshot.png" alt="Home Screen" />
          </li>
          <li class="md:w-[392px] max-w-[85%] md:max-w-[31%] block">
            <img src="/images/JournalScreenShot.png" alt="My Journal Screen" />
          </li>
          <li class="md:w-[392px] max-w-[85%] md:max-w-[31%] block">
            <img
              src="/images/WhiskeyViewScreenshot.png"
              alt="View Whiskey Screen"
            />
          </li>
        </ul>
        <a href="#" class="w-36 block mt-8 mb-8">
          <img
            src="/images/DownloadOnAppStore.svg"
            alt="Download on the App Store"
            class="w-full"
          />
        </a>
        <div class="support mt-8 mb-48">
          <h2 class="text-2xl pt-serif-caption-regular text-center">Support</h2>
          <p class="mt-4">
            For help with the app, or to report bugs, please send an email to
            <a href="mailto:gwjapp@icloud.com" class="text-blue-400 ml-1">
              gwjapp@icloud.com
            </a>.
          </p>
        </div>
      </main>
    </div>
  );
});
