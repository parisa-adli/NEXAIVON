import { ThreeDots } from "react-loader-spinner";

function Loading({ width = "75", height = "40", justifyContent = "center" }) {
  return (
    <ThreeDots
      visible={true}
      height={height}
      width={width}
      color="rgb(var(--color-primary-900))"
      radius="9"
      ariaLabel="three-dots-loading"
      wrapperStyle={{
        display: "flex",
        justifyContent: justifyContent,
      }}
    />
  );
}
export default Loading;
