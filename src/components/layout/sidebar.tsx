import { SidebarContent } from "@/components/layout/sidebar-content";

export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-64 bg-surface border-e border-border h-screen flex-shrink-0">
      <SidebarContent />
    </aside>
  );
}
