const Title = ({text1,text2}) => {
  return (
    <h1 className='font-medium text-3xl max-md:text-2xl  max-sm:pl-0'>
    {text1} <span className='text-primary'>{text2}</span>
    </h1>
  )
}

export default Title
