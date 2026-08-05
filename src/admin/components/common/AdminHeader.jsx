import '../../css/common/adminHeader.css'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { API_JSON_SERVER_URL } from '../../../apis/commonApi'
import { logoutF } from '../../../auth/slice/authSlice'
import AdminHeaderNavBar from './AdminHeaderNavBar'

// 관리자페이지 헤더

const AdminHeader = () => {
  // 계정정보 불러옴
  const authState = useSelector(state => state.auth);
  // 외부함수를 불러오기위한 변수
  const dispatch = useDispatch();
  // 페이지 이동을 위한 변수
  const navigate = useNavigate();

  const onLogoutClick = () => {
    const isOk = confirm('로그아웃 하시겠습니까?')
    if (isOk) {
      // 로그아웃 함수 호출
      dispatch(logoutF());
      navigate('/');
    }
  }
  return (
    <div className="adminHeader">
      <div className="adminHeader-con">
        <AdminHeaderNavBar />
        <span>{authState.isUser.userName}님</span>
        <span onClick={onLogoutClick} className='clickSpan'>Logout</span>
      </div>
    </div>
  )
}

export default AdminHeader
