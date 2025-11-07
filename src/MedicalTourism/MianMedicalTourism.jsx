import React from 'react'
import MedicalTourism from './MedicalTourism'
import ContentPage from './ContentPage'
import TourismAttachments from './TourismAttachments'
import MedicalTourismSpecialties from './MedicalTourismSpecialties'

const MianMedicalTourism = () => {
  return (
    <>
    <ContentPage slugProp="alsyahh-alalajyh" />
    <TourismAttachments slugProp="medical-tourism" />
    <MedicalTourismSpecialties />
    <MedicalTourism />
    </>
  )
}

export default MianMedicalTourism