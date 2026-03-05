import {
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  LogOut,
  Package,
  ShoppingCart,
  FolderTree,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import Logo from "../../assests/logoA.png";

const navigationItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Products", url: "/admin/products", icon: Package },
   { title: "Categories", url: "/admin/categories", icon: FolderTree },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  // { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/admin") {
      return currentPath === "/admin";
    }
    return currentPath.startsWith(path);
  };

  const getNavClassName = (path: string) => {
    return isActive(path)
      ? "bg-primary/10 text-primary border-r-2 border-primary font-medium"
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";
  };

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      className={`border-r transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
            <img
              src={Logo}
              alt="Dashboard"
              className="w-full h-full object-contain"
            />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold text-foreground">Admin Panel</h2>
              <p className="text-xs text-muted-foreground">
                Management Dashboard
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="transition-colors">
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className={`flex items-center px-3 py-2 rounded-md transition-colors ${getNavClassName(
                        item.url
                      )}`}
                    >
                      <item.icon
                        className={`h-5 w-5 flex-shrink-0 ${
                          isCollapsed ? "" : "mr-3"
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="truncate">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <NavLink to="/" className="flex items-center">
                    <LogOut
                      className={`h-5 w-5 flex-shrink-0 ${
                        isCollapsed ? "" : "mr-3"
                      }`}
                    />
                    {!isCollapsed && <span>Logout</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}