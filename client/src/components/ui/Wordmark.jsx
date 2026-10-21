// Latin capitals in Inter, isolated so it never reorders inside Persian text.
function Wordmark({ className = "" }) {
  return (
    <bdi
      dir="ltr"
      className={`font-latin font-bold tracking-[0.3em] ${className}`}
    >
      NEXAIVON
    </bdi>
  );
}
export default Wordmark;
