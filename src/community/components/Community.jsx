import React from 'react'
import { Outlet } from 'react-router-dom'
import ItemHeader from '../../items/components/common/ItemHeader'
import CommunityHeader from './common/CommunityHeader'
import ItemFooter from '../../items/components/common/ItemFooter'


const Community = () => {
  return (
    <>
      <ItemHeader/>
      <CommunityHeader/>
      <Outlet/>
      <ItemFooter/>   
    
    </>
  )
}

export default Community