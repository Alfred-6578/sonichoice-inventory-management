import AcceptInvite from "@/components/accept-invite/AcceptInvite"
import SideContent from "@/components/accept-invite/SideContent"


const AcceptInvitePage = () => {
  return (
    <div className='flex w-screen h-full'>
        <SideContent/>
        <div className="bg-surface w-full lg:w-[52%]">
            <AcceptInvite />
        </div>
    </div>
  )
}

export default AcceptInvitePage