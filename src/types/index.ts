
export interface SidebarItem {
  title: string;
  href: string;
  icon: React.ElementType;
  submenu?: SidebarItem[];
  requireAdmin?: boolean;
}

export interface SidebarProps {
  items?: SidebarItem[];
  collapsed?: boolean;
  onToggle?: () => void;
}
