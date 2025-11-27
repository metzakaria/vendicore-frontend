import { UserForm } from "../../../_components/UserForm";

interface EditUserFormProps {
  user: any;
}

export const EditUserForm = ({ user }: EditUserFormProps) => {
  return (
    <UserForm
      mode="edit"
      userId={user.id}
      initialData={{
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        is_superuser: user.is_superuser,
        is_staff: user.is_staff,
        is_active: user.is_active,
      }}
    />
  );
};

