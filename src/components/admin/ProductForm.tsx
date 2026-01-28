import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Trash2, Upload, Loader2, Weight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Helper function to validate MongoDB ObjectId
const isValidMongoId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

interface ProductImage {
  imageUrl: string;
  public_id: string;
}

interface ProductVariant {
  _id: any;
  id?: Number;
  variantName: string;
  price: number;
  salePrice?: number;
  stockQuantity: number;
  weight?: number;
  size?: string;
  images: ProductImage[];
  isActive: boolean;
  warrantyPeriod?: number;
  height?: number;
  width?: number;
  breadth?: number;
  length?: number;
}

interface ProductFormData {
  _id?: string; // MongoDB ObjectId for existing products
  id?: string; // Optional, only for existing products
  name: string;
  description?: string;
  brand?: string;
  categoryId: string;
  isFeatured: boolean;
  isActive: boolean;
  images: ProductImage[];
  status: "draft" | "active" | "inactive" | "out_of_stock";
  variants: ProductVariant[];
}

interface ProductFormProps {
  product?: Partial<ProductFormData>;
  onSave?: (product: ProductFormData) => void;
  onCancel: () => void;
}

export const ProductForm = ({
  product: variant,
  onSave,
  onCancel,
}: ProductFormProps) => {
  const { toast } = useToast();

  // Main form state with safe defaults
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    brand: "",
    categoryId: "",
    isFeatured: false,
    isActive: true,
    images: [],
    status: "active",
    variants: [],
  });

  // Loading states
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [uploadingVariantIndex, setUploadingVariantIndex] = useState<
    number | null
  >(null);

  // API base URL
  const API_BASE_URL = "https://kawaiworld-nkppi.ondigitalocean.app/api";
  // const API_BASE_URL =  'http://localhost:1209/api';
  

  console.log("ProductForm variant prop:", variant);

