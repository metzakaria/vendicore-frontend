import { DataPackageForm } from "../../../_components/DataPackageForm";

interface EditDataPackageFormProps {
  dataPackage: any;
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
      }}
    />
  );
};

