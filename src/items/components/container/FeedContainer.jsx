import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../../css/common/bestItem.css'
import { useSearchParams } from 'react-router-dom'
import CommunityPagination from '../../../community/components/common/CommunityPagination'
import { API_JSON_SERVER_URL } from '../../../apis/commonApi'

const FeedContainer = () => {
  const url= API_JSON_SERVER_URL
  const [itemList, setItemList] = useState([])
  const ITEMS_PER_PAGE = 8
  const [showTitle, setShowTitle] = useState(false)
  const [reviews, setReviews] = useState([])
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page')) || 1
  const sort = searchParams.get('sort') // null이면 추천순

  const changePage = (pageNumber) => {
    const params = {}

    if (sort) params.sort = sort
    if (pageNumber > 1) params.page = pageNumber

    setSearchParams(params)
    window.scrollTo({ top: 0, behavior: 'smooth' }) 
  }

  useEffect(() => {
    window.scrollTo({ top: 0 })
    setShowTitle(false) // 페이지/정렬 변경 시 초기화
    setTimeout(() => setShowTitle(true), 200) // 0.2초 딜레이
  }, [])
  useEffect(() => {
    const bestFn = async () => {
      try {
        const res = await fetch(`${url}/items?category=feed`);
        const resData = await res.json();
        setItemList(resData)
      } catch (err) {
        alert('데이터 불러오기 실패')
      }
    }
    bestFn();
  }, [])


  const totalCount = itemList.length

  useEffect(() => {
    window.scrollTo({
      top: 0,
    })
  }, [page, sort])
  useEffect(() => {
    fetch(`${url}/comments`)
      .then(res => res.json())
      .then(data => setReviews(data))
  }, [])
  const reviewCountMap = reviews.reduce((acc, review) => {
    const productId = review.productId
    acc[productId] = (acc[productId] || 0) + 1
    return acc
  }, {})
  const sortedItems = [...itemList].sort((a, b) => {
    if (sort === 'popular') {
      return (reviewCountMap[b.id] || 0)
        - (reviewCountMap[a.id] || 0)
    }

    if (sort === 'price_asc') return a.price - b.price
    if (sort === 'price_desc') return b.price - a.price

    return 0 // ✅ 추천순
  })

  const pagedItems = sortedItems.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )
  const changeSort = (value) => {
    const params = {}

    if (value) params.sort = value
    params.page = 1   // 정렬 바뀌면 1페이지

    setSearchParams(params)
  }


  return (
    <div className="best">
      <div className="best-con">
        <h2><div className={`title ${showTitle ? 'show' : ''}`}>사료/간식</div></h2>

        <div className="category-top">
          <div className="item-count">
            <strong>{totalCount}</strong> 개 상품
          </div>
          <ul className="sort-list">
            <li
              className={!sort ? 'active' : ''}
              onClick={() => changeSort(null)}
            >
              추천순
            </li>

            <li
              className={sort === 'popular' ? 'active' : ''}
              onClick={() => changeSort('popular')}
            >
              인기순
            </li>

            <li
              className={sort === 'price_asc' ? 'active' : ''}
              onClick={() => changeSort('price_asc')}
            >
              낮은가격순
            </li>

            <li
              className={sort === 'price_desc' ? 'active' : ''}
              onClick={() => changeSort('price_desc')}
            >
              높은가격순
            </li>
          </ul>

        </div>

        <div className="itemList">
          <div className="itemList-con">
            <ul>
              {/* json리스트 출력 */}
              {pagedItems.map((el, idx) => {
                return (
                  <li key={el.id}>

                    <div className="top">
                      <Link onClick={() => window.scrollTo(0, 0)}
                        to={`/items/feed/detail/${el.id}`}
                        className="item-link">
                        <img src={`/images/items_juhee/${el.image}`} alt={el.image} />
                      </Link>
                    </div>
                    <div className="bottom">
                      <Link to={`/items/${el.category}/detail/${el.id}`} className="item-link" onClick={() => window.scrollTo(0, 0)}>
                        <div className="name"><span>{el.name}</span> </div>
                        <div className="price"><span>{el.price.toLocaleString()}원</span></div>
                      </Link>
                    </div>

                  </li>
                )
              })}
            </ul>
            <div className="pagination">
              <CommunityPagination
                totalItems={totalCount}
                itemsPerPage={ITEMS_PER_PAGE}
                currentPage={page}
                onPageChange={changePage}
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default FeedContainer