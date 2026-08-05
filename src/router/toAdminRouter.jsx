import React, { lazy, Suspense } from 'react'
import { Navigate } from 'react-router-dom';

const Loading = <div className='loading'>...Loading</div>
const AdminMain = lazy(()=>import('../admin/components/AdminMain'));
const AdminMember = lazy(()=>import('../admin/components/AdminMember'));
const AdminProduct = lazy(()=>import('../admin/components/AdminProduct'));
const AdminOrderStore = lazy(()=>import('../admin/components/AdminOrderStore'));
const AdminProductAdd = lazy(()=>import('../admin/components/AdminProductAdd'));
const AdminQna = lazy(()=>import('../admin/components/AdminQna'));

// yein 추가
const AdminOrder = lazy(() => import('../admin/components/AdminOrderList'))

const toAdminRouter = () => {
  return [
    {
      path:'',
      element:<Navigate replace to={'/admin/main'}/>
    },
    {
      path:'main',
      element:<Suspense fallback={Loading}><AdminMain/></Suspense>
    },
    {
      path:'member',
      element:<Suspense fallback={Loading}><AdminMember/></Suspense>
    },
    {
      path:'product',
      element:<Suspense fallback={Loading}><AdminProduct/></Suspense>
    },
    {
      path:'orderstore',
      element:<Suspense fallback={Loading}><AdminOrderStore/></Suspense>
    },
    {
      path:'productadd',
      element:<Suspense fallback={Loading}><AdminProductAdd/></Suspense>
    },
    {
      path:'qna',
      element:<Suspense fallback={Loading}><AdminQna/></Suspense>
    },
    {
      // yein 추가
      path:'order',
      element:<Suspense fallback={Loading}><AdminOrder/></Suspense>
    }
  ]
}

export default toAdminRouter
