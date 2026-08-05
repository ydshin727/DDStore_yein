import React, { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import toItemsRouter from './toItemsRouter'
import toCartRouter from './toCartRouter'
import toPaymentRouter from './toPaymentRouter'
import toAdminRouter from './toAdminRouter'
import toCommunityRouter from './toCommunityRouter'
import toAuthRouter from './toAuthRouter'
import ItemLayout from '../items/layout/ItemLayout'
import PrivacyLayout from '../items/layout/PrivacyLayout'
import TermsLayout from '../items/layout/TermsLayout'

const Loading = <div className="loading">...Loading</div>

const IndexPage = lazy(() => import('../index/components/index'))
const AdminLayout = lazy(() => import('../admin/layout/AdminLayout'))
const AuthLayout = lazy(() => import('../auth/layout/AuthLayout'))
const CommunityPage = lazy(()=> import('../community/components/Community'))
const CartLayout = lazy(() => import('../cart/layout/CartLayout'))
const PaymentLayout = lazy(() => import('../payment/layout/PaymentLayout'))

const root = createBrowserRouter([
  {
    path: '',
    element: <Navigate replace to = {'index'}/>
  },
  {
    path: 'index',
    element: <Suspense fallback = {Loading}><IndexPage/></Suspense>
  },
  {
    path: 'items',
    element: <Suspense fallback = {Loading}><ItemLayout/></Suspense>,
    children: toItemsRouter()
  },
  {
    path: 'cart',
    element: <Suspense fallback = {Loading}><CartLayout/></Suspense>,
    children: toCartRouter()
  },
  {
    path: 'payment',
    element: <Suspense fallback = {Loading}><PaymentLayout/></Suspense>,
    children: toPaymentRouter()
  },
  {
    path: 'admin',
    element: <Suspense fallback = {Loading}><AdminLayout/></Suspense>,
    children: toAdminRouter()
  },
  {
    path: 'auth',
    element: <Suspense fallback = {Loading}><AuthLayout/></Suspense>,
    children: toAuthRouter()
  },
  {
    path: 'community',
    element: <Suspense fallback={Loading}><CommunityPage/></Suspense>,
    children: toCommunityRouter()
  },
  {
    path: 'privacy',
    element: <Suspense fallback={Loading}><PrivacyLayout/></Suspense>,
  },
  {
    path: 'terms',
    element: <Suspense fallback={Loading}><TermsLayout/></Suspense>,
  }
])

export default root