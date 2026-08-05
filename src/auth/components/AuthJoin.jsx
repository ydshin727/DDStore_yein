import React, { useEffect, useRef, useState } from 'react'
import '../css/authJoin.css'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMemberList, postMemberList } from '../slice/authMemberListSlice'
import { checkData, checkNotData, validateEmail, validatePass } from './AuthCommonFn'

const initUserData = {
  userEmail: '',
  userPw: '',
  userName: '',
  userAddr: '',
  userRole: 'ROLE_MEMBER'
}
const AuthJoin = () => {
  // 회원가입정보를 담게될 변수
  const [joinData, setJoinData] = useState(initUserData);
  // 패스워드 체크용 변수(저장, value로 보여줄 변수)
  const [pwdCheck, setPwdCheck] = useState('');
  // 비밀번호 확인용 변수
  const [isPwd, setIsPwd] = useState(true);
  // 비밀번호 확인을 실시간으로 하기위해 useRef사용
  const testPwd = useRef('');
  // 이메일 중복 체크를 위한 변수
  const [isEmail, setIsEmail] = useState(true);
  // 이메일 확인을 실시간으로 하기위해 useRef사용
  const testEmail = useRef('');
  // 저장되어있는 멤버리스트의 데이터를 불러옴(전체 멤버리스트 데이터)
  const { memberData: userData } = useSelector(state => state.authMember)
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 전체 멤버리스트 호출
  useEffect(() => {
    dispatch(fetchMemberList());
  }, [dispatch])

  // 비밀번호 확인 함수
  const isCheckPwdFn = (e)=>{
    testPwd.current = e.target.value;
    // 적어놓은 비밀번호와 일치하지않을 경우
    if (testPwd.current !== joinData.userPw) {
      setIsPwd(false);
      return;
    }else{
      setIsPwd(true);
    }
  }
  // 이메일 실시간 확인 함수
  const isCheckEmailFn = (e)=>{
    testEmail.current = e.target.value;
    // 맨처음에 이메일의 형식이 맞는지부터 검사
    if (testEmail.current !==''&&validateEmail(testEmail.current)) {
      setIsEmail(false);
      return;
    }else{
      // 이메일이 중복되었는지 검사
      if (userData.find(el => el.userEmail === testEmail.current)) {
        setIsEmail(false);
        return;
      }else{
      setIsEmail(true);
    }
    }
  }
  // 회원가입 함수
  const onJoinFn = (el) => {
    // 정보가 하나라도 비어있으면 진행X
    if (checkNotData(joinData) !== undefined) {
      alert('정보가 비어있습니다.');
      return;
    }
    // 이메일 형식체크
    if (validatePass(testEmail.current)) {
      return;
    }
    // 이메일중복체크
    if (userData.find(el => el.userEmail === testEmail.current)) {
        return;
      }
    // 비밀번호 형식체크
    if (validatePass(joinData.userPw)) {
      return;
    }
    dispatch(postMemberList(joinData));
    alert('회원가입 성공');
    navigate('/auth/login', { state: { from: '/items' } });
  }
  const onChangeFn = (e) => {
    const { name, value } = e.target;
    setJoinData({ ...joinData, [name]: value });
  }
  
  return (
    <div className="authJoin">
      <div className="authJoin-con">
        <h1 className="logo">
          <Link to={'/'}>
            <img src='/images/items_juhee/dangdang_logo.png' alt='dangdang_logo.png' />
          </Link>
        </h1>
        <ul>
          <li><h4>회원가입</h4></li>
          <li className='join-input'>
            <span className='front'>이름</span>
            <span className='back'>
              <input type="text" name='userName' id='userName'
                onChange={onChangeFn} value={joinData.userName}
                placeholder='이름' />
            </span>
          </li>
          <li className='join-input'>
            <span className='front'>이메일</span>
            <span className='back'>
              <input type="email" name='userEmail' id='userEmail'
                onChange={()=>{
                  onChangeFn(event)
                  isCheckEmailFn(event)
                }} value={joinData.userEmail}
                placeholder='이메일' />
            </span>
          </li>
          {/* 이메일형식이 맞으면 중복체크 메세지로 변경 */}
          {!isEmail && validateEmail(testEmail.current)?
            <li className='check'>
              <span>*이메일 형식이 맞지 않습니다.</span>
            </li>:!isEmail ?
            <li className='check'>
              <span>*이메일이 중복되었습니다.</span>
            </li>:<></>}
          <li className='join-input'>
            <span className='front'>비밀번호</span>
            <span className='back'>
              <input type="password" name='userPw' id='userPw'
                onChange={onChangeFn} value={joinData.userPw}
                maxLength="16"
                placeholder='영문/숫자/특수문자 혼합 8~16자' />
            </span>
          </li>
          <li className='join-input'>
            <span className='front'>비밀번호확인 </span>
            <span className='back'>
              <input type="password" name='userPw' id='userPw'
                onChange={() => {
                  setPwdCheck(event.target.value);
                  isCheckPwdFn(event);
                }} value={pwdCheck}
                maxLength="16"
                placeholder='비밀번호를 다시 입력해주세요.' />
            </span>
          </li>
          {/* 비밀번호가 맞지않을때만 메세지 출력 */}
          {!isPwd ?
            <li className='check'>
              <span>*비밀번호가 일치하지 않습니다.</span>
            </li>:<></>}
          <li className='join-input'>
            <span className='front'>주소</span>
            <span className='back'>
              <input type="text" name='userAddr' id='userAddr'
                onChange={onChangeFn} value={joinData.userAddr}
                placeholder='주소' />
            </span>
          </li>
          <li className='join-input'>
            <span className='front'>가입종류</span>
            <span className='back'>
              <select name="userRole" id="userRole"
                onChange={onChangeFn} value={joinData.userRole}>
                <option value="ROLE_MEMBER">일반회원</option>
                <option value="ROLE_ADMIN">관리자</option>
              </select>
            </span>
          </li>
        </ul>
        <div className="button-area">
          <button onClick={onJoinFn}>회원가입</button>
          <button onClick={() => navigate('/auth/login', { state: { from: '/items' } })}>로그인</button>
          <button onClick={() => navigate('/items')}>홈으로</button>
        </div>
      </div>
    </div>
  )
}

export default AuthJoin
