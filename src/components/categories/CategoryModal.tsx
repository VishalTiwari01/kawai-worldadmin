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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;

      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value === "" && name === "parentId" ? null : value,
    }));
  };

  /* ---------------- IMAGE UPLOAD ---------------- */

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      
      {/* MODAL */}

      <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-lg shadow-lg flex flex-col">

        {/* HEADER */}

        <div className="p-5 border-b">
          <h2 className="text-xl font-semibold">
            {editingCategory ? "Edit Category" : "Add Category"}
          </h2>
        </div>

        {/* SCROLLABLE BODY */}

        <form
          onSubmit={handleSubmit}
          className="p-5 space-y-4 overflow-y-auto flex-1"
        >
          {/* NAME */}

          <div>
            <label className="text-sm font-medium">Category Name</label>

            <input
              name="name"
              placeholder="Category Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
              required
            />
          </div>

          {/* DESCRIPTION */}

          <div>
            <label className="text-sm font-medium">Description</label>

            <textarea
              name="description"
              placeholder="Description"
              value={formData.description || ""}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
            />
          </div>

          {/* PARENT CATEGORY */}

          <div>
            <label className="text-sm font-medium">Parent Category</label>

            <select
              name="parentId"
              value={formData.parentId || ""}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
            >
              <option value="">Root Category</option>

              {flatCategories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {"—".repeat(cat.level)} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* IMAGE */}

          <div>
            <label className="text-sm font-medium">Category Image</label>

            <input
              type="file"
              onChange={handleImageUpload}
              className="mt-1"
            />

            {imageUploading && (
              <p className="text-sm text-gray-500 mt-1">
                Uploading image...
              </p>
            )}

            {formData.imageUrl && (
              <img
                src={formData.imageUrl}
                alt="category"
                className="w-28 h-28 object-cover rounded mt-3"
              />
            )}
          </div>

          {/* SORT ORDER */}

          <div>
            <label className="text-sm font-medium">Sort Order</label>

            <input
              type="number"
              name="sortOrder"
              value={formData.sortOrder || 0}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
            />
          </div>

          {/* META TITLE */}

          <div>
            <label className="text-sm font-medium">Meta Title</label>

            <input
              name="metaTitle"
              value={formData.metaTitle || ""}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
            />
          </div>

          {/* META DESCRIPTION */}

          <div>
            <label className="text-sm font-medium">Meta Description</label>

            <textarea
              name="metaDescription"
              value={formData.metaDescription || ""}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
            />
          </div>

          {/* ACTIVE */}

          <label className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive || false}
              onChange={handleChange}
            />
            Active
          </label>
        </form>

        {/* FOOTER */}

        <div className="border-t p-4 flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>

          <Button type="submit" onClick={handleSubmit}>
            Save Category
          </Button>
        </div>
      </div>
    </div>
  );
}