useEffect(() => {
  if (!variant) return;

  setFormData({
    _id: (variant as any)._id,
    id: (variant as any).id,
    name: variant.name ?? "",
    description: variant.description ?? "",
    categoryId: variant.categoryId ?? "",
    brand: variant.brand ?? "",
    isFeatured: variant.isFeatured ?? false,
    isActive: variant.isActive ?? true,
    status: variant.status ?? "active",
    images: variant.images ?? [],
    variants: (variant.variants ?? []).map(v => ({
      _id: v._id,
      id: v._id,
      variantName: v.variantName,
      price: v.price,
      salePrice: v.salePrice,
      stockQuantity: v.stockQuantity,
      weight: v.weight,
      length: v.length,
      breadth: v.breadth,
      height: v.height,
      isActive: v.isActive,
      images: v.images ?? [],
    })),
  });
}, [variant]);


  // Handle main field changes
  const handleMainFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNumberFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: parseFloat(value) || 0,
    }));
  };

  // Demo function for image upload
  const uploadImages = async (
    files: File[]
  ): Promise<Array<{ url: string; public_id: string }>> => {
    // add api for upload image here
    // Example: Call your image upload API and return the uploaded image URLs
    // This is a demo, replace with actual API call if needed
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("image", file));
      const response = await fetch(`${API_BASE_URL}/uploads/images`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      return data; // [{ url, public_id }]
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
      console.error("Image upload error:", error);
      throw new Error("Failed to upload images");
    }

    // return files.map((file, index) => ({
    //   url: `https://picsum.photos/400/400?random=${Date.now()}-${index}`,
    //   public_id: `demo_image_${Date.now()}_${index}`,
    // }));
  };

  // Handle main image upload
  const handleMainImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const fileArray = Array.from(files);
      const uploadedImages = (await uploadImages(fileArray)) as any;

      // const imageObjects: ProductImage[] = uploadedImages.map((img) => ({
      //   imageUrl: uploadedImages.url,
      //   public_id: uploadedImages.public_id,
      // }));

      setFormData((prev) => ({
        ...prev,
        images: [
          ...(prev.images ?? []),
          {
            imageUrl: uploadedImages.url,
            public_id: uploadedImages.public_id,
          },
        ],
      }));

      toast({
        title: "Success",
        description: `${uploadedImages.length} image(s) uploaded successfully.`,
      });
    } catch (error) {
      console.error("Image upload error:", error);
      toast({
        title: "Upload Error",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Remove main image
  const removeMainImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: (prev.images ?? []).filter((_, i) => i !== index),
    }));
  };

  // Handle variant image upload
  const handleVariantImageChange = async (
    variantIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingVariantIndex(variantIndex);
    try {
      const fileArray = Array.from(files);
      const uploadedImages = (await uploadImages(fileArray)) as any;

      setFormData((prev) => {
        const newVariants = [...(prev.variants ?? [])];
        newVariants[variantIndex] = {
          ...newVariants[variantIndex],
          images: [
            ...(newVariants[variantIndex].images ?? []),
            {
              imageUrl: uploadedImages.url,
              public_id: uploadedImages.public_id,
            },
          ],
        };
        return { ...prev, variants: newVariants };
      });

      toast({
        title: "Success",
        description: `${uploadedImages.length} variant image(s) uploaded successfully.`,
      });
    } catch (error) {
      console.error("Variant image upload error:", error);
      toast({
        title: "Upload Error",
        description: "Failed to upload variant images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingVariantIndex(null);
    }
  };

  // Remove variant image
  const removeVariantImage = (variantIndex: number, imageIndex: number) => {
    setFormData((prev) => {
      const newVariants = [...(prev.variants ?? [])];
      newVariants[variantIndex] = {
        ...newVariants[variantIndex],
        images: (newVariants[variantIndex].images ?? []).filter(
          (_, i) => i !== imageIndex
        ),
      };
      return { ...prev, variants: newVariants };
    });
  };

  // Variant management
  const handleVariantChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;
    const newVariants = [...(formData.variants ?? [])];
    newVariants[index] = {
      ...newVariants[index],
      [name]: type === "checkbox" ? checked : value,
    };
    setFormData((prev) => ({ ...prev, variants: newVariants }));
  };

  const handleVariantNumberChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const newVariants = [...(formData.variants ?? [])];
    newVariants[index] = {
      ...newVariants[index],
      [name]: parseFloat(value) || 0,
    };
    setFormData((prev) => ({ ...prev, variants: newVariants }));
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...(prev.variants ?? []),
        {
          _id:0,
          variantName: "",
          price: 0,
          salePrice: 0,
          stockQuantity: 0,
          weight: 0,
          size: "",
          images: [],
          isActive: true,
          warrantyPeriod: 0,
          height: 0,
          width: 0,
          breadth: 0,
          length: 0,
        },
      ],
    }));
  };

  const removeVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: (prev.variants ?? []).filter((_, i) => i !== index),
    }));
  };

  // Create or update product via API
  const createProduct = async (
    productData: ProductFormData,
    isUpdate: boolean = false
  ) => {
    const endpoint = isUpdate
      ? `${API_BASE_URL}/products/${variant?._id}`
      : `${API_BASE_URL}/products`;
    const method = isUpdate ? "PUT" : "POST";

    // Transform data to match DTO
    const transformedData = {
      name: productData.name,
      description: productData.description || undefined,
      brand: productData.brand || undefined,
      categoryId: productData.categoryId || undefined,
      isFeatured: productData.isFeatured ?? false,
      isActive: productData.isActive ?? true,
      status: productData.status ?? "active",
      images: productData.images || [],
      variants: (productData.variants ?? []).map((variant) => ({
        // id: variant.id || undefined,
        id: variant._id ? variant.id : undefined,
        variantName: variant.variantName || "",
        price: variant.price || 0,
        salePrice: variant.salePrice || undefined,
        height: variant.height || undefined,
        weight: variant.weight || undefined,
        length: variant.length || undefined,
        breadth: variant.breadth || undefined,
        stockQuantity: variant.stockQuantity || undefined,
        images: variant.images || [],
        isActive: variant.isActive ?? true,
      })),
    };

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
        },
        body: JSON.stringify(transformedData),
      });

      // console.log("API response status:", response.status);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message ||
            `Failed to ${isUpdate ? "update" : "create"} product: ${
              response.statusText
            }`
        );
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name) {
      toast({
        title: "Validation Error",
        description: "Product name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.categoryId) {
      toast({
        title: "Validation Error",
        description: "A valid Category Name is required.",
        variant: "destructive",
      });
      return;
    }

    if ((formData.variants ?? []).some((v) => !v.price || v.price <= 0)) {
      toast({
        title: "Validation Error",
        description: "All variants must have a price greater than 0.",
        variant: "destructive",
      });
      return;
    }

    if ((formData.images ?? []).length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one product image is required.",
        variant: "destructive",
      });
      return;
    }

    // Validate variants
    for (const [index, variant] of (formData.variants ?? []).entries()) {

      console.log("Validating variant:", variant.price);
      if (!variant.variantName || !variant.price) {
        toast({
          title: "Validation Error",
          description: `Variant ${index + 1}: Type and value are required.`,
          variant: "destructive",
        });
        return;
      }
      if ((variant.images ?? []).length === 0) {
        toast({
          title: "Validation Error",
          description: `Variant ${index + 1}: At least one image is required.`,
          variant: "destructive",
        });
        return;
      }
    }

    setIsCreatingProduct(true);

    try {
      const isUpdate = !!variant?._id;
      console.log("Submitting form data:", formData, "isUpdate:", isUpdate);

      const createdProduct = await createProduct(formData, isUpdate);

      toast({
        title: "Success",
        description: `Product "${formData.name}" ${
          isUpdate ? "updated" : "created"
        } successfully.`,
      });

      if (onSave) {
        onSave(createdProduct);
      }

      onCancel();
    } catch (error) {
      // console.error('Product operation error:', error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${variant?._id ? "update" : "create"} product.`,
        variant: "destructive",
      });
    } finally {
      setIsCreatingProduct(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              {variant?._id ? "Edit Product" : "Add New Product"}
            </CardTitle>
            <Button variant="outline" size="icon" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Information Section */}
            <div className="space-y-4 border-b pb-4">
              <h2 className="text-lg font-semibold">General Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name ?? ""}
                    onChange={handleMainFieldChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="categoryId">Category Name *</Label>
                  <Input
                    id="categoryId"
                    value={formData.categoryId ?? ""}
                    onChange={handleMainFieldChange}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand ?? ""}
                  onChange={handleMainFieldChange}
                />
              </div>
              <div>
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={formData.description ?? ""}
                  onChange={handleMainFieldChange}
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isFeatured"
                    checked={formData.isFeatured ?? false}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        isFeatured: Boolean(checked),
                      }))
                    }
                  />
                  <Label htmlFor="isFeatured">Featured</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive ?? true}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: Boolean(checked),
                      }))
                    }
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status ?? "active"}
                    onValueChange={(
                      value: "draft" | "active" | "inactive" | "out_of_stock"
                    ) => setFormData((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Main Images Upload Section */}
            <div className="space-y-4 border-b pb-4">
              <h2 className="text-lg font-semibold">Product Images *</h2>
              <div>
                <Label htmlFor="main-image-upload">
                  Upload Images (Multiple)
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      id="main-image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleMainImageChange}
                      disabled={isUploading}
                    />
                    {isUploading && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </div>
                    )}
                  </div>
                  {(formData.images ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {(formData.images ?? []).map((image, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1 p-1"
                        >
                          <img
                            src={image.imageUrl }
                            alt={`Product preview ${index + 1}`}
                            className="h-12 w-12 object-cover rounded-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeMainImage(index)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {(formData.images ?? []).length} image(s) uploaded. At
                    least one image is required.
                  </p>
                </div>
              </div>
            </div>

            {/* Product Variants Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Product Variants</h2>
                <Button type="button" onClick={addVariant} size="sm">
                  <Plus className="w-4 h-4 mr-2" /> Add Variant
                </Button>
              </div>

              {(formData.variants ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No variants added yet. Add variants for different colors,
                  sizes, or other variations.
                </p>
              )}

              <div className="space-y-4">
                {(formData.variants ?? []).map((variant, index) => (
                  <Card key={index} className="p-4 bg-muted">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-md font-medium">
                        Variant {index + 1}
                      </h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVariant(index)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`variantName-${index}`}>
                          Varient Name
                        </Label>
                        <Input
                          id={`variantName-${index}`}
                          name="variantName"
                          value={variant.variantName ?? "Color"}
                          onChange={(e) => handleVariantChange(index, e)}
                          placeholder="e.g., Color, Size"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label htmlFor={`stockQuantity-${index}`}>
                          Stock Quantity
                        </Label>
                        <Input
                          id={`stockQuantity-${index}`}
                          name="stockQuantity"
                          type="number"
                          value={variant.stockQuantity ?? 0}
                          onChange={(e) => handleVariantNumberChange(index, e)}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <Label htmlFor="price">Price *</Label>
                          <Input
                            name="price"
                            type="number"
                            step="0.01"
                            value={variant.price ?? 0}
                            onChange={(e) =>
                              handleVariantNumberChange(index, e)
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="salePrice">Sale Price</Label>
                          <Input
                            name="salePrice"
                            type="number"
                            step="0.01"
                            value={variant.salePrice ?? 0}
                            onChange={(e) =>
                              handleVariantNumberChange(index, e)
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="weight">Weight (kg)</Label>
                          <Input
                            name="weight"
                            type="number"
                            step="0.01"
                            value={variant.weight ?? 0}
                            onChange={(e) =>
                              handleVariantNumberChange(index, e)
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="height">Height (kg)</Label>
                          <Input
                            name="height"
                            type="number"
                            step="0.01"
                            value={variant.height ?? 0}
                            onChange={(e) =>
                              handleVariantNumberChange(index, e)
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="length">Length (kg)</Label>
                          <Input
                            name="length"
                            type="number"
                            step="0.01"
                            value={variant.length ?? 0}
                            onChange={(e) =>
                              handleVariantNumberChange(index, e)
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="breadth">Breadth (kg)</Label>
                          <Input
                            name="breadth"
                            type="number"
                            step="0.01"
                            value={variant.breadth ?? 0}
                            onChange={(e) =>
                              handleVariantNumberChange(index, e)
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="warrantyPeriod">
                            Warranty Period (months)
                          </Label>
                          <Input
                            name="warrantyPeriod"
                            type="number"
                            value={variant.warrantyPeriod ?? 0}
                            onChange={(e) =>
                              handleVariantNumberChange(index, e)
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Variant Images Section */}
                    <div className="mt-4 space-y-2">
                      <Label htmlFor={`variant-image-upload-${index}`}>
                        Upload Variant Images *
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={`variant-image-upload-${index}`}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleVariantImageChange(index, e)}
                          disabled={uploadingVariantIndex === index}
                        />
                        {uploadingVariantIndex === index && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading...
                          </div>
                        )}
                      </div>
                      {(variant.images ?? []).length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {(variant.images ?? []).map((image, imageIndex) => (
                            <Badge
                              key={imageIndex}
                              variant="secondary"
                              className="flex items-center gap-1 p-1"
                            >
                              <img
                                src={image.imageUrl}
                                alt={`Variant ${index + 1} image ${
                                  imageIndex + 1
                                }`}
                                className="h-12 w-12 object-cover rounded-sm"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  removeVariantImage(index, imageIndex)
                                }
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {(variant.images ?? []).length} variant image(s)
                        uploaded. At least one image is required.
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 mt-4">
                      <Checkbox
                        id={`isActive-${index}`}
                        name="isActive"
                        checked={variant.isActive ?? true}
                        onCheckedChange={(checked) => {
                          const newVariants = [...(formData.variants ?? [])];
                          newVariants[index].isActive = Boolean(checked);
                          setFormData((prev) => ({
                            ...prev,
                            variants: newVariants,
                          }));
                        }}
                      />
                      <Label htmlFor={`isActive-${index}`}>Active</Label>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isCreatingProduct}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-primary to-primary/90"
                disabled={isCreatingProduct}
              >
                {isCreatingProduct ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {variant?._id ? "Updating..." : "Creating..."}
                  </>
                ) : variant?._id ? (
                  "Update Product"
                ) : (
                  "Create Product"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};