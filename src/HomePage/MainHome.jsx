import React from "react";
import Slider from "./Slider";
import AboutTwo from "./About";
import { Services } from "./Services";
import WhyUs from "./WhyUs";
import Numbers from "./Numbers";
import SliderOne from "./SliderOne";
import Work from "./Work";
import Testimonials from "./Testimonials";
import Faq from "./Faq";

const MainHome = () => {
  return (
    <>
      <Slider />
      <AboutTwo />
      <Services />
      <WhyUs />
      <Numbers />
      <SliderOne />
      <Work />
      <Testimonials />
      <Faq />
    </>
  );
};

export default MainHome;
