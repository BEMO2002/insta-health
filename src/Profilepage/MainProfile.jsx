import React from "react";
import UserProfile from "./UserProfile";
import SeoHead from "../Components/SeoHead";
const MainProfile = () => {
  return (
    <>
      <SeoHead
        title="الملف الشخصي - إدارة حسابك وحجوزاتك | Insta Health"
        description="إدارة بياناتك الشخصية، متابعة حجوزاتك الحالية والسابقة، والاطلاع على ملفك الطبي وتاريخك الصحي بسهولة وأمان عبر انستا هيلث."
        keywords="الملف الشخصي, حسابي, حجوزاتي, تاريخي الطبي, انستا هيلث, user profile, my account, my bookings, medical history, insta health"
        ogTitle="حسابي - انستا هيلث"
        ogDescription="تحكم في حسابك وتابع جميع خدماتك الطبية من مكان واحد."
        ogImage="https://instahealth.com/share/profile-og.jpg"
        canonical="https://instahealth.com/profile"
      />
      <UserProfile />
    </>
  );
};

export default MainProfile;
