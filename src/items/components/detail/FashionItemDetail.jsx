import React from 'react'
import { useParams } from 'react-router-dom'
import ItemDetailContainer from '../container/ItemDetailContainer'

const FeedItemDetail = () => {
  const param=useParams()
  return (
    <>
      <ItemDetailContainer param={param}/>
    </>
  )
}

export default FeedItemDetail