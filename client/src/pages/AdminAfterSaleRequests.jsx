import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/admin/Sidebar";
import Header from "../components/admin/Header";
import api from "../api/axios";

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

export default function AdminAfterSaleRequests() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [originFilter, setOriginFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError("");
        const params = {
          page,
          limit: 10,
        };
        if (statusFilter) params.status = statusFilter;
        if (originFilter) params.productOrigin = originFilter;

        const res = await api.get("/admin/after-sale", { params });
        setRequests(res.data.requests || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.totalCount || 0);
      } catch (err) {
        console.error("Error fetching after-sale requests (admin):", err);
        setError(
          err.response?.data?.message ||
            "Failed to load after-sale service requests"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [statusFilter, originFilter, page]);

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

  const paymentBadge = (invoice) => {
    if (!invoice || !invoice.paymentStatus) return null;
    const status = invoice.paymentStatus;
    let classes = "bg-gray-100 text-gray-800";
    if (status === "paid") classes = "bg-green-100 text-green-800";
    else if (status === "waived") classes = "bg-teal-100 text-teal-800";
    else if (status === "unpaid") classes = "bg-yellow-100 text-yellow-800";
    return (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${classes}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const originBadge = (origin) => {
    const label = origin === "platform" ? "Platform" : "External";
    const classes =
      origin === "platform"
        ? "bg-indigo-100 text-indigo-800 border-indigo-200"
        : "bg-gray-100 text-gray-800 border-gray-200";
    return (
      <span
        className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border ${classes}`}
      >
        {label}
      </span>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    for (let i = 1; i <= totalPages; i += 1) {
      pages.push(i);
    }
    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500">
          Showing page {page} of {totalPages} ({totalCount} requests)
        </p>
        <div className="inline-flex rounded-md shadow-sm isolate">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-xs border border-gray-300 bg-white text-gray-700 rounded-l-md disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          {pages.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`px-3 py-1.5 text-xs border-t border-b border-gray-300 bg-white text-gray-700 hover:bg-gray-50 ${
                p === page ? "font-semibold bg-gray-100" : ""
              }`}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-xs border border-gray-300 bg-white text-gray-700 rounded-r-md disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const rows = useMemo(() => requests || [], [requests]);

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="flex-1 p-6 overflow-y-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              After-Sale Service Requests
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Review and manage customer after-sale service requests.
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">All Statuses</option>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Origin
                </label>
                <select
                  value={originFilter}
                  onChange={(e) => {
                    setOriginFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">All Origins</option>
                  <option value="platform">Platform</option>
                  <option value="external">External</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("");
                    setOriginFilter("");
                    setPage(1);
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent" />
                <p className="mt-4 text-sm text-gray-500">
                  Loading after-sale requests...
                </p>
              </div>
            ) : rows.length === 0 ? (
              <div className="p-12 text-center">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-500 text-sm">
                  No after-sale requests found for the selected filters.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Request
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Origin
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quote
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rows.map((req) => {
                        const shortId = req._id ? `${req._id.slice(0, 6)}...` : "-";
                        const statusLabel =
                          STATUS_LABELS[req.status] || req.status || "-";
                        const statusClass =
                          STATUS_BADGE_CLASSES[req.status] ||
                          "bg-gray-100 text-gray-800 border-gray-200";
                        const productName =
                          req.productName ||
                          req.productId?.name ||
                          (req.productOrigin === "external"
                            ? req.externalProductDetails?.name
                            : "Product");
                        return (
                          <tr key={req._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {shortId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {req.contactDetails?.fullName || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {productName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {originBadge(req.productOrigin)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {SERVICE_TYPE_LABELS[req.serviceType] || req.serviceType}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusClass}`}
                              >
                                {statusLabel}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {typeof req.invoice?.quotedAmount === "number" &&
                              req.invoice.quotedAmount > 0
                                ? formatINR(req.invoice.quotedAmount)
                                : "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {paymentBadge(req.invoice)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(req.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                type="button"
                                onClick={() =>
                                  (window.location.href = `/admin/after-sale/${req._id}`)
                                }
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {renderPagination()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

