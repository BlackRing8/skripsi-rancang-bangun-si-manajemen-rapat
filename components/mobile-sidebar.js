"use client";
import { Sidebar } from "./sidebar";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import { Menu } from "lucide-react";

export const MobileSideBar = () => {
  return (
    <Sheet>
      <SheetTrigger className="xl:hidden pr-4 hover:opacity-75 transition">
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="p-0  w-80 bg-sky-200">
        <SheetHeader>
          <VisuallyHidden>
            <SheetTitle>Profile</SheetTitle>
            <SheetDescription>yes</SheetDescription>
          </VisuallyHidden>
        </SheetHeader>
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
};
