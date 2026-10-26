"use client";

import Image from "next/image";
import { useState } from "react";
import { LuX } from "react-icons/lu";
import toast from "react-hot-toast";
import Loading from "@/common/Loading";
import { uploadImage } from "@/services/homeService";

function ImageInput({ id, label, value, onChange, removable }) {
  const [isUploading, setIsUploading] = useState(false);

  const fileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      onChange(await uploadImage(file));
    } catch (error) {
      toast.error(error?.response?.data?.message);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block">
        {label}
      </label>
      <div className="flex items-center gap-x-4">
        {value && (
          <div className="relative shrink-0">
            <Image
              src={value}
              alt=""
              width={96}
              height={96}
              className="w-24 h-24 object-contain rounded-lg bg-secondary-100"
            />
            {removable && !isUploading && (
              <button
                type="button"
                aria-label="حذف تصویر"
                onClick={() => onChange("")}
                className="absolute top-1 left-1 flex items-center justify-center w-6 h-6 rounded-full bg-secondary-800/70 text-white"
              >
                <LuX className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
        <input
          id={id}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={fileHandler}
          disabled={isUploading}
          className="text-sm"
        />
        {isUploading && <Loading width="45" height="15" />}
      </div>
    </div>
  );
}
export default ImageInput;
