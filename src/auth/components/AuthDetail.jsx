import React, { useEffect, useState } from 'react'
import '../css/authDetail.css'
import { useNavigate, useParams } from 'react-router-dom';
import AuthModal from './AuthModal';
import { useDispatch, useSelector } from 'react-redux';
import { logoutF } from '../slice/authSlice';
import { deleteMemberList, fetchMemberList } from '../slice/authMemberListSlice';

const AuthDetail = () => {
  // authSlice에 있는 자신의 멤버데이터
  const { isUser: memberData } = useSelector(state => state.auth);
  // authMemberSlice에 있는 전체 유저데이터
  const { memberData: memberList } = useSelector(state => state.authMember);
  // 모달창을 위한 bool변수
  const [isBool, setIsBool] = useState(false);
  // 회원 id를 받아오는 파라미터 변수
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // 정보수정 모달창 열기
  const onEditFn = () => {
    setIsBool(true);
  }
  // 정보 삭제 함수
  const onDeleteFn = () => {
    const agree = confirm('정보를 삭제하시겠습니까?');
    if (!agree) return;
    // 멤버삭제 함수 호출
    dispatch(deleteMemberList(id));
    alert('정보가 삭제되었습니다.');
    dispatch(logoutF());
    navigate('/');
  }
  // 멤버리스트 호출
  useEffect(() => {
    dispatch(fetchMemberList());
  }, [dispatch])
  return (
    <>
    {/* 모달창 */}
      {isBool && <AuthModal getData={memberData}
        memberList={memberList} setIsBool={setIsBool}
        onDeleteFn={onDeleteFn}/>}
      <div className="authDetail">
        <div className="right-con">
          <div className="sidebar">
            {/* span을 이용해 햄버거 메뉴를 제작(반응형) */}
            <label htmlFor='menu'
              className={"menuIcon"}>
              <span className='menuSpan' /><span className='menuSpan' /><span className='menuSpan' />
            </label>
            <ul>
              <li>
                <span onClick={() => navigate(`/payment/list/`)}>주문내역</span>
              </li>
              <li>
                <span onClick={() => navigate(-1)}>뒤로가기</span>
              </li>
              <li>
                <span onClick={() => navigate('/items')}>홈으로</span>
              </li>
            </ul>
          </div>
          <div className="default-con">
            <span onClick={() => navigate(`/payment/list/`)}>주문내역</span>
            <span onClick={() => navigate(-1)}>뒤로가기</span>
            <span onClick={() => navigate('/items')}>홈으로</span>
          </div>
        </div>
        <div className="authDetail-con">
          <h1>나의 정보</h1>
          <ul>
            <li><h1>{memberData.userName}님</h1></li>
            <li>
              <span>이메일</span>
              <span>{memberData.userEmail}</span>
            </li>
            <li>
              <span>비밀번호</span>
              <span>{memberData.userPw}</span>
            </li>
            <li>
              <span>이름</span>
              <span>{memberData.userName}</span>
            </li>
            <li>
              <span>주소</span>
              <span>{memberData.userAddr}</span>
            </li>
            <li>
              <button onClick={onEditFn}>정보수정</button>
              <button onClick={onDeleteFn}>정보삭제</button>
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}

export default AuthDetail
