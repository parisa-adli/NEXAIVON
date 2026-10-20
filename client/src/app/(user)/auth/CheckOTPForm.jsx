import OTPInput from "react-otp-input";
import { FaArrowRight } from "react-icons/fa6";
import { TbEdit } from "react-icons/tb";
import Loading from "@/common/Loading";
import Button from "@/common/Button";

function CheckOTPForm({
  otpResponse,
  onSubmit,
  otp,
  setOtp,
  onBack,
  time,
  onResendOtp,
  isCheckingOtp,
}) {
  return (
    <div>
      <button
        onClick={onBack}
        className="bg-primary-200 rounded-md p-2 flex items-center justify-center text-primary-900 gap-x-2 mb-4"
      >
        <FaArrowRight />
        <span>برگشت</span>
      </button>

      {otpResponse && (
        <div className="flex items-center gap-x-1 mb-2">
          <p className="text-sm text-gray-700">{otpResponse.message}</p>
          <button onClick={onBack}>
            <TbEdit className="text-primary-900" />
          </button>
        </div>
      )}

      <div className="mb-4">
        {time > 0 ? (
          <p className="text-sm text-gray-500">{time} ثانیه تا ارسال مجدد کد</p>
        ) : (
          <button className="text-sm text-gray-500" onClick={onResendOtp}>
            ارسال مجدد کد؟
          </button>
        )}
      </div>
      <form className="space-y-10" onSubmit={onSubmit}>
        <p>کد تایید را وارد کنید</p>
        <OTPInput
          value={otp}
          onChange={setOtp}
          numInputs={6}
          renderSeparator={<span>-</span>}
          inputStyle={{
            width: "2.5rem",
            padding: "0.5rem 0.2rem",
            border: "1px solid rgb(var(--color-primary-300))",
            borderRadius: "0.5rem",
            outline: "none",
          }}
          containerStyle="flex flex-row-reverse gap-x-2 justify-center"
          renderInput={(props) => <input {...props} />}
        />
        {isCheckingOtp ? (
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
export default CheckOTPForm;
