'use client';

import { Header } from "../../components/layout/header";
import { NavigationMenu } from "../../components/layout/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="px-6 py-6">
            <h1 className="text-xl font-bold text-gray-900">
              Spor Kulübü
            </h1>
            <p className="text-sm text-gray-600">
              Yoklama Sistemi
            </p>
          </div>
          <div className="flex-1 px-4">
            <NavigationMenu />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}