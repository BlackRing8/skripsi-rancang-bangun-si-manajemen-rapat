import { MobileSideBar } from "./mobile-sidebar";
import NavbarRoutes from "./navbar-routes";

export const Navbar = () => {
  return (
    <div className="p-6 border-b flex items-center bg-white shadow-sm">
      <MobileSideBar />
      <NavbarRoutes />
    </div>
  );
};
