import React from 'react'
import { useParams } from 'react-router-dom'
import ItemDetailContainer from '../container/ItemDetailContainer'

const LivingItemDetail = () => {
  const param=useParams()
  return (
    <>
      <ItemDetailContainer param={param}/>
    </>
  )
}

export default LivingItemDetail