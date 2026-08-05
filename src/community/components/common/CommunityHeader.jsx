import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../css/common/communityHeader.css';

const CommunityHeader = () => {
  const location = useLocation(); // 현재 URL 경로 가져오기
  
  // 스크롤감지하여 메인헤더 확인유무 상태
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // 스크롤을 100px 이상 내리면 메인 헤더가 사라졌다고 판단 (false)
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHeaderVisible(false);
      } else {
        // 스크롤을 올리면 메인 헤더가 나타났다고 판단 (true)
        setIsHeaderVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    // isHeaderVisible 상태에 따라 다르게적용
    <div className={`CommunityHeader ${isHeaderVisible ? 'with-header' : 'no-header'}`}>
      <div className="gnb">
        <ul>
          <li className={location.pathname.includes('/notice') ? 'active' : ''}>
            <Link to='/community/notice'>공지사항</Link>
          </li>
          <li className={location.pathname.includes('/faq') ? 'active' : ''}>
            <Link to='/community/faq'>자주묻는질문</Link>
          </li>
          <li className={location.pathname.includes('/qna') ? 'active' : ''}>
            <Link to='/community/qna'>질문게시판</Link>
          </li>
          <li className={location.pathname.includes('/orderstore') ? 'active' : ''}>
            <Link to='/community/orderstore'>주문처</Link>
          </li>
          <li className={location.pathname.includes('/review') ? 'active' : ''}>
            <Link to='/community/review'>후기</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CommunityHeader;