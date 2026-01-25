import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Components/Layout";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ScrollToTop from "./Components/ScrollToTop";

// Lazy load components
const Login = lazy(() => import("./Authinction/Login"));
const Signup = lazy(() => import("./Authinction/SignUp"));
const AuthenticateEmail = lazy(() => import("./Authinction/AuthenticateEmail"));
const ConfirmEmail = lazy(() => import("./Authinction/ConfirmEmail"));
const ForgetPassword = lazy(() => import("./Authinction/ForgetPassword"));
const ResetPassword = lazy(() => import("./Authinction/ResetPassword"));

const MainHome = lazy(() => import("./HomePage/MainHome"));
const MainServices = lazy(() => import("./ServicesProviders/MainServices"));
const ProvidersDetails = lazy(
  () => import("./ServicesProviders/ProvidersDetails"),
);
const MainProducts = lazy(() => import("./ProductsPage/MainProducts"));
const ProductsDetails = lazy(() => import("./ProductsPage/ProductsDetails"));
const MainCart = lazy(() => import("./CartPage.jsx/MainCart"));
const OrderStatus = lazy(() => import("./Orders/OrderStatus"));
const PrescriptionReservations = lazy(
  () => import("./PrescriptionReservations/PrescriptionReservations"),
);
const MainHomeProviders = lazy(
  () => import("./HomeProviders/MainHomeProviders"),
);
const HomeProvidersDetails = lazy(
  () => import("./HomeProviders/HomeProvidersDetails"),
);
const MainMediaclFiles = lazy(() => import("./MediaclFiles/MainMediaclFiles"));
const MedicalFileStatus = lazy(
  () => import("./MediaclFiles/MedicalFileStatus"),
);
const MianMedicalTourism = lazy(
  () => import("./MedicalTourism/MianMedicalTourism"),
);
const ContentPage = lazy(() => import("./MedicalTourism/ContentPage"));
const PackageReservationDetails = lazy(
  () => import("./MedicalTourism/PackageReservationDetails"),
);
const MedicalPrescriptionsDetails = lazy(
  () => import("./MedicalPrescriptions/MedicalPrescriptionsDetails"),
);
const MedicalConsultationReservationsDetails = lazy(
  () => import("./MedicalTourism/MedicalConsultationReservationsDetails"),
);
const MainAreYouProvider = lazy(
  () => import("./AreYouProvider/MainAreYouProvider"),
);
const MainFamilyCard = lazy(() => import("./FamilyCard/MainFamilyCard"));
const FamilyCardStatus = lazy(() => import("./FamilyCard/FamilyCardStatus"));
const MainFilesAndrecord = lazy(
  () => import("./MedicalFileAndRecored/MainFilesAndrecord"),
);
const NotFound = lazy(() => import("./Components/NotFound"));
const MainProfile = lazy(() => import("./Profilepage/MainProfile"));
const MedicalFileDetails = lazy(() => import("./MedicalFileDetails"));
const MainMedicalPrescriptions = lazy(
  () => import("./MedicalPrescriptions/MainMedicalPrescriptions"),
);
const WhyDetails = lazy(() => import("./HomePage/WhyDetails"));

// Loading Component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-second"></div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ToastContainer />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<MainHome />} />
            <Route path="/providers" element={<MainServices />} />
            <Route
              path="/prescription-reservations"
              element={<PrescriptionReservations />}
            />
            <Route path="/providers/:slug" element={<ProvidersDetails />} />
            <Route path="/home-providers" element={<MainHomeProviders />} />
            <Route
              path="/home-providers/:slug"
              element={<HomeProvidersDetails />}
            />
            <Route path="/products" element={<MainProducts />} />
            <Route path="/products/:slug" element={<ProductsDetails />} />
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
            <Route path="/profile" element={<MainProfile />} />

            <Route
              path="/medical-consultation-reservation/:reservationNumber"
              element={<MedicalConsultationReservationsDetails />}
            />
            <Route
              path="/medical-consultation-reservation"
              element={<MedicalConsultationReservationsDetails />}
            />
            <Route path="/medical-file" element={<MainMediaclFiles />} />
            <Route
              path="/medical-file/status"
              element={<MedicalFileStatus />}
            />
            <Route path="/medical-tourism" element={<MianMedicalTourism />} />
            <Route path="/content/:slug" element={<ContentPage />} />
            <Route
              path="/medical-prescriptions"
              element={<MainMedicalPrescriptions />}
            />
            <Route
              path="/medical-prescriptions/:id"
              element={<MedicalPrescriptionsDetails />}
            />
            <Route path="/are-you-provider" element={<MainAreYouProvider />} />
            <Route path="/family-card" element={<MainFamilyCard />} />
            <Route path="/family-card/status" element={<FamilyCardStatus />} />
            <Route
              path="/medical-file-record"
              element={<MainFilesAndrecord />}
            />
            <Route
              path="medical-files/:fileNumber"
              element={<MedicalFileDetails />}
            />
            <Route path="/medical-features/:slug" element={<WhyDetails />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/authenticate-email" element={<AuthenticateEmail />} />
          <Route path="/confirm-email" element={<ConfirmEmail />} />
          <Route path="/forget" element={<ForgetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
