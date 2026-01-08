import React from "react";

const Footer = () => {
  return (
    <footer className="w-full h-[49px] bg-zinc-900 border-t border-zinc-800 flex items-center justify-center px-4">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm text-zinc-400">
        <span className="flex items-center gap-1">
          © 2026 
          <span className="text-white font-medium">Md. Shafiuddin Shajib</span>
        </span>
        <span className="hidden sm:inline text-zinc-600">•</span>
        <span>All rights reserved</span>
      </div>
    </footer>
  );
};

export default Footer;