import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../features/debugger/Sidebar';
import { useUiStore } from '../../store/uiStore';

const AuthLayout = ({ children }) => {
  const { isSidebarOpen, setSidebarOpen } = useUiStore();
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  return (
    <div className="flex h-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden relative">
      <div
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={`duration-350 ease-in-out h-full border-r border-zinc-200/50 dark:border-zinc-800 transition-all ${
          isSidebarOpen
            ? "w-[260px] overflow-hidden"
            : "w-[52px] overflow-visible z-50"
        }`}
      >
        <div className={`${isSidebarOpen ? "w-[260px]" : "w-[52px]"} h-full`}>
          <Sidebar
            isOpen={isSidebarOpen}
            onToggle={() => setSidebarOpen(!isSidebarOpen)}
            isSidebarHovered={isSidebarHovered}
          />
        </div>
      </div>

      <main className="flex-1 h-full overflow-hidden relative">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default AuthLayout;
