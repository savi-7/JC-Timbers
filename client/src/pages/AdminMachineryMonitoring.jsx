import React, { useState, useEffect, useCallback } from "react";
import { io as createSocket } from "socket.io-client";
import api from "../api/axios";
import { API_BASE } from "../config";
import Sidebar from "../components/admin/Sidebar";
import Header from "../components/admin/Header";

function isOverThreshold(m) {
  if (m == null) return false;
  const tempOver = typeof m.lastTemperature === "number" && typeof m.tempThreshold === "number" && m.lastTemperature > m.tempThreshold;
  const vibOver = typeof m.lastVibration === "number" && typeof m.vibrationThreshold === "number" && m.lastVibration > m.vibrationThreshold;
  return tempOver || vibOver;
}

export default function AdminMachineryMonitoring() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingMachine, setEditingMachine] = useState(null);
  const [editForm, setEditForm] = useState({ tempThreshold: "", vibrationThreshold: "" });
  const [saving, setSaving] = useState(false);

  const fetchMachines = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get("/machinery/machines");
      setMachines(res.data.machines || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load machines");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load to show existing machines
    fetchMachines();

    // Derive socket base (strip trailing /api)
    const socketBase = API_BASE.replace(/\/api$/, "");
    const socket = createSocket(socketBase, {
      transports: ["websocket", "polling"]
    });

    socket.on("machine_update", (update) => {
      setMachines((prev) => {
        const existing = prev.find((m) => m.machineId === update.machineId);
        if (existing) {
          return prev.map((m) =>
            m.machineId === update.machineId ? { ...m, ...update } : m
          );
        }
        return [...prev, update];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchMachines]);

  const openEdit = (machine) => {
    setEditingMachine(machine);
    setEditForm({
      tempThreshold: machine.tempThreshold ?? "",
      vibrationThreshold: machine.vibrationThreshold ?? ""
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
        prev.map((m) =>
          m._id === editingMachine._id ? { ...m, ...payload } : m
        )
      );
      closeEdit();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update thresholds");
    } finally {
      setSaving(false);
    }
  };

  const overCount = machines.filter(isOverThreshold).length;
  const formatTime = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Machinery Monitoring</h1>
            <p className="text-gray-600 mt-1">Current temperature and vibration from IoT; customize thresholds and see warnings when values exceed limits.</p>
          </div>

          {overCount > 0 && (
            <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-medium">
              {overCount} machine{overCount !== 1 ? "s" : ""} above threshold — review below.
            </div>
          )}

          {loading && machines.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                type="button"
                onClick={() => { setLoading(true); fetchMachines(); }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {machines.map((m) => {
                const over = isOverThreshold(m);
                return (
                  <div
                    key={m._id}
                    className={`rounded-lg border-2 p-5 bg-white shadow-sm ${
                      over ? "border-red-400 bg-red-50/50" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {m.name || m.machineId || "Unknown"}
                      </h2>
                      {over && (
                        <span className="text-xs font-medium px-2 py-1 rounded bg-red-200 text-red-800">
                          Above threshold
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Temperature: </span>
                        <span className={typeof m.lastTemperature === "number" && m.lastTemperature > (m.tempThreshold ?? 0) ? "text-red-700 font-medium" : "text-gray-900"}>
                          {typeof m.lastTemperature === "number" ? m.lastTemperature : "—"}
                        </span>
                        <span className="text-gray-500"> / {m.tempThreshold ?? "—"} (max)</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Vibration: </span>
                        <span className={typeof m.lastVibration === "number" && m.lastVibration > (m.vibrationThreshold ?? 0) ? "text-red-700 font-medium" : "text-gray-900"}>
                          {typeof m.lastVibration === "number" ? m.lastVibration : "—"}
                        </span>
                        <span className="text-gray-500"> / {m.vibrationThreshold ?? "—"} (max)</span>
                      </div>
                      <div className="text-gray-500 pt-1">Last updated: {formatTime(m.lastReadingAt)}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openEdit(m)}
                      className="mt-4 w-full py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
                    >
                      Edit thresholds
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && machines.length === 0 && !error && (
            <div className="text-center py-12 text-gray-500">
              No machines yet. Send data to the webhook to create machines.
            </div>
          )}
        </div>
      </div>

      {editingMachine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={closeEdit}>
          <div
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit thresholds — {editingMachine.name || editingMachine.machineId}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temperature threshold</label>
                <input
                  type="number"
                  value={editForm.tempThreshold}
                  onChange={(e) => setEditForm((f) => ({ ...f, tempThreshold: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vibration threshold</label>
                <input
                  type="number"
                  value={editForm.vibrationThreshold}
                  onChange={(e) => setEditForm((f) => ({ ...f, vibrationThreshold: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={closeEdit}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveThresholds}
                disabled={saving}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
