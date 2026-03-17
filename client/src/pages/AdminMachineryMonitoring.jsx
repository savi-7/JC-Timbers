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
      setMachines(list);
      setReadingsHistory((prev) => {
        const now = Date.now();
        const fromOnDevices = list
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
    if (graphMachineId == null && machines.length > 0) {
      setGraphMachineId(machines[0].machineId);
    }
  }, [machines, graphMachineId]);

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
    return byTime.slice(0, MAX_HISTORY_TABLE_ROWS);
  }, [readingsHistory]);

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
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Top: Title + Live + Refresh */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">
                    Live
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  Machinery Monitoring
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Temperature and vibration from IoT. Adjust limits and see alerts when values exceed thresholds.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setLoading(true); fetchMachines(); }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-colors shrink-0"
              >
                <RefreshCw className="h-4 w-4" aria-hidden />
                Refresh
              </button>
            </div>

            {/* Status strip: one card with three metrics */}
            <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Overview
              </h2>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-3xl font-bold text-gray-900 tabular-nums">{totalMachines}</p>
                  <p className="mt-1 text-sm text-gray-500">Total machines</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-red-600 tabular-nums">{overCount}</p>
                  <p className="mt-1 text-sm text-gray-500">Above threshold</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-emerald-600 tabular-nums">{healthyCount}</p>
                  <p className="mt-1 text-sm text-gray-500">Healthy</p>
                </div>
              </div>
              {/* Mini health bar */}
              {totalMachines > 0 && (
                <div className="mt-6 flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="bg-emerald-500 transition-all duration-500"
                    style={{ width: `${(healthyCount / totalMachines) * 100}%` }}
                  />
                  <div
                    className="bg-red-500 transition-all duration-500"
                    style={{ width: `${(overCount / totalMachines) * 100}%` }}
                  />
                </div>
              )}
            </div>

            {/* Machines — directly below Overview */}
            <section className="mb-8" aria-labelledby="machines-heading">
              {machines.length > 0 && (
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h2 id="machines-heading" className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Machines
                  </h2>
                  <div className="inline-flex rounded-xl bg-white p-1 shadow-sm border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setViewFilter("all")}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        viewFilter === "all" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewFilter("alerts")}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        viewFilter === "alerts" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Alerts only
                    </button>
                  </div>
                </div>
              )}
              {loading && machines.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-24">
                  <RefreshCw className="h-10 w-10 text-blue-500 animate-spin mb-4" aria-hidden />
                  <p className="text-sm font-medium text-gray-700">Loading machines</p>
                  <p className="text-xs text-gray-500 mt-1">Fetching latest data…</p>
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center max-w-md mx-auto">
                  <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" aria-hidden />
                  <p className="font-semibold text-red-900">Could not load data</p>
                  <p className="text-sm text-red-700 mt-2 mb-6">{error}</p>
                  <button
                    type="button"
                    onClick={() => { setLoading(true); fetchMachines(); }}
                    className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredMachines.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
                  {machines.length === 0 ? (
                    <>
                      <Activity className="h-14 w-14 text-gray-300 mx-auto mb-4" aria-hidden />
                      <p className="text-base font-semibold text-gray-800">No machines yet</p>
                      <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                        When your IoT devices send data to the webhook, machines will show up here with live readings.
                      </p>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-14 w-14 text-emerald-400 mx-auto mb-4" aria-hidden />
                      <p className="text-base font-semibold text-gray-800">No alerts</p>
                      <p className="text-sm text-gray-500 mt-2">All machines are within limits. Switch to “All” to see the full list.</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
                    const showId = (m.name && m.name !== m.machineId) || !m.name;

                    return (
                      <article
                        key={m._id}
                        className={`rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden ${
                          over ? "border-red-200 ring-1 ring-red-100" : "border-gray-200"
                        }`}
                      >
                        <div className="p-6">
                          {/* Header: name + status + time */}
                          <div className="flex items-start justify-between gap-4 mb-6">
                            <div className="min-w-0">
                              <h3 className="text-xl font-bold text-gray-900 truncate">{displayName}</h3>
                              {showId && (
                                <p className="text-sm text-gray-500 font-mono mt-0.5 truncate">{m.machineId}</p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                  over ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
                                }`}
                              >
                                {over ? (
                                  <AlertTriangle className="h-4 w-4" aria-hidden />
                                ) : (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
                                )}
                                {over ? "Alert" : "OK"}
                              </span>
                              <span className="text-xs text-gray-500">{formatTime(m.lastReadingAt)}</span>
                            </div>
                          </div>

                          {/* Temperature */}
                          <div className="mb-5">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <Thermometer className="h-3.5 w-3.5" aria-hidden />
                                Temperature
                              </span>
                              <span className="text-[10px] text-gray-400 uppercase">°C</span>
                            </div>
                            <div className="flex items-baseline gap-2 mb-2">
                              <span className={`text-2xl font-bold tabular-nums ${tempOver ? "text-red-600" : "text-gray-900"}`}>
                                {typeof m.lastTemperature === "number" ? m.lastTemperature : "—"}
                              </span>
                              <span className="text-sm text-gray-500">
                                / {m.tempThreshold ?? "—"} max
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  tempOver ? "bg-red-500" : "bg-blue-500"
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
                          <div className="mb-6">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <Vibrate className="h-3.5 w-3.5" aria-hidden />
                                Vibration
                              </span>
                            </div>
                            <div className="flex items-baseline gap-2 mb-2">
                              <span className={`text-2xl font-bold tabular-nums ${vibOver ? "text-red-600" : "text-gray-900"}`}>
                                {typeof m.lastVibration === "number" ? m.lastVibration : "—"}
                              </span>
                              <span className="text-sm text-gray-500">
                                / {m.vibrationThreshold ?? "—"} max
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  vibOver ? "bg-red-500" : "bg-blue-500"
                                }`}
                                style={{
                                  width: `${m.vibrationThreshold > 0 && typeof m.lastVibration === "number"
                                    ? Math.min((m.lastVibration / m.vibrationThreshold) * 100, 100)
                                    : 0}%`,
                                }}
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => openEdit(m)}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors"
                          >
                            <Settings2 className="h-4 w-4" aria-hidden />
                            Edit limits
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
              <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                    <AlertTriangle className="h-5 w-5 text-amber-700" aria-hidden />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-900">
                      {overCount} machine{overCount !== 1 ? "s" : ""} above threshold
                    </p>
                    <p className="text-sm text-amber-800 mt-0.5">
                      Review the machine cards above and update limits if needed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Real-time analytics graph — only records data when device is on (recent reading) */}
            {machines.length > 0 && (() => {
              const selectedMachine = machines.find((m) => m.machineId === graphMachineId);
              const deviceOn = selectedMachine ? isMachineOn(selectedMachine) : false;
              return (
              <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                      <LineChartIcon className="h-4 w-4 text-blue-600" aria-hidden />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">Real-time analytics</h2>
                      <p className="text-xs text-gray-500">Chart updates only when the device is on and sending data (last 2 min)</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label htmlFor="graph-machine" className="text-sm text-gray-600">Machine:</label>
                      <select
                        id="graph-machine"
                        value={graphMachineId ?? ""}
                        onChange={(e) => setGraphMachineId(e.target.value || null)}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      >
                        {machines.map((m) => (
                          <option key={m.machineId} value={m.machineId}>
                            {m.name || m.machineId}
                          </option>
                        ))}
                      </select>
                    </div>
                    {graphMachineId && (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                          deviceOn ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${deviceOn ? "bg-emerald-500" : "bg-gray-400"}`} />
                        {deviceOn ? "Device on" : "Device off"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-[280px] w-full">
                  {!deviceOn && selectedMachine ? (
                    <div className="flex h-full flex-col items-center justify-center rounded-xl bg-gray-50 border border-gray-200 text-center p-6">
                      <p className="font-semibold text-gray-700">Real-time analysis stopped</p>
                      <p className="mt-2 text-sm text-gray-500 max-w-sm">
                        The device is off. The chart will resume when this machine sends new readings (within the last 2 minutes).
                      </p>
                    </div>
                  ) : graphData.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-500 p-4 text-center">
                      <p>Waiting for data… Chart updates only while the device is on and sending readings.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={graphData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="time"
                          tickFormatter={(ts) => new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          stroke="#9ca3af"
                          fontSize={11}
                        />
                        <YAxis yAxisId="temp" stroke="#3b82f6" fontSize={11} tickFormatter={(v) => `${v}°`} />
                        <YAxis yAxisId="vib" orientation="right" stroke="#10b981" fontSize={11} />
                        <Tooltip
                          contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }}
                          labelFormatter={(ts) => new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                          formatter={(value, name) => [value ?? "—", name === "temperature" ? "Temperature (°C)" : "Vibration"]}
                        />
                        <Legend formatter={(name) => (name === "temperature" ? "Temperature (°C)" : "Vibration")} />
                        <Area
                          yAxisId="temp"
                          type="monotone"
                          dataKey="temperature"
                          name="temperature"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          fill="url(#colorTemp)"
                        />
                        <Area
                          yAxisId="vib"
                          type="monotone"
                          dataKey="vibration"
                          name="vibration"
                          stroke="#10b981"
                          strokeWidth={2}
                          fill="url(#colorVib)"
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
              <div className="mb-8 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                    <History className="h-4 w-4 text-gray-600" aria-hidden />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Reading history</h2>
                    <p className="text-xs text-gray-500">Latest readings from this session (newest first)</p>
                  </div>
                </div>
                <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left font-semibold text-gray-600 px-6 py-3">Time</th>
                        <th className="text-left font-semibold text-gray-600 px-6 py-3">Machine</th>
                        <th className="text-right font-semibold text-gray-600 px-6 py-3">Temperature (°C)</th>
                        <th className="text-right font-semibold text-gray-600 px-6 py-3">Vibration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {historyTableRows.map((row, idx) => (
                        <tr key={`${row.timestamp}-${row.machineId}-${idx}`} className="hover:bg-gray-50/80">
                          <td className="px-6 py-2.5 text-gray-600 whitespace-nowrap">
                            {new Date(row.timestamp).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </td>
                          <td className="px-6 py-2.5 font-medium text-gray-900">{row.machineName}</td>
                          <td className="px-6 py-2.5 text-right tabular-nums text-gray-700">
                            {typeof row.temperature === "number" ? row.temperature : "—"}
                          </td>
                          <td className="px-6 py-2.5 text-right tabular-nums text-gray-700">
                            {typeof row.vibration === "number" ? row.vibration : "—"}
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

      {/* Modal */}
      {editingMachine && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={closeEdit}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-100 px-6 py-5">
              <h3 className="text-lg font-semibold text-gray-900">Edit limits</h3>
              <p className="text-sm text-gray-500 mt-0.5">{editingMachine.name || editingMachine.machineId}</p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Temperature limit (°C)</label>
                <input
                  type="number"
                  value={editForm.tempThreshold}
                  onChange={(e) => setEditForm((f) => ({ ...f, tempThreshold: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  placeholder="80"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Vibration limit</label>
                <input
                  type="number"
                  value={editForm.vibrationThreshold}
                  onChange={(e) => setEditForm((f) => ({ ...f, vibrationThreshold: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  placeholder="10"
                />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                type="button"
                onClick={closeEdit}
                className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveThresholds}
                disabled={saving}
                className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
