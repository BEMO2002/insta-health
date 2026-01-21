import React from "react";
import { FiShoppingBag } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const CartIcon = ({ count = 0, onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      aria-label="View Cart"
      className="fixed z-[999] left-6 bottom-6 flex items-center justify-center 
                 bg-white/80 backdrop-blur-md border border-white/20 
                 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] 
                 rounded-2xl p-4 transition-all duration-300
                 hover:bg-white hover:shadow-2xl group"
    >
      <div className="relative">
        <FiShoppingBag
          className="text-gray-700 group-hover:text-primary/90 transition-colors duration-300"
          size={26}
        />

        <AnimatePresence>
          {count > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-5 -right-5 bg-primary text-white 
                         text-[13px] font-black rounded-full w-7 h-7 
                         flex items-center justify-center shadow-lg 
                         border-2 border-white uppercase tracking-tighter"
            >
              {count > 99 ? "99+" : count}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {count > 0 && (
        <span className="absolute inset-0 rounded-2xl bg-primary/10 animate-ping -z-10" />
      )}
    </motion.button>
  );
};

export default CartIcon;
