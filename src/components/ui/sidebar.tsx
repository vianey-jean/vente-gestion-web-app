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
} from "lucide-react";

import { NavItem } from "@/types";

export interface NavConfig {
  mainNav: NavItem[]
  sidebarNav: NavItem[]
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
