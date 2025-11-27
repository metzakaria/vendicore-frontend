import { ProviderAccountForm } from "../../../_components/ProviderAccountForm";

interface EditProviderAccountFormProps {
  account: any;
}

export const EditProviderAccountForm = ({ account }: EditProviderAccountFormProps) => {
  return (
    <ProviderAccountForm
      mode="edit"
      accountId={account.id}
      initialData={{
        account_name: account.account_name,
        provider_id: account.provider_id,
        available_balance: account.available_balance,
        balance_at_provider: account.balance_at_provider,
        vending_sim: account.vending_sim,
        config: account.config || {},
        config_schema: account.vas_providers?.config_schema || {},
      }}
    />
  );
};

