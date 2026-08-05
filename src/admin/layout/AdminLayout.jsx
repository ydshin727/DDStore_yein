// 어드민페이지 레이아웃

import { useSelector } from 'react-redux'
import AdminHeader from '../components/common/AdminHeader'
import AdminSide from '../components/common/AdminSide'
import '../css/common/adminLayout.css'
import { Navigate, Outlet } from 'react-router-dom'

const AdminLayout = () => {
  const authState = useSelector(state => state.auth);
  return (
    <>
    {authState&&
    authState.isUser.userRole!=='ROLE_ADMIN'?
    <Navigate to="/" {...alert("접근할 수 없는 페이지입니다.")} />
    :
      <div className="adminLayout">
      {/* 어드민페이지 컨텐츠는 항상 포지션이 고정되어있기때문에 className으로 구분 */}
      <AdminSide />
      <div className="adminLayout-con">
      <AdminHeader />
      <Outlet />
      </div>
      </div>
}
    </>
  )
}

export default AdminLayout
