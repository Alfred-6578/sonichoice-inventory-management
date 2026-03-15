import SideContent from '@/components/reset-password/SideContent'
import ResetPassword from '@/components/reset-password/ResetPasswordForm'


const ResetPasswordPage = () => {
  return (
    <div className='flex w-screen h-full'>
        <SideContent/>
        <div className="bg-surface w-full lg:w-[52%]">
            <ResetPassword/>

        </div>
    </div>
  )
}

export default ResetPasswordPage