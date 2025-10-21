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
import ServiceItems from "./ServiceItems";
import NumbersTwo from "./NumbersTwo";

const MainHome = () => {
  return (
    <>
      <Slider />
      <WhyUs />
      <Services />
      <SliderOne />
      <ServiceItems />
      <Work />
      <AboutTwo />
      <Numbers />
      <NumbersTwo />
      <Testimonials />
      <Faq />
    </>
  );
};

export default MainHome;
