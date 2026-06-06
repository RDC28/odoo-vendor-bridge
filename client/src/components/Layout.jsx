import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300 relative overflow-hidden">
      {/* Decorative ambient background blobs for storytelling and depth */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 dark:bg-blue-600/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-green-400/10 dark:bg-green-600/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute top-[40%] right-[-5%] w-[30%] h-[30%] rounded-full bg-purple-400/10 dark:bg-purple-600/10 blur-[100px] pointer-events-none"></div>
      
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-w-0 relative z-10">
        <Topbar />
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
