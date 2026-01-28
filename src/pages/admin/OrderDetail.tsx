import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CreditCard, Truck, Calendar } from "lucide-react";

type OrderItem = {
  _id: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productName: string;
  productSku: string;
  productId?: number;
  productImage?: string;
  createdAt: string;
};

type OrderDetailType = {
  _id: string;
  userId?: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  taxAmount?: number;
  shippingAmount?: number;
  discountAmount?: number;
  currency: string;
  isReturn?: boolean;
  tracking?: any[];
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

const StatusBadge = ({ value }: { value: string }) => {
  const base = "px-2 py-1 rounded text-xs font-medium capitalize";
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-400",
    confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-400",
    processing: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-400",
    shipped: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-400",
    delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400",
    refunded: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400",
    failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400",
  };
  return (
    <span className={`${base} ${map[value?.toLowerCase()] || "bg-gray-100 dark:bg-gray-800 dark:text-gray-300"}`}>
      {value || "N/A"}
    </span>
  );
};

const OrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetailType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`https://kawaiworld-nkppi.ondigitalocean.app/api/admin/orders/${orderId}`);
        setOrder(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500 dark:text-gray-400">
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        Order not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="px-3 py-1 border rounded hover:bg-gray-200 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-700 dark:text-gray-100"
      >
        ← Back to Orders
      </button>

      {/* Order Info */}
      <div className="border rounded-lg p-4 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 space-y-2">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Order #{order.orderNumber}</h2>
        <div className="flex flex-wrap gap-4 text-sm text-gray-700 dark:text-gray-300">
          <div>
            Status: <StatusBadge value={order.status} />
          </div>
          <div className="flex items-center gap-1">
            <CreditCard className="h-4 w-4 text-gray-500 dark:text-gray-400" /> Payment: <StatusBadge value={order.paymentStatus} />
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" /> Date: {new Date(order.createdAt).toLocaleDateString("en-IN")}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700">
        <table className="w-full text-sm text-gray-800 dark:text-gray-100">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">SKU</th>
              <th className="px-4 py-3 text-left">Quantity</th>
              <th className="px-4 py-3 text-left">Unit Price</th>
              <th className="px-4 py-3 text-left">Total Price</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item._id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                <td className="px-4 py-3 flex items-center gap-2">
                  {item.productImage && <img src={item.productImage} alt={item.productName} className="w-10 h-10 object-cover rounded" />}
                  <span>{item.productName}</span>
                </td>
                <td className="px-4 py-3">{item.productSku}</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">{item.unitPrice.toLocaleString("en-IN", { style: "currency", currency: order.currency })}</td>
                <td className="px-4 py-3">{item.totalPrice.toLocaleString("en-IN", { style: "currency", currency: order.currency })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderDetail;