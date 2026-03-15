'use client'
import React from 'react'
import StepOne from './StepOne'
import StepIndicator from './StepIndicator'
import StepTwo from './StepTwo'
import StepThree from './StepThree'
import StepFour from './StepFour'
import SuccessState from './SuccessState'
import { useRouter } from 'next/navigation'

const AcceptInvite = () => {
  const [currentStep, setCurrentStep] = React.useState(1)
  const [email, setEmail] = React.useState("")
  const [firstname, setFirstname] = React.useState("")
  const [lastname, setLastname] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [branch, setBranch] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")

  const router = useRouter()

  const invitedEmail = "emeka.okafor@sonichoice.ng";
 
  return (
     <div className='flex flex-col pt-30 h-screen w-full border-t-5 border-t-amber relative px-6 tny:px-10 sm:px-18'>
        <span className="bg-amber absolute top-0 rounded-b-lg px-4 py-2 text-ink font-semibold uppercase text-sm">
            Staff Onboarding · sonichoice
        </span>

       {currentStep <= 4 && <StepIndicator currentStep={currentStep} /> }
       
       <div className="">
        {
            currentStep === 1 ? <StepOne email={email} invitedEmail={invitedEmail} setEmail={setEmail} setCurrentStep={setCurrentStep} />
            : currentStep === 2 ? <StepTwo firstname={firstname} lastname={lastname} phone={phone} branch={branch} setFirstname={setFirstname} setLastname={setLastname} setPhone={setPhone} setBranch={setBranch} setCurrentStep={setCurrentStep}/>
            : currentStep === 3 ? <StepThree password={password} confirmPassword={confirmPassword} setPassword={setPassword} setConfirmPassword={setConfirmPassword} setCurrentStep={setCurrentStep} />
            : currentStep === 4 ? <StepFour email={email} firstName={firstname} lastName={lastname} branch={branch} phone={phone} setCurrentStep={setCurrentStep} handleSubmit={() => alert("Submitted")} />
            : currentStep === 200 ? <SuccessState onBack={()=> router.push('/login')}/>
            : <StepOne email={email} invitedEmail={invitedEmail} setEmail={setEmail} setCurrentStep={setCurrentStep} />
        }
       </div>
    </div>
  )
}

export default AcceptInvite