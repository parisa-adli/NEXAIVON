"use client";
import { useForm } from "react-hook-form";
import Button from "@/common/Button";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeProfile } from "@/services/authServices";
import RHFTextField from "@/common/RHFTextField";
import Loading from "@/common/Loading";

function CompleteProfile() {
  const router = useRouter();

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const { data, isPending, error, mutateAsync } = useMutation({
    mutationFn: completeProfile,
  });

  const onSubmit = async (data) => {
    try {
      const { message } = await mutateAsync(data);
      toast.success(message);
      router.push("/");
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-full sm:max-w-sm">
        <form className="space-y-10" onSubmit={handleSubmit(onSubmit)}>
          <RHFTextField
            label="نام و نام خانوادگی"
            name="name"
            register={register}
            required
            validationSchema={{
              required: "نام و نام خانوادگی ضروری است",
              minLength: {
                value: 10,
                message: "حداقل 10 کاراکتر را وارد کنید",
              },
            }}
            errors={errors}
          />
          <RHFTextField
            label="ایمیل"
            name="email"
            dir="ltr"
            register={register}
            required
            validationSchema={{
              required: "ایمیل ضروری است",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "ایمیل نامعتبر است",
              },
            }}
            errors={errors}
          />
          {isPending ? (
            <div className="flex justify-center">
              <Loading />
            </div>
          ) : (
            <Button>تایید</Button>
          )}
        </form>
      </div>
    </div>
  );
}
export default CompleteProfile;
