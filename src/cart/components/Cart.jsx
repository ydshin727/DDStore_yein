import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCart, patchCartCount, deleteCartItem, patchCartOption } from '../slice/cartSlice'
import { useLocation, useNavigate } from 'react-router-dom'
import PaymentModal from '../../payment/components/PaymentModal'
import useRecommend from '../../payment/components/useRecommend'
import '../css/cart.css'

// yein - 장바구니

const Cart = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  // Redux Store에서 데이터 추출
  const { data: cartItems = [], loading, error } = useSelector(state => state.cart)
  const { isState, isUser } = useSelector(state => state.auth)
  // 유저 정보가 있으면 id 가져오기
  const userId = isUser?.id

  // 추천 상품 훅 사용 (useRecommend) -> cartItems 제외한 추천 상품
  const { dbItems, showModal, recommendItems, openRecommendModal, closeRecommendModal } = useRecommend(cartItems)

  // 로그인 여부 체크 (URL 접근)
  useEffect(() => {
    // 장바구니에서 로그아웃시 보낸 세션 스토리지 받아옴
    const isLogout = sessionStorage.getItem('isLogout')
    if (!isState) {
      // 장바구니 로그아웃이면 alert 안띄우고 바로 리턴
      if (isLogout) {
        sessionStorage.removeItem('isLogout')
        return
      }
      alert("로그인이 필요한 서비스입니다.")
      // 뒤로가기 했을 때 장바구니로 안가게 처리
      navigate('/auth/login', { state: { from: location.pathname }, replace: true })
    }
  }, [isState, navigate, location.pathname])

  // 장바구니 불러오기
  useEffect(() => {
    if (isState && userId) dispatch(fetchCart(userId))
  }, [dispatch, isState, userId])

  // 수량 증감 함수
  const handleCountChange = useCallback((item, amount) => {
    const nextCount = item.count + amount
    // 수량이 0보다 작으면 아이템 삭제
    if (nextCount <= 0) {
      if (window.confirm("상품을 삭제하시겠습니까?")) dispatch(deleteCartItem(item.id))
      return
    }
    dispatch(patchCartCount({ cartId: item.id, count: nextCount }))
  }, [dispatch])

  // 옵션 변경 함수
  const handleOptionChange = useCallback((item, type, value) => {
    const newColor = type === 'color' ? value : item.color
    const newSize = type === 'size' ? value : item.size
    const updateOption =  {
      cartId: item.id,
      ...(newColor && { color: newColor }),
      ...(newSize && { size: newSize })
    }
    dispatch(patchCartOption(updateOption))
  }, [dispatch])

  // 장바구니 아이템 삭제 함수
  const handleDelete = useCallback((id) => {
    if (window.confirm("해당 상품을 삭제하시겠습니까?")) dispatch(deleteCartItem(id))
  }, [dispatch])

  // 총 장바구니 금액
  const total = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = Number(item.price) || 0
      const count = Number(item.count) || 0
      return sum + (price * count)
    }, 0)
  }, [cartItems])
 
  // 추천 상품 - 결제하기 함수
  const handleCheckoutClick = useCallback(() => {
    if (cartItems.length === 0) return
    // 추천 상품이 있어서 모달이 열리면 true, 없으면 false 반환
    const isOpened = openRecommendModal()
    // 추천할 상품이 없다면 결제 페이지로 이동
    if (!isOpened) navigate('/payment/order')
  }, [cartItems.length, openRecommendModal, navigate]) 

  // 로딩 처리
  if (loading && cartItems.length === 0) return <div className="cart-loading-con">데이터를 불러오고 있습니다...</div>

  // 에러 처리
  if (error) {
    return (
      <div className="cart-error-con">
        <p>{error}</p>
        <button onClick={() => dispatch(fetchCart(userId))}>다시 시도하기</button>
      </div>
    )
  }

  // 장바구니 비어있을 때
  if (cartItems.length === 0) {
    return (
      <div className="cart-empty-cart">
        <p>장바구니가 비어있습니다.</p>
        <button onClick={() => navigate('/items/best')}>쇼핑하러 가기</button>
      </div>
    )
  }

  return (
    <div className="cart">
      <div className="cart-con">
        <h2>장바구니</h2>

        <div className="cart-list">
          {/* 장바구니 아이템 출력 */}
          {cartItems.map(item => {
            // 해당 상품 원본 옵션 데이터 찾기
            const originalItem = dbItems.find(db => db.id === item.itemId)
            return (
              <div key={item.id} className='cart-list-con'
              onClick={() => navigate(`/items/${item.category}/detail/${item.itemId}`)}>
                <img src={`/images/items_juhee/${item.image}`} alt={item.name} />
                <p>{item.name}</p>

                {/* 버튼 클릭시 상품 디테일로 이동 안되게 막아두기 */}
                <div className="option-control" onClick={(e) => e.stopPropagation()}>
                  {/* 색상 변경 */}
                  {originalItem?.options?.color && (
                    <select 
                      value={item.color || ''} 
                      onChange={(e) => handleOptionChange(item, 'color', e.target.value)}>
                      {originalItem.options.color.map(oc => (
                        <option key={oc} value={oc}>{oc}</option>
                      ))}
                    </select>
                  )}
                  {/* 사이즈 변경 */}
                  {originalItem?.options?.size && (
                      <select 
                        value={item.size || ''} 
                        onChange={(e) => handleOptionChange(item, 'size', e.target.value)}>
                        {originalItem.options.size.map(os => (
                          <option key={os} value={os}>{os}</option>
                        ))}
                      </select>
                    )}
                </div>

                {/* 버튼 클릭시 상품 디테일로 이동 안되게 막아두기 */}
                <div className="count-control" onClick={(e) => e.stopPropagation()}>
                  {/* 수량 변경 */}
                  <button onClick={() => handleCountChange(item, -1)}>-</button>
                  <span>{item.count}</span>
                  <button onClick={() => handleCountChange(item, 1)}>+</button>
                </div>

                <p>{((Number(item.price) || 0) * (Number(item.count) || 0)).toLocaleString()}원</p>
                
                {/* 버튼 클릭시 상품 디테일로 이동 안되게 막아두기 */}
                <button onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(item.id)
                }}>x</button>
              </div>
            )
          })}
        </div>

        <h3>총 금액: {total.toLocaleString()}원</h3>

        <div className="cart-btn">
          <button onClick={() => navigate('/items/best')}>상품 둘러보기</button>
          <button onClick={handleCheckoutClick}>결제하기</button>
        </div>

        {/* 추천 상품 - 모달 띄우기 */}
        {showModal && (
          <PaymentModal 
            items={recommendItems}
            // 모달창 바깥 클릭시 창 닫기
            onJustClose={closeRecommendModal}
            // 그냥 결제하기
            onConfirm={() => {
              closeRecommendModal()
              navigate('/payment/order')
            }}
            // 더 둘러보기
            onClose={() => {
              closeRecommendModal()
              navigate('/items/best')
            }}
          />
        )}
      </div>
    </div>
  )
}

export default Cart
