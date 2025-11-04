export default function AppLayout({ Component }: { Component: any }) {
  return (
    <div class="layout mx-auto home-background-grad min-h-screen text-white">
      <Component />
    </div>
  );
}
