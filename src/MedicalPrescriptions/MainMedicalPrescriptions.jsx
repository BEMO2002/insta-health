import React from "react";
import MedicalPrescriptions from "./MedicalPrescriptions";
import SeoHead from "../Components/SeoHead";

const MainMedicalPrescriptions = () => {
  return (
    <>
      <SeoHead
        title="المدونة الطبية - مقالات ونصائح صحية موثوقة | Insta Health"
        description="تصفح أحدث المقالات الطبية والنصائح الصحية المقدمة من نخبة الأطباء. معلومات موثوقة في جميع التخصصات: صحة الأسرة، التغذية، الأمومة والطفل، والوقاية من الأمراض."
        keywords="مدونة طبية, مقالات طبية, نصائح صحية, معلومات طبية, صحة عامة, تغذية, انستا هيلث, medical blog, health articles, health tips, insta health, egypt"
        ogTitle="المدونة الطبية - دليلك لحياة صحية أفضل"
        ogDescription="اقرأ أحدث المقالات والنصائح الطبية من خبراء انستا هيلث."
        ogImage="https://insta-health.netlify.app/metalogo.jpeg"
        canonical="https://instahealth.com/medical-prescriptions"
      />
      <MedicalPrescriptions />
    </>
  );
};

export default MainMedicalPrescriptions;
