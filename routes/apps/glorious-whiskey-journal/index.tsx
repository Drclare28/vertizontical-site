import { Head } from "fresh/runtime";
import { define } from "../../../utils.ts";

export default define.page(function GWJ() {
  return (
    <div>
      <Head>
        <title>The Glorious Whiskey Journal</title>
      </Head>
      <header class="bg-[url('images/HomeTopBackground.png')] bg-bottom bg-cover pt-3 pb-[38vw] md:pb-[17vw] px-6 md:min-h-[620px]">
        <a href="/">
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
        </a>
      </header>
      <main class="mt-[-7vw] flex flex-col justify-center items-center">
      </main>
    </div>
  );
});
