import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import '../../css/comment.css'
import { API_JSON_SERVER_URL } from '../../../apis/commonApi'

const CommentContainer = ({ productId }) => {
  const url = API_JSON_SERVER_URL
  const [reviews, setReviews] = useState([])
  const [newReview, setNewReview] = useState({ content: '', rating: 5 })

  const [editingId, setEditingId] = useState(null)
  const [editReview, setEditReview] = useState({ content: '', rating: 5 })

  const { isState, isUser } = useSelector(state => state.auth)

  // 리뷰 불러오기
  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${url}/comments`)
      const productReviews = res.data.filter(
        r => r.productId === productId
      )
      setReviews(productReviews)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [productId])

  // ⭐ 평균 평점 계산
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, cur) => acc + cur.rating, 0) / reviews.length).toFixed(1)
      : 0

  // ⭐ 별점 분포
  const ratingCount = [5, 4, 3, 2, 1].map(n =>
    reviews.filter(r => r.rating === n).length
  )

  // 리뷰 등록
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isState) {
      alert('로그인 후 작성 가능합니다.')
      return
    }

    if (!newReview.content.trim()) {
      alert('리뷰 내용을 입력해주세요.')
      return
    }

    const reviewData = {
      productId,
      userEmail: isUser.userEmail,
      userName: isUser.userName,
      content: newReview.content,
      rating: newReview.rating,
      createdAt: new Date().toISOString()
    }

    try {
      await axios.post(`${url}/comments`, reviewData)
      setNewReview({ content: '', rating: 5 })
      fetchReviews()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('리뷰를 삭제하시겠습니까?')) return
    await axios.delete(`${url}/comments/${id}`)
    fetchReviews()
  }

  const handleEditSubmit = async (id) => {
    await axios.patch(`${url}/comments/${id}`, editReview)
    setEditingId(null)
    fetchReviews()
  }

  return (
    <div className="product-reviews">
      <h3 className="review-title">리뷰</h3>

      {/* ⭐ 상단 요약 */}
      <div className="review-summary">
        <div className="summary-left">
          <p>구매자 평점</p>
          <h2>⭐ {avgRating} / 5</h2>
        </div>

        <div className="summary-center">
          <p>리뷰 개수</p>
          <h2>{reviews.length}</h2>
        </div>

        <div className="summary-right">
          {[5, 4, 3, 2, 1].map((n, i) => (
            <div key={n} className="bar-row">
              <span>{n}점</span>
              <div className="bar">
                <div
                  className="fill"
                  style={{
                    width: reviews.length
                      ? `${(ratingCount[i] / reviews.length) * 100}%`
                      : '0%'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ⭐ 리뷰 리스트 */}
      {reviews.length === 0 ? (
        <div className="no-review-box">
          게시물이 없습니다
        </div>
      ) : (
        reviews.map(r => {
          const userEmail = isUser?.userEmail
          const isMyReview =
            isState &&
            r.userEmail?.toLowerCase() === userEmail?.toLowerCase()

          return (
            <div key={r.id} className="review">
              <p>
                <strong>{r.userName}</strong>
                <span className="stars">
                  {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                </span>
              </p>
              {editingId === r.id ? (
                <>
                  <textarea
                    value={editReview.content}
                    onChange={e =>
                      setEditReview({ ...editReview, content: e.target.value })
                    }
                  />
                  <select
                    value={editReview.rating}
                    onChange={e =>
                      setEditReview({
                        ...editReview,
                        rating: Number(e.target.value)
                      })
                    }
                  >
                    {[5, 4, 3, 2, 1].map(n => (
                      <option key={n} value={n}>{n}점</option>
                    ))}
                  </select>
                  <div className="save-back">
                    <button className='save' onClick={() => handleEditSubmit(r.id)}>저장</button>
                    <button className='back' onClick={() => setEditingId(null)}>취소</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="review-content"> <p>{r.content}</p></div>
                  <small>{new Date(r.createdAt).toLocaleString()}</small>

                  {isMyReview && (
                    <div className="review-actions">
                      <button onClick={() => {
                        setEditingId(r.id)
                        setEditReview({ content: r.content, rating: r.rating })
                      }}>수정</button>
                      <button onClick={() => handleDelete(r.id)}>삭제</button>
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })
      )}

      {/* ⭐ 작성 폼 */}
      <div className="review-form">
        {isState ? (
          <form onSubmit={handleSubmit}>
            <select
              value={newReview.rating}
              onChange={e =>
                setNewReview({
                  ...newReview,
                  rating: Number(e.target.value)
                })
              }
            >
              {[5, 4, 3, 2, 1].map(n => (
                <option key={n} value={n}>{n}점</option>
              ))}
            </select>

            <textarea
              placeholder="리뷰를 작성해주세요"
              value={newReview.content}
              onChange={e =>
                setNewReview({ ...newReview, content: e.target.value })
              }
            />

            <button type="submit">리뷰 작성</button>
          </form>
        ) :
          <p></p>
        }
        <div className="review-footer">
          <a href={`/community/review`} className="view-all-reviews">
            전체 리뷰 보러가기 →
          </a>
        </div>
      </div>
    </div>
  )
}

export default CommentContainer