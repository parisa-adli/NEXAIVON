function Button({ children, onClick }) {
  return (
    <button onClick={onClick} type="submit" className="btn btn--primary w-full">
      {children}
    </button>
  );
}
export default Button;
