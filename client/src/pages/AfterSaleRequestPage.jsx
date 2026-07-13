import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { useNotification } from "../components/NotificationProvider";

const SERVICE_TYPES = [
  { value: "repair", label: "Repair" },
  { value: "maintenance", label: "Maintenance" },
  { value: "polishing", label: "Polishing" },
  { value: "restoration", label: "Restoration" },
  { value: "installation", label: "Installation" },
  { value: "inspection", label: "Inspection" },
  { value: "warranty_claim", label: "Warranty Claim" },
];

export default function AfterSaleRequestPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 state
  const [productOrigin, setProductOrigin] = useState("");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [warrantyIncluded, setWarrantyIncluded] = useState(false);
  const [externalDetails, setExternalDetails] = useState({
    name: "",
    category: "",
    estimatedAge: "",
    notes: "",
  });

  // Step 2 state
  const [contactDetails, setContactDetails] = useState({
    fullName: user?.name || "",
    phoneNumber: user?.phone || "",
    email: user?.email || "",
  });
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
  });
  const [addressLoaded, setAddressLoaded] = useState(false);
  const [serviceType, setServiceType] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [issueImages, setIssueImages] = useState([]); // array of {file, url, uploading}
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTimeSlot, setPreferredTimeSlot] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const today = new Date();
  const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);
  const minDateStr = minDate.toISOString().split("T")[0];

  // Fetch addresses once for default address
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await api.get("/addresses");
        const first = Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : null;
        if (first) {
          setAddress({
            street: first.address || "",
            city: first.city || "",
            state: first.state || "",
            zip: first.pincode || "",
          });
        }
      } catch (err) {
        console.error("Error fetching addresses for after-sale:", err);
      } finally {
        setAddressLoaded(true);
      }
    };
    fetchAddresses();
  }, []);

  // Fetch orders when platform origin selected
  useEffect(() => {
    if (productOrigin !== "platform" || orders.length > 0 || ordersLoading) return;
    const fetchOrders = async () => {
      try {
        setOrdersLoading(true);
        const res = await api.get("/orders/me");
        const allOrders = res.data || [];
        const delivered = allOrders.filter((o) => o.status === "Delivered");
        setOrders(delivered);
      } catch (err) {
        console.error("Error fetching orders for after-sale:", err);
        showError(err.response?.data?.message || "Failed to load your orders");
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [productOrigin, orders.length, ordersLoading, showError]);

  const handleSelectOrder = async (orderId) => {
    setSelectedOrderId(orderId);
    const order = orders.find((o) => o._id === orderId);
    if (!order) return;
    const firstItem = Array.isArray(order.items) && order.items.length > 0 ? order.items[0] : null;
    if (!firstItem) return;
    const prodId = firstItem.product?._id || firstItem.product || firstItem.productId;
    setSelectedProductId(prodId || "");
    setProductName(firstItem.name || "");

    if (prodId) {
      try {
        const res = await api.get(`/products/${prodId}`);
        const product = res.data?.product || res.data;
        if (product && product.warrantyIncluded) {
          setWarrantyIncluded(true);
        } else {
          setWarrantyIncluded(false);
        }
      } catch (err) {
        console.error("Error fetching product for warranty check:", err);
        setWarrantyIncluded(false);
      }
    } else {
      setWarrantyIncluded(false);
    }
  };

  const handleExternalChange = (e) => {
    const { name, value } = e.target;
    setExternalDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    if (name === "zip") {
      const digits = value.replace(/\\D/g, "");
      setAddress((prev) => ({ ...prev, [name]: digits }));
    } else {
      setAddress((prev) => ({ ...prev, [name]: value }));
    }
  };

  const clearAddress = () => {
    setAddress({
      street: "",
      city: "",
      state: "",
      zip: "",
    });
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const existingCount = issueImages.length;
    const allowed = Math.max(0, 5 - existingCount);
    const toAdd = files.slice(0, allowed);

    toAdd.forEach((file) => {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        showError("Only JPG and PNG files are allowed");
        return;
      }
      const id = `${file.name}-${Date.now()}`;
      const newItem = { id, file, url: "", uploading: true };
      setIssueImages((prev) => [...prev, newItem]);

      const reader = new FileReader();
      reader.onloadend = () => {
        setIssueImages((prev) =>
          prev.map((img) =>
            img.id === id ? { ...img, url: reader.result, uploading: false } : img
          )
        );
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const canGoNextFromStep1 =
    productOrigin === "platform"
      ? !!selectedOrderId && !!selectedProductId
      : productOrigin === "external"
      ? externalDetails.name.trim() && externalDetails.category.trim()
      : false;

  const canGoNextFromStep2 =
    contactDetails.fullName.trim() &&
    contactDetails.phoneNumber.trim() &&
    contactDetails.email.trim() &&
    address.street.trim() &&
    address.city.trim() &&
    address.state.trim() &&
    address.zip.trim() &&
    serviceType &&
    issueDescription.trim().length >= 20 &&
    preferredDate &&
    preferredTimeSlot;

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const handleNext = () => {
    if (currentStep === 1 && canGoNextFromStep1) {
      setCurrentStep(2);
    } else if (currentStep === 2 && canGoNextFromStep2) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) setCurrentStep(1);
    else if (currentStep === 3) setCurrentStep(2);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const payload = {
        productOrigin: productOrigin === "platform" ? "platform" : "external",
        serviceType,
        issueDescription: issueDescription.trim(),
        issueImages: issueImages.filter((img) => img.url && !img.uploading).map((img) => img.url),
        contactDetails: {
          fullName: contactDetails.fullName.trim(),
          phoneNumber: contactDetails.phoneNumber.trim(),
          email: contactDetails.email.trim(),
        },
        address: {
          street: address.street.trim(),
          city: address.city.trim(),
          state: address.state.trim(),
          zip: address.zip.trim(),
        },
        preferredDate,
        preferredTimeSlot,
      };

      if (productOrigin === "platform") {
        payload.orderId = selectedOrderId;
        payload.productId = selectedProductId;
        payload.productName = productName;
      } else {
        payload.productName = externalDetails.name.trim();
        payload.externalProductDetails = {
          name: externalDetails.name.trim(),
          category: externalDetails.category.trim(),
          estimatedAge: externalDetails.estimatedAge || "",
          notes: externalDetails.notes || "",
        };
      }

      await api.post("/after-sale", payload);

      showSuccess("After-sale service request submitted successfully!");
      navigate("/my-after-sale-requests");
    } catch (err) {
      console.error("Error submitting after-sale request:", err);
      const message = err.response?.data?.message || "Failed to submit request";
      showError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: 1, label: "Product" },
      { id: 2, label: "Details & Visit" },
      { id: 3, label: "Review & Submit" },
    ];

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;
            return (
              <div key={step.id} className="flex-1 flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${
                      isCompleted
                        ? "bg-green-600 text-white"
                        : isActive
                        ? "bg-dark-brown text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className="mt-2 text-xs font-medium text-gray-700">
                    Step {step.id}: {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 bg-gray-200">
                    <div
                      className={`h-0.5 ${
                        currentStep > step.id ? "bg-dark-brown" : "bg-gray-200"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderStep1 = () => {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            type="button"
            onClick={() => setProductOrigin("platform")}
            className={`w-full border rounded-2xl p-6 text-left transition-all duration-200 ${
              productOrigin === "platform"
                ? "border-dark-brown bg-cream shadow-md"
                : "border-gray-200 bg-white hover:border-dark-brown/60 hover:shadow-sm"
            }`}
          >
            <h3 className="text-lg font-semibold text-dark-brown mb-2">
              I bought this from JC Timbers
            </h3>
            <p className="text-sm text-gray-600">
              Select from your delivered JC Timbers orders to raise a service request.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setProductOrigin("external")}
            className={`w-full border rounded-2xl p-6 text-left transition-all duration-200 ${
              productOrigin === "external"
                ? "border-dark-brown bg-cream shadow-md"
                : "border-gray-200 bg-white hover:border-dark-brown/60 hover:shadow-sm"
            }`}
          >
            <h3 className="text-lg font-semibold text-dark-brown mb-2">
              I have a product from elsewhere
            </h3>
            <p className="text-sm text-gray-600">
              Tell us about your existing furniture or wood product and we will help you.
            </p>
          </button>
        </div>

        {productOrigin === "platform" && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Select Delivered Order
            </label>
            {ordersLoading ? (
              <p className="text-sm text-gray-500">Loading your orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-sm text-gray-500">
                You don't have any delivered orders yet.
              </p>
            ) : (
              <select
                value={selectedOrderId}
                onChange={(e) => handleSelectOrder(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-dark-brown focus:ring-dark-brown text-sm"
              >
                <option value="">Select an order</option>
                {orders.map((order) => (
                  <option key={order._id} value={order._id}>
                    {(() => {
                      const date = new Date(order.createdAt);
                      const labelDate = date.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      });
                      const firstItem =
                        Array.isArray(order.items) && order.items.length > 0
                          ? order.items[0]
                          : null;
                      const name = firstItem?.name || "Order";
                      return `${name} — ${labelDate}`;
                    })()}
                  </option>
                ))}
              </select>
            )}
            {warrantyIncluded && (
              <p className="mt-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                This product includes warranty coverage. If your issue qualifies, the service
                will be free of charge.
              </p>
            )}
          </div>
        )}

        {productOrigin === "external" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Product Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={externalDetails.name}
                onChange={handleExternalChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-dark-brown focus:ring-dark-brown text-sm"
                placeholder="e.g. Solid wood dining table"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category<span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={externalDetails.category}
                onChange={handleExternalChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-dark-brown focus:ring-dark-brown text-sm bg-white"
              >
                <option value="">Select category</option>
                <option value="Furniture">Furniture</option>
                <option value="Construction Material">Construction Material</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Estimated Age
              </label>
              <input
                type="text"
                name="estimatedAge"
                value={externalDetails.estimatedAge}
                onChange={handleExternalChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-dark-brown focus:ring-dark-brown text-sm"
                placeholder="e.g. 2 years, 5 years"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={externalDetails.notes}
                onChange={handleExternalChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-dark-brown focus:ring-dark-brown text-sm"
                rows={3}
                placeholder="Any details about the product that would help our team."
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStep2 = () => {
    const allowedServiceTypes = SERVICE_TYPES.filter((type) =>
      type.value === "warranty_claim"
        ? productOrigin === "platform" && warrantyIncluded
        : true
    );

    return (
      <div className="space-y-8">
        {/* Contact Details */}
        <div>
          <h2 className="text-lg font-semibold text-dark-brown mb-4">Contact Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={contactDetails.fullName}
                onChange={handleContactChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-dark-brown focus:ring-dark-brown text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={contactDetails.phoneNumber}
                onChange={handleContactChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-dark-brown focus:ring-dark-brown text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={contactDetails.email}
                onChange={handleContactChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-dark-brown focus:ring-dark-brown text-sm"
              />
            </div>
          </div>
        </div>

        {/* Service Visit Details */}
        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-dark-brown mb-4">
            Service Visit Details
          </h2>

          {/* Address */}
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-medium text-gray-800">Service Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Street<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="street"
                  value={address.street}
                  onChange={handleAddressChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-dark-brown focus:ring-dark-brown text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  City<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={address.city}
                  onChange={handleAddressChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-dark-brown focus:ring-dark-brown text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  State<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  value={address.state}
                  onChange={handleAddressChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-dark-brown focus:ring-dark-brown text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  PIN Code<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="zip"
                  value={address.zip}
                  onChange={handleAddressChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-dark-brown focus:ring-dark-brown text-sm"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={clearAddress}
              className="text-xs text-dark-brown hover:text-accent-red underline-offset-2 hover:underline"
            >
              Use a different address
            </button>
          </div>

          {/* Service type selector */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-800 mb-3">
              Service Type<span className="text-red-500">*</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {allowedServiceTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setServiceType(type.value)}
                  className={`border rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                    serviceType === type.value
                      ? "border-dark-brown bg-cream text-dark-brown shadow-sm"
                      : "border-gray-200 bg-white text-gray-700 hover:border-dark-brown/60 hover:shadow-sm"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Issue description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">
              Describe the Issue<span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-dark-brown focus:ring-dark-brown text-sm"
              placeholder="Please describe the problem in detail so our team can prepare for the visit."
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>Minimum 20 characters</span>
              <span>{issueDescription.length} characters</span>
            </div>
          </div>

          {/* Image upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">
              Upload Photos of the Issue
              <span className="text-gray-500 text-xs ml-1">(optional, max 5 images)</span>
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png"
              multiple
              onChange={handleImagesChange}
              className="mt-2 text-sm"
            />
            {issueImages.length > 0 && (
              <div className="mt-3 grid grid-cols-3 md:grid-cols-5 gap-3">
                {issueImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative w-full aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center"
                  >
                    {img.uploading || !img.url ? (
                      <div className="text-xs text-gray-500 animate-pulse">
                        Uploading...
                      </div>
                    ) : (
                      <img
                        src={img.url}
                        alt="Issue"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preferred date and time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Preferred Service Date<span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                min={minDateStr}
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-dark-brown focus:ring-dark-brown text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Only dates at least two days from today are available.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Preferred Time Slot<span className="text-red-500">*</span>
              </label>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPreferredTimeSlot("morning")}
                  className={`border rounded-lg px-3 py-2 text-sm transition-all ${
                    preferredTimeSlot === "morning"
                      ? "border-dark-brown bg-cream text-dark-brown shadow-sm"
                      : "border-gray-200 bg-white text-gray-700 hover:border-dark-brown/60 hover:shadow-sm"
                  }`}
                >
                  <div className="font-medium">Morning</div>
                  <div className="text-xs text-gray-500">9 AM – 12 PM</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPreferredTimeSlot("afternoon")}
                  className={`border rounded-lg px-3 py-2 text-sm transition-all ${
                    preferredTimeSlot === "afternoon"
                      ? "border-dark-brown bg-cream text-dark-brown shadow-sm"
                      : "border-gray-200 bg-white text-gray-700 hover:border-dark-brown/60 hover:shadow-sm"
                  }`}
                >
                  <div className="font-medium">Afternoon</div>
                  <div className="text-xs text-gray-500">12 PM – 4 PM</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPreferredTimeSlot("evening")}
                  className={`border rounded-lg px-3 py-2 text-sm transition-all ${
                    preferredTimeSlot === "evening"
                      ? "border-dark-brown bg-cream text-dark-brown shadow-sm"
                      : "border-gray-200 bg-white text-gray-700 hover:border-dark-brown/60 hover:shadow-sm"
                  }`}
                >
                  <div className="font-medium">Evening</div>
                  <div className="text-xs text-gray-500">4 PM – 7 PM</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStep3 = () => {
    const productSummary =
      productOrigin === "platform"
        ? {
          origin: "JC Timbers",
          productName: productName || "Selected from delivered orders",
        }
        : {
          origin: "External product",
          productName: externalDetails.name || "-",
        };

    const photosCount = issueImages.filter((img) => img.url).length;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Details */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-800">Product Details</h3>
              <button
                type="button"
                onClick={() => goToStep(1)}
                className="text-xs text-dark-brown hover:text-accent-red underline-offset-2 hover:underline"
              >
                Edit
              </button>
            </div>
            <dl className="space-y-1 text-sm text-gray-700">
              <div className="flex justify-between">
                <dt className="font-medium">Origin</dt>
                <dd>{productSummary.origin}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Product Name</dt>
                <dd>{productSummary.productName}</dd>
              </div>
              {productOrigin === "platform" && (
                <>
                  <div className="flex justify-between">
                    <dt className="font-medium">Order ID</dt>
                    <dd className="truncate max-w-[160px] text-right">
                      {selectedOrderId || "-"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Warranty</dt>
                    <dd>{warrantyIncluded ? "Included" : "Not included"}</dd>
                  </div>
                </>
              )}
              {productOrigin === "external" && (
                <>
                  <div className="flex justify-between">
                    <dt className="font-medium">Category</dt>
                    <dd>{externalDetails.category || "-"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Estimated Age</dt>
                    <dd>{externalDetails.estimatedAge || "-"}</dd>
                  </div>
                </>
              )}
            </dl>
          </div>

          {/* Contact Details */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-800">Contact Details</h3>
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="text-xs text-dark-brown hover:text-accent-red underline-offset-2 hover:underline"
              >
                Edit
              </button>
            </div>
            <dl className="space-y-1 text-sm text-gray-700">
              <div className="flex justify-between">
                <dt className="font-medium">Full Name</dt>
                <dd>{contactDetails.fullName || "-"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Phone</dt>
                <dd>{contactDetails.phoneNumber || "-"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Email</dt>
                <dd>{contactDetails.email || "-"}</dd>
              </div>
            </dl>
          </div>

          {/* Service Address */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-800">Service Address</h3>
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="text-xs text-dark-brown hover:text-accent-red underline-offset-2 hover:underline"
              >
                Edit
              </button>
            </div>
            <dl className="space-y-1 text-sm text-gray-700">
              <div>
                <dt className="font-medium">Street</dt>
                <dd>{address.street || "-"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">City</dt>
                <dd>{address.city || "-"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">State</dt>
                <dd>{address.state || "-"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">PIN Code</dt>
                <dd>{address.zip || "-"}</dd>
              </div>
            </dl>
          </div>

          {/* Service Information */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-800">Service Information</h3>
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="text-xs text-dark-brown hover:text-accent-red underline-offset-2 hover:underline"
              >
                Edit
              </button>
            </div>
            <dl className="space-y-1 text-sm text-gray-700">
              <div className="flex justify-between">
                <dt className="font-medium">Service Type</dt>
                <dd>
                  {SERVICE_TYPES.find((t) => t.value === serviceType)?.label || "-"}
                </dd>
              </div>
              <div>
                <dt className="font-medium">Issue Description</dt>
                <dd className="mt-1 text-xs text-gray-700 whitespace-pre-line">
                  {issueDescription || "-"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Photos Uploaded</dt>
                <dd>{photosCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Preferred Date</dt>
                <dd>{preferredDate || "-"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Preferred Time Slot</dt>
                <dd>
                  {preferredTimeSlot
                    ? preferredTimeSlot.charAt(0).toUpperCase() +
                      preferredTimeSlot.slice(1)
                    : "-"}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Info box */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
          <p className="font-semibold mb-1">
            Our team will review your request and contact you with a service quote before
            scheduling your visit.
          </p>
          <p className="text-blue-800">
            You will be notified at every step so you can track the status of your after-sale
            service.
          </p>
        </div>

        {/* Submit button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-3 rounded-lg bg-dark-brown text-white text-sm font-semibold hover:bg-accent-red transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading text-dark-brown mb-2">
              After-Sale Service Request
            </h1>
            <p className="text-sm text-gray-600 max-w-2xl">
              Tell us about your product and the issue you are facing. We will review your request
              and get back to you with the best possible support.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/my-after-sale-requests")}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            View My After-Sale Requests
          </button>
        </div>

        {renderStepIndicator()}

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 md:p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {/* Navigation buttons */}
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            {currentStep < 3 && (
              <button
                type="button"
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !canGoNextFromStep1) ||
                  (currentStep === 2 && !canGoNextFromStep2)
                }
                className="px-6 py-2 rounded-lg bg-dark-brown text-white text-sm font-semibold hover:bg-accent-red transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

