'use client';

import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '../ui/sidebar';
import { NavigationMenu } from '../layout/navigation';

export function AppSidebar() {
  return (
    <Sidebar className="hidden md:flex">
      <SidebarHeader className="p-6">
        <h1 className="text-xl font-bold text-gray-900">
          Spor Kulübü
        </h1>
        <p className="text-sm text-gray-600">
          Yoklama Sistemi
        </p>
      </SidebarHeader>
      
      <SidebarContent className="px-4">
        <NavigationMenu />
      </SidebarContent>
    </Sidebar>
  );
}