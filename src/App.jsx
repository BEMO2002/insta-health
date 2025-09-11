import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Components/Layout";
import "./App.css";
import Login from "./Authinction/Login";
import Signup from "./Authinction/SignUp";
import AuthenticateEmail from "./Authinction/AuthenticateEmail";
import ConfirmEmail from "./Authinction/ConfirmEmail";
import ForgetPassword from "./Authinction/ForgetPassword";
import ResetPassword from "./Authinction/ResetPassword";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Layout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/authenticate-email" element={<AuthenticateEmail />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />
        <Route path="/forget" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
