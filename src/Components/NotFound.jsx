import React from 'react'
import notimage from  "../assets/Home/notfound404.jpg"
import { Link } from 'react-router-dom'
import { HiOutlineHomeModern } from "react-icons/hi2";
const NotFound = () => {
  return (
    <div className='flex items-center flex-col justify-center mt-50 md:mt-0'>
        <img src={notimage} alt="" className='mx-auto' />
        <Link to="/">
        <button aria-label="Go to Home" className='flex  items-center gap-2 bg-transparent cursor-pointer hover:bg-primary hover:text-white transition-colors border border-primary text-primary px-6 py-4 rounded-lg '>
            العودة للرئيسية
            <HiOutlineHomeModern size={20} />
        </button>
        </Link>
    </div>
  )
}

export default NotFound