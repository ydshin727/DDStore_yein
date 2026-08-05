// 관리자페이지에서 공통으로 쓰는 함수를 따로 명시해놓음

import { updateOrFetchGrade } from "../../../community/slice/communityGradeSlice";
import { addNotification } from "../../../payment/slice/notificationSlice";
import { updateOrderStatus } from "../../../payment/slice/paymentSlice";

// 변수들을 받아서 검색 input필드 생성
export const searchInput = (onChange, value, placeholder,
  onSearchBtnFn) => {
  return <input type="text" name='searchDetail' id='searchDetail'
    onChange={onChange} value={value}
    placeholder={placeholder}
    onKeyDown={(e) => { e.key === 'Enter' && onSearchBtnFn() }} />
};

// 변수들을 받아서 필터 select필드 생성
export const FilterInput = (filterStatus, onFilterBtnFn, value, filterName) => {
  return <select value={filterStatus} onChange={onFilterBtnFn}>
    <option value="전체">{filterName}</option>
    {Object.entries(value).map((el, idx) => {
      return <option value={el[0]} key={idx}>{el[1]}</option>
    })}
  </select>
};

// 주문 상태 변경, 알림 DB 추가
export const adminStatusChange = async (order, newStatus, dispatch) => {
  if (confirm(`주문 상태를 [${newStatus}](으)로 변경하시겠습니까?`)) {
    try {
      // 주문 상태 업데이트
      await dispatch(updateOrderStatus({ orderId: order.id, status: newStatus })).unwrap()

      // 알림 DB 저장
      const notiData = {
        userId: order.userId,
        orderId: order.id,
        message: `고객님의 주문이 [${newStatus}] 상태로 변경되었습니다!`,
        date: new Date().toISOString(),
        isRead: false
      }
      dispatch(addNotification(notiData))

      //==============================        DB호출용 (kyunam)            ==============================================
      if (newStatus === '배송완료' || newStatus === '수령완료') { dispatch(updateOrFetchGrade({ userId: order.userId, userName: order.orderName })) }

      alert(`[${newStatus}] 상태로 변경 및 알림 전송 완료`)
    } catch (error) {
      console.error("처리 중 에러 발생: ", error)
      alert("데이터 저장에 실패하였습니다.")
    }

  }
}
// api로 불러온 데이터(혹은 컴포넌트에서 받은 데이터)를 
// 필터링 데이터로 활용하기위해 타입별로 나누는 함수
export const filterData = (posts,type, filterStatus,filterStatus2) => {
  if (!posts) return;
  let result = [...posts];
  switch (type) {
    case 'member':
      return result.filter(data =>
        filterStatus === '전체' || data.userRole === filterStatus
      )
    case 'items':
      return result.filter(data =>
        filterStatus === '전체' || data.category === filterStatus
      )
    // order는 시간을 반환하기때문에 시간별로 내림차순 정렬
    case 'order':
      return result.filter(data =>
        (filterStatus === '전체' || data.status === filterStatus) &&
        (filterStatus2 === '전체' || data.orderPlace === filterStatus2)
      ).sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    // orderstore는 따로 필터링이 필요없기에 기본데이터를 return
    case 'orderstore':
      return result;
    case 'community':
      return result.filter(data =>
        filterStatus === '전체' || data.status === filterStatus
      ).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }
}