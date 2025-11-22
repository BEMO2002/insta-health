import React from "react";
import Navbar from "./Navbar";
import { Outlet, useNavigate } from "react-router-dom";
import Footer from "./Footer";
import CartIcon from "./CartIcon";
import { useContext } from "react";
import { CartContext } from "../Context/CartContext";
import { Top } from "./Top";
const Layout = () => {
  const { totalCount } = useContext(CartContext);
  const navigate = useNavigate();
  return (
    <>
      <Navbar />
      <Outlet />
      <CartIcon count={totalCount} onClick={() => navigate("/cart")} />
      <Top />
      <Footer />
    </>
  );
};

export default Layout;
