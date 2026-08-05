import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { fetchPayment, fetchStore } from '../slice/paymentSlice'
import { clearCart } from '../../cart/slice/cartSlice'
import PaymentModal from './PaymentModal'
import useRecommend from './useRecommend'
import '../css/paymentOrder.css'

// yein - 주문 확인

const PaymentOrder = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  // Redux Store에서 데이터 추출
  const { data: cartItems = [], loading: cartLoading } = useSelector(state => state.cart)
  const { store: storeList = [], loading: paymentLoading, error: paymentError } = useSelector(state => state.payment)
  const { isState, isUser } = useSelector(state => state.auth)
  
  // 방금 결제 완료된 주문 ID
  const [lastOrderId, setLastOrderId] = useState(null)
  // 결제 완료 확인용 상태
  const [isFinish, setIsFinish] = useState(false)
  
  // 주문자 정보 저장
  const [orderInfo, setOrderInfo] = useState({
    orderName: '',
    orderEmail: '',
    orderAddr: '',
    orderPayment: '',
    orderPlace: '', 
    orderStore: ''
  })

  // 단일 상품 결제(바로 결제) or 장바구니 결제 구분
  // location.state에 singleOrder이 있으면 그것만 쓰고, 없으면 장바구니 아이템 사용
  const displayItems = useMemo(() => {
    return location.state?.singleOrder ? [location.state.singleOrder] : (cartItems || [])
  }, [location.state, cartItems])
  
  // 추천 상품 훅 사용 (useRecommend) -> displayItems 제외한 추천 상품 (yein)
  const { showModal, recommendItems, openRecommendModal, closeRecommendModal } = useRecommend(displayItems) 

  // 장바구니 상품들의 총 금액 합계 계산
  const total = useMemo(() => {
    return displayItems.reduce((sum, item) => sum + (item.price * item.count), 0) || 0
  }, [displayItems])

  // 모든 입력 필드가 다 채워졌는지 확인 (공백 제거)
  const isAllFilled = useMemo(() => {
    const { orderName, orderEmail, orderAddr, orderPayment, orderPlace, orderStore } = orderInfo
    const baseCheck = orderName.trim() && orderEmail.trim() && orderAddr.trim() && orderPayment && orderPlace
    return orderPlace === '매장' ? (baseCheck && orderStore) : baseCheck
  }, [orderInfo])

  // 로그인 여부 체크 (URL 접근)
  useEffect(() => {
    if (!isState) {
      alert("로그인이 필요한 서비스입니다.")
      navigate('/auth/login', { state: { from: location.pathname }, replace: true })
    } else {
      // 로그인 됐으면 매장 목록 불러오기
      dispatch(fetchStore())
    }
  }, [isState, navigate, location.pathname, dispatch])

  // input 값 입력시 상태 업데이트 함수
  const orderChange = useCallback((e) => {
    const {name, value} = e.target
    setOrderInfo(prev => ({
      ...prev,
      [name]: value,
      // 수령방법이 매장이 아니면 주문처 선택값 초기화
      ...(name === 'orderPlace' && value != '매장' ? { orderStore: '' } : {})
    }))
  }, [])

  // 회원 정보 불러오기 함수 (체크박스)
  const copyUserInfo = useCallback((e) => {
    if (e.target.checked) {
      // 체크 -> user 정보를 orderInfo에 넣음
      setOrderInfo(prev => ({
        ...prev,
        orderName: isUser?.userName || '',
        orderEmail: isUser?.userEmail || '',
        orderAddr: isUser?.userAddr || ''
      }))
    } else {
      // 체크 해제 -> 초기화
      setOrderInfo(prev => ({
        ...prev,
        orderName: '',
        orderEmail: '',
        orderAddr: ''
      }))
    }
  }, [isUser])

  // 결제 실행
  const goToPayment = async () => {
    if (!isAllFilled) return alert("모든 주문 정보를 입력해주세요")
    // 1. order DB에 저장될 데이터
    const paymentData = {
      ...orderInfo,
      // 현재 로그인한 유저 id
      userId: isUser?.id,
      carts: displayItems,
      totalPrice: total,
      orderDate: new Date().toISOString(),
      // 주문 상태 (초기값은 주문완료)
      status: '주문완료',
      // 상세페이지 결제시(singleOrder 존재) false, 없으면 true
      isCartOrder: !location.state?.singleOrder
    }
    // 2. paymentSlice -> Thunk 호출
    const result = await dispatch(fetchPayment(paymentData))
    // Thunk 처리가 성공했을 때만 주문 리스트 페이지로 이동 (param에 주문 id 넘김)
    if (result.meta.requestStatus === 'fulfilled') {
      // 결제 완료로 상태 변경
      setIsFinish(true)
      // 장바구니 결제일 때만 장바구니 비우기
      if (!location.state?.singleOrder) dispatch(clearCart())
      const newOrderId = result.payload.id
      setLastOrderId(newOrderId)
      // 결제 완료 후 추천 상품 모달 열기
      // 추천 상품이 있어서 모달이 열리면 true, 없으면 false 반환
      const isOpened = openRecommendModal()
      // 추천할 상품이 없다면 결제 상세 내역으로 이동
      if (!isOpened) navigate(`/payment/list/${newOrderId}`, { replace: true })
    } else {
      alert("결제 처리 중 오류가 발생했습니다.")
    }
  }

  // 로그인 안되어있으면 내용 안보여주기
  if (!isState) return null

  // 로딩 처리
  if (cartLoading || paymentLoading) return <div className="po-loading-con">데이터를 불러오고 있습니다...</div>

  // 장바구니에 아이템이 없을 경우
  if (!isFinish && !cartLoading && displayItems.length === 0) {
    return (
      <div className="po-empty-cart">
        <p>주문할 상품이 없습니다.</p>
        <button onClick={() => navigate('/items/best')}>쇼핑하러 가기</button>
      </div>
    )
  }
  
  // 에러 처리
  if (paymentError) {
    return (
      <div className="po-error-con">
        <p>{paymentError}</p>
        <div className="po-btn-group">
          <button onClick={() => navigate('/items/best')}>쇼핑하러 가기</button>
          <button onClick={() => navigate('/cart')}>장바구니로 돌아가기</button>
        </div>
      </div>
    )
  }

  return (
    <div className="paymentOrder">
      <div className="paymentOrder-con">
        <h2>주문 확인</h2>

        <div className="item-list">
          {/* 장바구니 아이템 출력 */}
          {displayItems.map(item => (
            <div key={item.itemId}>
              <img src={`/images/items_juhee/${item.image}`} alt={item.name} />
              <div className="item-info-text">
                <p>{item.name}</p>
                <div className="item-option">
                  {item.color && <span>{item.color}</span>}
                  {item.size && <span>{item.size}</span>}
                </div>
              </div>
              <p className="item-count">{item.count}개</p>
              <p className="item-price">{(item.price * item.count).toLocaleString()}원</p>
            </div>
          ))}
        </div>
        
        <div className="order-info">
          {/* 회원 정보 불러오기 */}
          <input type="checkbox" name="checkCopyUser" id="copyUserInfo" onChange={copyUserInfo} />
          <label htmlFor="copyUserInfo">회원 정보와 동일</label>

          {/* 필수 입력폼 (orderDB에 저장될 값) */}
          <p>* 주문자명</p>
          <input type="text" name="orderName" id="orderName" 
          value={orderInfo.orderName} onChange={orderChange}/>

          <p>* 주문자 이메일</p>
          <input type="email" name="orderEmail" id="orderEmail"
          value={orderInfo.orderEmail} onChange={orderChange}/>

          <p>* 주문자 주소</p>
          <input type="text" name="orderAddr" id="orderAddress"
          value={orderInfo.orderAddr} onChange={orderChange}/>

          <p>* 결제 방법</p>
          <select name="orderPayment" id="orderPayment" 
          value={orderInfo.orderPayment} onChange={orderChange}>
            <option value="">결제 수단 선택</option>
            <option value="카카오페이">카카오페이</option>
          </select>

          <p>* 상품 수령 방법</p>
          <select name="orderPlace" id="orderPlace" 
          value={orderInfo.orderPlace} onChange={orderChange}>
            <option value="">상품 수령 방법 선택</option>
            <option value="배달">배달</option>
            <option value="매장">매장</option>
          </select>

          {/* 상품 수령 방법이 매장일 때만 매장 선택 박스 표시 */}
          {orderInfo.orderPlace === '매장' && (
            <div className="store-con">
              <p>* 방문하실 지점</p>
              <select name="orderStore" id="orderStore" value={orderInfo.orderStore} onChange={orderChange}>
                <option value="">지점을 선택해주세요</option>
                {storeList.map(item => (
                  <option key={item.id} value={item.name}>{item.name}</option>
                ))}
              </select>
            </div>
          )}

        </div>
        
        <h3>총 금액: {total.toLocaleString()}원</h3>

        <div className="btn-group">
          <div className="left-btns">
            <button onClick={() => navigate('/items/best')}>상품 둘러보기</button>
            <button onClick={() => navigate('/cart')}>장바구니</button>
          </div>
          <button className="pay-btn" onClick={goToPayment}>결제하기</button>
        </div>
      </div>

      {/* 추천 상품 - 모달 띄우기 */}
      {showModal && (
          <PaymentModal 
            items={recommendItems}
            // 결제창이라고 전달
            isOrderPage={true}
            // 모달창 바깥 클릭시 창 닫기
            onJustClose={() => {
              closeRecommendModal()
              navigate(`/payment/list/${lastOrderId}`, { replace: true })
            }}
            // 그냥 결제하기 -> 내 주문 확인하기
            onConfirm={() => {
              closeRecommendModal()
              navigate(`/payment/list/${lastOrderId}`, { replace: true })
            }}
            // 더 둘러보기
            onClose={() => {
              closeRecommendModal()
              navigate('/items/best')
            }}
          />
        )}
    </div>
  )
}

export default PaymentOrder