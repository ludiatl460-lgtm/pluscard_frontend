"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  GitCompareArrows,
  Users,
  Menu,
  X,
  LogOut,
  CreditCard,
  ChevronRight,
  Clock,
  CalendarDays,
  User,
  ClipboardList
} from "lucide-react";

interface UserInfo {
  username?: string;
  name?: string;
  role?: string;
}

interface NavbarSidebarProps {
  children?: React.ReactNode;
}

const menuItems = [
  {
    title: "ໜ້າຫຼັກ",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "ທຽບຍອດທຸລະກຳ",
    path: "/upload",
    icon: GitCompareArrows,
  },
  {
    title: "ລາຍງານຜົນການທຽບ",
    path: "/reconciliation",
    icon: ClipboardList,
  },
  {
    title: "ຈັດການຜູ້ໃຊ້",
    path: "/user",
    icon: Users,
  },
];

export default function NavbarSidebar({
  children,
}: NavbarSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("userInfo");

      if (storedUser) {
        setUserInfo(JSON.parse(storedUser) as UserInfo);
      }
    } catch (error) {
      console.error("Cannot read user information:", error);
    }

    const updateDateTime = () => {
      const now = new Date();

      setCurrentDate(
        now.toLocaleDateString("lo-LA", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      );

      setCurrentTime(
        now.toLocaleTimeString("lo-LA", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
      );
    };

    updateDateTime();

    const timer = window.setInterval(updateDateTime, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userInfo");

    router.replace("/");
  };

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const navigateTo = (path: string) => {
    setSidebarOpen(false);
    router.push(path);
  };

  const displayName =
    userInfo?.name || userInfo?.username || "ຜູ້ໃຊ້";

  return (
    // ຕຶງ layout ໄວ້ເທົ່າໜ້າຈໍ: ທັງໜ້າບໍ່ເລື່ອນ, ມີແຕ່ <main> ທີ່ເລື່ອນ
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="ປິດເມນູ"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar: ສູງເທົ່າໜ້າຈໍ ແລະບໍ່ເລື່ອນຕາມເນື້ອໃນ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col
          bg-indigo-950 text-white shadow-xl
          transition-transform duration-300
          lg:static lg:h-screen lg:shrink-0 lg:translate-x-0
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
      >
        {/* Sidebar header */}
        <div className="flex h-20 shrink-0 items-center justify-between px-5">
          <button
            type="button"
            onClick={() => navigateTo("/dashboard")}
            className="flex items-center gap-3 text-left"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-indigo-900">
              <CreditCard size={25} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-wide">
                PETRO TRADE
              </h1>
              <p className="text-xs text-indigo-200">
                Reconciliation Portal
              </p>
            </div>
          </button>

          <button
            type="button"
            aria-label="ປິດ Sidebar"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-indigo-100 hover:bg-white/10 lg:hidden"
          >
            <X size={21} />
          </button>
        </div>

        {/* Menu label */}
        <div className="mb-3 shrink-0 border-b border-white/10 px-5 pb-2 pt-7">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-300">
            Main Menu
          </p>
        </div>

        {/* Sidebar menu */}
        <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigateTo(item.path)}
                className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white text-indigo-900 shadow-sm"
                    : "text-indigo-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={20} />

                <span className="flex-1 text-left">
                  {item.title}
                </span>

                {active && <ChevronRight size={17} />}
              </button>
            );
          })}
        </nav>

        {/* Sidebar user information */}
        <div className="shrink-0 border-t border-white/10 p-4">
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-white/10 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white font-bold text-indigo-900">
              <User/>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {displayName}
              </p>
              <p className="truncate text-xs text-indigo-200">
                {userInfo?.role || "ADMIN"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-indigo-100 transition-colors hover:bg-red-500/20 hover:text-white"
          >
            <LogOut size={19} />
            <span>ອອກຈາກລະບົບ</span>
          </button>
        </div>
      </aside>

      {/* Main area: min-h-0 ເພື່ອໃຫ້ <main> ເລື່ອນພາຍໃນໄດ້ */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Navbar: ຢູ່ກັບທີ່ເທິງສຸດ (shrink-0) */}
        <header className="z-30 flex h-20 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="ເປີດເມນູ"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 lg:hidden"
            >
              <Menu size={23} />
            </button>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-gray-800 sm:text-xl">
                PETRO TRADE
              </h2>
              <p className="hidden text-xs text-gray-500 sm:block">
                Reconciliation Management System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden items-center gap-2 text-sm text-gray-600 md:flex">
              <CalendarDays
                size={17}
                className="text-indigo-600"
              />
              <span>{currentDate}</span>
            </div>

            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Clock size={17} className="text-indigo-600" />
              <span className="tabular-nums">{currentTime}</span>
            </div>

            <div className="hidden h-9 w-px bg-gray-200 sm:block" />

            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-800">
                <User/>
              </div>

              <div className="hidden max-w-32 md:block">
                <p className="truncate text-sm font-semibold text-gray-800">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500">
                  {userInfo?.role || "ADMIN"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content: ເປັນຕົວເລື່ອນຕົວດຽວຂອງທັງໜ້າ */}
        <main className="min-h-0 flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          {children ?? (
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800">
                ຍິນດີຕ້ອນຮັບ
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                ລະບົບຈັດການ ແລະກວດສອບລາຍການ PLUS CARD.
              </p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}