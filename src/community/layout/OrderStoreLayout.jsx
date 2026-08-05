import React from 'react'
import OrderStoreContainer from '../container/OrderStoreContainer'
import { Outlet } from 'react-router-dom'

const OrderStoreLayout = () => {
  return (
    <>
    <Outlet/>
    </>
  )
}

export default OrderStoreLayout
