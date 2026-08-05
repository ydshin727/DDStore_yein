import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { cancelOrder, fetchPaymentList, updateOrderStatus } from '../slice/paymentSlice'
import Pagination from '../../community/components/common/CommunityPagination'
import '../css/paymentList.css'

// yein - 주문 내역(상세/전체)

// 주문 상태 게이지바
const OrderProgressBar = ({ status, orderPlace }) => {
  // 1. 배달이면 5단계, 매장이면 2단계로 설정
    const steps = orderPlace === '배달' 
    ? ['주문완료', '주문확인', '배송중', '배송완료', '수령완료']
    : ['주문완료', '수령완료']
  // 2. 현재 주문 상태 위치(인덱스) 찾기
  const currentIdx = steps.indexOf(status)
  // 3. 인덱스를 못찾으면 0(첫 단계)로 고정
  const safeIdx = currentIdx === -1 ? 0 : currentIdx
  // 4. 게이지 너비 계산 (마지막 단계일 때 100%)
  const stepWeight = 100 / steps.length
  const progressWidth = (safeIdx === steps.length - 1) ? 100 : (safeIdx * stepWeight) + (stepWeight / 2)
  return (
    <div className="gauge-container">
      <div className="gauge-track">
        <div className="gauge-fill" style={{ width: `${progressWidth}%` }}></div>
      </div>
      <div className="steps-row">
        {steps.map((step, idx) => (
          <div key={step} className={`step-unit ${idx <= safeIdx ? 'active' : ''}`} style={{ flexBasis: `${stepWeight}%` }}>
            <div className="step-point"></div>
            <span className="step-label">{step}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const PaymentList = () => {
  // param 가져오기
  const { orderId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  // Redux Store에서 데이터 추출
  const {data: orderData = [], loading, error} = useSelector(state => state.payment)
  const { isState, isUser } = useSelector(state => state.auth)
  // 유저 정보가 있으면 id 가져오기
  const userId = isUser?.id

  // 페이징 상태 추가
  const [page, setPage] = useState(1)
  const pageRange = 5

  // 스크롤시 페이지 맨 위로 가는 버튼 상태 추가
  const [showTopBtn, setShowTopBtn] = useState(false)

  // 로그인 여부 체크 (URL 접근)
  useEffect(() => {
    if (!isState) {
      alert("로그인 후 이용 가능합니다.")
      navigate('/auth/login', {state: { from: location.pathname }, replace: true})
      return
    }
    // param 있으면 상세 조회, 없으면 내 userId에 해당하는 목록 조회 (Thunk 호출)
    if (userId) {
      dispatch(fetchPaymentList({
        orderId: orderId,
        userId: userId
      }))
    }
  }, [isState, navigate, location.pathname, userId, orderId, dispatch])

  // 페이지 변경시 스크롤 상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [page])

  // 주문 내역 최신순 정렬
  const sortedOrder = useMemo(() => {
    return [...orderData].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
  }, [orderData])

  // 페이징 -> 현재 페이지에 보여줄 데이터 슬라이싱
  const currentOrder = useMemo(() => {
    const indexOfLastItem = page * pageRange
    const indexOfFirstItem = indexOfLastItem - pageRange
    return sortedOrder.slice(indexOfFirstItem, indexOfLastItem)
  }, [sortedOrder, page, pageRange])
  
  // 500px 이상 밑으로 스크롤시 버튼 생성
  useEffect(() => {
    const handleShowBtn = () => {
      if (window.scrollY > 500) setShowTopBtn(true)
      else setShowTopBtn(false)
    }
    window.addEventListener("scroll", handleShowBtn)
    return () => window.removeEventListener("scroll", handleShowBtn)
  }, [])

  // 결제취소 함수
  const handleCancel = useCallback((id) => {
    if (window.confirm("주문을 취소하시겠습니까?")) {
      dispatch(cancelOrder(id))
      alert("주문취소 처리가 되었습니다.")
      navigate('/payment/list', { replace: true })
    }
  }, [dispatch, navigate])

  // 수령완료 함수
  const handleComplete = useCallback((id) => {
    if (window.confirm("수령 완료 처리하시겠습니까?")) {
      dispatch(updateOrderStatus({ orderId: id, status: '수령완료' }))
      alert("수령완료 처리가 되었습니다.")
    }
  }, [dispatch])

  // 로딩 처리
  if (loading) return <div className="pl-loading-con">데이터를 불러오고 있습니다...</div>

  // 에러 처리
  if (error) {
    return (
      <div className="pl-error-con">
        <p>{error}</p>
        <button onClick={() => navigate('/items/best')}>상품 목록으로 돌아가기</button>
      </div>
    )
  }

  // 주문 내역이 없을 경우
  if (!loading && orderData.length === 0) {
    return (
      <div className="pl-empty-cart">
        <p>주문 내역이 존재하지 않습니다.</p>
        <button onClick={() => navigate('/items/best')}>쇼핑하러 가기</button>
      </div>
    )
  }

  return (
    <div className="paymentList">
      <div className="paymentList-con">
        <h2>{orderId ? "주문 상세 내역" : "전체 주문 내역"}</h2>
        
        {/* 주문 정보 출력, 내림차순 (최신순) */}
        {currentOrder.map((order) => {
          return (
            <div className="orderItem" key={order.id}>

              {/* 주문 정보 출력 */}
              <p><strong>주문번호:</strong> {order.id}</p>
              <p><strong>주문일자:</strong> {new Date(order.orderDate).toLocaleString()}</p>
              <p><strong>수령방법:</strong> {order.orderPlace}</p>
              <p><strong>{order.orderPlace === '배달' ? '주문자 주소:' : '매장명:'}</strong> 
              {order.orderPlace === '배달' ? order.orderAddr : order.orderStore}</p>

              {/* 게이지바 추가 -> 현재 주문 상태와 수령방법 넘김 */}
              <OrderProgressBar status={order.status} orderPlace={order.orderPlace} />

              {/* 상세 내역일 때만 출력 */}
              {orderId && (
                <>
                  <p><strong>주문자명:</strong> {order.orderName}</p>
                  <p><strong>주문자 이메일:</strong> {order.orderEmail}</p>
                  <p><strong>결제 수단:</strong> {order.orderPayment}</p>
                </>
              )}
              
              {/* 주문 상품 출력 */}
              <div className="orderProduct">
                {order.carts.map((item) => {
                  return (
                    <div className="orderProduct-con" key={item.itemId} 
                    onClick={() => navigate(`/items/${item.category}/detail/${item.itemId}`)}>
                      <img src={`/images/items_juhee/${item.image}`} alt={item.name} />
                      <div className="orderProduct-info">
                        <p className="name">{item.name}</p>
                        <p>
                          {item.color && <span>색상: {item.color}</span>}
                          {item.color && item.size && ' / '}
                          {item.size && <span>사이즈: {item.size}</span>}
                        </p>
                        <p className="count">{item.count}개</p>
                      </div>
                      <p className="orderProduct-price">
                        {(Number(item.price) * Number(item.count)).toLocaleString()}원
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* 전체 주문 내역일 때만 출력 */}
              {!orderId && (
                <button onClick={() => navigate(`/payment/list/${order.id}`)}>주문 상세 내역 보기</button>
              )}

              {/* 주문완료 상태, 상세 내역일 때만 출력 */}
              {order.status === '주문완료' && orderId && (
                <button onClick={() => handleCancel(order.id)}>결제취소</button>
              )}

              {/* 매장 주문, 주문완료 / 배송중 / 배송완료 상태일 때만 출력 */}
              {((order.orderPlace === '매장' && order.status === '주문완료') || 
                (order.status === '배송중' || order.status === '배송완료')) && (
                <button onClick={() => handleComplete(order.id)}>수령완료</button>
              )}

              <p><strong>총 결제 금액:</strong> {order.totalPrice?.toLocaleString()}원</p>
            </div>
          )
        })}
  
        {/* 페이징 -> 규남님 Pagination 컴포넌트 사용 */}
        {!orderId && (
          <Pagination 
            totalItems={sortedOrder.length} 
            itemsPerPage={pageRange} 
            currentPage={page} 
            onPageChange={(pageNum) => setPage(pageNum)}/>
        )}

        <button onClick={() => navigate('/items/best')}>상품 둘러보기</button>

        {/* 상세 내역일 때만 출력 */}
        {orderId && (
          <button onClick={() => navigate('/payment/list')}>전체 주문 내역 보기</button>
        )}

        {/* 전체 주문내역, 스크롤을 내렸을 때 페이지 맨 위로 가는 span 추가 -> 주희님 svg 사용 */}
        {!orderId && showTopBtn && (
          <span className="scroll-to-top" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </span>
        )}
      </div>
    </div>
  )
}

export default PaymentList