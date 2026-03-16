import CTA from '@/components/home-page/CTA'
import Features from '@/components/home-page/Features'
import Footer from '@/components/home-page/Footer'
import Hero from '@/components/home-page/Hero'
import Navbar from '@/components/home-page/Navbar'
import Stats from '@/components/home-page/StatsBand'
import Workflow from '@/components/home-page/Workflow'
import React from 'react'

const HomePage = () => {
  return (
    <div className='bg-ink/90'>
        <Navbar />
        <div className="px-6 md:px-12 lg:px-18 relative overflow-x-hidden">
          <Hero />
          <Stats/>
          <Features />
          <Workflow />
          {/* <CTA /> */}
        </div>
        <Footer />
    </div>
  )
}

export default HomePage