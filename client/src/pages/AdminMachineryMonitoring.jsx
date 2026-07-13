import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../api/axios";
import Sidebar from "../components/admin/Sidebar";
import Header from "../components/admin/Header";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Settings2,
  Thermometer,
  Vibrate,
  LineChart as LineChartIcon,
  History,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const POLL_INTERVAL_MS = 2000;
const MAX_READINGS_HISTORY = 120;
const MAX_HISTORY_TABLE_ROWS = 40;
/** Consider device "on" if last reading was within this many ms */
const DEVICE_ON_WINDOW_MS = 2 * 60 * 1000;

// Mock machines for UI demonstration
const MOCK_MACHINES = [
  {
    _id: "mock-1",
    machineId: "MACH-002",
    name: "CNC Router B (Idle)",
    tempThreshold: 75,
    vibrationThreshold: 8,
    lastTemperature: 0,
    lastVibration: 0,
    lastReadingAt: new Date(Date.now() - 10000000).toISOString(),
    isMock: true,
  },
  {
    _id: "mock-2",
    machineId: "MACH-003",
    name: "Edge Bander (Maintenance)",
    tempThreshold: 80,
    vibrationThreshold: 6,
    lastTemperature: 0,
    lastVibration: 0,
    lastReadingAt: new Date(Date.now() - 10000000).toISOString(),
    isMock: true,
  },
  {
    _id: "mock-3",
    machineId: "MACH-004",
    name: "Panel Saw (Offline)",
    tempThreshold: 70,
    vibrationThreshold: 10,
    lastTemperature: 0,
    lastVibration: 0,
    lastReadingAt: new Date(Date.now() - 10000000).toISOString(),
    isMock: true,
  }
];

function isOverThreshold(m) {
  if (m == null) return false;
  const tempOver =
    typeof m.lastTemperature === "number" &&
    typeof m.tempThreshold === "number" &&
    m.lastTemperature > m.tempThreshold;
  const vibOver =
    typeof m.lastVibration === "number" &&
    typeof m.vibrationThreshold === "number" &&
    m.lastVibration > m.vibrationThreshold;
  return tempOver || vibOver;
}

/** True if the machine has sent a reading recently (device is "on"). */
function isMachineOn(m) {
  if (m == null || !m.lastReadingAt) return false;
  const age = Date.now() - new Date(m.lastReadingAt).getTime();
  return age < DEVICE_ON_WINDOW_MS;
}

