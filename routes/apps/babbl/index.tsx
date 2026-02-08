import { Head } from "fresh/runtime";
import { define } from "../../../utils.ts";

export default define.page(function Babbl() {
  return (
    <div>
      <Head>
        <title>Babbl</title>
      </Head>
      <main class="flex flex-col justify-center items-center px-4 max-w-[1224px] mx-auto">
        <img
          src="/images/babbl-logo.svg"
          alt="Babbl"
          class="w-[370px] mt-12"
        />
        <a
          href="https://apps.apple.com/app/id6757442463"
          class="w-36 block mt-8"
        >
          <img
            src="/images/DownloadOnAppStore.svg"
            alt="Download on the App Store"
            class="w-full"
          />
        </a>
        <div class="text max-w-3xl mt-8">
          <p class="mb-4">
            Babbl is a new app for connecting with friends and family. It's a
            simple, way to share your life with the people who matter most.
          </p>
        </div>
        <ul class="screenshots flex gap-8 flex-wrap mt-10 mx-auto justify-center">
          <li class="md:w-[392px] max-w-[85%] md:max-w-[31%] block">
            <img
              src="/images/babbl-main-screen.png"
              alt="Home Screen"
              class="rounded-xl"
            />
          </li>
          <li class="md:w-[392px] max-w-[85%] md:max-w-[31%] block">
            <img
              src="/images/babbl-family-screen.png"
              alt=""
              class="rounded-xl"
            />
          </li>
          <li class="md:w-[392px] max-w-[85%] md:max-w-[31%] block">
            <img
              src="/images/babbl-child-screen.png"
              alt=""
              class="rounded-xl"
            />
          </li>
          <li class="md:w-[392px] max-w-[85%] md:max-w-[31%] block">
            <img
              src="/images/babbl-sharing-screen.png"
              alt=""
              class="rounded-xl"
            />
          </li>
        </ul>
        <a
          href="https://apps.apple.com/app/id6757442463"
          class="w-36 block mt-8 mb-8"
        >
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
            <a
              href="mailto:babbl@vertizonticalstudios.com"
              class="text-blue-400 ml-1"
            >
              babbl@vertizonticalstudios.com
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
});
