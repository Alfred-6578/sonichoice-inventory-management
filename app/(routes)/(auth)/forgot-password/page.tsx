import ForgotPassword from '@/components/forgot-password/ForgotPasswordForm'
import SideContent from '@/components/forgot-password/SideContent'
import React from 'react'

const ForgotPasswordPage = () => {
  return (
    <div className='flex w-screen h-full'>
        <SideContent/>
        <div className="bg-surface w-full lg:w-[52%]">
            <ForgotPassword/>

        </div>
    </div>
  )
}

export default ForgotPasswordPage