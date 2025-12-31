import { MerchantForm } from "../../../_components/MerchantForm";

interface EditMerchantFormProps {
  merchant: any;
}

export const EditMerchantForm = ({ merchant }: EditMerchantFormProps) => {
  return (
    <MerchantForm
      mode="edit"
      merchantId={merchant.id}
      initialData={{
        business_name: merchant.business_name,
        business_description: merchant.business_description,
        account_type: merchant.account_type,
        address: merchant.address,
        city: merchant.city,
        state: merchant.state,
        country: merchant.country,
        website: merchant.website,
        email: merchant.vas_users?.email,
        first_name: merchant.vas_users?.first_name,
        last_name: merchant.vas_users?.last_name,
        phone_number: merchant.vas_users?.phone_number,
        api_access_ip: merchant.api_access_ips,
        daily_tranx_limit: merchant.daily_tranx_limit,
        is_active: merchant.is_active,
      }}
    />
  );
};
