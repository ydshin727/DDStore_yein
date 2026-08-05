import React, { useEffect, useState } from 'react'
import '../css/adminDetailModal.css'
import { useDispatch } from 'react-redux';
import { deleteItem, putItem } from '../../items/slice/itemSlice';
import { deleteMemberList, putMemberList } from '../../auth/slice/authMemberListSlice';
import { checkData, validateEmail } from '../../auth/components/AuthCommonFn';
import { adminStatusChange } from './common/AdminCommonFn';
import axios from 'axios';
import { API_JSON_SERVER_URL } from '../../apis/commonApi';

// 관리자 페이지 modal창 컴포넌트(props를 전달받아서 사용)
const AdminDetailModal = (props) => {
  // 수정시 데이터를 저장하기 위한 변수
  const [detailData, setDetailData] = useState(props.getData);
  // 외부함수 호출을 위한 변수
  const dispatch = useDispatch();

  // 결제금액, 등급을 저장하는 변수
  const [paymentData, setPaymentData] = useState(0);
  const [paymentGrade, setPaymentGrade] = useState('');
  // 모달창 비활성화 함수
  const closeFn = (e) => {
    props.setIsBool(false);
  }
  // 모달창의 change함수
  // flag로 일반데이터, 체크박스를 구분
  const onChangeFn = (e, flag) => {
    const { name, value, type } = e.target;
    switch (type) {
      case 'email':
      case 'text':
        setDetailData({ ...detailData, [name]: value });
        break;
      case 'number':
        setDetailData({ ...detailData, [name]: Number(value) });
        break;
      case 'checkbox':
        setDetailData({ ...detailData, [name]: e.target.checked });
        break;
    }
  }
  // 수정버튼 함수
  const onChangeBtn = () => {
    const isOk = confirm('수정하시겠습니까?');
    if (!isOk) return;
    // props.type받은 데이터로 if문으로 분류
    // 현재 모달창은 멤버, 제품만 수정가능해서 if ~ else로 처리
    if (props.type === 'member') {
      if (validateEmail(detailData.userEmail)) {
        alert('이메일 형식이 맞지 않습니다.')
        return;
      }
      // AdminCommonFn에서 가져온 데이터 체크 함수(중복확인)
      if (checkData('userEmail', detailData, props.allData) && props.getData.userEmail !== detailData.userEmail) {
        alert('이메일이 중복되었습니다.');
        // 중복되면 이전에 가져온 데이터로 다시 교체(초기화)
        setDetailData(props.getData);
        return;
      }
      // member DB에 넣는 비동기 함수 호출
      dispatch(putMemberList(detailData));
    } else {
      // AdminCommonFn에서 가져온 데이터 체크 함수(중복확인)
      if (checkData('items', detailData, props.allData) && props.getData.name !== detailData.name) {
        alert('아이템명이 중복되었습니다.');
        // 중복되면 이전에 가져온 데이터로 다시 교체(초기화)
        setDetailData(props.getData);
        return;
      }
      // items DB에 넣는 비동기 함수 호출
      dispatch(putItem(detailData));
    }
    alert('수정 완료');
    // 완료시 모달창 닫기함수 실행
    closeFn();
  }
  // 삭제버튼 함수
  const onDeleteBtn = () => {
    const isOk = confirm('삭제하시겠습니까?');
    if (!isOk) return;
    // props에서 가져온 타입별로 구분
    switch (props.type) {
      case 'items':
        // items DB에서 제거하는 비동기 함수 호출
        dispatch(deleteItem(detailData.id));
        break;
      case 'member':
        // member DB에서 제거하는 비동기 함수 호출
        dispatch(deleteMemberList(detailData.id));
        break;
    }
    alert('삭제 완료');
    // 완료시 모달창 닫기함수 실행
    closeFn();
  }
  useEffect(() => {
    if (props.type === 'member') {
      onPaymentDataFn();
    }
  }, [])
  const onPaymentDataFn = async () => {
    try {
      const res = await axios.get(`${API_JSON_SERVER_URL}/grades?userId=${String(detailData.id)}`);
      if (res.data.length !== 0) {
        res.data.map(el => {
          setPaymentData(el.totalSpent);
          setPaymentGrade(el.currentGrade);
        });
      }
    } catch (err) {
      alert(err);
    }
  }
  return (
    <div className="adminDetailModal" onClick={closeFn}>
      {/* 컨텐츠 안에는 클릭이벤트가 없게 설정 */}
      <div className="adminDetailModal-con" onClick={(e) => e.stopPropagation()}>
        {/* 모달창 닫기버튼 */}
        <span className='close' onClick={closeFn}>X</span>
        <ul>
          <li><h1>상세정보</h1></li>
          {props.type === 'member' ?
            <>
              <li>
                <span>id</span>
                <span><input type="text" name="id" id="id"
                  disabled value={detailData.id} /></span>
              </li>
              <li>
                <span>이메일</span>
                <span><input type="email" name="userEmail" id="userEmail"
                  value={detailData.userEmail}
                  onChange={onChangeFn} /></span>
              </li>
              <li>
                <span>비밀번호</span>
                <span><input type="text" name="userPw" id="userPw"
                  value={detailData.userPw}
                  onChange={onChangeFn} /></span>
              </li>
              <li>
                <span>이름</span>
                <span><input type="text" name="userName" id="userName"
                  value={detailData.userName}
                  onChange={onChangeFn} /></span>
              </li>
              <li>
                <span>주소</span>
                <span><input type="text" name="userAddr" id="userAddr"
                  value={detailData.userAddr}
                  onChange={onChangeFn} /></span>
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
                <span>권한</span>
                <span>
                  <select name="userRole" id="userRole"
                    defaultValue={detailData.userRole}
                    onChange={onChangeFn} >
                    <option value="ROLE_MEMBER">일반회원</option>
                    <option value="ROLE_ADMIN">관리자</option>
                  </select>
                </span>
              </li>
            </>
            : props.type === 'items' ?
              <>
                <li>
                  <span>id</span>
                  <span><input type="text" name="id" id="id"
                    disabled value={detailData.id} /></span>
                </li>
                <li>
                  <span>카테고리</span>
                  <span>
                    <select name="category" id="category"
                      defaultValue={detailData.category}
                      onChange={onChangeFn}>
                      <option value="fashion">패션</option>
                      <option value="feed">사료/간식</option>
                      <option value="living">생활용품</option>
                      <option value="toy">장난감</option>
                    </select>
                  </span>
                </li>
                <li>
                  <span>이름</span>
                  <span><input type="text" name="name" id="name"
                    value={detailData.name}
                    onChange={onChangeFn} /></span>
                </li>
                <li>
                  <span>가격</span>
                  <span><input type="number" name="price" id="price"
                    value={detailData.price}
                    onChange={() => onChangeFn(event, true)} /></span>
                </li>
                <li>
                  <span>Best</span>
                  <span><input type="checkbox" name="isBest" id="isBest"
                    checked={detailData.isBest}
                    onChange={() => onChangeFn(event, true)} /></span>
                </li>
                <li>
                  <img src={`/images/items_juhee/${detailData.image}`} alt="" />
                </li>
              </>
              : props.type === 'order' &&
              <>
                <li>
                  <span>주문한 날짜</span>
                  <span>
                    {new Date(detailData.orderDate).toLocaleString()}
                  </span>
                </li>
                <li>
                  <span>주문자명</span>
                  <span>{detailData.orderName}</span>
                </li>
                <li>
                  <span>주문상품</span>
                  <span>{detailData.carts.map((el, idx) => {
                    return (
                      <div>{el.name}({el.count}개)<br /></div>
                    )
                  })}</span>
                </li>
                <li>
                  <span>총액</span>
                  <span>{detailData.totalPrice} 원</span>
                </li>
                <li>
                  <span>수령방법</span>
                  <span>{detailData.orderPlace}</span>
                </li>
                {detailData.orderPlace === '매장' &&
                  <li>
                    <span>매장명</span>
                    <span>{detailData.orderStore}</span>
                  </li>
                }
                <li>
                  <span>현재상태</span>
                  <span>{detailData.status}</span>
                </li>
                <li>
                  <span>상태변경</span>
                  <span>
                    <select name="status-select" id="status-select" className="status-select"
                      value={detailData.status} onChange={(e) => {
                        adminStatusChange(detailData, e.target.value, dispatch);
                        closeFn();
                      }}>

                      {/* 공통(배달/매장) -> 주문완료 */}
                      <option value="주문완료" disabled={detailData.status !== "주문완료"}>
                        주문완료
                      </option>

                      {detailData.orderPlace === '배달' ? (
                        <>
                          {/* 배달 주문 */}
                          <option value="주문확인"
                            disabled={['주문확인', '배송중', '배송완료', '수령완료'].includes(detailData.status)}>
                            주문확인
                          </option>
                          <option value="배송중"
                            disabled={['배송중', '배송완료', '수령완료'].includes(detailData.status)}>
                            배송중
                          </option>
                          <option value="배송완료"
                            disabled={['배송완료', '수령완료'].includes(detailData.status)}>
                            배송완료
                          </option>
                          {/* 배달일 때 사용자가 수령 완료한 경우 표시만 해줌 */}
                          {detailData.status === '수령완료' && (
                            <option value="수령완료" disabled>수령완료</option>
                          )}
                        </>
                      ) : (
                        /* 매장 주문 */
                        <option value="수령완료" disabled={detailData.status === '수령완료'}>
                          수령완료
                        </option>
                      )}
                    </select></span>
                </li>
              </>}
          {props.type !== 'order' &&
            <li>
              <button onClick={onChangeBtn}>수정</button>
              <button onClick={onDeleteBtn}>삭제</button>
            </li>
          }

        </ul>
      </div>
    </div>
  )
}

export default AdminDetailModal
