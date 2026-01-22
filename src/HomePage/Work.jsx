import React from "react";
import Work2 from "../assets/Home/روشتة اليوم 1.png";
import Button from "../Components/Button";
import { Link } from "react-router-dom";
const Work = () => {
  return (
    <div className="py-12 p-4 flex flex-col items-center justify-center">
      <div className="mx-auto h-full w-full md:w-[400px] lg:w-[500px] flex items-center justify-center">
        <img src={Work2} alt="" />
      </div>
      <div className="mt-8">
        <Link to="/medical-prescriptions">
          <Button />
        </Link>
      </div>
    </div>
  );
};

export default Work;
