'use client';

import { MobileNav } from "./mobile-nav";

export function Header() {
  return (
    <header className="border-b bg-white px-4 py-3 md:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <MobileNav />
          <h1 className="text-lg font-semibold md:text-xl">
            Arya Taksis Yoklama Sistemi
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 hidden md:block">
            {new Date().toLocaleDateString('tr-TR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>
    </header>
  );
}