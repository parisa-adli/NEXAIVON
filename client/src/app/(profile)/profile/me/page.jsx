"use client";

import Button from "@/common/Button";
import Loading from "@/common/Loading";
import TextField from "@/common/TextField";
import { useGetUser } from "@/hooks/useAuth";
import { updateProfile } from "@/services/authServices";
import { includeObj } from "@/utils/objectUtils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function MePage() {
  const { isLoading, data } = useGetUser();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({});
  const { user } = data || {};
  const includesKey = ["name", "email", "phoneNumber", "biography"];
  const { isPending: isUpdating, mutateAsync } = useMutation({
    mutationFn: updateProfile,
  });

  useEffect(() => {
    if (user) setFormData(includeObj(user, includesKey));
  }, [user]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { message } = await mutateAsync(formData);
      queryClient.invalidateQueries({ queryKey: ["get-user"] });
      toast.success(message);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="max-w-sm">
      <h1 className="text-xl font-bold mb-4">اطلاعات کاربری</h1>
      <form onSubmit={submitHandler} className="space-y-8">
        {Object.keys(includeObj(user, includesKey)).map((key) => {
          return (
            <TextField
              label={key}
              name={key}
              key={key}
              value={formData[key] || ""}
              onChange={(e) =>
                setFormData({ ...formData, [e.target.name]: e.target.value })
              }
              disabled={key === "phoneNumber"}
            />
          );
        })}
        {isUpdating ? (
          <div className="flex justify-center">
            <Loading width="45" height="15" />
          </div>
        ) : (
          <Button>تایید</Button>
        )}
      </form>
    </div>
  );
}
export default MePage;
