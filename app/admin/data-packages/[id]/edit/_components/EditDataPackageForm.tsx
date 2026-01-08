import { DataPackageForm } from "../../../_components/DataPackageForm";

// Re-using the interface defined in DataPackageDetails.tsx
interface DataPackageDetailsItem {
  id: string; // Serialized BigInt
  data_code: string;
  tariff_id: string | null;
  amount: string; // Serialized Decimal
  description: string;
  duration: string;
  value: string;
  network: string;
  plan_name: string;
  short_desc: string;
  payvantage_code: string;
  creditswitch_code: string;
  is_active: boolean;
  created_at: string | Date | null;
  updated_at: string | Date | null;
  product_id: string; // Serialized BigInt

  vas_products: {
    id: string; // Serialized BigInt
    product_name: string;
    product_code: string;
    vas_product_categories: {
      name: string;
      category_code: string;
    };
  };
}

interface EditDataPackageFormProps {
  dataPackage: DataPackageDetailsItem;
}

export const EditDataPackageForm = ({ dataPackage }: EditDataPackageFormProps) => {
  return (
    <DataPackageForm
      mode="edit"
      packageId={dataPackage.id}
      initialData={{
        data_code: dataPackage.data_code,
        tariff_id: dataPackage.tariff_id || "",
        amount: dataPackage.amount,
        description: dataPackage.description,
        duration: dataPackage.duration,
        value: dataPackage.value,
        product_id: dataPackage.product_id,
        is_active: dataPackage.is_active,
        network: dataPackage.network,
        plan_name: dataPackage.plan_name,
        short_desc: dataPackage.short_desc,
        payvantage_code: dataPackage.payvantage_code,
        creditswitch_code: dataPackage.creditswitch_code,
      }}
    />
  );
};

