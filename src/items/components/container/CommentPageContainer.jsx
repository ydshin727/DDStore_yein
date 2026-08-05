import React, { useEffect, useState } from 'react'
import '../../css/commentPage.css'
import { Link } from 'react-router-dom'
import CommunityPagination from '../../../community/components/common/CommunityPagination'
import { API_JSON_SERVER_URL } from '../../../apis/commonApi'


const CommentPageContainer = () => {
  const url= API_JSON_SERVER_URL
  const [reviews, setReviews] = useState([])
  const [products, setProducts] = useState([])

  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 9

  const [sortType, setSortType] = useState('latest')

  /* 날짜 포맷 */
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }
  /* 페이지 변경 시 스크롤 */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])
  const changePage = (pageNumber) => {
    setPage(pageNumber)
  }
  /* 데이터 fetch */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resReviews, resProducts] = await Promise.all([
          fetch(`${url}/comments`),
          fetch(`${url}/items`),
        ])

        setReviews(await resReviews.json())
        setProducts(await resProducts.json())
        setPage(1)
      } catch (err) {
        console.error(err)
        alert('데이터를 불러오는 중 오류가 발생했습니다.')
      }
    }

    fetchData()
  }, [])

  /* 🔥 리뷰 정렬 */
  const sortReviews = (reviews, type) => {
    const sorted = [...reviews]

    switch (type) {
      case 'latest':
        return sorted.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
      case 'oldest':
        return sorted.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        )
      case 'ratingHigh':
        return sorted.sort((a, b) => b.rating - a.rating)
      case 'ratingLow':
        return sorted.sort((a, b) => a.rating - b.rating)
      default:
        return sorted
    }
  }
  const sortedReviews = sortReviews(reviews, sortType)
  const totalCount = sortedReviews.length
  /* 페이징 */
  const pagedReviews = sortedReviews.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  return (
    <div className="comment-page-container">
      <h2>상품리뷰 모아보기</h2>

      {/* 정렬 필터 */}
      <div className="review-sort">
        <select value={sortType} onChange={(e) => setSortType(e.target.value)}>
          <option value="latest">최신순</option>
          <option value="oldest">오래된순</option>
          <option value="ratingHigh">별점 높은순</option>
          <option value="ratingLow">별점 낮은순</option>
        </select>
      </div>

      {/* 리뷰 카드 */}
      <div className="product-grid">
        {pagedReviews.map((review) => {
          const product = products.find(
            (p) => String(p.id) === String(review.productId)
          )

          const category = product?.category || 'best'
          const productName = product?.name || '상품명 없음'
          const productImage = product?.image
            ? `/images/items_juhee/${product.image}`
            : '/images/no-image.png'

          return (
            <div key={review.id} className="product-review-group">
              <Link
                to={`/items/${category}/detail/${review.productId}`}
                className="product-image-wrap"
              >
                <img src={productImage} alt={productName} />
              </Link>

              <h3>
                <Link
                  to={`/items/${category}/detail/${review.productId}`}
                  className="product-link"
                >
                  {productName} 
                </Link>
              </h3>

              <div className="review-item">
                <div className="review-header">
                  <h4>{review.userName}</h4>
                  <span className="rating">⭐ {review.rating}점</span>
                  <span className="review-date">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                <div className="review-comment">{review.content}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* pagination */}
      <div className="pagination">
              <CommunityPagination
                totalItems={totalCount}
                itemsPerPage={ITEMS_PER_PAGE}
                currentPage={page}
                onPageChange={changePage}
              />
            </div>
    </div>
  )
}

export default CommentPageContainer
