import React, { lazy, Suspense } from 'react'
import { Navigate } from 'react-router-dom'

const Loading = <div className="loading">...Loading</div>

const BestItem = lazy(() => import('../items/components/item/BestItem'))
const FeedItem = lazy(() => import('../items/components/item/FeedItem'))
const FashionItem = lazy(() => import('../items/components/item/FashionItem'))
const ToyItem = lazy(() => import('../items/components/item/ToyItem'))
const LivingItem = lazy(() => import('../items/components/item/LivingItem'))

const BestItemDetail = lazy(() => import('../items/components/detail/BestItemDetail'))
const FeedItemDetail = lazy(() => import('../items/components/detail/FeedItemDetail'))
const FashionItemDetail = lazy(() => import('../items/components/detail/FashionItemDetail'))
const ToyItemDetail = lazy(() => import('../items/components/detail/ToyItemDetail'))
const LivingItemDetail = lazy(() => import('../items/components/detail/LivingItemDetail'))
const SearchPageContainer = lazy(() => import('../items/components/container/SearchPageContainer'))
const HomeContainer = lazy(() => import('../items/components/container/HomeContainer'))

const toItemsRouter = () => {
  return [
    {
      path: '',
      element:<Navigate replace to={'best'}/>   
    },
    {
      path:'best',
      element:<Suspense fallback={Loading}><BestItem/></Suspense>
    },
    {
      path:'home',
      element:<Suspense fallback={Loading}><HomeContainer/></Suspense>
    },
    {
      path:'/items/best/detail/:id',
      element:<Suspense fallback={Loading}><BestItemDetail/></Suspense>
    },
    {
      path:'feed',
      element:<Suspense fallback={Loading}><FeedItem/></Suspense>
    },
    {
      path:'/items/feed/detail/:id',
      element:<Suspense fallback={Loading}><FeedItemDetail/></Suspense>
    },
    {
      path:'fashion',
      element:<Suspense fallback={Loading}><FashionItem/></Suspense>
    },
    {
      path:'/items/fashion/detail/:id',
      element:<Suspense fallback={Loading}><FashionItemDetail/></Suspense>
    },
    {
      path:'toy',
      element:<Suspense fallback={Loading}><ToyItem/></Suspense>
    },
    {
      path:'/items/toy/detail/:id',
      element:<Suspense fallback={Loading}><ToyItemDetail/></Suspense>
    },
    {
      path:'living',
      element:<Suspense fallback={Loading}><LivingItem/></Suspense>
    },
    {
      path:'/items/living/detail/:id',
      element:<Suspense fallback={Loading}><LivingItemDetail/></Suspense>
    },
    {
      path: 'detail/:id', 
      element: <Suspense fallback={Loading}><BestItemDetail/></Suspense> 
    },
    {
      path: '/items/search', 
      element: <Suspense fallback={Loading}><SearchPageContainer/></Suspense> 
    }
  ]
}

export default toItemsRouter