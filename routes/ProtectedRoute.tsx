"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    } else {
      setIsLoading(false);
    }
  }, [router]);
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>ກຳລັງກວດສອບການເຂົ້າສູ່ລະບົບ...</p>
      </div>
    );
  }

  return <>{children}</>;
}