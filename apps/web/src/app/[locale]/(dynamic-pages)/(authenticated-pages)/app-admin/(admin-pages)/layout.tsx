import { InternalNavbar } from "@/components/navigation-menu/internal-navbar";
import { SidebarProviderWithState } from "@/components/sidebar-provider-with-state";
import { SidebarInset } from "@/components/ui/sidebar";

export default async function Layout({
  children,
  sidebar,
  navbar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  navbar: React.ReactNode;
}) {
  return (
    <SidebarProviderWithState>
      {sidebar}
      <SidebarInset
        className="overflow-hidden"
        style={{
          maxHeight: "calc(100svh - 16px)",
        }}
      >
        <div className="overflow-y-auto">
          <div
            className="h-full overflow-y-auto"
            data-testid="admin-panel-layout"
          >
            <InternalNavbar>
              <div
                className="flex w-full items-center justify-start"
                data-testid="admin-panel-title"
              >
                {navbar}
              </div>
            </InternalNavbar>
            <div className="relative h-auto w-full flex-1">
              <div className="space-y-6 px-6 py-6">
                <p>
                  All sections of this area are protected and only accessible by
                  Application Admins.
                </p>
                {children}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProviderWithState>
  );
}
