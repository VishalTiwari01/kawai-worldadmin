import { useState } from "react";
import { ChevronDown, ChevronRight, Pencil, Trash } from "lucide-react";

export default function CategoryItem({ category, level = 0, onEdit, onDelete }: any) {

  const [isOpen, setIsOpen] = useState(true);

  const hasChildren = category.children && category.children.length > 0;

  return (
    <div>

      {/* CATEGORY CARD */}

      <div
        className="flex items-center  justify-between border rounded-lg px-4 py-3 bg-gray-50 hover:bg-gray-100"
        style={{ marginLeft: `${level * 24}px` }}
      >

        {/* LEFT */}

        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => hasChildren && setIsOpen(!isOpen)}
        >

          {hasChildren ? (
            isOpen ? (
              <ChevronDown size={18} />
            ) : (
              <ChevronRight size={18} />
            )
          ) : (
            <div className="w-[18px]" />
          )}

          {/* IMAGE */}

          <img
            src={category.imageUrl}
            alt={category.name}
            className="h-24 w-24 rounded-md object-cover border"
          />

          {/* NAME */}

          <span className="font-medium text-gray-800">
            {category.name}
          </span>

        </div>

        {/* ACTIONS */}

        <div className="flex items-center gap-3">

          <button
            onClick={() => onEdit(category)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Pencil size={16} />
          </button>

          <button
            onClick={() => onDelete(category._id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash size={16} />
          </button>

        </div>

      </div>

      {/* CHILDREN */}

      {isOpen && hasChildren && (

        <div className="mt-2 space-y-2">

          {category.children.map((child: any) => (
            <CategoryItem
              key={child._id}
              category={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}

        </div>

      )}

    </div>
  );
}