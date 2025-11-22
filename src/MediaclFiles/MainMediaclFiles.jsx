import React from "react";
// import MedicalFiles from "./MedicalFiles";
import SlugMedicalFiles from "./SlugMedicalFiles";
import MedicalFilesPlans from "./MedicalFilesPlans";

const MainMediaclFiles = () => {
  return (
    <>
      <SlugMedicalFiles slugProp="almlf-altby" />
      <MedicalFilesPlans />
      {/* <MedicalFiles /> */}
    </>
  );
};

export default MainMediaclFiles;
