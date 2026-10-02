import Sidebar from '@/src/components/layout/Sidebar';

// Demo build: PlantsProvider / PlantCodeBanner removed along with the plant
// registry fetch — the plant is a static constant (see AppContext).
export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen w-full bg-canvas text-text-primary overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}
