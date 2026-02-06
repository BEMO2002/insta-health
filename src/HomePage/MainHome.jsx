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
import SeoHead from "../Components/SeoHead";
import HomePopup from "./HomePopup";

const MainHome = () => {
  return (
    <>
      <SeoHead
        title="انستا هيلث - خدمات الرعاية الصحية المنزلية الشاملة | Insta Health"
        description="الرائدون في الرعاية الصحية المنزلية في مصر. تمريض منزلي، زيارات أطباء، تحاليل طبية، علاج طبيعي، ورعاية مسنين بجودة عالية. | Comprehensive home healthcare in Egypt."
        keywords="رعاية صحية منزلية, تمريض منزلي, كشف منزلي, تحاليل طبية, علاج طبيعي, انستا هيلث, home nursing, doctor visit, medical analysis, physiotheraphy, egypt"
        ogTitle="انستا هيلث - رعاية صحية في منزلك"
        ogDescription="احصل على أفضل خدمات الرعاية الطبية في منزلك مع انستا هيلث."
        ogImage="https://insta-health.netlify.app/metalogo.jpeg"
        canonical="https://instahealth.com"
      />
      <HomePopup />
      <Slider />
      <AboutTwo />
      <WhyUs />
      <Services />
      <SliderOne />
      <ServiceItems />
      <Work />
      <Numbers />
      <NumbersTwo />
      <Testimonials />
      <Faq />
    </>
  );
};

export default MainHome;
