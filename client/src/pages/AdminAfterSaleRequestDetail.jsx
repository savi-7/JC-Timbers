import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import Header from "../components/admin/Header";
import api from "../api/axios";

const STATUS_OPTIONS = [
  "submitted",
  "under_review",
  "scheduled",
  "in_progress",
  "completed",
  "closed",
  "rejected",
  "rescheduled",
];

const SERVICE_TYPE_LABELS = {
  repair: "Repair",
  maintenance: "Maintenance",
  polishing: "Polishing",
  restoration: "Restoration",
  installation: "Installation",
  inspection: "Inspection",
  warranty_claim: "Warranty Claim",
};

export default function AdminAfterSaleRequestDetail() {
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusData, setStatusData] = useState({
    status: "submitted",
    adminNotes: "",
    rejectionReason: "",
  });

  const [assignData, setAssignData] = useState({
    assignedTechnicianName: "",
    assignedTechnicianPhone: "",
    scheduledDate: "",
    scheduledTimeSlot: "",
  });

  const [quoteAmount, setQuoteAmount] = useState("");
  const [completionData, setCompletionData] = useState({
    completionNotes: "",
    completionImages: [],
  });

  const [savingStatus, setSavingStatus] = useState(false);
  const [savingAssign, setSavingAssign] = useState(false);
  const [savingQuote, setSavingQuote] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get(`/after-sale/${id}`);
        const data = res.data || res.data?.request || null;
        setRequest(data);
        if (data) {
          setStatusData({
            status: data.status || "submitted",
            adminNotes: data.adminNotes || "",
            rejectionReason: data.rejectionReason || "",
          });
          setAssignData({
            assignedTechnicianName: data.assignedTechnicianName || "",
            assignedTechnicianPhone: data.assignedTechnicianPhone || "",
            scheduledDate: data.scheduledDate
              ? new Date(data.scheduledDate).toISOString().split("T")[0]
              : "",
            scheduledTimeSlot: data.scheduledTimeSlot || "",
          });
          setQuoteAmount(
            typeof data.invoice?.quotedAmount === "number"
              ? String(data.invoice.quotedAmount)
              : ""
          );
          setCompletionData({
            completionNotes: data.completionNotes || "",
            completionImages: Array.isArray(data.completionImages)
              ? data.completionImages
              : [],
          });
        }
      } catch (err) {
        console.error("Error fetching after-sale request (admin):", err);
        setError(
          err.response?.data?.message ||
            "Failed to load after-sale service request"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  const refreshRequest = async () => {
    try {
      const res = await api.get(`/after-sale/${id}`);
      const data = res.data || res.data?.request || null;
      setRequest(data);
      if (data) {
        setStatusData({
          status: data.status || "submitted",
          adminNotes: data.adminNotes || "",
          rejectionReason: data.rejectionReason || "",
        });
        setAssignData({
          assignedTechnicianName: data.assignedTechnicianName || "",
          assignedTechnicianPhone: data.assignedTechnicianPhone || "",
          scheduledDate: data.scheduledDate
            ? new Date(data.scheduledDate).toISOString().split("T")[0]
            : "",
          scheduledTimeSlot: data.scheduledTimeSlot || "",
        });
        setQuoteAmount(
          typeof data.invoice?.quotedAmount === "number"
            ? String(data.invoice.quotedAmount)
            : ""
        );
        setCompletionData({
          completionNotes: data.completionNotes || "",
          completionImages: Array.isArray(data.completionImages)
            ? data.completionImages
            : [],
        });
      }
    } catch (err) {
      console.error("Error refreshing after-sale request:", err);
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatINR = (amount) => {
    if (typeof amount !== "number") return "-";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleStatusSave = async () => {
    try {
      setSavingStatus(true);
      const body = {
        status: statusData.status,
        adminNotes: statusData.adminNotes,
      };
      if (statusData.status === "rejected") {
        body.rejectionReason = statusData.rejectionReason;
      }
      if (statusData.status === "completed") {
        body.completionNotes = completionData.completionNotes;
        body.completionImages = completionData.completionImages;
      }
      await api.patch(`/admin/after-sale/${id}/status`, body);
      await refreshRequest();
    } catch (err) {
      console.error("Error updating after-sale status (admin):", err);
      alert(
        err.response?.data?.message || "Failed to update after-sale status"
      );
    } finally {
      setSavingStatus(false);
    }
  };

  const handleAssignSave = async () => {
    try {
      setSavingAssign(true);
      await api.patch(`/admin/after-sale/${id}/assign`, {
        ...assignData,
        scheduledDate: assignData.scheduledDate || null,
      });
      await refreshRequest();
    } catch (err) {
      console.error("Error assigning technician:", err);
      alert(err.response?.data?.message || "Failed to assign technician");
    } finally {
      setSavingAssign(false);
    }
  };

  const handleQuoteSave = async () => {
    try {
      setSavingQuote(true);
      await api.patch(`/admin/after-sale/${id}/quote`, {
        quotedAmount: quoteAmount ? Number(quoteAmount) : 0,
      });
      await refreshRequest();
    } catch (err) {
      console.error("Error setting service quote:", err);
      alert(err.response?.data?.message || "Failed to set quote");
    } finally {
      setSavingQuote(false);
    }
  };

  const handleMarkOfflinePaid = async () => {
    if (
      !window.confirm(
        "Mark this request as paid in cash? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      setMarkingPaid(true);
      await api.patch(`/admin/after-sale/${id}/offline-paid`);
      await refreshRequest();
    } catch (err) {
      console.error("Error marking payment collected:", err);
      alert(
        err.response?.data?.message || "Failed to mark payment as collected"
      );
    } finally {
      setMarkingPaid(false);
    }
  };

  const handleCompletionImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const allowed = 5 - completionData.completionImages.length;
    const toAdd = files.slice(0, allowed);

    toAdd.forEach((file) => {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        alert("Only JPG, PNG, or WebP files are allowed.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompletionData((prev) => ({
          ...prev,
          completionImages: [...prev.completionImages, reader.result],
        }));
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent" />
              <p className="mt-4 text-sm text-gray-500">
                Loading request details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-gray-50 flex overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <div className="flex-1 p-6 overflow-y-auto">
            <p className="text-sm text-red-600 mb-4">
              {error || "Unable to load after-sale request."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const productName =
    request.productName ||
    request.productId?.name ||
    (request.productOrigin === "external"
      ? request.externalProductDetails?.name
      : "Product");
  const originLabel =
    request.productOrigin === "platform" ? "Platform" : "External";
  const serviceLabel =
    SERVICE_TYPE_LABELS[request.serviceType] || request.serviceType;
  const paymentInfo = request.invoice || {};

  const paymentStatus = paymentInfo.paymentStatus || "unpaid";
  const paymentMethod = paymentInfo.paymentMethod || "pending";

  const paymentStatusBadgeClass =
    paymentStatus === "paid"
      ? "bg-green-100 text-green-800"
      : paymentStatus === "waived"
      ? "bg-teal-100 text-teal-800"
      : "bg-yellow-50 text-yellow-800";

  const canShowMarkPaid =
    (paymentInfo.paymentMethod === "offline" ||
      paymentInfo.paymentMethod === "pending" ||
      !paymentInfo.paymentMethod) &&
    paymentInfo.paymentStatus === "unpaid";

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Top summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  After-Sale Service Request
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Request ID:{" "}
                  <span className="font-mono">{request._id}</span>
                </p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-xs text-gray-500">
                  Created: {formatDate(request.createdAt)}
                </p>
                <p className="text-xs text-gray-500">
                  Preferred: {formatDate(request.preferredDate)} (
                  {request.preferredTimeSlot || "-"})
                </p>
              </div>
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500">Customer</p>
                <p className="font-medium text-gray-900">
                  {request.contactDetails?.fullName || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">
                  {request.contactDetails?.phoneNumber || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium text-gray-900">
                  {request.contactDetails?.email || "-"}
                </p>
              </div>
            </div>

            {/* Payment summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500">Payment Status</p>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium ${paymentStatusBadgeClass}`}
                  >
                    {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
                    {paymentStatus === "paid" && paymentMethod
                      ? ` (${paymentMethod})`
                      : ""}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Quoted Amount</p>
                <p className="font-medium text-gray-900">
                  {typeof paymentInfo.quotedAmount === "number" &&
                  paymentInfo.quotedAmount > 0
                    ? formatINR(paymentInfo.quotedAmount)
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Paid On</p>
                <p className="font-medium text-gray-900">
                  {paymentInfo.paidAt ? formatDate(paymentInfo.paidAt) : "-"}
                </p>
              </div>
            </div>

            {/* Product and issue details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500">Product</p>
                  <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-800 border border-gray-200">
                    {originLabel}
                  </span>
                  {request.warrantyEligible && (
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-800 border border-green-200">
                      Warranty Eligible
                    </span>
                  )}
                </div>
                <p className="font-medium text-gray-900">{productName}</p>
                {request.productOrigin === "external" && (
                  <>
                    <p className="text-xs text-gray-500">
                      Category:{" "}
                      <span className="text-gray-800">
                        {request.externalProductDetails?.category || "-"}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Estimated Age:{" "}
                      <span className="text-gray-800">
                        {request.externalProductDetails?.estimatedAge || "-"}
                      </span>
                    </p>
                  </>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-500">Service Type</p>
                <p className="font-medium text-gray-900">{serviceLabel}</p>
                <p className="text-xs text-gray-500 mt-2">Issue Description</p>
                <p className="text-sm text-gray-800">
                  {request.issueDescription || "-"}
                </p>
              </div>
            </div>

            {/* Issue images and address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {Array.isArray(request.issueImages) &&
                request.issueImages.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Issue Photos</p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {request.issueImages.map((img, idx) => (
                        <div
                          key={`${img}-${idx}`}
                          className="w-20 h-20 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex-shrink-0"
                        >
                          <img
                            src={img}
                            alt={`Issue ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              <div>
                <p className="text-xs text-gray-500 mb-2">Service Address</p>
                <p className="text-sm text-gray-800">
                  {request.address?.street || "-"}
                  <br />
                  {request.address?.city || ""}{" "}
                  {request.address?.state || ""}{" "}
                  {request.address?.zip || ""}
                </p>
              </div>
            </div>
          </div>

          {/* Action panels */}
          {/* 1. Update Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">
                Update Status
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusData.status}
                  onChange={(e) =>
                    setStatusData((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Admin Notes
              </label>
              <textarea
                rows={3}
                value={statusData.adminNotes}
                onChange={(e) =>
                  setStatusData((prev) => ({
                    ...prev,
                    adminNotes: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Notes visible to the customer about this request."
              />
            </div>
            {statusData.status === "rejected" && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Rejection Reason
                </label>
                <textarea
                  rows={2}
                  value={statusData.rejectionReason}
                  onChange={(e) =>
                    setStatusData((prev) => ({
                      ...prev,
                      rejectionReason: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Explain why this request was rejected."
                />
              </div>
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleStatusSave}
                disabled={savingStatus}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {savingStatus ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {/* 2. Assign Technician */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">
                Assign Technician
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Technician Name
                </label>
                <input
                  type="text"
                  value={assignData.assignedTechnicianName}
                  onChange={(e) =>
                    setAssignData((prev) => ({
                      ...prev,
                      assignedTechnicianName: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Technician Phone
                </label>
                <input
                  type="text"
                  value={assignData.assignedTechnicianPhone}
                  onChange={(e) =>
                    setAssignData((prev) => ({
                      ...prev,
                      assignedTechnicianPhone: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  value={assignData.scheduledDate}
                  onChange={(e) =>
                    setAssignData((prev) => ({
                      ...prev,
                      scheduledDate: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Time Slot
                </label>
                <div className="flex gap-2">
                  {["morning", "afternoon", "evening"].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() =>
                        setAssignData((prev) => ({
                          ...prev,
                          scheduledTimeSlot: slot,
                        }))
                      }
                      className={`px-3 py-2 rounded-lg text-xs border ${
                        assignData.scheduledTimeSlot === slot
                          ? "bg-blue-50 border-blue-500 text-blue-700"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {slot.charAt(0).toUpperCase() + slot.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAssignSave}
                disabled={savingAssign}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {savingAssign ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {/* 3. Set Service Quote */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">
                Set Service Quote
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm items-end">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Service Charge (INR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={quoteAmount}
                  onChange={(e) => setQuoteAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Enter amount"
                />
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-600">
                  Warranty-eligible requests will be automatically waived regardless of the
                  amount entered.
                </p>
                {typeof paymentInfo.quotedAmount === "number" &&
                  paymentInfo.quotedAmount > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      Current Quote:{" "}
                      <span className="font-semibold">
                        {formatINR(paymentInfo.quotedAmount)}
                      </span>
                    </p>
                  )}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleQuoteSave}
                disabled={savingQuote}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {savingQuote ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {/* 4. Mark Payment Collected */}
          {canShowMarkPaid && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">
                  Mark Payment Collected
                </h2>
              </div>
              <p className="text-xs text-gray-600">
                Use this action only after the technician has collected cash from the
                customer for this service visit.
              </p>
              <button
                type="button"
                onClick={handleMarkOfflinePaid}
                disabled={markingPaid}
                className="px-4 py-2 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {markingPaid ? "Marking..." : "Mark as Paid — Cash Collected"}
              </button>
            </div>
          )}

          {/* 5. Completion Details */}
          {request.status === "in_progress" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">
                  Completion Details
                </h2>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                These details will be saved when you update the status to{" "}
                <span className="font-semibold">Completed</span> in the{" "}
                <span className="font-semibold">Update Status</span> panel above.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Completion Notes
                  </label>
                  <textarea
                    rows={3}
                    value={completionData.completionNotes}
                    onChange={(e) =>
                      setCompletionData((prev) => ({
                        ...prev,
                        completionNotes: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Describe what was done during the visit."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Completion Images
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleCompletionImagesChange}
                    className="text-xs"
                  />
                  {completionData.completionImages.length > 0 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                      {completionData.completionImages.map((img, idx) => (
                        <div
                          key={`${img}-${idx}`}
                          className="w-20 h-20 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex-shrink-0"
                        >
                          <img
                            src={img}
                            alt={`Completion ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

