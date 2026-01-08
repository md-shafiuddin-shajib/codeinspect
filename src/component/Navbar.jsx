import React from "react";
import { Bot, Sun } from "lucide-react";



const navbar = () => {
  return (
    <>
      <div className="nav flex items-center justify-between h-22.5 bg-zinc-900" style={{padding:"0px 40px"}}>
        <div className="logo flex items-center gap-2 mb-2">
          <Bot className="size-10 text-green-400"/>
          <div className="flex items-center justify-center flex-nowrap">
            <span className="text-2xl font-bold text-green-400 font-mono">Code</span>
          <span className="text-2xl font-bold text-red-500 font-serif">Inspect</span>
          </div>
        </div>
       
      </div>
    </>
  );
};

export default navbar;
