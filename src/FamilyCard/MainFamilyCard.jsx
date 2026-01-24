import React from "react";
import SlugFamily from "./SlugFamily";
import SubscriptionFamilyPlans from "./SubscriptionFamilyPlans";
import SeoHead from "../Components/SeoHead";
const MainFamilyCard = () => {
  return (
    <>
      <SeoHead
        title="كارت الصحة - خصومات طبية حتى 70% | Insta Health"
        description="احصل على كارت الصحة واستمتع بخصومات تصل إلى 70% على الكشف، التحاليل، الأشعة، والعلاج. بطاقة خصومات طبية فورية بدون موافقات مسبقة للأفراد والعائلات."
        keywords="كارت الصحة, كارت خصومات طبية, تأمين صحي, خصم تحاليل, خصم اشعة, رعاية صحية مخفضة, انستا هيلث, health card, medical discount card, discount coupon, egypt"
        ogTitle="كارت الصحة - خصومات فورية على خدمات الرعاية الصحية"
        ogDescription="وفر حتى 70% على مصاريفك الطبية مع كارت الصحة من انستا هيلث. اشترك الآن!"
        ogImage="https://instahealth.com/share/health-card-og.jpg"
        canonical="https://instahealth.com/health-card"
      />
      <SlugFamily slugProp="kart-alshh" />
      <SubscriptionFamilyPlans />
    </>
  );
};

export default MainFamilyCard;
