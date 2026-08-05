import React, { lazy, Suspense } from 'react'
import { Navigate } from 'react-router-dom'

const Loading = <div className="loading">...Loading</div>

const PaymentListPage = lazy(() => import('../payment/components/PaymentList'))
const PaymentOrderPage = lazy(() => import('../payment/components/PaymentOrder'))

const toPaymentRouter = () => {
  return [
    {
      path: '',
      element:<Navigate replace to={'order'}/>   
    },
    {
      path: 'order',
      element: <Suspense fallback = {Loading}><PaymentOrderPage/></Suspense>
    },
    {
      path: 'list',
      element: <Suspense fallback = {Loading}><PaymentListPage/></Suspense>
    },
    {
      path: 'list/:orderId',
      element: <Suspense fallback = {Loading}><PaymentListPage/></Suspense>
    }
  ]
}

export default toPaymentRouter