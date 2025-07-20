import { ArrowRight, Calendar1Icon, ClockIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const HeroSection = () => {
    const navigate = useNavigate();
    return (
        <div className='flex flex-col items-start justify-center gap-8 px-10 md:px-14 lg:px-23 bg-[url("/backgroundImage.jpeg")] bg-cover bg-center h-screen max-md:overflow-hidden'>
            <div className="flex flex-col items-start justify-center max-md:text-sm mt-10 min-2xl:text-2xl">
                <img src="/MarvelLogo.png" alt="Logo" className='w-50 mx-2 max-md:w-40' />
                <h1 className='text-7xl md: leading-18 max-w-100 font-semibold li mx-2 max-md:text-3xl max-md:leading-10'>Deadpool & Wolverine</h1>
                <div className="flex mx-3 my-2 gap-6 max-sm:flex-col max-sm:gap-2 text-gray-300 max-md:font-semibold">
                    <span>Superhero  |  Action  |  Comedy</span>
                    <div className="flex items-center">
                        <Calendar1Icon className='w-4 h-4 mx-1' />2024
                    </div>
                    <div className="flex items-center">
                        <ClockIcon className='w-4 h-4 mx-1' />2hr 7min
                    </div>
                </div>
                <p className='max-w-lg mx-3 max-md:font-semibold min-2xl:max-w-xl text-gray-300 max-md:max-w-sm'>When the Time Variance Authority recruits Deadpool to fix a multiversal mess, he reluctantly teams up with a grumpy, out-of-retirement Wolverine. Expect chaos, claws, and classic Deadpool humor as the duo slashes through timelines to save… well, everything</p>
                <button className='flex items-center px-4 py-3 text-md min-2xl:my-6 font-medium bg-primary hover:bg-primary-dull transition rounded-full cursor-pointer my-4 mx-3 max-md:text-sm' onClick={() => { navigate('/movies') }}>
                    Explore Movies
                    <ArrowRight className='w-5 h-5 ml-1' />
                </button>
            </div>
        </div>
    )
}

export default HeroSection