export default function AdminMachineryMonitoring() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingMachine, setEditingMachine] = useState(null);
  const [editForm, setEditForm] = useState({ tempThreshold: "", vibrationThreshold: "" });
  const [saving, setSaving] = useState(false);
  const [viewFilter, setViewFilter] = useState("all");
  const [readingsHistory, setReadingsHistory] = useState([]);
  const [graphMachineId, setGraphMachineId] = useState(null);

  const fetchMachines = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get("/machinery/machines");
      const list = res.data.machines || [];
      // Combine API machines with Mock machines
      const fullList = [...list, ...MOCK_MACHINES];
      setMachines(fullList);
      
      setReadingsHistory((prev) => {
        const now = Date.now();
        const fromOnDevices = fullList
          .filter(isMachineOn)
          .map((m) => ({
            timestamp: now,
            machineId: m.machineId,
            machineName: m.name || m.machineId,
            temperature: m.lastTemperature,
            vibration: m.lastVibration,
          }));
        const next = [...prev, ...fromOnDevices];
        return next.slice(-MAX_READINGS_HISTORY);
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load machines");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMachines();
    const interval = setInterval(fetchMachines, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchMachines]);

  useEffect(() => {
    const viewMachines = viewFilter === "alerts" ? machines.filter(isOverThreshold) : machines;
    if (viewMachines.length > 0 && (!graphMachineId || !viewMachines.find(m => m.machineId === graphMachineId))) {
      // Prioritize selecting a real machine initially if there is one
      const actualMachine = viewMachines.find((m) => !m.isMock);
      setGraphMachineId(actualMachine ? actualMachine.machineId : viewMachines[0].machineId);
    }
  }, [machines, graphMachineId, viewFilter]);

  const openEdit = (machine) => {
    setEditingMachine(machine);
    setEditForm({
      tempThreshold: machine.tempThreshold ?? "",
      vibrationThreshold: machine.vibrationThreshold ?? "",
    });
  };

  const closeEdit = () => {
    setEditingMachine(null);
    setSaving(false);
  };

  const saveThresholds = async () => {
    if (!editingMachine) return;
    const temp = Number(editForm.tempThreshold);
    const vib = Number(editForm.vibrationThreshold);
    if (Number.isNaN(temp) && Number.isNaN(vib)) return;
    
    // For mock machines, simulate save
    if (editingMachine.isMock) {
        setSaving(true);
        setTimeout(() => {
            setMachines((prev) =>
                prev.map((m) => (m._id === editingMachine._id ? { ...m, tempThreshold: temp, vibrationThreshold: vib } : m))
            );
            closeEdit();
        }, 500);
        return;
    }

    try {
      setSaving(true);
      const payload = {};
      if (!Number.isNaN(temp)) payload.tempThreshold = temp;
      if (!Number.isNaN(vib)) payload.vibrationThreshold = vib;
      await api.patch(`/machinery/machines/${editingMachine._id}`, payload);
      setMachines((prev) =>
        prev.map((m) => (m._id === editingMachine._id ? { ...m, ...payload } : m))
      );
      closeEdit();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update thresholds");
    } finally {
      setSaving(false);
    }
  };

  const overCount = machines.filter(isOverThreshold).length;
  const totalMachines = machines.length;
  const healthyCount = Math.max(totalMachines - overCount, 0);
  const filteredMachines = viewFilter === "alerts" ? machines.filter(isOverThreshold) : machines;

  const graphData = useMemo(() => {
    if (!graphMachineId) return [];
    const raw = readingsHistory
      .filter((r) => r.machineId === graphMachineId)
      .sort((a, b) => a.timestamp - b.timestamp);
    return raw.map((r) => ({
      time: r.timestamp,
      timeLabel: new Date(r.timestamp).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      temperature: typeof r.temperature === "number" ? r.temperature : null,
      vibration: typeof r.vibration === "number" ? r.vibration : null,
    }));
  }, [readingsHistory, graphMachineId]);

  const historyTableRows = useMemo(() => {
    const byTime = [...readingsHistory].sort((a, b) => b.timestamp - a.timestamp);
    let slice = byTime.slice(0, MAX_HISTORY_TABLE_ROWS);
    if (viewFilter === "alerts") {
      const alertedIds = new Set(machines.filter(isOverThreshold).map(m => m.machineId));
      slice = slice.filter(row => alertedIds.has(row.machineId));
    }
    return slice;
  }, [readingsHistory, viewFilter, machines]);

  const formatTime = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden font-sans">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {/* Subtle decorative background blur gradients */}
        <div className="absolute top-0 right-0 -mr-40 -mt-40 h-[500px] w-[500px] rounded-full bg-emerald-400/10 blur-[100px] pointer-events-none" />
        <div className="absolute top-40 left-0 -ml-40 h-[600px] w-[600px] rounded-full bg-blue-400/5 blur-[120px] pointer-events-none" />

        <main className="flex-1 overflow-y-auto relative z-10">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Top: Title + Live + Refresh */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  </span>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">
                    Live System
                  </span>
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
                  Machinery Intelligence
                </h1>
                <p className="mt-2 text-sm text-gray-500 max-w-xl">
                  Real-time temperature, vibration monitoring, and predictive alerting. Adjust operational limits to maintain safety requirements.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setLoading(true); fetchMachines(); }}
                className="group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-white/80 backdrop-blur-md border border-gray-200/50 px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:shadow-md hover:bg-white hover:-translate-y-0.5 transition-all duration-300 shrink-0 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                <RefreshCw className="h-4 w-4 relative z-10 group-hover:rotate-180 transition-transform duration-500 text-blue-600" aria-hidden />
                <span className="relative z-10">Refresh Data</span>
              </button>
            </div>

            {/* Status strip: glassmorphism style */}
            <div className="mb-10 rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 pointer-events-none" />
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em] mb-6 relative z-10">
                System Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                <div className="bg-white/50 rounded-2xl p-5 border border-gray-100/50 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                  <p className="text-4xl font-extrabold text-gray-900 tabular-nums">{totalMachines}</p>
                  <p className="mt-1.5 text-sm font-medium text-gray-500">Total Machinery</p>
                </div>
                <div className="bg-white/50 rounded-2xl p-5 border border-red-50 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                  <p className="text-4xl font-extrabold text-red-600 tabular-nums">{overCount}</p>
                  <p className="mt-1.5 text-sm font-medium text-red-400 flex items-center gap-1.5">
                    {overCount > 0 && <AlertTriangle className="h-4 w-4" />}
                    Critical Alerts
                  </p>
                </div>
                <div className="bg-white/50 rounded-2xl p-5 border border-emerald-50 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                  <p className="text-4xl font-extrabold text-emerald-600 tabular-nums">{healthyCount}</p>
                  <p className="mt-1.5 text-sm font-medium text-emerald-500 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    Optimal Operations
                  </p>
                </div>
              </div>
              {/* Sleek mini health bar */}
              {totalMachines > 0 && (
                <div className="mt-8 flex h-3 w-full overflow-hidden rounded-full bg-gray-200/50 relative z-10 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-1000 ease-out"
                    style={{ width: `${(healthyCount / totalMachines) * 100}%` }}
                  />
                  <div
                    className="bg-gradient-to-r from-red-400 to-red-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                    style={{ width: `${(overCount / totalMachines) * 100}%` }}
                  />
                </div>
              )}
            </div>

            {/* Machines section */}
            <section className="mb-10" aria-labelledby="machines-heading">
              {machines.length > 0 && (
                <div className="flex items-center justify-between gap-4 mb-6">
                  <h2 id="machines-heading" className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                    Operational Nodes
                  </h2>
                  <div className="inline-flex rounded-2xl bg-white/80 backdrop-blur-md p-1.5 shadow-sm border border-gray-200/50">
                    <button
                      type="button"
                      onClick={() => setViewFilter("all")}
                      className={`rounded-xl px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                        viewFilter === "all" ? "bg-gray-900 text-white shadow-md shadow-gray-900/20" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewFilter("alerts")}
                      className={`rounded-xl px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                        viewFilter === "alerts" ? "bg-red-500 text-white shadow-md shadow-red-500/20" : "text-gray-500 hover:text-gray-800 hover:bg-red-50"
                      }`}
                    >
                      Alerts Only
                    </button>
                  </div>
                </div>
              )}
              {loading && machines.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-200/50 bg-white/60 backdrop-blur-sm py-24 shadow-sm">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 rounded-full blur-md bg-blue-400/30 animate-pulse" />
                    <RefreshCw className="relative h-12 w-12 text-blue-500 animate-spin" aria-hidden />
                  </div>
                  <p className="text-base font-bold text-gray-800">Initializing Data Link</p>
                  <p className="text-sm text-gray-500 mt-2">Connecting to IoT sensors…</p>
                </div>
              ) : error ? (
                <div className="rounded-3xl border border-red-200/50 bg-white/80 backdrop-blur-md p-10 text-center max-w-md mx-auto shadow-xl shadow-red-100/50">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500 mb-6 border border-red-200">
                    <AlertTriangle className="h-8 w-8" aria-hidden />
                  </div>
                  <p className="text-xl font-bold text-gray-900">Connection Interrupted</p>
                  <p className="text-sm text-gray-500 mt-2 mb-8">{error}</p>
                  <button
                    type="button"
                    onClick={() => { setLoading(true); fetchMachines(); }}
                    className="w-full rounded-2xl bg-gray-900 px-5 py-3.5 text-sm font-bold text-white hover:bg-gray-800 transition-all focus:ring-4 focus:ring-gray-900/10 shadow-lg shadow-gray-900/20"
                  >
                    Retry Connection
                  </button>
                </div>
              ) : filteredMachines.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-gray-300/50 bg-white/50 backdrop-blur-sm py-20 text-center">
                  {machines.length === 0 ? (
                    <>
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 mb-6">
                         <Activity className="h-8 w-8" aria-hidden />
                      </div>
                      <p className="text-lg font-bold text-gray-800">No Nodes Registered</p>
                      <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">
                        Data from connected timber processing units will naturally populate this interface once telemetry transmission starts.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-500 mb-6">
                         <CheckCircle2 className="h-8 w-8" aria-hidden />
                      </div>
                      <p className="text-lg font-bold text-gray-800">All Systems Nominal</p>
                      <p className="text-sm text-gray-500 mt-2">Zero machinery parameter breaches detected across operational nodes.</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredMachines.map((m) => {
                    const over = isOverThreshold(m);
                    const tempOver =
                      typeof m.lastTemperature === "number" &&
                      typeof m.tempThreshold === "number" &&
                      m.lastTemperature > m.tempThreshold;
                    const vibOver =
                      typeof m.lastVibration === "number" &&
                      typeof m.vibrationThreshold === "number" &&
                      m.lastVibration > m.vibrationThreshold;
                    const displayName = m.name || m.machineId || "Unknown";
                    const isMock = m.isMock;
                    const isOnline = isMock ? false : isMachineOn(m);

                    return (
                      <article
                        key={m._id}
                        className={`group relative rounded-3xl border backdrop-blur-xl bg-white/80 p-0 shadow-[0_8px_30px_rgb(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_20px_40px_rgb(0,0,0,0.1)] hover:-translate-y-1 overflow-hidden ${
                          over ? "border-red-300/60 ring-1 ring-red-100/50" : "border-white/60"
                        }`}
                      >
                         {/* Card inner gradient for depth */}
                         <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
                         
                         {/* Decorative status glow */}
                         {over && (
                             <div className="absolute top-0 right-0 w-32 h-32 bg-red-400/10 blur-[40px] rounded-full pointer-events-none" />
                         )}
                         {(!over && isOnline) && (
                             <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/10 blur-[30px] rounded-full pointer-events-none" />
                         )}

                        <div className="p-6 relative z-10 flex flex-col h-full">
                          {/* Header: name + status + time */}
                          <div className="flex items-start justify-between gap-3 mb-6">
                            <div className="min-w-0 flex-1">
                              <h3 className="text-lg font-bold text-gray-900 truncate tracking-tight">{displayName}</h3>
                              <div className="flex items-center gap-2 mt-1.5">
                                 <span className="text-xs font-mono text-gray-400/80 bg-gray-100/50 px-2 py-0.5 rounded-md truncate">{m.machineId}</span>
                                 <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-gray-300'}`} />
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider ${
                                  over ? "bg-red-50 text-red-600 border border-red-100" : isOnline ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-gray-100 text-gray-500 border border-gray-200"
                                }`}
                              >
                                {over ? (
                                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                                ) : isOnline ? (
                                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                                ) : (
                                  <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                                )}
                                {over ? "Alert" : isOnline ? "Machine On" : "Device Off"}
                              </span>
                              <span className="text-[10px] font-medium text-gray-400">{formatTime(m.lastReadingAt)}</span>
                            </div>
                          </div>

                          <div className="flex-1 space-y-5">
                            {/* Temperature */}
                            <div className="rounded-2xl bg-gray-50/50 border border-gray-100 p-4 transition-colors group-hover:bg-white">
                                <div className="flex items-center justify-between mb-2">
                                <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                                    <Thermometer className="h-4 w-4 text-blue-400" aria-hidden />
                                    Temp
                                </span>
                                </div>
                                <div className="flex items-end justify-between mb-3">
                                <div className="flex items-baseline gap-1.5">
                                    <span className={`text-3xl font-black tabular-nums tracking-tighter ${tempOver ? "text-red-500" : "text-gray-800"}`}>
                                    {typeof m.lastTemperature === "number" ? m.lastTemperature : "0"}
                                    </span>
                                    <span className="text-sm font-bold text-gray-300">°C</span>
                                </div>
                                <span className="text-xs font-semibold text-gray-400">
                                    Max {m.tempThreshold ?? "—"}
                                </span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-gray-200/60 overflow-hidden shadow-inner">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                                    tempOver ? "bg-gradient-to-r from-red-400 to-red-500" : "bg-gradient-to-r from-blue-400 to-indigo-500"
                                    }`}
                                    style={{
                                    width: `${m.tempThreshold > 0 && typeof m.lastTemperature === "number"
                                        ? Math.min((m.lastTemperature / m.tempThreshold) * 100, 100)
                                        : 0}%`,
                                    }}
                                />
                                </div>
                            </div>

                            {/* Vibration */}
                            <div className="rounded-2xl bg-gray-50/50 border border-gray-100 p-4 transition-colors group-hover:bg-white">
                                <div className="flex items-center justify-between mb-2">
                                <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                                    <Vibrate className="h-4 w-4 text-amber-500" aria-hidden />
                                    Vibration
                                </span>
                                </div>
                                <div className="flex items-end justify-between mb-3">
                                <div className="flex items-baseline gap-1.5">
                                    <span className={`text-3xl font-black tabular-nums tracking-tighter ${vibOver ? "text-red-500" : "text-gray-800"}`}>
                                    {typeof m.lastVibration === "number" ? m.lastVibration : "0"}
                                    </span>
                                </div>
                                <span className="text-xs font-semibold text-gray-400">
                                    Max {m.vibrationThreshold ?? "—"}
                                </span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-gray-200/60 overflow-hidden shadow-inner">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                                    vibOver ? "bg-gradient-to-r from-red-400 to-red-500" : "bg-gradient-to-r from-amber-400 to-orange-400"
                                    }`}
                                    style={{
                                    width: `${m.vibrationThreshold > 0 && typeof m.lastVibration === "number"
                                        ? Math.min((m.lastVibration / m.vibrationThreshold) * 100, 100)
                                        : 0}%`,
                                    }}
                                />
                                </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => openEdit(m)}
                            className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200/60 bg-white shadow-sm py-3.5 text-sm font-bold text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition-all focus:ring-4 focus:ring-gray-100"
                          >
                            <Settings2 className="h-4 w-4 text-gray-400" aria-hidden />
                            Configure Limits
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Alert banner */}
            {overCount > 0 && (
              <div className="mb-8 rounded-3xl border border-red-200 bg-gradient-to-r from-red-50 to-white/80 backdrop-blur-md p-6 shadow-lg shadow-red-100/30 transform transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex gap-4 items-center">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-100 border border-red-200 shadow-inner">
                    <AlertTriangle className="h-7 w-7 text-red-600 animate-pulse" aria-hidden />
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-red-900">
                      {overCount} active parameter breach{overCount !== 1 ? "es" : ""} detected
                    </p>
                    <p className="text-sm font-medium text-red-700/80 mt-1">
                      Immediate attention required. Adjust thresholds or schedule maintenance downtime.
                    </p>
                    <div className="mt-3 flex flex-col gap-1.5">
                      {machines.filter(isOverThreshold).map((m) => (
                        <div key={m.machineId} className="flex items-center gap-2 text-xs font-bold text-red-800 bg-red-100/50 px-3 py-1.5 rounded-lg w-fit border border-red-200/50">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                          {m.name || m.machineId} Alert Detected At: {formatTime(m.lastReadingAt)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Real-time analytics graph */}
            {machines.length > 0 && (() => {
              const selectedMachine = machines.find((m) => m.machineId === graphMachineId);
              const deviceOn = selectedMachine ? isMachineOn(selectedMachine) : false;
              return (
              <div className="mb-10 rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-10">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-8 border-b border-gray-100/80 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-inner">
                      <LineChartIcon className="h-6 w-6 text-blue-600" aria-hidden />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Live Telemetry</h2>
                      <p className="text-sm font-medium text-gray-500 mt-1">Streaming metrics captured during operational window</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 bg-gray-50/80 backdrop-blur border border-gray-200/50 p-2 rounded-2xl">
                    <div className="flex items-center gap-3 pl-3">
                      <label htmlFor="graph-machine" className="text-sm font-bold text-gray-500 uppercase tracking-widest text-[10px]">Select Node</label>
                      <div className="relative">
                        <select
                            id="graph-machine"
                            value={graphMachineId ?? ""}
                            onChange={(e) => setGraphMachineId(e.target.value || null)}
                            className="appearance-none rounded-xl border border-gray-200 bg-white pl-4 pr-10 py-2.5 text-sm font-semibold text-gray-800 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer"
                        >
                            {filteredMachines.map((m) => (
                            <option key={m.machineId} value={m.machineId}>
                                {m.name || m.machineId}
                            </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <Settings2 className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    {graphMachineId && (
                      <span
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm border ${
                          deviceOn ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-white text-gray-500 border-gray-200"
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${deviceOn ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-gray-400"}`} />
                        {deviceOn ? "Machine On" : "Device Off"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-[350px] w-full">
                  {!deviceOn && selectedMachine ? (
                    <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-gray-50/50 border border-dashed border-gray-200 text-center p-8">
                      <div className="h-16 w-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                          <Activity className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-bold text-gray-700">Telemetry Paused</p>
                      <p className="mt-2 text-sm font-medium text-gray-500 max-w-sm leading-relaxed">
                        Data flow resumes automatically when the machinery node initiates active session broadcasts.
                      </p>
                    </div>
                  ) : graphData.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-gray-50/50 border border-dashed border-gray-200 text-sm font-medium text-gray-500 p-8 text-center">
                      <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-4" />
                      <p>Buffering real-time packets…</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                          dataKey="time"
                          tickFormatter={(ts) => new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          stroke="#cbd5e1"
                          fontSize={11}
                          fontFamily="inherit"
                          fontWeight={600}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis yAxisId="temp" stroke="#cbd5e1" fontSize={11} fontFamily="inherit" fontWeight={600} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}°`} />
                        <YAxis yAxisId="vib" orientation="right" stroke="#cbd5e1" fontSize={11} fontFamily="inherit" fontWeight={600} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)", backgroundColor: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(8px)", padding: "12px 16px", fontWeight: "600", color: "#1e293b", fontSize: "13px" }}
                          labelFormatter={(ts) => new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                          formatter={(value, name) => [value ?? "—", name === "temperature" ? "Temperature (°C)" : "Vibration"]}
                          cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '5 5' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", fontWeight: "600", paddingTop: "20px" }} formatter={(name) => (name === "temperature" ? "Temperature Baseline" : "Vibration Matrix")} />
                        <Area
                          yAxisId="temp"
                          type="natural"
                          dataKey="temperature"
                          name="temperature"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          fill="url(#colorTemp)"
                          animationDuration={1500}
                        />
                        <Area
                          yAxisId="vib"
                          type="natural"
                          dataKey="vibration"
                          name="vibration"
                          stroke="#f59e0b"
                          strokeWidth={3}
                          fill="url(#colorVib)"
                          animationDuration={1500}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
              );
            })()}

            {/* History section */}
            {readingsHistory.length > 0 && (
              <div className="mb-10 rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                <div className="flex items-center gap-3 border-b border-gray-100/50 px-8 py-6 bg-white/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100/80 shadow-inner">
                    <History className="h-5 w-5 text-gray-600" aria-hidden />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Operations Log</h2>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">Chronological Trace</p>
                  </div>
                </div>
                <div className="overflow-x-auto max-h-[400px] scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white/95 backdrop-blur-md z-10 border-b border-gray-100 shadow-sm">
                      <tr>
                        <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-widest px-8 py-4">Timestamp</th>
                        <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-widest px-8 py-4">Node Identity</th>
                        <th className="text-right text-xs font-bold text-gray-500 uppercase tracking-widest px-8 py-4">Temp (°C)</th>
                        <th className="text-right text-xs font-bold text-gray-500 uppercase tracking-widest px-8 py-4">Vibration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50/80">
                      {historyTableRows.map((row, idx) => (
                        <tr key={`${row.timestamp}-${row.machineId}-${idx}`} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="px-8 py-4 text-gray-500 font-medium whitespace-nowrap">
                            {new Date(row.timestamp).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </td>
                          <td className="px-8 py-4 font-bold text-gray-800 flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:scale-150 transition-transform" />
                             {row.machineName}
                          </td>
                          <td className="px-8 py-4 text-right">
                             <span className="bg-gray-100/80 px-2.5 py-1 rounded-md text-gray-700 font-bold tabular-nums">
                                {typeof row.temperature === "number" ? row.temperature : "—"}
                             </span>
                          </td>
                          <td className="px-8 py-4 text-right">
                             <span className="bg-gray-100/80 px-2.5 py-1 rounded-md text-gray-700 font-bold tabular-nums">
                                {typeof row.vibration === "number" ? row.vibration : "—"}
                             </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modern Modal */}
      {editingMachine && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-all duration-300"
          onClick={closeEdit}
        >
          <div
            className="w-full max-w-md rounded-[2rem] border border-white/20 bg-white/90 backdrop-blur-xl shadow-2xl p-2 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-[1.5rem] overflow-hidden">
                <div className="border-b border-gray-100 px-8 py-6 bg-gradient-to-b from-gray-50/50 to-transparent">
                <h3 className="text-xl font-extrabold text-gray-900">Define Guardrails</h3>
                <p className="text-sm font-semibold text-gray-500 mt-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    {editingMachine.name || editingMachine.machineId}
                </p>
                </div>
                <div className="px-8 py-6 space-y-5">
                <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Max Operating Temp (°C)</label>
                    <div className="relative">
                        <Thermometer className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                        type="number"
                        value={editForm.tempThreshold}
                        onChange={(e) => setEditForm((f) => ({ ...f, tempThreshold: e.target.value }))}
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-12 pr-4 py-3.5 text-gray-900 font-bold placeholder-gray-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                        placeholder="e.g. 80"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Vibration Tolerance</label>
                    <div className="relative">
                        <Vibrate className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                        type="number"
                        value={editForm.vibrationThreshold}
                        onChange={(e) => setEditForm((f) => ({ ...f, vibrationThreshold: e.target.value }))}
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-12 pr-4 py-3.5 text-gray-900 font-bold placeholder-gray-300 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all"
                        placeholder="e.g. 10"
                        />
                    </div>
                </div>
                </div>
                <div className="flex gap-4 px-8 pb-8 pt-4">
                <button
                    type="button"
                    onClick={closeEdit}
                    className="flex-1 rounded-2xl border border-gray-200 py-3.5 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition-all focus:ring-4 focus:ring-gray-100"
                >
                    Discard
                </button>
                <button
                    type="button"
                    onClick={saveThresholds}
                    disabled={saving}
                    className="flex-1 rounded-2xl bg-gray-900 py-3.5 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-50 transition-all shadow-lg shadow-gray-900/20 focus:ring-4 focus:ring-gray-900/20"
                >
                    {saving ? "Deploying…" : "Deploy Configuration"}
                </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
