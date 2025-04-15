"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { zUserEdit } from "common/validation/user_validation";
import { APIPath, getAPIPath, getPath, Path } from "client/paths";
import http from "client/http";
import { UserLookupDTO } from "common/types";
import { FormButton, FormError, FormInput, FormLabel } from "../form";

type UserEditForm = {
  name: string;
  school: string;
};

type UserEditorProps = {
  user: UserLookupDTO;
};

export const UserEditor = ({ user }: UserEditorProps) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserEditForm>({
    resolver: zodResolver(zUserEdit),
  });

  const onSubmit = async (data: UserEditForm) => {
    try {
      const response = await http.put(getAPIPath({ kind: APIPath.UserEdit, id: user.id }), data);

      if (response.status != 200) {
        toast.error(`Error. Status code: ${response.status}`);
      }

      router.refresh();
      router.push(getPath({ kind: Path.UserView, username: user.username }));
    } catch (e) {
      toast.error("An unexpected error occured. Please try again.");
    }
  };

  const onCancel = async () => {
    router.refresh();
    router.push(getPath({ kind: Path.UserView, username: user.username }));
  };

  return (
    <>
      <p className="font-bold text-6xl mt-8 mb-2 text-blue-450">{user.username}</p>
      <div className="mt-4 lg:w-1/2">
        <FormLabel> Name </FormLabel>
        <FormInput type="text" defaultValue={user.name ? user.name : ""} {...register("name")} />
        <FormError error={errors.name} className="mb-4" />

        <FormLabel> School </FormLabel>
        <FormInput
          type="text"
          defaultValue={user.school ? user.school : ""}
          {...register("school")}
        />
        <FormError error={errors.school} className="mb-4" />

        <div className="mt-6 flex-row">
          <FormButton onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="mr-4">
            Save
          </FormButton>

          <FormButton
            onClick={handleSubmit(onCancel)}
            disabled={isSubmitting}
            className="bg-gray-400 hover:bg-gray-500"
          >
            Cancel
          </FormButton>
        </div>
      </div>
    </>
  );
};
