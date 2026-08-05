import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchOrderStores, setActiveStore, removeOrderStore } from '../slice/communityOrderStoreSlice';
import KakaoMapApi from '../../apis/kakaoApi/KakaoMapApi';
import '../css/container/orderStore.css'
import { ScrollToTopButton } from '../components/common/CommunityUtils';

// ===============            주문처         =========================
const OrderStoreContainer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { orderstores, activeStore, loading } = useSelector(state => state.orderstore);
  const auth = useSelector(state => state.auth);
  const isAdmin = auth.isUser?.userRole === 'ROLE_ADMIN';
  // 스크롤 감지 상태 추가
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHeaderVisible(false); // 스크롤 내리면 숨김
      } else {
        setIsHeaderVisible(true);  // 스크롤 올리면 보임
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  //상태 로드
  useEffect(() => {
    dispatch(fetchOrderStores());
  }, [dispatch]);

  //검색어 상태관리
  const [searchTerm, setSearchTerm] = useState('')

  //검색어에 따라 매장목록필터링 (매장명 기준)
  const filteredStores = orderstores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  //삭제함수 slice
  const handleDelete = (id) => {
    if (confirm("매장을 삭제하시겠습니까?")) {
      dispatch(removeOrderStore(id)).unwrap().then(() => alert("삭제되었습니다."));
    }
  };

  if (loading && orderstores.length === 0) return <div className="loading">데이터 로딩 중...</div>;

  return (
    <div className="orderStore">
      <h2 className="orderstore-title">매장 안내</h2>
      <div className={`store-filter-bar ${isHeaderVisible ? 'with-header' : 'no-header'}`}>

        {/* 검색필터바 */}
        <div className="search-filter">
          <input
            type="text"
            className='store-search-input'
            placeholder='찾으시는 매장명을 입력하세요'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} //입력할때마다 필터링
          />
        </div>

        {isAdmin && (
          <button className="write-btn" onClick={() => navigate(`/community/orderstore/write`)}>
            신규 매장 등록
          </button>
        )}
      </div>

      <div className="orderStore-con">
        {/* 왼쪽: 리스트 사이드바 */}
        <aside className="store-sidebar">
          <div className="list-inner">
            {filteredStores.length > 0 ? (
              filteredStores.map((el) => (
                <div
                  key={el.id}
                  className={`store-card ${activeStore?.id === el.id ? 'active' : ''}`}
                  onClick={() => dispatch(setActiveStore(el))}
                >
                  <div className="info">
                    <div className="info-header">
                      <h3>{el.name}</h3>
                      <div className="dir-box">
                        <a href={`https://map.kakao.com/link/to/${el.name},${el.lat},${el.lng}`}
                          target="_blank" rel="noreferrer" className="btn-dir">길찾기</a>
                      </div>
                    </div>
                    <p>{el.address}</p>
                    <p className="tel">{el.phone}</p>
                  </div>
                  <div className="actions">
                    {isAdmin && (
                      <div className="admin-btns">
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/community/orderstore/write/${el.id}`); }}>수정</button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(el.id); }}>삭제</button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-result-container">
                <div className="no-result-content">
                  <div className="search-icon-wrapper">
                    <span className="search-icon"><img src="/images/community/cryingpuppy.png" alt="cryingPuppy" /></span>
                  </div>
                  <h3>검색 결과가 없습니다</h3>
                  <p>
                    입력하신 <strong>'{searchTerm}'</strong>에 대한 매장을 찾을 수 없습니다.<br />
                    매장명이 정확한지 다시 한번 확인해 주세요.
                  </p>
                  <button className="reset-search-btn" onClick={() => setSearchTerm('')}>
                    검색어 초기화
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* 오른쪽: 지도 영역 */}
        <section className="map-section">
          {activeStore && (
            <div className="map-container">
              <KakaoMapApi
                key={`map-${activeStore.id}`}
                lat={activeStore.lat}
                lng={activeStore.lng}
                name={activeStore.name}
              />
              <div className="map-overlay-info">
                <strong>{activeStore.name}</strong>
                <p>{activeStore.address}</p>
              </div>
            </div>
          )}
        </section>
      </div>
      <ScrollToTopButton />
    </div>

  );
};

export default OrderStoreContainer;