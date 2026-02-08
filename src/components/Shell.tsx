import Sidebar from "@/components/Sidebar";

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-56">
        <div className="p-8 max-w-[1400px]">{children}</div>
      </main>
    </div>
  );
}
