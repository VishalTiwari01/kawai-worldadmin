import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import CategoryItem from "@/components/categories/CategoryItem";
import CategoryModal from "@/components/categories/CategoryModal";
import { Plus } from "lucide-react";
import {
  getCategoryTree,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/api/api";

interface Category {
  _id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  parentId?: string | null;
  children?: Category[];
}

export default function Categories() {

  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories-tree"],
    queryFn: getCategoryTree,
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories-tree"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Category }) =>
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories-tree"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories-tree"] });
    },
  });

  const handleSave = (data: Category) => {

    const payload = {
      ...data,
      parentId: data.parentId || null
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }

    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this category?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading categories...
      </div>
    );
  }

  return (
    <div className="p-2 max-w-7xl mx-auto">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-6">

        <div>
          <h1 className="text-2xl font-bold">Category Manager</h1>
          <p className="text-sm text-gray-500">
            Manage your store categories
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingCategory(null);
            setModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>

      </div>

      {/* CATEGORY TREE */}

      <div className="bg-white rounded-xl border shadow-sm p-4 space-y-3">

        {categories.length === 0 ? (

          <div className="text-center py-12 text-gray-500">
            No categories found
          </div>

        ) : (

          categories.map((category: Category) => (
            <CategoryItem
              key={category._id}
              category={category}
              level={0}
              onEdit={(cat: Category) => {
                setEditingCategory(cat);
                setModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))

        )}

      </div>

      <CategoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editingCategory={editingCategory}
      />

    </div>
  );
}