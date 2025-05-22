
import React from 'react';

export interface SidebarItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  submenu?: SidebarItem[];
  requireAdmin?: boolean;
}

export interface SidebarProps {
  items?: SidebarItem[];
  collapsed?: boolean;
  onToggle?: () => void;
}

// Add NavItem to fix sidebar.tsx import error
export interface NavItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  external?: boolean;
  label?: string;
}

export interface NavConfig {
  mainNav: NavItem[];
  sidebarNav: NavItem[];
}
