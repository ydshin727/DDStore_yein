import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logoutF } from '../../../auth/slice/authSlice'
import {
  deleteNotification, fetchNotification, readNotification
} from '../../../payment/slice/notificationSlice'
import { clearCart, fetchCart } from '../../../cart/slice/cartSlice'
import '../../../items/css/common/itemHeader.css'

const ItemHeader = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  // 검색 사이드바 상태
  const [showSearchSidebar, setShowSearchSidebar] = useState(false)
  const [keyword, setKeyword] = useState('')
  const searchRef = useRef(null)
  const popularSearches = ['사료', '장난감', '간식', '패드', '옷', '노즈워크', '영양제', '샴푸', '방석', '이동장'];
  const [isScrolled, setIsScrolled] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const lastScrollY = useRef(0)
  const [showHeader, setShowHeader] = useState(true)
  const isPc = window.innerWidth >= 1024
  
    // 🔥 authSlice 기준
    const { isState, isUser } = useSelector(state => state.auth)

  const [recentSearches, setRecentSearches] = useState([]);
  const isActive = (path) => {
    return location.pathname.startsWith(path)
  }
  const getSearchKey = () => {
    return isUser?.id ? `recentSearches_${isUser.id}` : 'recentSearches_guest'
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!keyword.trim()) return
  
    const updatedRecent = [keyword, ...recentSearches.filter(k => k !== keyword)].slice(0, 10);
    setRecentSearches(updatedRecent);
  
    const key = getSearchKey()
    localStorage.setItem(key, JSON.stringify(updatedRecent)); 
  
    navigate(`/items/search?keyword=${keyword}&page=1`);
    setShowSearchSidebar(false);
  };
  // 검색창 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchSidebar(false)
      }
    }
    if (showSearchSidebar) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSearchSidebar])
  useEffect(() => {
    const key = getSearchKey()
    const data = JSON.parse(localStorage.getItem(key)) || []
    setRecentSearches(data)
  }, [isUser?.id])
  // 스크롤 감지
  useEffect(() => {
    const isPc = window.innerWidth >= 1024
  
    // ✅ PC면 아예 실행 안함
    if (isPc) return
  
    const handleScroll = () => {
      const currentScrollY = window.scrollY
  
      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setShowHeader(false)
      } else {
        setShowHeader(true)
      }
  
      lastScrollY.current = currentScrollY
    }
  
    window.addEventListener('scroll', handleScroll)
  
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  // 알림창 바깥 클릭시 닫힘 (yein)
  const notiRef = useRef(null)
  // 장바구니 데이터 불러오기 (yein)
  const { data: cartItems = [] } = useSelector(state => state.cart)
  // 알림 데이터 가져오기 (yein)
  const { data: notiData = [] } = useSelector(state => state.notification)

  // 알림 모달창 열림/닫힘 (yein)
  const [showNoti, setShowNoti] = useState(false)
  // 알림 읽음모드(read), 삭제모드(delete) (yein)
  const [mode, setMode] = useState(null)
  // 체크된 ID들(알림) (yein)
  const [selectedIds, setSelectedIds] = useState([])

  // 장바구니 개수 합계 (span) -> cartItems 없으면 0 (yein)
  const totalCartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.count, 0) || 0
  }, [cartItems])

  // 안 읽은 알림(isRead: false) 개수 합계 (span) -> notiData 없으면 0 (yein)
  const unreadCount = useMemo(() => {
    return notiData.filter(noti => !noti.isRead).length || 0
  }, [notiData])

  // 알림 데이터 최신순 정렬 (yein)
  const sortedNoti = useMemo(() => {
    return [...notiData].sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [notiData])

  // 로그인 상태가 변할 때마다 알림/장바구니 불러오기 (yein)
  useEffect(() => {
    if (isState && isUser?.id) {
      dispatch(fetchNotification(isUser.id))
      dispatch(fetchCart(isUser.id))
    }
  }, [isState, isUser?.id, dispatch])

  // 알림창 닫고 초기화하는 함수 (yein)
  const closeNotiModal = useCallback(() => {
    setShowNoti(false)
    setMode(null)
    setSelectedIds([])
  }, [])

  // 알림창 외부 클릭시 창 닫기 (yein)
  useEffect(() => {
    const handleClickOutside = (click) => {
      // notiRef(알림) 존재 & notiRef 외부 클릭시 실행
      if (notiRef.current && !notiRef.current.contains(click.target)) {
        closeNotiModal()
      }
    }
    // 알림창이 열려있을 때만 클릭 이벤트 리스너 등록
    if (showNoti) {
      window.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      // 알림창 닫힐 때 리스너 제거
      window.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNoti, closeNotiModal])

  const handleLogout = () => {
    // 현재 위치가 장바구니인지 확인 (yein)
    const isCart = location.pathname === '/cart'
    // alert 안뜨게하려고 세션 스토리지 사용 (yein)
    if (isCart) {
      sessionStorage.setItem('isLogout', 'true')
    }
    dispatch(logoutF())
    // 장바구니 span 초기화 (yein)
    dispatch(clearCart())
    alert('로그아웃 되었습니다')
    // yein 수정
    navigate(isCart ? '/items/best' : location.pathname, { replace: true })
  }

  // 알림창 체크박스 전체 선택 (yein)
  const handleAllCheck = (checked) => {
    // 모든 알림 ID 담기 or 초기화
    setSelectedIds(checked ? notiData.map(noti => noti.id) : [])
  }

  // 알림창 체크박스 선택/해제 (yein)
  const handleCheck = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  // mode 두 번 더 클릭시 전체선택/선택완료 사라짐 (yein)
  const handleModeClick = (targetMode) => {
    // 이미 같은 모드면 버튼 사라짐, 체크박스 선택 초기화
    setMode(prev => (prev === targetMode ? null : targetMode))
    setSelectedIds([])
  }

  // 선택 완료 버튼 클릭 (읽음, 삭제 실행) (yein)
  const handleConfirm = () => {
    if (selectedIds.length === 0) {
      return alert("선택된 항목이 없습니다.")
    }
    if (mode === 'read') {
      dispatch(readNotification(selectedIds))
    } else if (mode === 'delete') {
      if (window.confirm("삭제하시겠습니까?")) {
        dispatch(deleteNotification(selectedIds))
      }
    }
    // 초기화
    setMode(null)
    setSelectedIds([])
  }
  // 🔹 인기 상품 클릭 시 검색 실행
  const handlePopularSearchClick = (item) => {
    // setKeyword(item) // 이제는 선택 사항, input 반영만 필요하면 유지
    handleSearchWithKeyword(item)
  }

  // 🔹 최근 검색어 클릭 시 검색 실행
  const handleRecentSearchClick = (item) => {
    // setKeyword(item) // input 반영
    handleSearchWithKeyword(item)
  }

  // 🔹 키워드를 직접 받아서 바로 검색
  const handleSearchWithKeyword = (searchWord) => {
    if (!searchWord?.trim()) return

    const updatedRecent = [searchWord, ...recentSearches.filter(k => k !== searchWord)].slice(0, 10);
    setRecentSearches(updatedRecent);
    const key = getSearchKey()
    localStorage.setItem(key, JSON.stringify(updatedRecent));
    navigate(`/items/search?keyword=${searchWord}&page=1`);
    setShowSearchSidebar(false);
  };


  return (
    <>
      {/* 이벤트 바 */}
      <div
        className="event-bar"
        onClick={() => navigate('/community/notice/detail/0a26')}
      >
        💖 지금 진행중! 최대 10,000 포인트 적립 이벤트 →
      </div>
      <div className={`itemHeader ${showHeader ? 'show' : 'hide'}`}>
        <div className="nav">
          
          <h1 className="logo">
            <Link to="/">
              <img src="/public/images/items_juhee/dangdang_logo.png" alt="logo" />
            </Link>
          </h1>
          {/* 햄버거 버튼 추가 */}
          <div
            className="hamburger"
            onClick={() => setShowMenu(prev => !prev)}
            style={{ cursor: 'pointer' }}
          >
            ☰
          </div>
          <div className="gnb">
            <ul className="gnb-center">
              <li>
                <Link to="/items/home" className={location.pathname === '/' ? 'active' : ''}>
                  HOME
                </Link>
              </li>

              <li>
                <Link to="/items/best" className={isActive('/items/best') ? 'active' : ''}>
                  BEST
                </Link>
              </li>

              <li>
                <Link to="/items/feed" className={isActive('/items/feed') ? 'active' : ''}>
                  사료/간식
                </Link>
              </li>

              <li>
                <Link to="/items/fashion" className={isActive('/items/fashion') ? 'active' : ''}>
                  패션
                </Link>
              </li>

              <li>
                <Link to="/items/toy" className={isActive('/items/toy') ? 'active' : ''}>
                  장난감
                </Link>
              </li>

              <li>
                <Link to="/items/living" className={isActive('/items/living') ? 'active' : ''}>
                  생활용품
                </Link>
              </li>
            </ul>

            <ul className='gnb-right'>
              <li className='community' ><Link to="/community">커뮤니티</Link></li>

              {isState ? (
                <>
                  {isUser?.userRole === 'ROLE_ADMIN' && (
                    <li className='admin'  ><Link to="/admin/main">ADMIN</Link></li>
                  )}

                  <li className="welcome">
                    <Link to={`/auth/detail/${isUser?.id}`}>
                      {isUser?.userName || '회원'}님
                    </Link>

                  </li>

                  <li className="bye"
                    onClick={handleLogout}
                    style={{ cursor: 'pointer' }}
                  >
                    로그아웃
                  </li>
                </>
              ) : (
                <li className='login'>
                  <Link to="/auth">로그인</Link>
                </li>
              )}

              {!isState && <li className='join'><Link to="/auth/join">회원가입</Link></li>}

              {/* 검색 */}
              <li className="item-search" style={{ position: 'relative' }}>
                <div
                  className="item-search-btn"
                  onClick={() => setShowSearchSidebar(true)}
                  style={{ cursor: 'pointer' }}
                >
                  <img src="/images/items_juhee/search.png" alt="search" />
                </div>
              </li>

              {/* 알림 아이콘 부분 (yein) */}
              <li className="noti-container" ref={notiRef} style={{ position: 'relative' }}>
                <div className="noti-btn" onClick={() => setShowNoti(!showNoti)} style={{ cursor: 'pointer' }}>
                  <img src="/images/items_juhee/alarmBell.svg" alt="alarmBell" />
                  {unreadCount > 0 && <span className="cartCountSpan">{unreadCount}</span>}
                </div>

                {/* 알림 모달창 (yein) */}
                {showNoti && (
                  <div className="noti-modal">
                    <div className="noti-tools">
                      <button className={mode === 'read' ? 'active' : ''}
                        onClick={() => handleModeClick('read')}>알림읽음</button>
                      <button className={mode === 'delete' ? 'active' : ''}
                        onClick={() => handleModeClick('delete')}>알림삭제</button>

                      {/* 전체선택 - mode일 때만 출력 */}
                      {mode && (
                        <div className="all-check">
                          <input type="checkbox" name="all-noti" id="all-noti"
                            checked={selectedIds.length === notiData.length && notiData.length > 0}
                            onChange={(e) => handleAllCheck(e.target.checked)} />
                          <label htmlFor="all-noti">전체선택</label>
                        </div>
                      )}

                      {/* 선택완료 - mode일 때만 출력 */}
                      {mode && <button className="confirm-btn" onClick={handleConfirm}>선택완료</button>}
                    </div>

                    {/* 알림 데이터 출력 */}
                    <div className="noti-list">
                      {notiData.length === 0 ? <p className="empty">알림이 없습니다.</p> :
                        // 알림 내림차순 정렬 (최신순)
                        sortedNoti.map(noti => (
                          <div key={noti.id} className={`noti-item ${noti.isRead ? 'is-read' : ''}`}>
                            {mode && (
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(noti.id)}
                                onChange={() => handleCheck(noti.id)}
                              />
                            )}
                            <div className="noti-msg" onClick={() => {
                              // 알림 안읽은 상태에서 주문 상세로 넘어갈 시 읽음 처리
                              if (!noti.isRead) dispatch(readNotification([noti.id]))
                              navigate(`/payment/list/${noti.orderId}`)
                              closeNotiModal()
                            }}>
                              <p>{noti.message}</p>
                              <span>{new Date(noti.date).toLocaleString()}</span>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </li>

              {/* 장바구니(span 추가) (yein) */}
              <li className="cart2">
                <Link to="/cart">
                  <img src="/images/items_juhee/cart.png" alt="cart" />
                  {isState && totalCartCount > 0 && (
                    <span className="cartCountSpan">{totalCartCount}</span>
                  )}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        {/* 🔹 검색 사이드바 모달 */}
        <div
          className={`search-sidebar ${showSearchSidebar ? 'open' : ''}`}
          ref={searchRef}
        >
          <button className="close-btn" onClick={() => setShowSearchSidebar(false)}>✖</button>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="검색어를 입력해주세요."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              autoFocus
            />

            <button type="submit" className="search-icon-btn">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </form>
          <div className="search-section popular">
            <h4>추천 검색어</h4>
            <ul>
              {popularSearches.map((item, idx) => (
                <li key={idx}>
                  <span
                    className="clickable"
                    onClick={() => handlePopularSearchClick(item)}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="search-section recent">
            <h4>
              최근 검색어
              {recentSearches.length > 0 && (
                <button
                  className="clear-all"
                  onClick={() => {
                    const key = getSearchKey()
                    localStorage.removeItem(key)
                    setRecentSearches([])
                  }}
                >                  전체 삭제
                </button>
              )}
            </h4>
            <ul>
              {recentSearches.length === 0 ? (
                <li className="empty">최근 검색어가 없습니다.</li>
              ) : (
                recentSearches.map((item, idx) => (
                  <li key={idx}>
                    <span
                      className="clickable"
                      onClick={() => handleRecentSearchClick(item)}
                    >
                      {item}
                    </span>
                    <button
                      className="delete-btn"
                      onClick={() => {
                        const newList = recentSearches.filter((_, i) => i !== idx)
                        setRecentSearches(newList)
                      
                        const key = getSearchKey()
                        localStorage.setItem(key, JSON.stringify(newList)) // 🔥 추가
                      }}
                    >
                      ✖
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
        {/* 🔹 배경 어둡게 */}
        {showSearchSidebar && <div className="overlay" onClick={() => setShowSearchSidebar(false)}></div>}
      </div>
      <div className={`mobile-category-bar ${showHeader ? 'with-header' : 'no-header'}`}>
        <ul>
          <li><Link to="/items/home" className={location.pathname === '/items/home' ? 'active' : ''}>HOME</Link></li>
          <li><Link to="/items/best" className={location.pathname === '/items/best' ? 'active' : ''}>BEST</Link></li>
          <li><Link to="/items/feed" className={location.pathname === '/items/feed' ? 'active' : ''}>사료/간식</Link></li>
          <li><Link to="/items/fashion" className={location.pathname === '/items/fashion' ? 'active' : ''}>패션</Link></li>
          <li><Link to="/items/toy" className={location.pathname === '/items/toy' ? 'active' : ''}>장난감</Link></li>
          <li><Link to="/items/living" className={location.pathname === '/items/living' ? 'active' : ''}>생활용품</Link></li>
        </ul>
      </div>

      <div className={`mobile-menu ${showMenu ? 'open' : ''}`}>
        <button className="close-btn" onClick={() => setShowMenu(false)}>✖</button>

        <ul>
          <li><Link to="/items/home" onClick={() => setShowMenu(false)}>HOME</Link></li>
          <li><Link to="/items/best" onClick={() => setShowMenu(false)}>BEST</Link></li>
          <li><Link to="/items/feed" onClick={() => setShowMenu(false)}>사료/간식</Link></li>
          <li><Link to="/items/fashion" onClick={() => setShowMenu(false)}>패션</Link></li>
          <li><Link to="/items/toy" onClick={() => setShowMenu(false)}>장난감</Link></li>
          <li className='living-bottom'><Link to="/items/living" onClick={() => setShowMenu(false)}>생활용품</Link></li>
          <li className="sub-menu"><Link to="/community" onClick={() => setShowMenu(false)}>커뮤니티</Link></li>

          {isState ? (
            <>
              {isUser?.userRole === 'ROLE_ADMIN' && (
                <li className="sub-menu"><Link to="/admin/main" onClick={() => setShowMenu(false)}>ADMIN</Link></li>
              )}
              <li className="sub-menu"><Link to={`/auth/detail/${isUser?.id}`} onClick={() => setShowMenu(false)}>
                {isUser?.userName || '회원'}님
              </Link></li>
              <li className="sub-menu" onClick={() => { handleLogout(); setShowMenu(false); }}>로그아웃</li>
            </>
          ) : (
            <>
              <li className="sub-menu"><Link to="/auth" onClick={() => setShowMenu(false)}>로그인</Link></li>
              <li className="sub-menu"><Link to="/auth/join" onClick={() => setShowMenu(false)}>회원가입</Link></li>
            </>
          )}
        </ul>
      </div>
    </>
  )
}





export default ItemHeader
