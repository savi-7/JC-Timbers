import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../api/axios";
import { useNotification } from "../components/NotificationProvider";

const STATUS_ORDER = [
  "submitted",
  "under_review",
  "scheduled",
  "in_progress",
  "completed",
  "closed",
  "rejected",
  "rescheduled",
];

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

const SERVICE_TYPE_LABELS = {
  repair: "Repair",
  maintenance: "Maintenance",
  polishing: "Polishing",
  restoration: "Restoration",
  installation: "Installation",
  inspection: "Inspection",
  warranty_claim: "Warranty Claim",
};

export default function AfterSaleRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paying, setPaying] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/after-sale/${id}`);
        setRequest(res.data || res.data?.request || null);
      } catch (err) {
        console.error("Error fetching after-sale request:", err);
        const message = err.response?.data?.message || "Failed to load request details";
        setError(message);
        showError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id, showError]);

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

  const paymentInfo = request?.invoice || {};
  const hasQuote =
    request &&
    paymentInfo &&
    typeof paymentInfo.quotedAmount === "number" &&
    paymentInfo.quotedAmount > 0;

  const currentStatus = request?.status;

  const timelineNodes = useMemo(() => {
    if (!currentStatus || !request) return [];
    const currentIndex = STATUS_ORDER.indexOf(currentStatus);
    const createdAt = request.createdAt;
    const updatedAt = request.updatedAt;

    return STATUS_ORDER.map((status, index) => {
      const reached = index <= currentIndex;
      let ts = null;
      if (status === "submitted") {
        ts = createdAt;
      } else if (reached) {
        ts = updatedAt;
      }
      return {
        status,
        label: STATUS_LABELS[status] || status,
        reached,
        isCurrent: status === currentStatus,
        timestamp: ts,
      };
    });
  }, [currentStatus, request]);

  const handleCancel = async () => {
    if (!request) return;
    const confirmed = window.confirm(
      "Are you sure you want to cancel this request? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      setCancelLoading(true);
      await api.patch(`/after-sale/${request._id}/cancel`);
      showSuccess("Request cancelled successfully.");
      navigate("/my-after-sale-requests");
    } catch (err) {
      console.error("Error cancelling request:", err);
      const message = err.response?.data?.message || "Failed to cancel request";
      showError(message);
    } finally {
      setCancelLoading(false);
    }
  };

  const ensureRazorpayLoaded = () =>
    new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
      document.body.appendChild(script);
    });

  const handlePayOnline = async () => {
    if (!request || !hasQuote) return;
    try {
      setPaying(true);

      await ensureRazorpayLoaded();

      const orderRes = await api.post("/payment/razorpay/after-sale", {
        requestId: request._id,
      });

      const { orderId, amount: orderAmount, keyId } = orderRes.data;

      const options = {
        key: keyId,
        amount: orderAmount,
        currency: "INR",
        name: "JC Timbers",
        description: "After-sale service payment",
        order_id: orderId,
        handler: async function (response) {
          try {
            await api.patch(`/after-sale/${request._id}/pay-online`, {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            showSuccess("Payment successful!");
            const refreshed = await api.get(`/after-sale/${request._id}`);
            setRequest(refreshed.data || refreshed.data?.request || null);
          } catch (err) {
            console.error("Error confirming online payment:", err);
            const message =
              err.response?.data?.message || "Failed to confirm payment status";
            showError(message);
          }
        },
        prefill: {
          name: request.contactDetails?.fullName || "",
          email: request.contactDetails?.email || "",
          contact: request.contactDetails?.phoneNumber || "",
        },
        theme: {
          color: "#8B4513",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Error during Razorpay payment:", err);
      const message = err.response?.data?.message || err.message || "Payment failed";
      showError(message);
    } finally {
      setPaying(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!request || !feedbackRating) {
      showError("Please select a rating before submitting your feedback.");
      return;
    }

    try {
      setSubmittingFeedback(true);
      await api.post(`/after-sale/${request._id}/feedback`, {
        rating: feedbackRating,
        comment: feedbackComment,
      });
      showSuccess("Thank you for your feedback!");
      const refreshed = await api.get(`/after-sale/${request._id}`);
      setRequest(refreshed.data || refreshed.data?.request || null);
    } catch (err) {
      console.error("Error submitting feedback:", err);
      const message = err.response?.data?.message || "Failed to submit feedback";
      showError(message);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const renderLoading = () => (
    <div className="py-16 flex justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dark-brown mx-auto" />
        <p className="mt-3 text-sm text-gray-600">Loading request details...</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {renderLoading()}
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-sm text-red-600 mb-4">
            {error || "Unable to load this request. Please try again later."}
          </p>
          <button
            type="button"
            onClick={() => navigate("/my-after-sale-requests")}
            className="text-sm text-dark-brown hover:text-accent-red underline"
          >
            Back to My Requests
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const productName =
    request.productName ||
    request.productId?.name ||
    (request.productOrigin === "external"
      ? request.externalProductDetails?.name
      : "Product");
  const serviceLabel = SERVICE_TYPE_LABELS[request.serviceType] || request.serviceType;
  const originLabel =
    request.productOrigin === "platform" ? "JC Timbers Product" : "External Product";

  const originClass =
    request.productOrigin === "platform"
      ? "bg-indigo-100 text-indigo-800 border-indigo-200"
      : "bg-gray-100 text-gray-800 border-gray-200";

  const paymentStatus = paymentInfo.paymentStatus || "pending";

  const canShowServiceDetails = [
    "scheduled",
    "in_progress",
    "completed",
    "closed",
  ].includes(request.status);

  const canShowCompletion = ["completed", "closed"].includes(request.status);

  const canShowFeedback =
    request.status === "completed" &&
    (!request.feedback || request.feedback.rating == null);

  const paymentStatusBadge =
    paymentStatus === "paid"
      ? "bg-green-100 text-green-800"
      : paymentStatus === "waived"
      ? "bg-teal-100 text-teal-800"
      : "bg-yellow-50 text-yellow-800";

  const paymentStatusLabel =
    paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1);

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading text-dark-brown">
              After-Sale Service Request
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Request ID: <span className="font-mono text-gray-700">{request._id}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/my-after-sale-requests")}
            className="text-xs text-dark-brown hover:text-accent-red underline"
          >
            Back to My Requests
          </button>
        </div>

        {/* 1. Request summary */}
        <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-dark-brown">{productName}</h2>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${originClass}`}
            >
              {originLabel}
            </span>
            {request.warrantyEligible && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-800 border border-green-200">
                Warranty Eligible
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Service Type:</span> {serviceLabel}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Issue Description:</span>{" "}
            {request.issueDescription || "-"}
          </p>

          {Array.isArray(request.issueImages) && request.issueImages.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-2">Issue Photos</p>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {request.issueImages.map((img, idx) => (
                  <div
                    key={`${img}-${idx}`}
                    className="w-24 h-24 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0 bg-gray-50"
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

          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
            <span>
              <span className="font-medium">Submitted:</span>{" "}
              {formatDate(request.createdAt)}
            </span>
            <span>
              <span className="font-medium">Preferred Date:</span>{" "}
              {formatDate(request.preferredDate)}
            </span>
          </div>
        </section>

        {/* 2. Contact details */}
        <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Contact Details</h2>
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-700">
            <div>
              <dt className="font-medium">Full Name</dt>
              <dd>{request.contactDetails?.fullName || "-"}</dd>
            </div>
            <div>
              <dt className="font-medium">Phone</dt>
              <dd>{request.contactDetails?.phoneNumber || "-"}</dd>
            </div>
            <div>
              <dt className="font-medium">Email</dt>
              <dd>{request.contactDetails?.email || "-"}</dd>
            </div>
          </dl>
        </section>

        {/* 3. Status timeline */}
        <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Status Timeline</h2>
          <div className="relative">
            <div className="absolute left-4 top-2 bottom-2 w-px bg-gray-200" />
            <ol className="space-y-3 ml-2">
              {timelineNodes.map((node) => (
                <li key={node.status} className="relative flex items-start gap-3">
                  <div className="mt-1">
                    <span
                      className={`w-3 h-3 rounded-full inline-block ${
                        node.isCurrent
                          ? "bg-dark-brown"
                          : node.reached
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                  </div>
                  <div>
                    <p
                      className={`text-xs font-medium ${
                        node.isCurrent
                          ? "text-dark-brown"
                          : node.reached
                          ? "text-gray-800"
                          : "text-gray-400"
                      }`}
                    >
                      {node.label}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {node.reached && node.timestamp
                        ? formatDate(node.timestamp)
                        : node.reached
                        ? "(time not available)"
                        : "Pending"}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 4. Service details */}
        {canShowServiceDetails && (
          <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Service Details</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
              <div>
                <dt className="font-medium">Technician</dt>
                <dd>{request.assignedTechnicianName || "-"}</dd>
              </div>
              <div>
                <dt className="font-medium">Technician Phone</dt>
                <dd>
                  {request.assignedTechnicianPhone ? (
                    <a
                      href={`tel:${request.assignedTechnicianPhone}`}
                      className="text-dark-brown hover:text-accent-red"
                    >
                      {request.assignedTechnicianPhone}
                    </a>
                  ) : (
                    "-"
                  )}
                </dd>
              </div>
              <div>
                <dt className="font-medium">Scheduled Date</dt>
                <dd>{formatDate(request.scheduledDate)}</dd>
              </div>
              <div>
                <dt className="font-medium">Scheduled Time Slot</dt>
                <dd>{request.scheduledTimeSlot || "-"}</dd>
              </div>
            </dl>
          </section>
        )}

        {/* 5. Payment section */}
        <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-gray-800 mb-1">Payment</h2>

          {!hasQuote ? (
            <p className="text-xs text-blue-800 bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
              A service quote has not been set yet. Our team will update this after reviewing
              your request.
            </p>
          ) : paymentStatus === "unpaid" ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-800">
                Quoted Amount:{" "}
                <span className="font-semibold">
                  {formatINR(paymentInfo.quotedAmount) || paymentInfo.quotedAmount}
                </span>
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handlePayOnline}
                  disabled={paying}
                  className="px-4 py-2 rounded-lg bg-dark-brown text-white text-xs font-medium hover:bg-accent-red transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {paying ? "Processing Payment..." : "Pay Online via Razorpay"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Simple confirmation for pay-on-visit
                    window.alert(
                      "You can settle the amount directly with the technician on the day of the visit."
                    );
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Pay on Visit
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {paymentStatus === "paid" && (
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium ${paymentStatusBadge}`}
                >
                  Payment Received — {paymentStatusLabel} (
                  {paymentInfo.paymentMethod || "online"})
                </span>
              )}
              {paymentStatus === "waived" && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium bg-teal-100 text-teal-800">
                  Covered Under Warranty — No Charge
                </span>
              )}
              {paymentInfo.paidAt && (
                <p className="text-xs text-gray-600">
                  Paid on: {formatDate(paymentInfo.paidAt)}
                </p>
              )}
            </div>
          )}
        </section>

        {/* 6. Completion section */}
        {canShowCompletion && (
          <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-semibold text-gray-800 mb-1">Completion</h2>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Notes:</span>{" "}
              {request.completionNotes || request.adminNotes || "-"}
            </p>
            {Array.isArray(request.completionImages) &&
              request.completionImages.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    Completion Photos
                  </p>
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {request.completionImages.map((img, idx) => (
                      <div
                        key={`${img}-${idx}`}
                        className="w-24 h-24 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0 bg-gray-50"
                      >
                        <img
                          src={img}
                          alt={`Completion ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </section>
        )}

        {/* 7. Feedback section */}
        {request.status === "completed" && (
          <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">Feedback</h2>
            {request.feedback && request.feedback.rating != null && !canShowFeedback ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  Thank you for your feedback. Here is what you shared:
                </p>
                <div className="flex items-center gap-1 text-yellow-500">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <svg
                      key={idx}
                      className={`w-5 h-5 ${
                        idx < request.feedback.rating ? "fill-current" : "stroke-current"
                      }`}
                      fill={idx < request.feedback.rating ? "currentColor" : "none"}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.384 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.176 0l-3.385 2.46c-.784.57-1.838-.196-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.384-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z"
                      />
                    </svg>
                  ))}
                </div>
                {request.feedback.comment && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Comment:</span>{" "}
                    {request.feedback.comment}
                  </p>
                )}
              </div>
            ) : canShowFeedback ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1">
                    Please rate your overall experience with this service.
                  </p>
                  <div className="flex items-center gap-1 text-yellow-500">
                    {Array.from({ length: 5 }).map((_, idx) => {
                      const star = idx + 1;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          className="focus:outline-none"
                        >
                          <svg
                            className={`w-7 h-7 ${
                              star <= feedbackRating
                                ? "fill-current"
                                : "stroke-current text-gray-300"
                            }`}
                            fill={star <= feedbackRating ? "currentColor" : "none"}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.384 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.176 0l-3.385 2.46c-.784.57-1.838-.196-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.384-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z"
                            />
                          </svg>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Additional Comments (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-dark-brown focus:ring-dark-brown text-sm"
                    placeholder="Share anything else you'd like us to know."
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSubmitFeedback}
                  disabled={submittingFeedback}
                  className="px-4 py-2 rounded-lg bg-dark-brown text-white text-xs font-medium hover:bg-accent-red transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {submittingFeedback ? "Submitting..." : "Submit Feedback"}
                </button>
              </div>
            ) : null}
          </section>
        )}

        {/* Bottom actions */}
        {request.status === "submitted" && (
          <div className="pt-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelLoading}
              className="px-4 py-2 rounded-lg border border-red-300 text-xs font-medium text-red-700 hover:bg-red-50 transition-colors disabled:bg-gray-200 disabled:text-gray-500"
            >
              {cancelLoading ? "Cancelling..." : "Cancel Request"}
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

