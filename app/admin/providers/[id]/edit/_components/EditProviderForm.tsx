import { ProviderForm } from "../../../_components/ProviderForm";

interface EditProviderFormProps {
  provider: any;
}

export const EditProviderForm = ({ provider }: EditProviderFormProps) => {
  return (
    <ProviderForm
      mode="edit"
      providerId={provider.id}
      initialData={{
        name: provider.name,
        provider_code: provider.provider_code,
        description: provider.description,
        is_active: provider.is_active,
      }}
    />
  );
};

