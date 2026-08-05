import { useSelector } from 'react-redux';
import '../css/adminMain.css'
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 전체 통계
const AdminMain = () => {
  // 총 매출 계산값을 저장할 변수
  const [sales, setSales] = useState(0)
  // authSlice에서 멤버리스트 가져오기
  const { memberData: memberList } = useSelector(state => state.authMember);
  // communityOrderStreSlice에서 가게리스트 가져오기
  const { orderstores: storeList } = useSelector(state => state.orderstore);
  // paymentSlice에서 주문리스트 가져오기
  const { data: orderList } = useSelector(state => state.payment);
  // communitySlice에서 qna 게시판 글들 가져오기
  const { items: qnaList } = useSelector(state => state.community);
  // itemsSlice에서 아이템리스트 가져오기
  const { data: productList } = useSelector(state => state.item);

  // onclick시 이동하게 해주는 navigate함수 선언
  const navigate = useNavigate();

  // 매출계산
  useEffect(()=>{
    orderList.map((e) => {
        // 완료물품만 총 매출에 합산
        if (e.status === '배송완료' || e.status === '수령완료') {
          setSales(prev => prev + e.totalPrice);
        }
      })
  },[])
  return (
    <div className="adminMain">
      <div className="adminMain-con">
        <ul>
          <li onClick={() => navigate('/admin/member')}>
            <span>총 회원의 수</span>
            <span>{memberList && memberList.length}</span>
          </li>
          <li onClick={() => navigate('/admin/product')}>
            <span>등록된 제품의 갯수</span>
            <span>{productList && productList.length}</span>
          </li>
          <li onClick={() => navigate('/admin/order')}>
            <span>총 매출</span>
            <span>{sales}</span>
          </li>
          <li onClick={() => navigate('/admin/order')}>
            <span>배송 미완료 상품수</span>
            {/* 배송완료, 수령완료 안된 물품들 필터링 */}
            <span>{orderList && orderList.filter(e => {
          if (e.status !== '배송완료' && e.status !== '수령완료') {
            return e;
          }
        }).length}</span>
          </li>
          <li onClick={() => navigate('/admin/orderstore')}>
            <span>오프라인 가게의 수</span>
            <span>{storeList && storeList.length}</span>
          </li>
          <li onClick={() => navigate('/admin/qna')}>
            <span>답변 대기중인 qna 수</span>
            {/* 답변 대기중인 qna(Pending)중 admin을 제외한 나머지 필터링 */}
            <span>{qnaList && qnaList.filter((el, idx) => {
          if (el.author !== 'admin') {
            return el;
          }
        }).length}</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default AdminMain
