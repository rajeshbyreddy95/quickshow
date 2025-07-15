import { dummyShowsData } from '../assets/assets'
import BlurCircle from '../components/BlurCircle'
import MovieCard from '../components/MovieCard' 

const Favorite = () => {
  return dummyShowsData.length > 0 ? (
    <div className=' relative px-6 md:px-8 lg:px-16 xl:px-20 overflow-hidden py-10 max-md:py-0'>
      <div className="relative flex items-center justify-between pt-20 pb-5 pl-10 text-lg max-md:pl-0">
        <BlurCircle top='80px' right='-40px' />
        <p className='text-gray-300 font-medium max-md:text-md text-lg'>Your Favourite Movies</p>
        <BlurCircle top='500px' left='0px' />
      </div>
      <div className='flex flex-wrap justify-center gap-8 mt-8'>
        {dummyShowsData.map((movie) => (
          <MovieCard key={movie._id} movie={movie} />
        ))}
      </div>
    </div>
  ) : (
    <div className="text-center py-10 text-gray-400">No movies found.</div>
  )
}

export default Favorite
