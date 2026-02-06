import React from "react";
import ContentPage from "./ContentPage";
import TourismAttachments from "./TourismAttachments";
import MedicalTourismSpecialties from "./MedicalTourismSpecialties";
import MedicalTourismPackges from "./MedicalTourismPackges";
import SeoHead from "../Components/SeoHead";
const MianMedicalTourism = () => {
  return (
    <>
      <SeoHead
        title="السياحة العلاجية في مصر - عمليات تجميل وعلاج متكامل | Insta Health"
        description="خدمات السياحة العلاجية المتكاملة في مصر. نوفر لك أفضل خيارات العلاج للجراحات التجميلية، الأسنان، القلب، وإعادة التأهيل بجودة عالمية وتكلفة مناسبة مع ترتيبات السفر والإقامة."
        keywords="سياحة علاجية, سياحة طبية, علاج في مصر, عمليات تجميل, زراعة اسنان, جراحة قلب, مصحات علاجية, medical tourism egypt, cosmetic surgery, dental tourism, insta health"
        ogTitle="السياحة العلاجية في مصر - جودة طبية وتكلفة منافسة"
        ogDescription="خطط لرحلتك العلاجية الآن مع انستا هيلث. باقات شاملة للعلاج والإقامة في مصر."
        ogImage="https://insta-health.netlify.app/metalogo.jpeg"
        canonical="https://instahealth.com/medical-tourism"
      />
      <ContentPage slugProp="alsyahh-alalajyh" />
      <TourismAttachments slugProp="medical-tourism" />
      <MedicalTourismSpecialties />
      <MedicalTourismPackges />
    </>
  );
};

export default MianMedicalTourism;
