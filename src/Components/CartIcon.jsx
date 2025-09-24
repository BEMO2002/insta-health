import React from "react";

import { FiShoppingBag } from "react-icons/fi";
const CartIcon = ({ count = 0, onClick }) => {
  return (
    <button
      onClick={onClick}
      aria-label="Cart"
      className="fixed left-4 bottom-4 z-[9999] shadow-xl border border-gray-300 rounded-md  bg-white  transition-all duration-200 p-3 md:p-4"
      style={{ backdropFilter: "blur(6px)" }}
    >
      <div className="">
        <FiShoppingBag className="text-gray-800 " size={28} />
        {count > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-7 h-7 inline-flex items-center justify-center">
            {count}
          </span>
        )}
      </div>
    </button>
  );
};

export default CartIcon;
