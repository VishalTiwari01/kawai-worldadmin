import { useEffect, useState } from "react";
import {
  Package,
  Truck,
  CreditCard,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type Order = {
  _id: string;
  orderNumber?: string;
  shiprocketOrderId?: string;
  status: string;
  paymentStatus: string;
  shipmentStatus?: string;
  currency: string;
  shippingAmount?: number;
  taxAmount?: number;
  discountAmount?: number;
  itemCount: number;
  customerName?: string | null;
  phoneNumber?: string | null;
  createdAt: string;
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const StatusBadge = ({ value }: { value: string }) => {
  const base = "px-2 py-1 rounded text-xs font-medium capitalize";
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-400",
    paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400",
    success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400",
    shipped: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-400",
    delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400",
  };
  return (
    <span className={`${base} ${map[value?.toLowerCase()] || "bg-gray-100 dark:bg-gray-800 dark:text-gray-300"}`}>
      {value || "N/A"}
    </span>
  );
};

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");
  const [selectedShipmentStatus, setSelectedShipmentStatus] = useState("");
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState(searchText); // Debounced value
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // DEBOUNCE search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500); // 500ms debounce delay

    return () => clearTimeout(handler); // cleanup previous timeout
  }, [searchText]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        status: selectedStatus,
        paymentStatus: selectedPaymentStatus,
        shipmentStatus: selectedShipmentStatus,
        search: debouncedSearchText, // use debounced value
        startDate,
        endDate,
      };
      const { data } = await axios.get("https://kawaiworld-nkppi.ondigitalocean.app/api/admin/orders", { params });
      setOrders(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when filters change or debounced search changes
  useEffect(() => {
    setPage(1);
    fetchOrders();
  }, [selectedStatus, selectedPaymentStatus, selectedShipmentStatus, debouncedSearchText, startDate, endDate]);

  // Fetch when page changes
  useEffect(() => {
    fetchOrders();
  }, [page]);

  const handleOrderClick = async (orderId: string) => {
  try {
    // const { data } = await axios.get(`http://localhost:1209/api/admin/orders/${orderId}`);
    // console.log('Order detail:', data.data);
    navigate(`/admin/orders/${orderId}`);
    // Open modal or sidebar to show items + SKU + variety
  } catch (err) {
    console.error(err);
  }
};


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground dark:text-gray-300">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Orders</h1>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Total Orders: {pagination?.total ?? 0}
        </span>
      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <input
          type="text"
          placeholder="Search order / phone"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700"
        />
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700"
        >
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="success">Success</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={selectedPaymentStatus}
          onChange={(e) => setSelectedPaymentStatus(e.target.value)}
          className="border rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700"
        >
          <option value="">All Payments</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
        </select>
        <select
          value={selectedShipmentStatus}
          onChange={(e) => setSelectedShipmentStatus(e.target.value)}
          className="border rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700"
        >
          <option value="">All Shipments</option>
          <option value="pending">Pending</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>
        <button
          onClick={() => {
            setSearchText("");
            setSelectedStatus("");
            setSelectedPaymentStatus("");
            setSelectedShipmentStatus("");
            setStartDate("");
            setEndDate("");
            setPage(1);
          }}
          className="border rounded px-3 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-700"
        >
          Reset
        </button>
      </div>

      {/* TABLE */}
      <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700">
        <table className="w-full text-sm text-gray-800 dark:text-gray-100">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">Order</th>
              <th className="px-4 py-3 text-left">Customer / Phone</th>
              <th className="px-4 py-3 text-left">Items</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Payment</th>
              <th className="px-4 py-3 text-left">Shipment</th>
              <th className="px-4 py-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500 dark:text-gray-400">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleOrderClick(order._id)} style={{ cursor: 'pointer' }}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{order.orderNumber || order.shiprocketOrderId}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">#{order._id.slice(-6)}</div>
                  </td>
                  <td className="px-4 py-3">{order.phoneNumber || "Guest"}</td>
                  <td className="px-4 py-3 flex items-center gap-2"><Package className="h-4 w-4 text-gray-500 dark:text-gray-400" /> {order.itemCount}</td>
                  <td className="px-4 py-3"><StatusBadge value={order.status} /></td>
                  <td className="px-4 py-3 "><div className="flex gap-2"><CreditCard className="h-4 w-4 text-gray-500 dark:text-gray-400" /><StatusBadge value={order.paymentStatus} /></div></td>
                  <td className="px-4 py-3 "><div className="flex gap-2"><Truck className="h-4 w-4 text-gray-500 dark:text-gray-400" /><StatusBadge value={order.shipmentStatus || "pending"} /></div></td>
                  <td className="px-4 py-3 "><div className="flex gap-2"><Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />{new Date(order.createdAt).toLocaleDateString("en-IN")}</div></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-end items-center gap-3 text-gray-800 dark:text-gray-100">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50 flex items-center gap-1 border-gray-300 dark:border-gray-700"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>
          <span className="text-sm">Page {pagination.page} of {pagination.totalPages}</span>
          <button
            disabled={page === pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50 flex items-center gap-1 border-gray-300 dark:border-gray-700"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;