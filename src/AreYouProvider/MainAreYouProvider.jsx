import React from "react";
import SlugProvider from "./SlugProvider";
import SubscriptionPlans from "./SubscriptionPlans";
import SeoHead from "../Components/SeoHead";
const MainAreYouProvider = () => {
  return (
    <>
      <SeoHead
        title="انضم كمقدم خدمة - سوق خدماتك الطبية | Insta Health"
        description="انضم إلى شبكة انستا هيلث واعرض خدماتك الطبية لآلاف العملاء. نوفر لك أدوات تسويقية قوية، حملات إعلانية مستهدفة، ودعم فني متكامل لتنمية أعمالك وزيادة أرباحك."
        keywords="تسجيل مقدم خدمة, انضمام طبيب, تسويق عيادة, مورد مستلزمات طبية, منصة طبية, انستا هيلث, join insta health, medical provider registration, medical marketing, egypt"
        ogTitle="انضم لشركاء نجاح انستا هيلث - منصة الخدمات الطبية"
        ogDescription="سجل الآن كمقدم خدمة واستفد من حملاتنا التسويقية والدعم المستمر لتطوير عملك."
        ogImage="https://insta-health.netlify.app/metalogo.jpeg"
        canonical="https://instahealth.com/are-you-provider"
      />
      <SlugProvider slugProp="altaryf-bmqdmy-alkhmat" />
      <SubscriptionPlans />
    </>
  );
};

export default MainAreYouProvider;
