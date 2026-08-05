import React, { useEffect, useRef, useState } from 'react'
import '../css/authModal.css'
import { API_JSON_SERVER_URL } from '../../apis/commonApi';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginF, logoutF } from '../slice/authSlice';
import { checkData } from './AuthCommonFn';
import { putMemberList } from '../slice/authMemberListSlice';
import axios from 'axios';

const AuthModal = ({ getData, memberList, setIsBool, onDeleteFn }) => {
  // 회원정보 페이지에서 가져온 데이터를 modal에서 수정하기위한 변수
  const [modalDetailData, setModalDetailData] = useState(getData);
  // 결제금액, 등급을 저장할 변수
  const [paymentData, setPaymentData] = useState(0);
  const [paymentGrade, setPaymentGrade] = useState('');
  const navigate = useNavigate();
  // 이메일 오류시 이메일 인풋필드에 커서를 놓기위한 변수
  const inputRefEmail = useRef(null);
  const dispatch = useDispatch();
  // 모달창 닫기 함수
  const closeFn = (e) => {
    setIsBool(false);
  }
  const onChangeFn = (e) => {
    const { name, value } = e.target
    setModalDetailData({ ...modalDetailData, [name]: value });
  }
  // 정보수정 함수
  const onEditFn = async (e) => {
    const agree = confirm('회원정보를 수정하시겠습니까?');
    if (!agree) return;
    // 이메일과 비밀번호를 변경하지 않았는지 체크
    if (modalDetailData.userEmail === getData.userEmail
      && modalDetailData.userPw === getData.userPw
    ) {
      // 중요데이터가 변경되지 않았다면 바로 수정사항 적용
      dispatch(putMemberList(modalDetailData));
      dispatch(loginF(modalDetailData));
      closeFn();
    }
    // 이메일, 비밀번호 둘중 하나라도 바꿨다면
    else {
      // 이메일정보가 다르다면 체크
      if (modalDetailData.userEmail !== getData.userEmail) {
        // 이메일 형식부터 체크
        if (validateEmail(modalDetailData.useRemail)) {
          alert('이메일 형식이 맞지 않습니다.');
          return;
        }
        // 이메일 중복체크
        if (checkData('userEmail', modalDetailData, memberList)) {
          alert('이미 존재하는 이메일입니다.');
          inputRefEmail.current.focus();
          return;
        }
      }
      // 비밀번호만 바꿨으면 수정사항 적용 후 로그인창으로 이동
      else {
        dispatch(putMemberList(modalDetailData));
        dispatch(logoutF());
        navigate('/auth/login', { state: { from: '/items' } });
      }
    }
  }

  // 유저의 등급, 결제내역 불러오기
  useEffect(() => {
    onPaymentDataFn();
  }, [])
  const onPaymentDataFn = async () => {
    try {
      const res = await axios.get(`${API_JSON_SERVER_URL}/grades?userId=${String(getData.id)}`);
      // 만약 정보가 없다면 아무것도 리턴하지 않음
      if (res.data.length !== 0) {
        res.data.map(el => {
          // 데이터는 사용한 금액과 등급만 가져오기
          setPaymentData(el.totalSpent);
          setPaymentGrade(el.currentGrade);
        });
      }
    } catch (err) {
      alert(err);
    }
  }
  return (
    <div className="authDetailModal" onClick={closeFn}>
      <div className="authDetailModal-con" onClick={(e) => e.stopPropagation()}>
        <span className='close' onClick={closeFn}>X</span>
        <ul>
          <li>
            <h1>회원정보 수정</h1>
          </li>
          <li>
            <span className='front'>이름</span>
            <span className='back'><input type="text" id='userName' name='userName'
              onChange={onChangeFn} value={modalDetailData.userName} />
            </span>
          </li>
          <li>
            <span className='front'>이메일</span>
            <span className='back'><input type="email" id='userEmail' name='userEmail'
              onChange={onChangeFn} value={modalDetailData.userEmail}
              ref={inputRefEmail} />
            </span>
          </li>
          <li>
            <span className='front'>비밀번호</span>
            <span className='back'><input type="text" id='userPw' name='userPw'
              onChange={onChangeFn} value={modalDetailData.userPw} />
            </span>
          </li>
          <li>
            <span className='front'>주소</span>
            <span className='back'><input type="text" id='userAddr' name='userAddr'
              onChange={onChangeFn} value={modalDetailData.userAddr} />
            </span>
          </li>
          <li>
            <span className='front'>회원등급</span>
            <span className='back'>
              {paymentGrade}
            </span>
          </li>
          <li>
            <span className='front'>누적금액</span>
            <span className='back'>
              {paymentData}원
            </span>
          </li>
          <li>
            <button onClick={onEditFn}>수정</button>
            <button onClick={onDeleteFn}>삭제</button>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default AuthModal
