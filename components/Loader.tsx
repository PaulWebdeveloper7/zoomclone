import Image from 'next/image'
import React from 'react'

const Loader = () => {
  return (
    <div  className='flex-center h-screen w-full'>
 <Image src={'icons/loading-Circle.svg'} alt='Loading' width={50} height={52} priority/>
    </div>
  )
}

export default Loader