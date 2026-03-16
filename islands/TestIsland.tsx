import { useState } from "preact/hooks";

export default function TestIsland() {
  const [count, setCount] = useState(0);
  return (
    <div class="fixed top-2 left-2 z-[100] bg-white p-4 border-2 border-red-500 rounded-xl shadow-2xl">
      <p class="font-bold text-red-600">Hydration Test</p>
      <button
        type="button"
        onClick={() => setCount(count + 1)}
        class="bg-blue-500 text-white px-4 py-2 rounded mt-2 active:scale-95 transition-transform"
      >
        Click Me: {count}
      </button>
    </div>
  );
}
