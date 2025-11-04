export default function AppLayout({ Component }: { Component: any }) {
  return (
    <div class="content-layout background-grad min-h-screen">
      <Component />
    </div>
  );
}
