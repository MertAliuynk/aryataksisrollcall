'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '../ui/button';
import { NavigationMenu } from './navigation';

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Menüyü aç</span>
      </Button>

      {/* Mobile Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Menü</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <NavigationMenu onItemClick={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}