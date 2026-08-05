import React, { useEffect, useState } from 'react';
import '../../../community/css/common/communityModal.css';
import { useDispatch, useSelector } from 'react-redux';
import { liftCommunityRestriction, restrictUser } from '../../slice/communitySlice';
import { useNavigate } from 'react-router-dom';
import { getCategoryName, getGradeBadge, getStatusLabel, getUserGrade } from './CommunityUtils';
import { fetchItemList } from '../../../items/slice/itemSlice';
import authMemberListSlice, { fetchMemberList } from '../../../auth/slice/authMemberListSlice';
const CommunityModal = ({ isOpen, onClose, actionType, data, targetUser }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const auth = useSelector(state => state.auth)
  // authMember 슬라이스에서 memberData 로드 (정지유저 조회용)
  const members = useSelector(state => state.authMember?.memberData || [])
  // 후기조회용 
  const allProducts = useSelector(state => state.item?.data || [])
  const items = useSelector(state => state.item?.items || state.item?.data || [])
  // 등급 뱃지
  const gradeKey = data?.currentGrade?.toUpperCase() || 'WELCOME'
  const badge = getGradeBadge(gradeKey)
  const isAdmin = targetUser?.userRole === 'ROLE_ADMIN' || targetUser?.author === 'admin';

  // 액션 타입에 따른 타이틀 설정
  const getModalTitle = () => {
    switch (actionType) {
      case 'admin_pending_list': return '미답변 질문 목록';
      case 'admin_user_history': return `${targetUser?.author}님 활동 기록`;
      case 'admin_user_restrict': return '유저 활동 제한 설정';
      case 'user_posts': return '작성글 목록';
      case 'user_profile_view': return '회원 등급 정보';
      case 'my_payments': return '결제 내역';
      default: return '정보 조회';
    }
  };
  //members DB 목록 호출
  useEffect(() => {
    if (isOpen && members.length === 0) {
      dispatch(fetchMemberList());
    }
  }, [isOpen, members.length, dispatch]);

  // 유저후기글에서 상품정보 불러오기 (props형태였다가 useSelector에서 직접빼오기로함)
  useEffect(() => {
    if (isOpen && actionType === 'user_comments' && allProducts.length === 0) {
      dispatch(fetchItemList());
    }
  }, [isOpen, actionType, dispatch, allProducts.length]);


  //=============       정지 상태관리           ==============================
  const [restrictInfo, setRestrictInfo] = useState({ type: 'POST_ONLY', reason: '', duration: '3' });

  if (!isOpen) return null;

  // 제출
  const handleRestrictSubmit = () => {
    //데이터확인
    if (!targetUser || (!targetUser.user_id && !targetUser.userId)) {
      alert('대상 유저 정보를 찾을수 없습니다.')
      return
    }
    if (!restrictInfo.reason.trim()) {
      alert("정지 사유를 입력해 주세요.");
      return;
    }
    if (!window.confirm(`${targetUser.author} 유저의 활동을 제한하시겠습니까?`)) return;

    // 종료 날짜 계산
    const endDate = new Date();
    if (restrictInfo.duration === 'PERMANENT') {
      endDate.setFullYear(9999); // 영구 정지
    } else {
      endDate.setDate(endDate.getDate() + parseInt(restrictInfo.duration));
    }

    const restrictionData = {
      type: restrictInfo.type,
      reason: restrictInfo.reason,
      end_date: endDate.toISOString(),
      status: 'ACTIVE',
      admin_id: auth?.isUser?.id || 'admin' // 실제 관리자 ID 대체가능
    };

    // 리덕스 실행
    const targetId = targetUser.user_id || targetUser.userId
    dispatch(restrictUser({ userId: targetId, restrictionData }))
      .unwrap()
      .then(() => {
        setRestrictInfo({ type: 'POST_ONLY', reason: '', duration: '3' }) // 초기화
        onClose(); // 성공 시 모달 닫기
      })
      .catch(err => alert("오류 발생: " + err));
  };

  //정지 수동 해제
  const handleLiftRestriction = () => {
    if (!confirm(`${targetUser.author} 유저의 정지를 해제하시겠습니까?`)) return;

    // targetUser에 담긴 현재 활성 정지 기록의 ID를 넘깁니다.
    // (만약 targetUser 객체에 restriction_id가 없다면 조회를 통해 가져와야 합니다)
    dispatch(liftCommunityRestriction(targetUser.user_id))
      .unwrap()
      .then(() => {
        // 해제 후 목록을 새로고침하거나 상태를 동기화
        onClose();
      })
      .catch(err => alert("해제 실패: " + err));
  };

  // ==============================================================================

  return (
    <div className="community-modal-overlay" onClick={onClose}>
      {/* stopPropagation 부모(배열)한테 전달하지마시오. 영역분리 목적(모달창 사용시 갑자기닫힘 방지*/}
      <div className="community-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2> {getModalTitle()} </h2>
          <button className='close-btn' onClick={onClose}> &times; </button>
        </div>

        <div className="modal-body">
          {/* 1. 유저 활동 제한 설정 (관리자) */}
          {actionType === 'admin_user_restrict' && (
            <div className="restrict-form">
              <p className="target-info">대상: <strong>{targetUser?.author}</strong></p>

              <div className="input-group">
                <label>제한 유형</label>
                <select
                  value={restrictInfo.type}
                  onChange={(e) => setRestrictInfo({ ...restrictInfo, type: e.target.value })}
                >
                  <option value="POST_ONLY">커뮤니티 글쓰기 제한</option>
                  <option value="ALL">커뮤니티 전체 이용 정지</option>
                </select>
              </div>

              <div className="input-group">
                <label>기간 설정</label>
                <select
                  value={restrictInfo.duration}
                  onChange={(e) => setRestrictInfo({ ...restrictInfo, duration: e.target.value })}
                >
                  <option value="3">3일</option>
                  <option value="7">7일</option>
                  <option value="30">30일</option>
                  <option value="PERMANENT">영구 정지</option>
                </select>
              </div>

              <div className="input-group">
                <label>정지 사유</label>
                <textarea
                  value={restrictInfo.reason}
                  onChange={(e) => setRestrictInfo({ ...restrictInfo, reason: e.target.value })}
                  placeholder="유저에게 안내될 정지 사유를 입력하세요."
                  rows={4}
                />
              </div>

              <div className='modal-btn-group'>
                <button className="modal-submit-btn" onClick={handleRestrictSubmit}>제한 적용</button>
                <button className='modal-lift-btn' onClick={handleLiftRestriction}>즉시 해제</button>
              </div>

              {/* 이전 기록 테이블 */}
              <section className="restrict-history">
                <h3>이전 제한 기록</h3>

                <div className="history-table-wrapper">
                  <table className="modal-table">
                    <thead>
                      <tr><th>사유</th><th>유형</th><th>종료일</th><th>상태</th></tr>
                    </thead>
                    <tbody>
                      {/* 정지기록 데이터역순(최신순이 맨위로) */}
                      {data && data.length > 0 ? [...data].reverse().map((h, i) => (
                        <tr key={i}>
                          <td>{h.reason}</td>
                          <td>{h.type === 'ALL' ? '전체 이용정지' : '커뮤니티 글쓰기 제한'}</td>
                          <td>{h.end_date?.split('T')[0]}</td>
                          <td>{getStatusLabel(h.status)}</td>
                        </tr>
                      )) : <tr><td colSpan="4">기록이 없습니다.</td></tr>}
                    </tbody>
                  </table>
                </div>

              </section>
            </div>
          )}

          {/* 게시글 목록 (활동 기록 / 내 글 / 미답변) */}
          {(['admin_user_history', 'user_posts', 'admin_pending_list'].includes(actionType)) && (
            <div className="modal-table-container">
              <p className="modal-desc">총 <strong>
                {actionType === 'admin_pending_list'
                  ? data?.filter(post => !post.is_fixed).length // 미답변 목록일 때만 필독 제외 카운트
                  : data?.length || 0
                }
              </strong>건
              </p>
              <table className="modal-table">
                <thead>
                  <tr><th>번호</th><th>카테고리</th><th>제목</th><th>작성일</th></tr>
                </thead>
                <tbody>
                  {/* 미완료답변 필터 -> 상단고정 빼고 */}
                  {/* fillterArray.length - index 필터링으로 빠진글 제외하고 제대로된 역순번호 계산 */}
                  {(actionType === 'admin_pending_list'
                    ? data?.filter(post => !post.is_fixed)
                    : data
                  )?.map((post, index, fillterArray) => (
                    <tr key={post.id} onClick={() => { navigate(`/community/${post.category}/detail/${post.id}`); onClose(); }}>
                      <td>{fillterArray.length - index}</td>
                      <td>{getCategoryName(post.category)}</td>
                      <td className="modal-title-cell">{post.title}</td>
                      <td>{post.created_at?.split('T')[0]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}


          {/* 정지회원목록 */}
          {actionType === 'admin_user_restrict_list' && (
            <div className="modal-table-container">
              <p className="modal-desc">현재 커뮤니티 정지 상태인 유저들입니다.</p>
              <table className="modal-table">
                <thead>
                  <tr><th>유저명</th><th>정지 사유</th><th>종료일</th><th>상태</th></tr>
                </thead>
                <tbody>
                  {data && data.length > 0 ? (
                    data.map((restrict) => {
                      // restrict.user_id와 일치하는 회원(members DB활용)
                      const user = members.find(m => String(m.id) === String(restrict.user_id));
                      // 회원을 찾았다면 userName을, 없다면 저장된 author를, 둘 다 없으면 기본값
                      const displayAuthor = user?.userName || restrict.author || "알수없음";

                      return (
                        <tr key={restrict.id}>
                          <td
                            className="clickable-author"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMenuAction(e, {
                                id: restrict.user_id,
                                user_id: restrict.user_id,
                                author: displayAuthor, // 찾은 이름을 전달
                                email: user?.userEmail || "" // 이메일
                              })
                            }}
                          >
                            {displayAuthor}
                          </td>
                          <td>{restrict.reason}</td>
                          <td>{restrict.end_date?.split('T')[0]}</td>
                          <td>{restrict.status === 'ACTIVE' ? '정지중' : '해제됨'}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan="4" className="no-data">정지 중인 유저가 없습니다.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}



          {/* 유저 등급 및 뱃지 */}
          {actionType === 'user_profile_view' && (
            <div className="grade-view-container">
              <div className="grade-card">
                <div className={`profile-image-wrapper ${badge.class} ${isAdmin ? 'admin-security-effect' : `effect-${gradeKey}`}`}>
                  <img src={isAdmin ? '/images/community/badge/admin.png' : badge.icon} alt={gradeKey} className='profile-img' />
                  {isAdmin ? <div className="admin-scan-line"></div> : <div className="shiny-layer"></div>}
                </div>
                <h3 className="user-author">{targetUser?.author}님</h3>
                <p className='current-grade-label'>
                  현재등급: <span className={`grade-badge-text ${badge.class}`}> {isAdmin ? '관리자' : gradeKey} </span>
                </p>

                {/* 권한 체크: 본인이거나 관리자일 때만 금액 노출 */}
                {(String(auth?.isUser?.id) === String(targetUser?.user_id) || auth?.isUser?.userRole === 'ROLE_ADMIN') ? (
                  <div className="spent-info">
                    <p>누적 결제 금액: <strong>{data?.totalSpent?.toLocaleString() || 0}원</strong></p>
                  </div>
                ) : (
                  <p className="notice">* 누적 금액은 본인만 확인 가능합니다.</p>
                )}

              </div>
              <button className="modal-close" onClick={(e) => { e.preventDefault(); onClose() }}>확인</button>
            </div>
          )}

          {/* 상품 후기 조회 섹션 (user_comments) */}
          {actionType === 'user_comments' && (
            <div className="modal-review-container">
              <div className="modal-review-header-info">
                <p><strong>{targetUser?.author}</strong>님의 상품 후기 ({data?.length || 0}건)</p>
              </div>

              <div className="simple-review-list">
                {data && data.length > 0 ? (
                  data?.map((review) => {
                    const product = items?.find(p => String(p.id) === String(review.productId))
                    return (
                      <div key={review.id} className="simple-review-card" onClick={() => { navigate(`/items/detail/${review.productId}`); onClose(); }} >
                        <div className="review-meta">
                          <span className="review-stars"> ⭐({review.rating}점)  </span>
                        </div>
                        <p className="review-text">{review.content}</p>

                        <div className="review-footer">
                          <span>{product?.name || '상품정보없음'}</span>
                          <span className="move-link">상세보기➔</span>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="no-data">작성된 상품 후기가 없습니다.</div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div >
  );
};

export default CommunityModal;