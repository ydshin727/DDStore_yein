import React, { useEffect, useRef, useState, useCallback } from 'react';
import CommentContainer from './CommentContainer';
import ItemDetailImg from '../detail/ItemDetailImg';
import { addCartItem } from '../../../cart/slice/cartSlice'
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PaymentModal from '../../../payment/components/PaymentModal';
import useRecommend from '../../../payment/components/useRecommend';
import '../../css/itemDetail.css';
import '../../css/comment.css';
import { API_JSON_SERVER_URL } from '../../../apis/commonApi';

const url= API_JSON_SERVER_URL
// yein 수정
const items = {
  itemId: '',
  name: '',
  price: 0,
  image: '',
  count: 0
}

const ItemDetailContainer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation()
  const reviewRef = useRef(null); // 리뷰 영역 스크롤용
  const [showTopBtn, setShowTopBtn] = useState(false);

  const [bestDetailData, setBestDetailData] = useState(items);
  const [detailData, setDetailData] = useState(null);
  const [count, setCount] = useState(1);
  const [activeTab, setActiveTab] = useState('detail'); // 탭 상태
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const detailRef = useRef(null);
  const isClickingTab = useRef(false);
  const activeTabRef = useRef('detail');
  // 헤더 스크롤 감지
  const [showHeader, setShowHeader] = useState(true)
  const lastScrollY = useRef(0)
  useEffect(() => {
    document.body.classList.add('item-detail-page')
  
    return () => {
      document.body.classList.remove('item-detail-page')
    }
  }, [])
  useEffect(() => {
    document.body.classList.add('item-detail-page');
    return () => {
      document.body.classList.remove('item-detail-page');
    };
  }, []);
  // redux store 장바구니 정보 가져오기 (yein)
  const { data: cartItems = [] } = useSelector(state => state.cart)
  const { isState, isUser } = useSelector(state => state.auth)
  // 유저 정보가 있으면 id 가져오기 (yein)
  const userId = isUser?.id

  // 추천 상품 훅 사용 (useRecommend) -> bestDetailData 제외한 추천 상품 (yein)
  const { showModal, recommendItems, openRecommendModal, closeRecommendModal } = useRecommend([bestDetailData])

  // ---------------------------
  // 리뷰 버튼 클릭 시 탭 활성화 + 스크롤
  const moveToReview = () => {
    isClickingTab.current = true;
    setActiveTab('review');

    setTimeout(() => {
      const yOffset = -140;
      const y =
        reviewRef.current.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;

      smoothScrollTo(y, 300);
    }, 100);

    setTimeout(() => {
      isClickingTab.current = false;
    }, 400);
  };
  useEffect(() => {
    const handleScroll = () => {
  
      const currentScrollY = window.scrollY;
  
      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
  
      lastScrollY.current = currentScrollY;
    };
  
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const smoothScrollTo = (targetY, duration = 300) => {
    const startY = window.scrollY;
    const diff = targetY - startY;
    let start;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const time = timestamp - start;
      const percent = Math.min(time / duration, 1);

      window.scrollTo(0, startY + diff * percent);

      if (time < duration) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  // 옵션
  useEffect(() => {
    if (bestDetailData?.options) {
      setSelectedColor('');
      setSelectedSize('');
    }
  }, [bestDetailData]);

  const moveToDetail = () => {
    isClickingTab.current = true;
    setActiveTab('detail');

    setTimeout(() => {
      const yOffset = -80;
      const y =
        detailRef.current.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;

      smoothScrollTo(y, 300);
    }, 0);

    setTimeout(() => {
      isClickingTab.current = false;
    }, 400);
  };
  // ---------------------------
  // 데이터 fetch
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const itemRes = await fetch(`${url}/items/${id}`);
        const itemData = await itemRes.json();
        setBestDetailData(itemData);

        const detailRes = await fetch(`${url}/itemDetails?id=${id}`);
        if (!detailRes.ok) {
          setDetailData(null);
          return;
        }
        const detailData = await detailRes.json();
        setDetailData(detailData[0]);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [id]);

  // ---------------------------
  // 수량 조절
  const plusFn = () => setCount(count + 1);
  const minusFn = () => {
    if (count <= 1) {
      alert('상품은 하나 이상 선택해야 합니다.');
      setCount(1);
    } else {
      setCount(count - 1);
    }
  };

  // ---------------------------
  // 옵션 선택 확인 함수 (yein)
  const checkOption = () => {
    if (bestDetailData.options?.color?.length > 0 && !selectedColor) {
      alert("색상을 선택해주세요.")
      return false
    }
    if (bestDetailData.options?.size?.length > 0 && !selectedSize) {
      alert("사이즈를 선택해주세요.")
      return false
    }
    return true
  }

  // 장바구니에 아이템 추가 함수 (yein)
  const itemAddtoCart = useCallback(async () => {
    // db에서 데이터 불러왔는지 확인, 로그인 되어있는지 확인
    if (!bestDetailData.id || !userId) return
    // 현재 보고 있는 상품 정보 dispatch
    return await dispatch(addCartItem({
      userId: userId,
      itemId: bestDetailData.id,
      name: bestDetailData.name,
      category: bestDetailData.category,
      price: Number(bestDetailData.price),
      image: bestDetailData.image,
      count: count,
      // 옵션(색상, 사이즈) 값이 있을 때만 DB에 추가
      ...(selectedColor && { color: selectedColor }),
      ...(selectedSize && { size: selectedSize })
    })).unwrap() // 성공 여부 확인
  }, [dispatch, bestDetailData, userId, count, selectedColor, selectedSize])

  // 장바구니 담기 함수 (yein)
  const addToCartFn = useCallback(async () => {
    // db에서 데이터 불러왔는지 확인
    if (!bestDetailData.id) return
    // 옵션 선택 확인
    if (!checkOption()) return
    // 비회원 상태시 로그인페이지로 이동
    if (!isState) {
      alert("로그인이 필요한 서비스입니다.")
      navigate('/auth/login', { state: { from: location.pathname } })
      return
    }
    try {
      await itemAddtoCart()
      if (window.confirm("장바구니에 담겼습니다. 장바구니로 이동하시겠습니까?")) {
        navigate('/cart')
      }
    } catch (error) {
      alert("장바구니 담기에 실패했습니다.")
    }
  }, [bestDetailData, isState, itemAddtoCart, navigate, location.pathname])

  // 추천 상품 - 그냥 결제하기 클릭시 실행될 함수 (yein)
  const onConfirmDirect = useCallback(() => {
    navigate('/payment/order', {
      state: {
        singleOrder: {
          itemId: bestDetailData.id,
          name: bestDetailData.name,
          category: bestDetailData.category,
          price: Number(bestDetailData.price),
          image: bestDetailData.image,
          count: count,
          ...(selectedColor && { color: selectedColor }),
          ...(selectedSize && { size: selectedSize })
        }
      }
    })
  }, [bestDetailData, count, selectedColor, selectedSize, navigate])

  // ---------------------------
  // 결제하기 함수 (yein)
  const goToPaymentFn = useCallback(async () => {
    // db에서 데이터 불러왔는지 확인
    if (!bestDetailData.id) return
    // 옵션 선택 확인
    if (!checkOption()) return
    // 비회원 상태시 로그인페이지로 이동
    if (!isState) {
      alert("로그인이 필요한 서비스입니다.")
      navigate('/auth/login', { state: { from: location.pathname } })
      return
    }
    // 장바구니에 이미 물건이 있는 경우
    if (cartItems.length > 0) {
      if (window.confirm("장바구니에 담긴 물건이 있습니다! 같이 주문하시겠습니까?")) {
        // yes -> 현재 상품도 장바구니에 넣고 장바구니 페이지로 이동
        try {
          await itemAddtoCart()
          navigate('/cart')
          return
        } catch (error) {
          alert("장바구니 업데이트에 실패했습니다.")
          return
        }
      }
    }
    // no, 장바구니 비어있음 -> 추천 상품 모달 띄우기
    // 추천 상품이 있어서 모달이 열리면 true, 없으면 false 반환
    const isOpened = openRecommendModal()
    // 추천할 상품이 없다면 결제 페이지로 이동
    if (!isOpened) onConfirmDirect()
  }, [bestDetailData, isState, location.pathname, cartItems.length, navigate, itemAddtoCart, openRecommendModal, onConfirmDirect])

  // 결제하기 후 추천 상품 클릭시 실행될 함수 (yein)
  const handleRecommendClick = useCallback(async (recommendItem) => {
    try {
      await itemAddtoCart()
      closeRecommendModal()
      alert("장바구니에 상품이 담겼습니다.")
      navigate(`/items/${recommendItem.category}/detail/${recommendItem.id}`)
    } catch (error) {
      alert("장바구니 담기에 실패했습니다.")
      navigate(`/items/${recommendItem.category}/detail/${recommendItem.id}`)
    }
  }, [itemAddtoCart, closeRecommendModal, navigate])

  // ---------------------------
  useEffect(() => {
    const handleScroll = () => {
  
      if (isClickingTab.current) return;
      if (!detailRef.current || !reviewRef.current) return;
  
      const scrollY = window.scrollY;
      setShowTopBtn(scrollY > 300);
  
      const offset = 300;
      const reviewTop = reviewRef.current.getBoundingClientRect().top;
  
      if (reviewTop - offset <= 0) {
        if (activeTabRef.current !== 'review') setActiveTab('review');
      } else {
        if (activeTabRef.current !== 'detail') setActiveTab('detail');
      }
    };
  
    window.addEventListener('scroll', handleScroll);
  
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const scrollToTop = () => {
    smoothScrollTo(0, 300); // 👈 숫자 작을수록 빠름
  };

  return (
    <div className="orderBestDetail">
      <div className="orderBestDetail-con">

        {/* 1. 상품 이미지 + 정보 */}
        <div className="detail-con">
          <div className="left">
            <img src={`/images/items_juhee/${bestDetailData.image}`} alt={bestDetailData.name} />
          </div>
          <div className="right">
            <ul>
              <li><span>상품명</span><span>{bestDetailData.name}</span></li>
              <li><span>가격</span><span>{bestDetailData.price.toLocaleString()}원</span></li>
              {bestDetailData.options?.color && (
                <li>
                  <span>색상</span>
                  <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                  >
                    <option value="">
                      - [필수] 색상 선택 -
                    </option>

                    {bestDetailData.options.color.map((color, idx) => (
                      <option key={idx} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </li>
              )}

              {bestDetailData.options?.size && (
                <li>
                  <span>사이즈</span>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                  >
                    <option value="">
                      - [필수] 사이즈 선택 -
                    </option>

                    {bestDetailData.options.size.map((size, idx) => (
                      <option key={idx} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </li>
              )}


              <li>
                <span>수량</span>
                <span className='span1'>
                  <button onClick={minusFn}>-</button>
                  <span>{count}</span>
                  <button onClick={plusFn}>+</button>
                </span>
              </li>
              <li><span>total</span><span>{(bestDetailData.price * count).toLocaleString()}원</span></li>
              <li>
                <button onClick={addToCartFn}>장바구니 담기</button>
                <button onClick={goToPaymentFn}>결제</button>
              </li>
            </ul>
          </div>
        </div>

        {/* 2. 상세설명 / 리뷰 탭 */}
<div className={`detail-tabs ${showHeader ? 'header-show' : 'header-hide'}`}>
          <button
            className={activeTab === 'detail' ? 'active' : ''}
            onClick={moveToDetail}
          >
            상품 상세설명
          </button>

          <button
            className={activeTab === 'review' ? 'active' : ''}
            onClick={moveToReview}
          >
            리뷰
          </button>
        </div>

        {/* 3. 상세 이미지 */}
        <div ref={detailRef} className="detail-image-section">
          {detailData && <ItemDetailImg descriptionImages={detailData.descriptionImages} />}
        </div>
        {/* 4. 리뷰 영역 */}
        <div ref={reviewRef} className="product-review-section">
          <CommentContainer productId={bestDetailData.id} />
        </div>

      </div>
      {showTopBtn && (
        <button className="scrollTopBtn" onClick={scrollToTop}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      )}

      {/* 추천 상품 - 모달 띄우기 (yein) */}
      {showModal && (
        <PaymentModal
          items={recommendItems}
          // 모달창 바깥 클릭시 창 닫기
          onJustClose={closeRecommendModal}
          // 그냥 결제하기
          onConfirm={() => {
            closeRecommendModal()
            onConfirmDirect()
          }}
          // 더 둘러보기
          onClose={async () => {
            try {
              await itemAddtoCart()
              closeRecommendModal()
              alert("장바구니에 상품이 담겼습니다.")
              navigate('/items/best')
            } catch (error) {
              alert("장바구니 담기에 실패했습니다.");
            }
          }}
          // 추천 상품 클릭시 실행
          onRecommendClick={handleRecommendClick}
        />
      )}

    </div>
  );
};

export default ItemDetailContainer;