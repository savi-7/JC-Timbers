import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../api/axios";
import { useNotification } from "../components/NotificationProvider";

const STATUS_LABELS = {
  submitted: "Submitted",
  under_review: "Under Review",
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  closed: "Closed",
  rejected: "Rejected",
  rescheduled: "Rescheduled",
};

const STATUS_BADGE_CLASSES = {
  submitted: "bg-blue-100 text-blue-800 border-blue-200",
  under_review: "bg-yellow-100 text-yellow-800 border-yellow-200",
  scheduled: "bg-purple-100 text-purple-800 border-purple-200",
  in_progress: "bg-orange-100 text-orange-800 border-orange-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  closed: "bg-gray-100 text-gray-700 border-gray-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  rescheduled: "bg-amber-100 text-amber-800 border-amber-200",
};

const SERVICE_TYPE_LABELS = {
  repair: "Repair",
  maintenance: "Maintenance",
  polishing: "Polishing",
  restoration: "Restoration",
  installation: "Installation",
  inspection: "Inspection",
  warranty_claim: "Warranty Claim",
};

export default function MyAfterSaleRequests() {
  const navigate = useNavigate();
  const { showError } = useNotification();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/after-sale/my");
        setRequests(res.data || []);
      } catch (err) {
        console.error("Error fetching after-sale requests:", err);
        const message = err.response?.data?.message || "Failed to load your requests";
        setError(message);
        showError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [showError]);

  const filteredRequests = useMemo(() => {
    if (statusFilter === "all") return requests;
    return requests.filter((r) => r.status === statusFilter);
  }, [requests, statusFilter]);

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
    if (typeof amount !== "number") return null;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderFilterBar = () => {
    const statuses = [
      { value: "all", label: "All" },
      { value: "submitted", label: "Submitted" },
      { value: "under_review", label: "Under Review" },
      { value: "scheduled", label: "Scheduled" },
      { value: "in_progress", label: "In Progress" },
      { value: "completed", label: "Completed" },
      { value: "closed", label: "Closed" },
      { value: "rejected", label: "Rejected" },
      { value: "rescheduled", label: "Rescheduled" },
    ];

    return (
      <div className="mb-6 flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setStatusFilter(s.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              statusFilter === s.value
                ? "bg-dark-brown text-white border-dark-brown shadow-sm"
                : "bg-white text-gray-700 border-gray-200 hover:border-dark-brown/60"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    );
  };

  const renderLoading = () => (
    <div className="py-16 flex justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dark-brown mx-auto" />
        <p className="mt-3 text-sm text-gray-600">Loading your service requests...</p>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="py-16 flex justify-center">
      <div className="text-center max-w-md">
        <h2 className="text-lg font-semibold text-dark-brown mb-2">
          You have not raised any service requests yet
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          When you need help with repairs, maintenance, or support for your products, you can
          raise an after-sale service request here.
        </p>
        <button
          type="button"
          onClick={() => navigate("/after-sale/new")}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-dark-brown text-white text-sm font-medium hover:bg-accent-red transition-colors shadow-sm"
        >
          Request a Service
        </button>
      </div>
    </div>
  );

  const renderCard = (req) => {
    const serviceLabel = SERVICE_TYPE_LABELS[req.serviceType] || req.serviceType;
    const statusLabel = STATUS_LABELS[req.status] || req.status;
    const statusClass =
      STATUS_BADGE_CLASSES[req.status] || "bg-gray-100 text-gray-800 border-gray-200";
    const originLabel =
      req.productOrigin === "platform" ? "JC Timbers Product" : "External Product";
    const originClass =
      req.productOrigin === "platform"
        ? "bg-indigo-100 text-indigo-800 border-indigo-200"
        : "bg-gray-100 text-gray-800 border-gray-200";

    const hasQuote =
      req.invoice && typeof req.invoice.quotedAmount === "number" && req.invoice.quotedAmount > 0;

    const paymentStatusLabel =
      req.invoice && req.invoice.paymentStatus
        ? req.invoice.paymentStatus.charAt(0).toUpperCase() +
          req.invoice.paymentStatus.slice(1)
        : null;

    const paymentBadgeClass =
      req.invoice?.paymentStatus === "paid"
        ? "bg-green-100 text-green-800"
        : req.invoice?.paymentStatus === "waived"
        ? "bg-teal-100 text-teal-800"
        : "bg-yellow-50 text-yellow-800";

    const productName =
      req.productName ||
      req.productId?.name ||
      (req.productOrigin === "external"
        ? req.externalProductDetails?.name
        : "Product");

    return (
      <div
        key={req._id}
        className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-dark-brown">{productName}</h3>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${originClass}`}
              >
                {originLabel}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusClass}`}
              >
                {statusLabel}
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-2">
              Service Type: <span className="font-medium">{serviceLabel}</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-gray-600">
              <p>
                <span className="font-medium">Contact:</span>{" "}
                {req.contactDetails?.fullName || "-"}
              </p>
              <p>
                <span className="font-medium">Preferred Date:</span>{" "}
                {formatDate(req.preferredDate)}
              </p>
              <p>
                <span className="font-medium">Submitted:</span>{" "}
                {formatDate(req.createdAt)}
              </p>
              {hasQuote && (
                <p>
                  <span className="font-medium">Quote:</span>{" "}
                  {formatINR(req.invoice.quotedAmount)}
                </p>
              )}
            </div>
            {hasQuote && paymentStatusLabel && (
              <div className="mt-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${paymentBadgeClass}`}
                >
                  Payment: {paymentStatusLabel}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-end md:items-center justify-end">
            <button
              type="button"
              onClick={() => navigate(`/after-sale/${req._id}`)}
              className="px-4 py-2 rounded-lg bg-dark-brown text-white text-xs font-medium hover:bg-accent-red transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading text-dark-brown">
              My After-Sale Service Requests
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Track the status of your after-sale service requests and view details.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/after-sale/new")}
            className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg bg-dark-brown text-white text-xs font-medium hover:bg-accent-red transition-colors shadow-sm"
          >
            Request a Service
          </button>
        </div>

        {renderFilterBar()}

        {loading && renderLoading()}

        {!loading && error && (
          <p className="text-sm text-red-600 mb-4">{error}</p>
        )}

        {!loading && !error && filteredRequests.length === 0 && renderEmptyState()}

        {!loading && !error && filteredRequests.length > 0 && (
          <div className="space-y-4">
            {filteredRequests.map((req) => renderCard(req))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

