import React, { useEffect, useState } from 'react'




// 필요 컨테이너에 import후 적용시킬것
// =========            한글변환             ================

// tagValue: DB에 저장된 실제 태그값 ('alert','question',,,)
export const getTagLabel = (tagOptions, category, tagValue) => {
  //=========      tag값 -> label(한글)변환 함수      ==========
  if (!tagOptions || !category || !tagValue) return tagValue
  // 카테고리배열에서 tagValue와 일치하는 객체 찾기
  const found = tagOptions[category].find(t => t.value === tagValue)
  // 찾으면 label('공지사항','질문',,,) 반환, 못찾으면 원본으로 반환
  return found ? found.label : tagValue
}

// 날짜 포맷

//모달 + 추후사용처
export const getCategoryName = (category) => {
  const names = {
    qna: '질문',
    review: '후기',
    notice: '공지',
    faq: 'FAQ',
    orderstore: '주문매장'
  };
  return names[category] || category;
};

// 게시판 번호 역순 (최신글이 가장 위로)
export const getCommunityBoardNum = (totalItems, currentPage, itemsPerPage, index) => {
  return totalItems - (currentPage - 1) * itemsPerPage - index;
};

// Qna답변상태정보
export const getCommunityStatusInfo = (status) => {
  if (status === "COMPLETED") {
    return { label: "답변완료", className: "status-completed" };
  }
  return { label: "답변대기", className: "status-pending" };
};

export const FormatDate = (dateString) => {
  //========    업데이트,수정,글쓴날짜 한글로바꿔주는 유틸함수      ===========
  if (!dateString) return ""
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',    // 시간 (2자리)
    minute: '2-digit',  // 분 (2자리)
    hour12: true        // 오전/오후 표시 (24시간제를 원하면 false)
  })

}

export const getStatusLabel = (status) => {
  // =========      답변완료 상태 한글변환      ================
  switch (status) {
    case 'PENDING': return '답변대기'
    case 'COMPLETED': return '답변완료'
    case 'ACTIVE': return '정지 상태'
    case 'LIFTED': return '정지 해제'
    default:
      return status || '상태미정'  //데이터없을경우
  }
}

export const getUserGrade = (totalAmount) => {
  // ========      결제금액별 등급(커뮤니티용)       ===============
  if (totalAmount >= 770000) return { label: 'VIP', className: 'VIP' }
  if (totalAmount >= 550000) return { label: 'GOLD', className: 'GOLD' }
  if (totalAmount >= 330000) return { label: 'SILVER', className: 'SILVER' }
  if (totalAmount >= 110000) return { label: 'NEW', className: 'NEW' }
  return { label: 'Welcome', className: 'welcome' }
}

export const getGradeBadge = (grade, userId) => {
  // ==========       등급별 뱃지           =================
  //관리자용
  if (userId === 'admin' || userId === '1') {
    return {
      icon: '🐾',
      class: 'grade-admin',
      label: '운영자'
    }
  }
  //일반유저용
  const upperGrade = grade?.toUpperCase() || 'WELCOME'
  const gradeMap = {
    "VIP": {
      icon: '/images/community/badge/vip.png',
      class: 'grade-vip'
    },
    "GOLD": {
      icon: '/images/community/badge/gold.png',
      class: 'grade-gold'
    },
    "SILVER": {
      icon: '/images/community/badge/silver.png',
      class: 'grade-silver'
    },
    "WELCOME": {
      icon: '/images/community/badge/new.png',
      class: 'grade-welcome'
    }
  }
  return gradeMap[upperGrade] || gradeMap['WELCOME']
}

export const calculateUserTotal = (orders, userId) => {
  // ============   결제누적 합산 함수     ==================

  if (!orders || !userId) return 0
  return orders
    //내주문 && 수령완료 && 배송완료 상태
    .filter(order => String(order.userId) === String(userId) && (order.status === "수령완료" || order.status === "배송완료"))
    .reduce((sum, order) => sum + (Number(order.totalPrice) || 0), 0)
}

export const nicknameLabel = (userId, userName) => {
  // 관리자 한글변환및 이미지
  const isAdmin = userId === 'admin' || userName === 'admin' || userId === '1';
  return {
    render: (
      <span className={isAdmin ? 'admin-text' : 'user-text'}>
        {isAdmin && (
          <img
            src="/images/community/admin-foot.png"
            alt="관리자"
            className="admin-icon-img"
          />
        )}
        {isAdmin ? '관리자' : userName}
      </span>
    ),
    isAdmin
  };
};

// 화면 맨 위로 스크롤하는 순수 유틸 함수
export const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 스크롤 시 등장하는 Top 버튼
export const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // 스크롤이 300px 이상 내려갔을 때만 버튼 표시
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <button
      className={`scroll-top-btn ${isVisible ? 'show' : ''}`}
      onClick={scrollToTop}
      aria-label="맨 위로 가기"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
};

// 유저메뉴창에서 회원정보볼때, AdminPaging에 import하여 navigate(`/admin/member?userId=${targetUser.user_id}`)로 이동하는 함수
export const checkUrlForModal = (location, data, setDetailData, setIsBool) => {
  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get('userId');

  if (userId && data && data.length > 0) {
    const target = data.find(el => String(el.user_id || el.id) === String(userId));
    if (target) {
      setDetailData(target);
      setIsBool(true);
    }
  }
};


const CommunityUtils = {
  getGradeBadge,
  FormatDate,
  getStatusLabel,
  getUserGrade,
  calculateUserTotal,
  getTagLabel,
  nicknameLabel,
  getCategoryName,
  scrollToTop,
  ScrollToTopButton,
  checkUrlForModal
}

export default CommunityUtils