import { Head } from "fresh/runtime";
import { define } from "../utils.ts";

export default define.page(function Home() {
  return (
    <div>
      <Head>
        <title>Vertizontical Studios</title>
      </Head>
      <header class="bg-[url('/images/HomeTopBackground.png')] bg-bottom bg-cover pt-3 pb-[38vw] md:pb-[17vw] px-6 md:min-h-[620px]">
        <img
          src="/images/VSlogo.png"
          alt="VS"
          class="max-w-[85%] w-[460px] mx-auto "
        />
        <img
          src="/images/VStext.svg"
          alt="Vertizontical Studios"
          class="mx-auto max-w-[460px]"
        />
        <span class="mx-auto w-max block text-[1em] md:text-[1.3em] mt-2">
          web and app development and design
        </span>
      </header>
      <main class="mt-[-7vw] flex flex-col items-center min-h-screen">
        <div class="babbl flex flex-col justify-center items-center">
          <a href="apps/babbl">
            <img
              src="/images/babbl-icon.png"
              alt="Babbl"
              class="w-32 md:w-48 drop-shadow-xl mx-auto rounded-[27.5%]"
            />
            <span class="max-w-48 block w-full pt-serif-caption-regular text-xl mt-4 text-center text-gray-400">
              Babbl
            </span>
          </a>
          <div class="flex gap-4 mt-4 items-center">
            <a
              href="https://apps.apple.com/us/app/babbl-family-messaging/id6757442463"
              class="h-12 block"
            >
              <img
                src="/images/DownloadOnAppStore.svg"
                alt="Download on the App Store"
                class="h-full w-auto"
              />
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.vertizonticalstudios.babbl"
              class="h-12 block"
            >
              <img
                src="/images/GetItOnGooglePlay.svg"
                alt="Get it on Google Play"
                class="h-full w-auto"
              />
            </a>
          </div>
        </div>
        <hr class="w-50 border-gray-500/25 mt-12" />
        <div class="gwj flex flex-col justify-center items-center mt-12">
          <a href="apps/glorious-whiskey-journal">
            <img
              src="/images/GWJicon.png"
              alt="The Glorious Whiskey Journal"
              class="w-32 md:w-48 drop-shadow-xl mx-auto"
            />
            <span class="w-max max-w-48 block pt-serif-caption-regular text-xl mt-4 text-center text-gray-400">
              The Glorious Whiskey Journal
            </span>
          </a>
          <a
            href="https://apps.apple.com/us/app/the-glorious-whiskey-journal/id6754341010"
            class="mt-4 h-12 block"
          >
            <img
              src="/images/DownloadOnAppStore.svg"
              alt="Download on the App Store"
              class="h-full w-auto"
            />
          </a>
        </div>
      </main>
    </div>
  );
});
