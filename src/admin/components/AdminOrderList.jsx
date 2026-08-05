import { useSelector } from 'react-redux'
import AdminPaging from './AdminPaging'

// yein - 주문/배송 관리, 알림 발송 -> 나중에 검색, 페이징, 최신순 정렬 추가(우송)

const AdminOrderList = () => {

  const headCon = ['주문일자', '주문자명', '주문상품(수량)',
    '총액','수령방법','현재상태','상태변경'
  ]
  const type = 'order';
  // Redux Store에서 데이터 추출
  const { data: allOrders } = useSelector(state => state.payment)
  return (
    <div className="adminOrder">
      <div className="adminOrder-con">
        {}
        <AdminPaging
            data={allOrders}
                headCon = {headCon}
                type={type}
        />
      </div>
    </div>
  )
}

export default AdminOrderList