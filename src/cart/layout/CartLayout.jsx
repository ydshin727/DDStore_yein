import React from 'react'
import { Outlet } from 'react-router-dom'
import ItemHeader from '../../items/components/common/ItemHeader'
import ItemFooter from '../../items/components/common/ItemFooter'
import '../css/cartLayout.css'

const CartLayout = () => {
  return (
    <div className="cart-layout">
      <ItemHeader/>
      <main className="cart-main">
        <Outlet/>
      </main>
      <ItemFooter/>
    </div>
  )
}

export default CartLayout