"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  FileText,
  Users,
  Archive,
  CalendarCheck,
  AlertTriangle,
  Layers,
  Target,
  type LucideIcon,
  User,
} from "lucide-react";
import NavbarSidebar from "@/layout/NavbarSidebar";
import ProtectedRoute from "@/routes/ProtectedRoute";
import { useDashboardReport } from "@/hooks/UseDashboardReport";
import {
  type DashboardReport,
  type ReconcileStatus,
  type StatusCounts,
} from "@/types/Dashboard";

// ---------- Config ----------

const STATUS_META: Record<
  ReconcileStatus,
  { label: string; color: string; badge: string }
> = {
  MATCHED: {
    label: "ກົງກັນ",
    color: "#10b981",
    badge: "bg-emerald-100 text-emerald-800",
  },
  AMOUNT_MISMATCH: {
    label: "ຍອດເງິນບໍ່ກົງ",
    color: "#f59e0b",
    badge: "bg-amber-100 text-amber-800",
  },
  PARTIAL_MATCH: {
    label: "ກົງບາງສ່ວນ",
    color: "#f97316",
    badge: "bg-orange-100 text-orange-800",
  },
  ONLY_IN_FRONTEND: {
    label: "ມີສະເພາະ Frontend",
    color: "#0ea5e9",
    badge: "bg-sky-100 text-sky-800",
  },
  ONLY_IN_BACKEND: {
    label: "ມີສະເພາະ Backend",
    color: "#f43f5e",
    badge: "bg-rose-100 text-rose-800",
  },
};

const STATUS_ORDER: ReconcileStatus[] = [
  "MATCHED",
  "AMOUNT_MISMATCH",
  "PARTIAL_MATCH",
  "ONLY_IN_FRONTEND",
  "ONLY_IN_BACKEND",
];

const EMPTY_STATUS_COUNTS: StatusCounts = {
  MATCHED: 0,
  AMOUNT_MISMATCH: 0,
  PARTIAL_MATCH: 0,
  ONLY_IN_FRONTEND: 0,
  ONLY_IN_BACKEND: 0,
};

const fmtDate = (iso: string) => new Date(iso).toLocaleString("lo-LA");

// ---------- Sub components ----------

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  iconBg: string; // ສີພື້ນຂອງໄອຄອນ
  accent: string; // ສີແຖບດ້ານເທິງ
  hint?: string;
}

