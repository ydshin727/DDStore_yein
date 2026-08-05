import React from 'react'
import { Outlet } from 'react-router-dom'
import ItemHeader from '../../items/components/common/ItemHeader'
import ItemFooter from '../../items/components/common/ItemFooter'
import '../css/paymentLayout.css'

const PaymentLayout = () => {
  return (
    <>
    <div className="payment-layout">
      <ItemHeader/>
      <main className="payment-main">
        <Outlet/>
      </main>
      <ItemFooter/>
    </div>
    </>
  )
}

export default PaymentLayout