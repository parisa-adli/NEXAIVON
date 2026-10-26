import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import TextField from "@/common/TextField";
import RadioInput from "@/common/RadioInput";
import Button from "@/common/Button";
import Loading from "@/common/Loading";
import { demoLogin } from "@/services/authServices";
import { DEMO_CREDENTIALS } from "@/constants/demo";

function DemoLoginForm() {
  const [form, setForm] = useState({ ...DEMO_CREDENTIALS, role: "ADMIN" });
  const router = useRouter();
  const { isPending, mutateAsync } = useMutation({ mutationFn: demoLogin });

  const changeHandler = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { message } = await mutateAsync(form);
      toast.success(message);
      router.push("/");
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <form className="space-y-6" onSubmit={submitHandler}>
      <TextField
        label="نام کاربری"
        name="username"
        value={form.username}
        onChange={changeHandler}
      />
      <TextField
        label="رمز عبور"
        name="password"
        type="password"
        value={form.password}
        onChange={changeHandler}
      />
      <fieldset>
        <legend className="block mb-2">ورود با نقش</legend>
        <div className="flex items-center gap-x-8">
          <RadioInput
            checked={form.role === "ADMIN"}
            id="demo-role-admin"
            name="role"
            label="ادمین"
            value="ADMIN"
            onChange={changeHandler}
          />
          <RadioInput
            checked={form.role === "USER"}
            id="demo-role-user"
            name="role"
            label="کاربر"
            value="USER"
            onChange={changeHandler}
          />
        </div>
      </fieldset>
      {isPending ? (
        <div className="flex justify-center">
          <Loading width="45" height="15" />
        </div>
      ) : (
        <Button>ورود</Button>
      )}
    </form>
  );
}
export default DemoLoginForm;
