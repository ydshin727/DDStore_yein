import React, { useEffect, useState } from 'react'
import '../css/authLogin.css'
import { useDispatch, useSelector } from 'react-redux';
import { loginF } from '../slice/authSlice';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {  fetchMemberList } from '../slice/authMemberListSlice';
import { checkData, checkNotData, validateEmail } from './AuthCommonFn';

const initUserData = {
  userEmail: '',
  userPw: ''
}

const AuthLogin = () => {
  const navigate = useNavigate();
  // 로그인 정보들 담게될 변수
  const [loginData, setLoginData] = useState(initUserData);
  // 저장되어있는 멤버리스트의 데이터를 불러옴(전체 멤버리스트 데이터)
  const { memberData: userData } = useSelector(state => state.authMember)
  const dispatch = useDispatch();
  const onChangeFn = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };
  // 로그인시 로그인정보 비교를 위해 멤버리스트 불러오기
  useEffect(() => {
    dispatch(fetchMemberList());
  }, [dispatch])
  // yein 추가
  const location = useLocation()
  // 로그인 호출할 때 navigate에 from문 작성안했으면 자동으로 전페이지로 이동하게끔
  const redirectUrl = location.state?.from || -1;
  
  // 로그인시 정보 체크 & 이메일 형식 체크
  const loginFn = async (e) => {
    try {
      if (checkNotData(loginData) !== undefined) {
        alert('정보가 비어있습니다.');
        return;
      }
      if (validateEmail(loginData.userEmail)) {
        alert('이메일 형식이 맞지 않습니다.');
        return;
      }
      if (!checkData('userEmail', loginData, userData)) {
        alert('이메일 정보가 일치하지 않습니다.');
        return;
      }
      if (!checkData('userPw', loginData, checkData('userEmail', loginData, userData))) {
        alert('비밀번호 정보가 일치하지 않습니다.');
        return;
      }
      alert('로그인 성공');
      dispatch(loginF(checkData('userEmail', loginData, userData)));
      // yein 수정
      navigate(redirectUrl, { replace: true })
    } catch (err) {
      alert(err);
    }
  }
  return (
    <div className="authLogin">
      <div className="authLogin-con">
        <h1 className="logo">
          <Link to={'/'}>
            <img src='/images/items_juhee/dangdang_logo.png' alt='dangdang_logo.png' />
          </Link>
        </h1>
        <ul>
          <li>
            <h4>로그인</h4>
          </li>
          <li className='login-input'>
            <span className='front'>이메일</span>
            <span className='back'><input type="email" name='userEmail' id='userEmail' placeholder='이메일'
              onChange={onChangeFn} value={loginData.userEmail}
              onKeyDown={(e) => e.key === 'Enter' && loginFn()} />
            </span>
          </li>
          <li className='login-input'>
            <span className='front'>비밀번호</span>
            <span className='back'><input type="password" name='userPw' id='userPw' placeholder='비밀번호'
              onChange={onChangeFn} value={loginData.userPw}
              onKeyDown={(e) => e.key === 'Enter' && loginFn()} />
            </span>
          </li>
        </ul>
        <div className="button-area">
          <button onClick={()=>loginFn()}>로그인</button>
          <button onClick={() => navigate('/auth/join')}>회원가입</button>
        </div>
      </div>
    </div>
  )
}

export default AuthLogin