function StatCard({ title, value, icon: Icon, iconBg, accent, hint }: StatCardProps) {
  return (
    <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5">
      <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">
            {value.toLocaleString()}
          </p>
          {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        </div>
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-72" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Skeleton className="h-96 lg:col-span-2" />
        <Skeleton className="h-96 lg:col-span-3" />
      </div>
      <Skeleton className="h-72" />
    </div>
  );
}

function getSafeReport(report: DashboardReport | null): DashboardReport {
  return (
    report ?? {
      cards: {
        resultCount: 0,
        userCount: 0,
        resultOlderThanThreeMonth: 0,
        resultToday: 0,
      },
      statusCounts: EMPTY_STATUS_COUNTS,
      statusChart: [],
      latestResults: [],
    }
  );
}

// ---------- Page ----------

export default function Dashboard() {
  const { error, loading, reports } = useDashboardReport();
  const report = getSafeReport(reports);

  const totalItems = useMemo(
    () =>
      STATUS_ORDER.reduce(
        (sum, status) => sum + (report.statusCounts[status] ?? 0),
        0
      ),
    [report]
  );

  const matchRate = useMemo(() => {
    if (totalItems === 0) return 0;
    return (report.statusCounts.MATCHED / totalItems) * 100;
  }, [report, totalItems]);

  const chartData = useMemo(
    () =>
      report.statusChart.map((item) => ({
        name: STATUS_META[item.status]?.label ?? item.status,
        status: item.status,
        value: item.count ?? 0,
      })),
    [report.statusChart]
  );

  const issueCount = totalItems - (report.statusCounts.MATCHED ?? 0);

  const tooltipFormatter = (
    value: number | string | readonly (number | string)[] | undefined,
    name: string | number | undefined
  ) => {
    const numericValue = Array.isArray(value)
      ? Number(value[0] ?? 0)
      : Number(value ?? 0);

    return [`${numericValue.toLocaleString()} ລາຍການ`, String(name ?? "")];
  };

  return (
    <ProtectedRoute>
      <NavbarSidebar>
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              ແດຊບອດ (Dashboard)
            </h1>
            <p className="text-sm text-slate-500">
              ພາບລວມຜົນການກວດສອບຍອດ (Reconciliation) ທັງໝົດໃນລະບົບ
            </p>
          </div>

          {loading && <DashboardSkeleton />}

          {!loading && error && (
            <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-5">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-semibold">ບໍ່ສາມາດດຶງຂໍ້ມູນ Dashboard ໄດ້</p>
                <p className="text-sm opacity-80">{String(error)}</p>
              </div>
            </div>
          )}

          {!loading && !error && report && (
            <>
              {/* ===== 4 KPI Cards ===== */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                  title="Result ທັງໝົດ"
                  value={report.cards.resultCount}
                  icon={FileText}
                  iconBg="bg-gradient-to-br from-indigo-500 to-indigo-700"
                  accent="bg-indigo-600"
                  hint="ຮອບການກວດສອບທີ່ບັນທຶຓແລ້ວ"
                />
                <StatCard
                  title="ຜູ້ໃຊ້ທັງໝົດ"
                  value={report.cards.userCount}
                  icon={Users}
                  iconBg="bg-gradient-to-br from-sky-500 to-sky-700"
                  accent="bg-sky-500"
                  hint="ບັນຊີທີ່ໃຊ້ງານລະບົບ"
                />
                <StatCard
                  title="Result ມື້ນີ້"
                  value={report.cards.resultToday}
                  icon={CalendarCheck}
                  iconBg="bg-gradient-to-br from-emerald-500 to-emerald-700"
                  accent="bg-emerald-500"
                  hint="ສ້າງໃນມື້ນີ້"
                />
                <StatCard
                  title="ເກົ່າກວ່າ 3 ເດືອນ"
                  value={report.cards.resultOlderThanThreeMonth}
                  icon={Archive}
                  iconBg="bg-gradient-to-br from-amber-500 to-orange-600"
                  accent="bg-amber-500"
                  hint="ພິຈາລະນາເກັບຖາວອນ / ລຶບ"
                />
              </div>

              {/* ===== Status chart + breakdown ===== */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Donut */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-slate-800">
                      ສັດສ່ວນສະຖານະລາຍການ
                    </h3>
                  </div>

                  {totalItems === 0 ? (
                    <div className="h-72 flex items-center justify-center text-sm text-slate-400">
                      ຍັງບໍ່ມີລາຍການ
                    </div>
                  ) : (
                    <div className="relative h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData.filter((d) => d.value > 0)}
                            dataKey="value"
                            nameKey="name"
                            innerRadius="62%"
                            outerRadius="88%"
                            paddingAngle={3}
                            stroke="none"
                          >
                            {chartData
                              .filter((d) => d.value > 0)
                              .map((d) => (
                                <Cell
                                  key={d.status}
                                  fill={STATUS_META[d.status]?.color ?? "#cbd5e1"}
                                />
                              ))}
                          </Pie>
                          <Tooltip
                            formatter={tooltipFormatter}
                            contentStyle={{
                              borderRadius: 12,
                              border: "1px solid #e2e8f0",
                              fontSize: 12,
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      {/* ຕົວເລກກາງ donut */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-bold text-slate-800">
                          {totalItems.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-500">ລາຍການທັງໝົດ</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Breakdown */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                      <div className="p-2.5 bg-emerald-500 rounded-lg">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-emerald-700">Match Rate</p>
                        <p className="text-2xl font-bold text-emerald-800">
                          {matchRate.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 rounded-xl p-4">
                      <div className="p-2.5 bg-rose-500 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-rose-700">ລາຍການທີ່ຕ້ອງກວດ</p>
                        <p className="text-2xl font-bold text-rose-800">
                          {issueCount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {STATUS_ORDER.map((status) => {
                      const count = report.statusCounts[status] ?? 0;
                      const pct = totalItems ? (count / totalItems) * 100 : 0;
                      const meta = STATUS_META[status];

                      return (
                        <div key={status}>
                          <div className="flex items-center justify-between text-sm mb-1.5">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: meta.color }}
                              />
                              <span className="font-medium text-slate-700">
                                {meta.label}
                              </span>
                              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                                {status}
                              </span>
                            </div>
                            <span className="text-slate-600">
                              <span className="font-semibold text-slate-800">
                                {count.toLocaleString()}
                              </span>{" "}
                              <span className="text-xs text-slate-400">
                                ({pct.toFixed(1)}%)
                              </span>
                            </span>
                          </div>
                          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: meta.color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ===== Latest results table ===== */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-slate-800">
                      Result ລ່າສຸດ ({report.latestResults.length} ລາຍການ)
                    </h3>
                  </div>
                </div>

                {report.latestResults.length === 0 ? (
                  <div className="py-12 text-center text-sm text-slate-400">
                    ຍັງບໍ່ມີຂໍ້ມູນ Result
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                        <tr>
                          <th className="px-6 py-3">Result ID</th>
                          <th className="px-6 py-3">ຜູ້ອັບໂຫລດ</th>
                          <th className="px-6 py-3">ເພດ</th>
                          <th className="px-6 py-3">ເບອໂທລະສັບ</th>
                          <th className="px-6 py-3">ອີເມວ</th>
                          <th className="px-6 py-3">ວັນທີ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {report.latestResults.map((result) => (
                          <tr key={result.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-3.5">
                              <span className="font-mono text-xs bg-indigo-50 text-indigo-900 px-2 py-1 rounded-md">
                                {result.id}
                              </span>
                            </td>
                            <td className="px-6 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-500 to-indigo-800 text-white flex items-center justify-center text-sm font-semibold">
                                  <User/>
                                </div>
                                <span className="font-medium text-slate-800">
                                  {result.name} {result.lastname}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-3.5">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  result.gender === "MALE"
                                    ? "bg-sky-100 text-sky-800"
                                    : "bg-pink-100 text-pink-800"
                                }`}
                              >
                                {result.gender === "MALE" ? "ຊາຍ" : "ຍິງ"}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-slate-700">
                              {result.contact || "-"}
                            </td>
                            <td className="px-6 py-3.5 text-slate-700">
                              {result.email || "-"}
                            </td>
                            <td className="px-6 py-3.5 text-slate-500 whitespace-nowrap">
                              {fmtDate(result.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </NavbarSidebar>
    </ProtectedRoute>
  );
}