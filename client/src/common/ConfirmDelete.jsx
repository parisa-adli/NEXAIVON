function ConfirmDelete({ resourceName, onClose, onConfirm }) {
  return (
    <div>
      <h2 className="text-base mb-8 text-secondary-700">
        آیا از حذف
        <span className="font-bold"> {resourceName} </span>
        مطمین هستید؟
      </h2>
      <div className="flex justify-between items-center gap-x-16">
        <button
          className="btn border border-secondary-700 flex-1 py-3"
          onClick={onClose}
        >
          لغو
        </button>
        <button className="btn btn--primary flex-1" onClick={onConfirm}>
          حذف
        </button>
      </div>
    </div>
  );
}
export default ConfirmDelete;
