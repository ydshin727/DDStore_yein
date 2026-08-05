import React, { useEffect, useRef, useState } from 'react'
import '../../css/home.css'
import { Link } from 'react-router-dom'

const BrandStory = () => {

  const textRefs = useRef([])
  const [visibleIndices, setVisibleIndices] = useState([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = textRefs.current.indexOf(entry.target)
          if (entry.isIntersecting && !visibleIndices.includes(index)) {
            setVisibleIndices((prev) => [...prev, index])
          }
        })
      },
      { threshold: 0.2 }
    )

    textRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [visibleIndices])

  const addToRefs = (el) => {
    if (el && !textRefs.current.includes(el)) {
      textRefs.current.push(el)
    }
  }

  return (
    <div className="brand">
      <div className="story-header">
        <h2>Our Story</h2>
        <div className="divider"></div>
      </div>
      <div className="brand-hero">
        <img
          src="/images/items_juhee/banner.jpg"
          alt="배너"
          className="hero-img"
        />
        <div ref={addToRefs} className={`hero-text fade-up ${visibleIndices.includes(0) ? 'show' : ''}`}>
          <h1>건강한 습관의 완성,<br />댕댕상점</h1>
          <p>반려인으로서의 삶을 더욱 멋지게</p>
        </div>
      </div>

      <div ref={addToRefs} className={`brand-content fade-up ${visibleIndices.includes(1) ? 'show' : ''}`}>
        <h2>
          오래도록 함께하기 위한 준비,<br />
          지금부터 시작할 수 있어요.
        </h2>
        <p className="quote">“이 순간이 오래도록 계속 되었으면…”</p>
        <p className="desc">
          함께 산책하고, 목욕하고, 쉬는 일상의 순간을<br />
          더욱 편안하게 만들어 줄 제품으로<br />
          우리 가족에게 가장 적합한 반려 생활을 할 수 있습니다.
        </p>
      </div>

      <div className="brand-bottom">
        <div ref={addToRefs} className={`bottom-text-top fade-up ${visibleIndices.includes(2) ? 'show' : ''}`}>
          <h3>
            "반려동물과 사람의 편한한 공존을 지향합니다."
          </h3>
        </div>

        <div ref={addToRefs} className={`bottom-image fade-up ${visibleIndices.includes(3) ? 'show' : ''}`}>
          <img src="/images/items_juhee/dog-main.jpg" alt="dog" />
        </div>

        <div ref={addToRefs} className={`bottom-desc fade-up ${visibleIndices.includes(4) ? 'show' : ''}`}>
          <p>
            그래서 댕댕상점은<br />
            <strong>  판매금액 중 일정 금액을 유기견 및 유기묘 후원단체에 기부합니다. </strong><br />
          </p>
          <p>
            일상생활의 더 나은 경험을 연구하는 것처럼<br />
            우리의 손길이 필요한 곳에 도움을 주며 <br />
            더 좋은 경험을 만들어 나아가고자 합니다.
          </p>
          <p>
            당신이 사랑하는 가족이<br />
            더 오래 이어지도록,<br />
            댕댕상점이 곁에서 함께하겠습니다.
          </p>
        </div>

        <div ref={addToRefs} className={`bottom-btn fade-up ${visibleIndices.includes(5) ? 'show' : ''}`}>
          <Link to="/items/best" onClick={() => window.scrollTo(0, 0)}>
            <button>댕댕상점 상품 둘러보기</button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default BrandStory