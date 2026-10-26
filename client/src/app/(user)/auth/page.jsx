"use client";
import { useEffect, useState } from "react";
import SendOTPForm from "./SendOTPForm";
import http from "@/services/httpService";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { checkOtp, getOtp } from "@/services/authServices";
import CheckOTPForm from "./CheckOTPForm";
import DemoLoginForm from "./DemoLoginForm";
import { useRouter } from "next/navigation";

const RESEND_TIME = 90;
const TABS = [
  { id: "demo", label: "ورود دمو" },
  { id: "site", label: "ورود به سایت" },
];

function AuthPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [time, setTime] = useState(RESEND_TIME);
  const [tab, setTab] = useState("demo");
  const router = useRouter();

  const {
    data: otpResponse,
    isPending,
    error,
    mutateAsync: mutateGetOtp,
  } = useMutation({
    mutationFn: getOtp,
  });
  const { isPending: isCheckingOtp, mutateAsync: mutateCheckOtp } = useMutation(
    {
      mutationFn: checkOtp,
    }
  );

  const phoneNumberHandler = (e) => {
    setPhoneNumber(e.target.value);
  };

  const sendOtpHandler = async (e) => {
    e.preventDefault();
    try {
      const data = await mutateGetOtp({ phoneNumber });
      toast.success(data.message);
      setStep(2);
      setTime(RESEND_TIME);
      setOtp("");
    } catch (error) {
      // console.log(error?.response?.data?.message);
      toast.error(error?.response?.data?.message);
    }
  };

  const checkOtpHandler = async (e) => {
    e.preventDefault();
    try {
      const { user, message } = await mutateCheckOtp({ phoneNumber, otp });
      toast.success(message);
      if (user.isActive) {
        router.push("/");
      } else {
        router.push("/complete-profile");
      }
    } catch (error) {
      // console.log(error?.response?.data?.message);
      toast.error(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setTime((t) => t - 1), 1000);
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [time]);

  const renderSteps = () => {
    switch (step) {
      case 1:
        return (
          <SendOTPForm
            phoneNumber={phoneNumber}
            onChange={phoneNumberHandler}
            onSubmit={sendOtpHandler}
            isPending={isPending}
          />
        );
      case 2:
        return (
          <CheckOTPForm
            onSubmit={checkOtpHandler}
            otp={otp}
            setOtp={setOtp}
            onBack={() => setStep((s) => s - 1)}
            time={time}
            onResendOtp={sendOtpHandler}
            otpResponse={otpResponse}
            isCheckingOtp={isCheckingOtp}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-full sm:max-w-sm">
        <div role="tablist" className="flex mb-8 border-b border-secondary-200">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`tab-${id}`}
              aria-selected={tab === id}
              aria-controls="auth-tabpanel"
              onClick={() => setTab(id)}
              className={`flex-1 py-3 border-b-2 -mb-px ${
                tab === id
                  ? "border-primary-900 text-primary-900 font-bold"
                  : "border-transparent text-secondary-500"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div role="tabpanel" id="auth-tabpanel" aria-labelledby={`tab-${tab}`}>
          {tab === "demo" ? <DemoLoginForm /> : renderSteps()}
        </div>
      </div>
    </div>
  );
}
export default AuthPage;
