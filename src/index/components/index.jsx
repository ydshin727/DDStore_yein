import React from 'react'
import { Link } from 'react-router-dom'
import '../../../src/index/css/index.css'
const index = () => {
  return (
    <div className="index-wrapper">
      {/* 배경 영상: 루프 및 음소거 설정 */}
      <video autoPlay muted loop playsInline className="video-background">
        <source src="/images/community/Cozy_Pet_Shop_Video_Generation.mp4" type="video/mp4" />
        브라우저가 비디오 태그를 지원하지 않습니다.
      </video>

      {/* 영상 위를 덮는 투명 레이어와 타이틀 */}
      <div className="index-overlay">
        <div className="title-container">
          <h1 className="brand-name">댕댕상점</h1>
          <p className="brand-slogan">반려견을 위한 가장 따뜻한 선택</p>
          <button className="enter-btn" onClick={() => window.location.href='/items/home'}>
            댕댕상점 입장하기
          </button>
        </div>
      </div>
    </div>
  );
}


export default index