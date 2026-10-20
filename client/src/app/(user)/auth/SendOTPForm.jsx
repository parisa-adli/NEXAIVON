import TextField from "@/common/TextField";
import Button from "@/common/Button";
import Loading from "@/common/Loading";

function SendOTPForm({ phoneNumber, onChange, onSubmit, isPending }) {
  return (
    <div>
      <form className="space-y-10" onSubmit={onSubmit}>
        <TextField
          label="شماره موبایل"
          name="phoneNumber"
          value={phoneNumber}
          onChange={onChange}
        />
        {isPending ? (
          <div className="flex justify-center">
            <Loading width="45" height="15"/>
          </div>
        ) : (
          <Button>ارسال کد تایید</Button>
        )}
      </form>
    </div>
  );
}
export default SendOTPForm;
