import {
  getAllUsers,
  getUserProfile,
  updateUserByAdmin,
} from "@/services/authServices";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useGetUser = () =>
  useQuery({
    queryKey: ["get-user"],
    queryFn: getUserProfile,
    retry: false,
    refetchOnWindowFocus: true,
  });

export const useGetAllUsers = () =>
  useQuery({
    queryKey: ["get-users"],
    queryFn: getAllUsers,
    retry: false,
    refetchOnWindowFocus: true,
  });

export const useUpdateUserByAdmin = () =>
  useMutation({ mutationFn: updateUserByAdmin });
