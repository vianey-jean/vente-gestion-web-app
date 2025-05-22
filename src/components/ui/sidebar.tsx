
import {
  Home,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  Users,
  MessageSquare,
  MessagesSquare,
  Tag,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SidebarItem } from "@/types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export interface SidebarProps {
  items?: SidebarItem[];
  collapsed?: boolean;
  onToggle?: () => void;
}

// Menu items configuration
export const adminSidebarItems = [
  {
    title: "Tableau de bord",
    href: "/admin",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "Commandes",
    href: "/admin/orders",
    icon: <ShoppingBag className="h-5 w-5" />,
  },
  {
    title: "Produits",
    href: "/admin/products",
    icon: <Package className="h-5 w-5" />,
  },
  {
    title: "Codes promo",
    href: "/admin/promo-codes",
    icon: <Tag className="h-5 w-5" />,
  },
  {
    title: "Utilisateurs",
    href: "/admin/users",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Messages",
    href: "/admin/messages",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    title: "Chat client",
    href: "/admin/chat",
    icon: <MessagesSquare className="h-5 w-5" />,
  },
  {
    title: "Paramètres",
    href: "/admin/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

export function Sidebar({ items = adminSidebarItems, collapsed = false, onToggle }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onToggle) {
      onToggle();
    }
  };

  return (
    <aside
      className={cn(
        "bg-white border-r border-gray-200 h-screen transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <h2 className="text-xl font-semibold text-gray-800">Admin</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="ml-auto"
          >
            {isCollapsed ? (
              <Menu className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    isCollapsed ? "justify-center px-0" : "px-3"
                  )}
                  onClick={() => navigate(item.href)}
                >
                  {item.icon}
                  {!isCollapsed && (
                    <span className="ml-3">{item.title}</span>
                  )}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
