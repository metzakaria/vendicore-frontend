import { ProductForm } from "../../../_components/ProductForm";

interface EditProductFormProps {
  product: any;
}

export const EditProductForm = ({ product }: EditProductFormProps) => {
  return (
    <ProductForm
      mode="edit"
      productId={product.id}
      initialData={{
        product_name: product.product_name,
        product_code: product.product_code,
        description: product.description,
        category_id: product.category_id,
        preferred_provider_account_id: product.preferred_provider_account_id,
        backup_provider_account_id: product.backup_provider_account_id,
        is_active: product.is_active,
      }}
    />
  );
};

