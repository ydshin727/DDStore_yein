import { useDispatch } from 'react-redux';
import '../../css/common/adminSide.css'
import { Link } from 'react-router-dom'
import { fetchMemberList } from '../../../auth/slice/authMemberListSlice';
import { fetchPaymentListAdmin } from '../../../payment/slice/paymentSlice';
import { fetchOrderStores } from '../../../community/slice/communityOrderStoreSlice';
import { fetchCommunityList } from '../../../community/slice/communitySlice';
import { useEffect } from 'react';
import { fetchItemList } from '../../../items/slice/itemSlice';

// 관리자페이지 사이드메뉴
// 공통요소이므로 useEffect로 필요한 데이터 전체적으로 호출해서 사용함

const AdminSide = () => {
  const dispatch = useDispatch();
  // 각 데이터 비동기 청크 호출
  useEffect(()=>{
    // 멤버리스트
    dispatch(fetchMemberList());
    // 아이템리스트
    dispatch(fetchItemList());
    // 주문내역
    dispatch(fetchPaymentListAdmin())
    // 가게리스트
    dispatch(fetchOrderStores());
    // qna리스트
    dispatch(fetchCommunityList('qna'));
  },[dispatch])
  return (
    <div className="adminSide">
      <div className="adminSide-con">
        <ul>
          <li><h1 className='logo'><Link to={'/items'}>
          <img src='/images/items_juhee/dangdang_logo.png' alt='dangdang_logo.png'/>
          </Link></h1></li>
          <li><Link to={'/admin'}>Main</Link></li>
          <li><Link to={'/admin/member'}>Member</Link></li>
          <li><Link to={'/admin/product'}>Product</Link></li>
          <li><Link to={'/admin/productadd'}>ProductAdd</Link></li>
          {/* yein 추가 */}
          <li><Link to={'/admin/order'}>orderList</Link></li>
          <li><Link to={'/admin/orderstore'}>Store</Link></li>
          <li><Link to={'/admin/qna'}>QnA</Link></li>
        </ul>
      </div>
    </div>
  )
}

export default AdminSide
