import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../../css/common/bestItem.css'
import BannerContainer from './BannerContainer'
import { useDispatch, useSelector } from 'react-redux'
import { clearCart, fetchCart } from '../../../cart/slice/cartSlice'
import { API_JSON_SERVER_URL } from '../../../apis/commonApi'

const BestItemContainer = () => {
  const url= API_JSON_SERVER_URL
  
  // redux store 장바구니 정보 가져오기 (yein)
  const { isState, isUser } = useSelector(state => state.auth)
  // 유저 정보가 있으면 id 가져오기 (yein)
  const userId = isUser?.id

  const [itemList, setItemList] = useState([])
  const [visibleCount, setVisibleCount] = useState(8)
  const [showContent, setShowContent] = useState(false)
  const location = useLocation()

  const params = new URLSearchParams(location.search)
  const page = Number(params.get('page')) || 1

  const dispatch = useDispatch()
  useEffect(() => {
    setShowContent(false) // 페이지 변경 시 초기화
    const timer = setTimeout(() => setShowContent(true), 200) // 0.2초 딜레이
    return () => clearTimeout(timer)
  }, [page])
  useEffect(() => {
    // 장바구니 불러오기 (yein)
    if (isState && isUser) {
      dispatch(fetchCart(userId))
    } else {
      dispatch(clearCart())
    }

    const bestFn = async () => {
      try {
        const res = await fetch(`${url}/items`);
        const resData = await res.json();

        //isBest가 true인 상품만 필터
        const bestItems = resData.filter(item => item.isBest === true);

        setItemList(bestItems);
      } catch (err) {
        alert('데이터 불러오기 실패');
      }
    }
    bestFn();
  }, [dispatch, isState, isUser, userId]);

  // ✅ 더보기 클릭 시 8개씩 추가 + 부드러운 스크롤
  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 8)
  }

  const pagedItems = itemList.slice(0, visibleCount)

  return (
    <>
      <BannerContainer />
      <div className="best">
        <div className="best-con">
          <div className={`best-text fade-up ${showContent ? 'show' : ''}`}>
            <h2>MD 추천 상품 🐶</h2>
            <h4>댕댕상점의 베스트 아이템을 추천합니다.</h4>
          </div>
          <div className="itemList">
            <div className="itemList-con">
              <ul>
                {/* json리스트 출력 */}
                {pagedItems.map((el, idx) => (
                  <li
                    key={el.id}
                    style={{
                      transitionDelay: `${idx * 0.1}s`, // ✅ 순차적 딜레이 (0.1초 단위)
                    }}
                    className={`fade-up ${showContent ? 'show' : ''}`} // show 상태로 애니메이션
                  >

                    <div className="top">
                      <Link to={`/items/${el.category}/detail/${el.id}`} className="item-link" onClick={() => window.scrollTo(0, 0)}>
                        <img src={`/images/items_juhee/${el.image}`} alt={el.image} />
                      </Link>

                    </div>
                    <div className="bottom">
                      <Link to={`/items/${el.category}/detail/${el.id}`} className="item-link" onClick={() => window.scrollTo(0, 0)}>
                        <div className="name"><span>{el.name}</span> </div>
                        <div className="price"><span>{el.price.toLocaleString()}원</span></div>
                      </Link>
                    </div>
                  </li>

                ))}
              </ul>
              {/* ✅ 더보기 버튼 */}
              {visibleCount < itemList.length && (
                <div className="load-more">
                  <button onClick={handleLoadMore}>
                    상품 더보기 {Math.ceil(visibleCount / 8)}/{Math.ceil(itemList.length / 8)}
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
      <div className="hero-section">
        <div className="text">
          <h1>GIFT TO OUR FAMILY</h1>
          <p>우리 아이들의 건강과 행복을 항상 생각합니다.<br />
            좋은 소재와 섬세한 디테일에 신경 쓴 제품을 우리 아이들에게 선물해 주세요.</p>
          <div className="brand-story"><Link to={'/items/home'} onClick={() => window.scrollTo(0, 0)}>브랜드 스토리</Link></div>
        </div>
      </div>
    </>
  )
}

export default BestItemContainer