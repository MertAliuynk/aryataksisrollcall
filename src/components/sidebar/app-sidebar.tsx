'use client';

import { NavigationMenu } from '../layout/navigation';

export function AppSidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-900">
          Arya Taksi
        </h1>
        <p className="text-sm text-gray-600">
          Yoklama Sistemi
        </p>
      </div>
      <div className="px-4">
        <NavigationMenu />
      </div>
    </aside>
  );
}