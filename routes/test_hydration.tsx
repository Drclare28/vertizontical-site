import { define } from "../utils.ts";
import TestIsland from "../islands/TestIsland.tsx";

export default define.page(function TestPage() {
  return (
    <div class="p-10">
      <h1 class="text-2xl font-bold mb-4">Hydration Test</h1>
      <TestIsland />
    </div>
  );
});
