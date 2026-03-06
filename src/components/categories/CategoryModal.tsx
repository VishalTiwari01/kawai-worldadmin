import { useEffect, useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { getCategoryTree } from "@/api/api";
import { Button } from "@/components/ui/button";

interface Category {
  _id?: string;
  name: string;
  description?: string;
  parentId?: string | null;
  imageUrl?: string;
  sortOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
  isActive?: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: Category) => void;
  editingCategory?: Category | null;
}

export default function CategoryModal({
  open,
  onClose,
  onSave,
  editingCategory,
}: Props) {

  const [formData, setFormData] = useState<Category>({
    name: "",
    description: "",
    parentId: null,
    imageUrl: "",
    sortOrder: 0,
    metaTitle: "",
    metaDescription: "",
    isActive: true,
  });

  const [imageUploading, setImageUploading] = useState(false);

  /* ---------------- FETCH CATEGORY TREE ---------------- */

  const { data: categories = [] } = useQuery({
    queryKey: ["categories-tree"],
    queryFn: getCategoryTree,
  });

  /* ---------------- FLATTEN TREE ---------------- */

  const flattenCategories = (categories: any[], level = 0): any[] => {
    let result: any[] = [];

    categories.forEach((cat) => {
      result.push({
        _id: cat._id,
        name: cat.name,
        level,
      });

      if (cat.children?.length) {
        result = result.concat(flattenCategories(cat.children, level + 1));
      }
    });

    return result;
  };

  const flatCategories = flattenCategories(categories);

  /* ---------------- EDIT MODE ---------------- */

  useEffect(() => {

    if (editingCategory) {
      setFormData({
        ...editingCategory,
        parentId: editingCategory.parentId ?? null,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        parentId: null,
        imageUrl: "",
        sortOrder: 0,
        metaTitle: "",
        metaDescription: "",
        isActive: true,
      });
    }

  }, [editingCategory]);

  /* ---------------- INPUT CHANGE ---------------- */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {

    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value === "" && name === "parentId" ? null : value,
    }));
  };

  /* ---------------- IMAGE UPLOAD ---------------- */

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append("image", file);

    try {

      setImageUploading(true);

      const res = await axios.post(
        "https://kawaiworld-nkppi.ondigitalocean.app/api/uploads/images",
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setFormData((prev) => ({
        ...prev,
        imageUrl: res.data.url,
      }));

    } catch (err) {
      console.error("Image upload error:", err);
    } finally {
      setImageUploading(false);
    }
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!open) return null;

  return (

    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white w-[520px] rounded-lg p-6 shadow-lg">

        <h2 className="text-xl font-bold mb-4">
          {editingCategory ? "Edit Category" : "Add Category"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* NAME */}

          <input
            name="name"
            placeholder="Category Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          {/* DESCRIPTION */}

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          {/* PARENT CATEGORY */}

          <select
            name="parentId"
            value={formData.parentId || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >

            <option value="">Root Category</option>

            {flatCategories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {"—".repeat(cat.level)} {cat.name}
              </option>
            ))}

          </select>

          {/* IMAGE */}

          <input type="file" onChange={handleImageUpload} />

          {imageUploading && (
            <p className="text-sm text-gray-500">Uploading image...</p>
          )}

          {formData.imageUrl && (
            <img
              src={formData.imageUrl}
              alt="category"
              className="w-28 h-28 object-cover rounded"
            />
          )}

          {/* SORT ORDER */}

          <input
            type="number"
            name="sortOrder"
            placeholder="Sort Order"
            value={formData.sortOrder || 0}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          {/* META TITLE */}

          <input
            name="metaTitle"
            placeholder="Meta Title"
            value={formData.metaTitle || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          {/* META DESCRIPTION */}

          <textarea
            name="metaDescription"
            placeholder="Meta Description"
            value={formData.metaDescription || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          {/* ACTIVE */}

          <label className="flex items-center gap-2">

            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive || false}
              onChange={handleChange}
            />

            Active

          </label>

          {/* ACTION BUTTONS */}

          <div className="flex justify-end gap-3 pt-3">

            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit">
              Save Category
            </Button>

          </div>

        </form>

      </div>

    </div>
  );
}