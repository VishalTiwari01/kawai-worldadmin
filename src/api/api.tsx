import { Product } from "@/types/product";
import { Order } from "@/types/order";
import axios from "axios";

const API_BASE_URL =  'https://kawaiworld-nkppi.ondigitalocean.app/api';
// export const API_BASE_URL = "http://localhost:1209/api";
interface SaveProductResponse {
  id: string;
  message?: string;
}

// ================= CATEGORY TYPES =================

export interface Category {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  parentId?: string | null;
  level?: number;
  path?: string;
  hasChildren?: boolean;
  isActive?: boolean;
  children?: Category[];
}


import { signIn } from "@/redux/slices/authSlice";

export const loginUser = async (mobile, dispatch) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/login`, {
      phoneNumber: mobile,
    });

    const userData = response.data;

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userData.accessToken);

    dispatch(signIn({ user: userData, token: userData.accessToken }));

    return userData;
  } catch (error) {
    const errorMsg =
      error.response?.data?.message || "Login failed. Please try again.";
    throw new Error(errorMsg);
  }
};

export const createProduct = async (
  productData: Partial<Product>,
  mainFiles: File[] = [],
  variantFiles: { [key: number]: File[] } = {}
): Promise<SaveProductResponse> => {
  try {
    const formData = new FormData();

    // Serialize product JSON data
    formData.append("data", JSON.stringify(productData));

    // Append main product images
    mainFiles?.forEach((file) => {
      formData.append("mainImages", file);
    });

    // Append variant images (only if variantFiles is defined and not null)
    if (variantFiles && typeof variantFiles === "object") {
      Object.entries(variantFiles).forEach(([variantIndex, files]) => {
        files?.forEach((file) => {
          formData.append(`variantImages[${variantIndex}]`, file);
        });
      });
    }

    const response = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create product: ${errorText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error creating product:", error);
    throw new Error(error?.message || "Unknown error while creating product");
  }
};

export const updateProduct = async (
  id: string,
  productData: Partial<Product>,
  mainFiles: File[],
  variantFiles: { [key: number]: File[] }
): Promise<SaveProductResponse> => {
  try {
    const formData = new FormData();
    formData.append("data", JSON.stringify(productData));

    mainFiles.forEach((file) => {
      formData.append("mainImages", file);
    });

    Object.keys(variantFiles).forEach((variantIndex) => {
      variantFiles[parseInt(variantIndex, 10)].forEach((file) => {
        formData.append(`variantImages[${variantIndex}]`, file);
      });
    });

    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

export const fetchProducts = async (search?: string,page = 1,limit = 10): Promise<Product[]> => {
  console.log("Fetching products with search query:", search);
  try {
    const response = await axios.get(`${API_BASE_URL}/products/admin/products`,{
      params: { 
      search,
      page,
      limit

    }
    });
    
    return await response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    return []; // Return an empty array on error
  }
};

export const getAllOrders = async (
  page = 1,
  limit = 10,
  status?: string,
  paymentStatus?: string,
  shipmentStatus?: string,
  search?: string
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get(`${API_BASE_URL}/admin/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        page,
        limit,
        status,
        paymentStatus,
        shipmentStatus,
        search,
      },
    });

    /**
     * Expected response:
     * {
     *   success: true,
     *   data: {
     *     data: Order[],
     *     pagination: {...}
     *   }
     * }
     */

    const payload = response.data?.data;

    if (!payload) {
      console.warn("Unexpected orders response:", response.data);
      return {
        orders: [],
        pagination: null,
      };
    }

    return {
      orders: payload.data || [],
      pagination: payload.pagination || null,
    };
  } catch (error) {
    console.error("getAllOrders() failed:", error);
    return {
      orders: [],
      pagination: null,
    };
  }
};

export const getOrderById = async (orderId?: string | null) => {
  if (!orderId) throw new Error("Order ID is required");

  const token = localStorage.getItem("token");

  const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getDashboardStats = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_BASE_URL}/admin/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("getDashboardStats() failed:", error);
    return null;
  }
};




// ================= GET ROOT CATEGORIES =================

export const getCategoryTree = async () => {
  const res = await axios.get(`${API_BASE_URL}/categories/tree`);
  return res.data.data;
};

// ================= GET FULL TREE =================

// export const getCategoryTree = async (): Promise<Category[]> => {
//   try {
//     const response = await axios.get(`${API_BASE_URL}/categories/tree`);
//     return response.data?.data || [];
//   } catch (error) {
//     console.error("Error fetching category tree:", error);
//     return [];
//   }
// };

// ================= GET SUBTREE =================

export const getSubTree = async (id: string): Promise<Category[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/categories/subtree/${id}`
    );

    return response.data?.data || [];
  } catch (error) {
    console.error("Error fetching subtree:", error);
    return [];
  }
};
// Helper function: image upload
export const uploadCategoryImage = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("image", file);
console.log("Image upload response:", formData);
    const response = await axios.post(
      `${API_BASE_URL}/uploads/images`,
      formData
    );
    
    return response.data.url;
  } catch (error) {
    console.error("Image upload failed:", error);
    throw new Error("Image upload failed");
  }
};
// ================= CREATE CATEGORY =================

export const createCategory = async (data: Partial<Category>) => {
  const token = localStorage.getItem("token");

  const response = await axios.post(
    `${API_BASE_URL}/categories`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.data;
};

// ================= UPDATE CATEGORY =================

export const updateCategory = async (
  id: string,
  data: Partial<Category>,
  imageFile?: File
): Promise<Category | null> => {
  try {
    const token = localStorage.getItem("token");

    let imageUrl = data.imageUrl;

    if (imageFile) {
      imageUrl = await uploadCategoryImage(imageFile);
    }

    const payload = {
      ...data,
      imageUrl,
    };

    const response = await axios.put(
      `${API_BASE_URL}/categories/${id}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data?.data || null;
  } catch (error: any) {
    console.error("Error updating category:", error);

    throw new Error(
      error?.response?.data?.message || "Failed to update category"
    );
  }
};

// ================= DELETE CATEGORY =================

export const deleteCategory = async (id: string): Promise<boolean> => {
  try {
    const token = localStorage.getItem("token");

    await axios.delete(`${API_BASE_URL}/categories/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return true;
  } catch (error) {
    console.error("Error deleting category:", error);
    return false;
  }
};

// ================= TOGGLE CATEGORY STATUS =================

export const toggleCategoryStatus = async (
  id: string,
  isActive: boolean
) => {
  const token = localStorage.getItem("token");

  return axios.put(
    `${API_BASE_URL}/categories/${id}`,
    { isActive },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};