import React, { lazy, Suspense } from 'react'
import { Navigate } from 'react-router-dom'

const Loading = <div className="loading">...Loading</div>

const CommunityWriteContainer = lazy(() => import('../community/container/CommunityWriteContainer'))

const NoticeLayout = lazy(() => import('../community/layout/NoticeLayout'))
const NoticeContainer = lazy(() => import('../community/container/NoticeContainer'))
const NoticeDetailContainer = lazy(() => import('../community/container/NoticeDetailContainer'))

const FaqLayout = lazy(() => import('../community/layout/FaqLayout'))
const FaqContainer = lazy(() => import('../community/container/FaqContainer'))

const QnaLayout = lazy(() => import('../community/layout/QnaLayout'))
const QnaContainer = lazy(() => import('../community/container/QnaContainer'))
const QnaDetailContainer = lazy(() => import('../community/container/QnaDetailContainer'))

const OrderStoreLayout = lazy(() => import('../community/layout/OrderStoreLayout'))
const OrderStoreWriteContainer = lazy(() => import('../community/container/OrderStoreWriteContainer'))
const OrderStoreContainer = lazy(() => import('../community/container/OrderStoreContainer'))

const NotFoundPage = lazy(() => import('../community/components/common/NotFoundPage'))

const ReviewLayout = lazy(() => import('../community/layout/ReviewLayout'))
const ReviewContainer = lazy(() => import('../community/container/ReviewContainer'))
const ReviewDetailContainer = lazy(() => import('../community/container/ReviewDetailContainer'))

const toCommunityRouter = () => {
  return (
    [
      {
        path: '',
        element: <Navigate replace to='notice' />,
      },
      {
        path: 'notice',
        element: <Suspense fallback={Loading}> <NoticeLayout /> </Suspense>,
        children: [
          {
            index: true,
            element: <Suspense fallback={Loading}> <NoticeContainer /> </Suspense>
          },
          {
            path: 'detail/:id',
            element: <Suspense fallback={Loading}> <NoticeDetailContainer /> </Suspense>
          },
          {
            path: 'write',
            element: <Suspense fallback={Loading}> <CommunityWriteContainer /> </Suspense>
          },
          {
            path: 'write/:id',
            element: <Suspense fallback={Loading}> <CommunityWriteContainer /> </Suspense>
          }
        ]
      },
      {
        path: 'faq',
        element: <Suspense fallback={Loading}> <FaqLayout /> </Suspense>,
        children: [
          {
            path: '',
            element: <Suspense> <FaqContainer /> </Suspense>
          },
          {
            path: 'write',
            element: <Suspense fallback={Loading}> <CommunityWriteContainer /> </Suspense>
          },
          {
            path: 'write/:id',
            element: <Suspense fallback={Loading}> <CommunityWriteContainer /> </Suspense>
          }
        ]
      },
      {
        path: 'qna',
        element: <Suspense fallback={Loading}> <QnaLayout /> </Suspense>,
        children: [
          {
            path: '',
            element: <Suspense> <QnaContainer /> </Suspense>
          },
          {
            path: 'detail/:id',
            element: <Suspense fallback={Loading}> <QnaDetailContainer /> </Suspense>
          },
          {
            path: 'write',
            element: <Suspense fallback={Loading}> <CommunityWriteContainer /> </Suspense>
          },
          {
            path: 'write/:id',
            element: <Suspense fallback={Loading}> <CommunityWriteContainer />  </Suspense>
          }
        ]
      },
      {
        path: 'orderstore',
        element: <Suspense fallback={Loading}> <OrderStoreLayout /> </Suspense>,
        children: [
          {
            path: '',
            element: <Suspense> <OrderStoreContainer /> </Suspense>
          },
          {
            path: 'write',
            element: <Suspense fallback={Loading}> <OrderStoreWriteContainer /> </Suspense>
          },
          {
            path: 'write/:id',
            element: <Suspense fallback={Loading}> <OrderStoreWriteContainer /> </Suspense>
          }
        ]
      },
      {
        path: 'review',
        element: <Suspense fallback={Loading}> <ReviewLayout /> </Suspense>,
        children: [
          {
            path: '',
            element: <Suspense> <ReviewContainer /> </Suspense>
          },
          {
            path: 'detail/:id',
            element: <Suspense fallback={Loading}> <ReviewDetailContainer /> </Suspense>
          },
          {
            path: 'write',
            element: <Suspense fallback={Loading}> <CommunityWriteContainer /> </Suspense>
          },
          {
            path: 'write/:id',
            element: <Suspense fallback={Loading}> <CommunityWriteContainer /> </Suspense>
          }
        ]
      },
      { path: '*', element: <Suspense fallback={Loading}> <NotFoundPage /> </Suspense> }
    ]
  )
}

export default toCommunityRouter