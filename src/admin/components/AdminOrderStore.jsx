import React from 'react'
import AdminPaging from './AdminPaging'
import { useSelector } from 'react-redux';

const AdminOrderStore = () => {
  const headCon = ['가게명', '주소', '전화번호', ''];
  const type = 'orderstore';
  // communityOrderStreSlice에서 가게리스트 가져오기
  const {orderstores : storeList} = useSelector(state => state.orderstore);
  return (
    <>
      <AdminPaging
        data={storeList}
        headCon={headCon}
        type={type}
      />
    </>
  )
}

export default AdminOrderStore
