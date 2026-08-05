import React, { lazy, Suspense } from 'react'
import { Navigate } from 'react-router-dom';

const Loading = <div className="loading">...Loading</div>

const AuthLogin = lazy(() => import('../auth/components/AuthLogin'))
const AuthJoin = lazy(() => import('../auth/components/AuthJoin'))
const AuthDetail = lazy(() => import('../auth/components/AuthDetail'))

const toAuthRouter = () => {
  return [
    {
      path: '',
      element: <Navigate replace to={'/auth/login'}/>
    },
    {
      path: 'login',
      element: <Suspense fallback = {Loading}><AuthLogin/></Suspense>
    },
    {
      path: 'join',
      element: <Suspense fallback = {Loading}><AuthJoin/></Suspense>
    },
    {
      path: 'detail/:id',
      element: <Suspense fallback = {Loading}><AuthDetail/></Suspense>
    },
  ]
}

export default toAuthRouter