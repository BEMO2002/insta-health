import React from "react";
// import MedicalFiles from "./MedicalFiles";
import SlugMedicalFiles from "./SlugMedicalFiles";
import MedicalFilesPlans from "./MedicalFilesPlans";
import SeoHead from "../Components/SeoHead";
const MainMediaclFiles = () => {
  return (
    <>
      <SeoHead
        title="الملف الطبي الإلكتروني - سجلك الصحي الآمن | Insta Health"
        description="الملف الطبي هو سجل صحي شامل يضم تاريخك المرضي، الفحوصات، الوصفات، والتحاليل في مكان واحد آمن. سهولة الوصول وتحديث تلقائي لبياناتك الصحية."
        keywords="ملف طبي الكتروني, سجل صحي, تاريخ مرضي, تحاليل طبية, اشعة, وصفات طبية, انستا هيلث, medical record, electronic health record, ehr, egypt, medical history"
        ogTitle="الملف الطبي الإلكتروني - سجلك الصحي في جيبك"
        ogDescription="احتفظ بجميع بياناتك الطبية، تقاريرك، وتحاليلك في مكان واحد آمن ومحدث دائماً."
        ogImage="https://insta-health.netlify.app/metalogo.jpeg"
        canonical="https://instahealth.com/medical-file"
      />
      <SlugMedicalFiles slugProp="almlf-altby" />
      <MedicalFilesPlans />
      {/* <MedicalFiles /> */}
    </>
  );
};

export default MainMediaclFiles;
