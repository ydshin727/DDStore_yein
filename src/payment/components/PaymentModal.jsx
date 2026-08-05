import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../css/paymentModal.css'

// yein - 추천 상품 모달창

const PaymentModal = ({ items, onConfirm, onClose, onJustClose, onRecommendClick, isOrderPage }) => {
  const navigate = useNavigate()

  // 상품 상세에서 넘겨준 함수가 있다면 그거 실행, 없으면 추천 상품 링크로 이동
  const handleItemClick = (item) => {
    onJustClose()
    onRecommendClick ? onRecommendClick(item) : navigate(`/items/${item.category}/detail/${item.id}`)
  }

  return (
    // 모달창 바깥 클릭시 onJustClose 실행 (모달창 닫힘)
    <div className="pm-modal-overlay" onClick={onJustClose}>
      <div className="pm-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="pm-modal-header">
          <h3 className="pm-title">{isOrderPage ? "결제가 완료되었습니다!" : "잠깐! 이 상품은 어떠세요?"}</h3>
          <p className="pm-desc">{isOrderPage ? "주문하신 상품과 함께 보면 좋은 상품입니다." : "함께 구매하면 좋은 추천 상품입니다."}</p>
        </div>

        <div className="pm-recommend-list">
          {items.map(item => (
            <div className="pm-recommend-item" key={item.id} 
              onClick={() => handleItemClick(item)}>
              <img src={`/images/items_juhee/${item.image}`} alt={item.name} />
              <p className="pm-item-name">{item.name}</p>
              <p className="pm-item-price">{Number(item.price).toLocaleString()}원</p>
            </div>
          ))}
        </div>

        <div className="pm-modal-btns">
          <button className="pm-close-btn" onClick={onClose}>더 둘러보기</button>
          <button className="pm-confirm-btn" onClick={onConfirm}>{isOrderPage ? '내 주문 보기' : '그냥 결제하기'}</button>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal