import React, { lazy, Suspense } from 'react'

const Loading = <div className="loading">...Loading</div>

const CartPage = lazy(() => import('../cart/components/Cart'))

const toCartRouter = () => {
  return [
    {
      path: '',
      element: <Suspense fallback = {Loading}><CartPage/></Suspense>
    }
  ]
}

export default toCartRouter