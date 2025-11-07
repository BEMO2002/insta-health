import React from 'react'
import ContentPage from './ContentPage'
import TourismAttachments from './TourismAttachments'
import MedicalTourismSpecialties from './MedicalTourismSpecialties'
import MedicalTourismPackges from './MedicalTourismPackges'

const MianMedicalTourism = () => {
  return (
    <>
    <ContentPage slugProp="alsyahh-alalajyh" />
    <TourismAttachments slugProp="medical-tourism" />
    <MedicalTourismSpecialties />
    <MedicalTourismPackges />
    </>
  )
}

export default MianMedicalTourism