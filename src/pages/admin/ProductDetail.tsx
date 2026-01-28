import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  CheckCircle,
  XCircle,
} from "lucide-react";
import axios from "axios";

const formatPrice = (v?: number) =>
  typeof v === "number" ? `₹${v.toFixed(2)}` : "₹0.00";

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-gray-100 text-gray-700",
    draft: "bg-yellow-100 text-yellow-700",
    out_of_stock: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        colors[status] || "bg-muted"
      }`}
    >
      {status.replace("_", " ").toUpperCase()}
    </span>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`https://kawaiworld-nkppi.ondigitalocean.app/api/admin/products/${id}`);
        console.log(res.data.data);
        setProduct(res.data.data);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Product not found
      </div>
    );
  }

  const firstVariant = product.variants?.[0];

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg border hover:bg-muted"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-bold">{product.name}</h1>
        </div>

        <StatusBadge status={product.status} />
      </div>

      {/* TOP SECTION */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* IMAGES */}
        <div className="space-y-3">
          <img
            src={product.images?.[0]?.imageUrl}
            className="w-full h-72 object-cover rounded-xl border"
          />

          <div className="flex gap-2">
            {product.images?.map((img: any) => (
              <img
                key={img._id}
                src={img.imageUrl}
                className="h-16 w-16 object-cover rounded border"
              />
            ))}
          </div>
        </div>

        {/* BASIC INFO */}
        <div className="md:col-span-2 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Info label="Category" value={product.categoryId} />
            <Info label="Brand" value={product.brand || "—"} />
            <Info
              label="Shiprocket Product ID"
              value={product.shiprocketProductId}
            />
            <Info
              label="Featured"
              value={
                product.isFeatured ? (
                  <CheckCircle className="text-green-600" size={18} />
                ) : (
                  <XCircle className="text-muted-foreground" size={18} />
                )
              }
            />
          </div>

          <div>
            <h3 className="font-semibold mb-1">Short Description</h3>
            <p className="text-sm text-muted-foreground">
              {product.shortDescription}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-1">Description</h3>
            <p className="text-sm whitespace-pre-line text-muted-foreground">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* VARIANTS */}
      <div className="bg-background border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Package size={18} /> Variants
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th>Image</th>
                <th className="py-2 text-left">SKU</th>
                <th>Name</th>
                <th>Price</th>
                <th>Sale</th>
                <th>Stock</th>
                <th>Weight</th>
                <th>Dimensions (cm)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {product.variants.map((v: any) => (
                <tr key={v._id} className="border-b last:border-0">
                    <td><img src={v.images?.[0]?.imageUrl} className="h-12 w-12 object-cover rounded border" /></td>
                  <td className="py-3 font-mono">{v.sku}</td>
                  <td>{v.variantName}</td>
                  <td>{formatPrice(v.price)}</td>
                  <td>{formatPrice(v.salePrice)}</td>
                  <td>{v.stockQuantity}</td>
                  <td>{v.weight} kg</td>
                  <td>
                    {v.length}×{v.breadth}×{v.height}
                  </td>
                  <td>
                    {v.isActive ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-muted-foreground">
                        Inactive
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ---------------- SMALL INFO COMPONENT ---------------- */
const Info = ({
  label,
  value,
}: {
  label: string;
  value: any;
}) => (
  <div className="bg-muted/40 rounded-lg p-3">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="font-medium text-sm">{value}</p>
  </div>
);

export default ProductDetail;