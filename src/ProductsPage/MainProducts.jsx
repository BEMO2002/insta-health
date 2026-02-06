import React from "react";
import Products from "./Products";
import SeoHead from "../Components/SeoHead";

const MainProducts = () => {
  return (
    <>
      <SeoHead
        title="متجر انستا هيلث - منتجات ومستلزمات طبية أونلاين | Insta Health Store"
        description="تسوق أونلاين أفضل المنتجات والمستلزمات الطبية، أجهزة قياس، مستحضرات تجميل، ومنتجات العناية الشخصية في مصر مع انستا هيلث. توصيل سريع وأسعار تنافسية. | Shop medical products and equipment online in Egypt."
        keywords="متجر طبي, مستلزمات طبية, أجهزة طبية, صيدلية أونلاين, منتجات عناية, انستا هيلث, شراء دواء, medical store, medical equipment, pharmacy online, egypt"
        ogTitle="متجر انستا هيلث - منتجات ومستلزمات طبية أونلاين"
        ogDescription="اكتشف تشكيلة واسعة من المنتجات والمستلزمات الطبية بأسعار مميزة وتوصيل سريع."
        ogImage="https://insta-health.netlify.app/metalogo.jpeg"
        canonical="https://instahealth.com/products"
      />
      <Products />
    </>
  );
};

export default MainProducts;
