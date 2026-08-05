import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { checkCommunityAndRestoreRestriction } from '../slice/communitySlice';


// 게시판 방어로직 훅

const useCommunityAuth = (categoryPath, options = { detailData: undefined }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const auth = useSelector(state => state.auth);
  const { activeRestriction, loading } = useSelector(state => state.community);

  // 정지유저 확인
  const checkIsRestricted = (postAuthorId, postTag) => {
    if (!activeRestriction || (Array.isArray(activeRestriction) && activeRestriction.length === 0)) {
      return false;
    }
    const active = Array.isArray(activeRestriction) ? activeRestriction[0] : activeRestriction

    if (active && active.status === 'ACTIVE' && active.type === 'ALL') {
      // 예외: 본인의 1:1 문의글('secret')인 경우 통과
      const isMySecret = String(postAuthorId) === String(auth.isUser?.id) && postTag === 'secret';
      if (!isMySecret) {
        alert(`활동제한 상태입니다.\n사유: ${active.reason}\n종료일: ${active.end_date?.split('T')[0]}`);
        return true; // 정지됨
      }
    }
    return false; // 정상
  };

  // 정지상태 서버에서 최신화
  useEffect(() => {
    if (auth.isUser?.id) {
      dispatch(checkCommunityAndRestoreRestriction(auth.isUser.id))
    }
  }, [auth.isUser?.id, dispatch])


  useEffect(() => {
    // detail, list는 비회원도 읽기가능
    const isViewPage = window.location.pathname.includes('/detail') || window.location.pathname.includes('/list')
    // 비로그인 유저인데 faq,notice작성 주소입력 차단 (주소창 진입 방지)
    if (!auth.isState || !auth.isUser) {
      if (!isViewPage) {
        alert("로그인이 필요한 서비스입니다.");
        navigate('/auth/login', { replace: true });
      }
      return; // 조회 페이지라면 여기서 멈추고 아래 로직(관리자 체크 등) 실행 안 함
    }

    // 관리자 전용 게시판(공지, FAQ) 일반 유저 차단
    const adminOnly = ['notice', 'faq'];
    if (adminOnly.includes(categoryPath) && auth.isUser?.userRole !== 'ROLE_ADMIN') {
      alert("해당 게시판의 작성 권한이 없습니다.");
      navigate(`/community/${categoryPath}`, { replace: true });
      return;
    }

    // 활동 제한 유저 차단 (Q&A 제외)
    if (activeRestriction && categoryPath !== 'qna') {
      alert(`활동 제한 상태입니다. (사유: ${activeRestriction.reason})`);
      navigate(`/community/${categoryPath}`, { replace: true });
    }
  }, [auth, activeRestriction, categoryPath, loading, navigate]);

  //컴포넌트에서 안전하게 사용할 수 있도록 데이터 존재 여부 반환
  // detailData가 필수인 페이지(상세페이지 등)에서 null 체크를 자동화함
  const isDataReady = !loading && (options.detailData !== undefined)

  return {
    isAdmin: auth.isUser?.userRole === 'ROLE_ADMIN',
    user: auth.isUser,
    activeRestriction,
    checkIsRestricted,
    isDataReady
  };
};
export default useCommunityAuth