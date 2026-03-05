import React, { useEffect, useState } from "react";
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
    parentId: "",
    imageUrl: "",
    sortOrder: 0,
    metaTitle: "",
    metaDescription: "",
    isActive: true,
  });

  const [imageUploading, setImageUploading] = useState(false);

  // fetch category tree
  const { data: categories = [] } = useQuery({
    queryKey: ["categories-tree"],
    queryFn: getCategoryTree,
  });

  // flatten tree
  const flattenCategories = (categories: any[], level = 0) => {
    let result: any[] = [];

    categories.forEach((cat) => {
      result.push({
        _id: cat._id,
        name: cat.name,
        level,
      });

      if (cat.children && cat.children.length > 0) {
        result = result.concat(flattenCategories(cat.children, level + 1));
      }
    });

    return result;
  };

  const flatCategories = flattenCategories(categories);

  // edit mode
  useEffect(() => {
    if (editingCategory) {
      setFormData(editingCategory);
    } else {
      setFormData({
        name: "",
        description: "",
        parentId: "",
        imageUrl: "",
        sortOrder: 0,
        metaTitle: "",
        metaDescription: "",
        isActive: true,
      });
    }
  }, [editingCategory]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // image upload
  const handleImageUpload = async (e: any) => {

    const file = e.target.files[0];

    const data = new FormData();
    data.append("image", file);

    try {

      setImageUploading(true);

      const res = await axios.post(
        "https://kawaiworld-nkppi.ondigitalocean.app/api/uploads/images",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setFormData({
        ...formData,
        imageUrl: res.data.url,
      });

    } catch (err) {
      console.error("Image upload error:", err);
    }

    setImageUploading(false);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

      <div className="bg-white w-[500px] rounded-lg p-6">

        <h2 className="text-xl font-bold mb-4">
          {editingCategory ? "Edit Category" : "Add Category"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          <input
            name="name"
            placeholder="Category Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          {/* Parent Category */}

          <select
            name="parentId"
            value={formData.parentId || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">Root Category</option>

            {flatCategories.map((cat: any) => (
              <option key={cat._id} value={cat._id}>
                {"—".repeat(cat.level)} {cat.name}
              </option>
            ))}

          </select>

          {/* IMAGE */}

          <input type="file" onChange={handleImageUpload} />

          {imageUploading && <p>Uploading image...</p>}

          {formData.imageUrl && (
            <img
              src={formData.imageUrl}
              className="w-32 h-32 object-cover"
            />
          )}

          <input
            type="number"
            name="sortOrder"
            placeholder="Sort Order"
            value={formData.sortOrder}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            name="metaTitle"
            placeholder="Meta Title"
            value={formData.metaTitle}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <textarea
            name="metaDescription"
            placeholder="Meta Description"
            value={formData.metaDescription}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <label className="flex gap-2 items-center">

            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />

            Active

          </label>

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