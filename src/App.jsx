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
import MainHome from "./HomePage/MainHome";
import MainServices from "./ServicesProviders/MainServices";
import ProvidersDetails from "./ServicesProviders/ProvidersDetails";
import MainProducts from "./ProductsPage/MainProducts";
import ProductsDetails from "./ProductsPage/ProductsDetails";
import MainCart from "./CartPage.jsx/MainCart";
import OrderStatus from "./Orders/OrderStatus";
import PrescriptionReservations from "./PrescriptionReservations/PrescriptionReservations";
import MainHomeProviders from "./HomeProviders/MainHomeProviders";
import HomeProvidersDetails from "./HomeProviders/HomeProvidersDetails";
import MainMediaclFiles from "./MediaclFiles/MainMediaclFiles";
import MedicalFileStatus from "./MediaclFiles/MedicalFileStatus";
import MianMedicalTourism from "./MedicalTourism/MianMedicalTourism";
import ContentPage from "./MedicalTourism/ContentPage";
import PackageReservationDetails from "./MedicalTourism/PackageReservationDetails";
import MedicalPrescriptions from "./MedicalPrescriptions/MedicalPrescriptions";
import MedicalPrescriptionsDetails from "./MedicalPrescriptions/MedicalPrescriptionsDetails";
import MedicalConsultationReservationsDetails from "./MedicalTourism/MedicalConsultationReservationsDetails";
import MainAreYouProvider from "./AreYouProvider/MainAreYouProvider";
import MainFamilyCard from "./FamilyCard/MainFamilyCard";
import FamilyCardStatus from "./FamilyCard/FamilyCardStatus";
function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<MainHome />} />
          <Route path="/providers" element={<MainServices />} />
          <Route
            path="/prescription-reservations"
            element={<PrescriptionReservations />}
          />
          <Route path="/providers/:id" element={<ProvidersDetails />} />
          <Route path="/home-providers" element={<MainHomeProviders />} />
          <Route
            path="/home-providers/:id"
            element={<HomeProvidersDetails />}
          />
          <Route path="/products" element={<MainProducts />} />
          <Route path="/products/:id" element={<ProductsDetails />} />
          <Route path="/cart" element={<MainCart />} />
          <Route path="/orders/:merchantOrderId" element={<OrderStatus />} />
          <Route path="/orders" element={<OrderStatus />} />
          <Route
            path="/package-reservation/:reservationNumber"
            element={<PackageReservationDetails />}
          />
          <Route
            path="/package-reservation"
            element={<PackageReservationDetails />}
          />

          <Route
            path="/medical-consultation-reservation/:reservationNumber"
            element={<MedicalConsultationReservationsDetails />}
          />
          <Route
            path="/medical-consultation-reservation"
            element={<MedicalConsultationReservationsDetails />}
          />
          <Route path="/medical-file" element={<MainMediaclFiles />} />
          <Route path="/medical-file/status" element={<MedicalFileStatus />} />
          <Route path="/medical-tourism" element={<MianMedicalTourism />} />
          <Route path="/content/:slug" element={<ContentPage />} />
          <Route
            path="/medical-prescriptions"
            element={<MedicalPrescriptions />}
          />
          <Route
            path="/medical-prescriptions/:id"
            element={<MedicalPrescriptionsDetails />}
          />
          <Route path="/are-you-provider" element={<MainAreYouProvider />} />
          <Route path="/family-card" element={<MainFamilyCard />} />
          <Route path="/family-card/status" element={<FamilyCardStatus />} />
        </Route>

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
