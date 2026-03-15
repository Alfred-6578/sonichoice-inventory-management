import LoginForm from '@/components/login/LoginForm'
import SideContent from '@/components/login/SideContent'
import React from 'react'

const LoginPage = () => {
  return (
    <div className='flex w-screen h-full'>
        <SideContent/>
        <div className="bg-surface w-full lg:w-[52%]">
            <LoginForm/>

        </div>
    </div>
  )
}

export default LoginPage