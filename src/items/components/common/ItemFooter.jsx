import React from 'react'
import '../../css/common/ItemFooter.css'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* 왼쪽 */}
        <div className="footer-left">
          <h2 className="footer-phone">02-6953-2002</h2>

          <p className="footer-time">
            평일 09:00 - 18:00 <br />
            (점심시간 13:00 - 14:00)<br />
            토 · 일 공휴일 휴무
          </p>
        </div>

        {/* 가운데 */}
        <div className="footer-center">
          <p>COMPANY (주)댕댕상점 &nbsp;&nbsp; CEO 김댕댕</p>
          <p>ADDRESS 01693 서울 노원구 상계로3길 21 화일빌딩 </p>
          <p>BUSINESS REGISTRATION NUMBER  787-91-02063</p>
          <p>PERSONAL INFORMATION MANAGER (https://nowon.greenart.co.kr/)</p>
          <p>REPRESENTATIVE NUMBER 02-6953-2002</p>
        </div>

        {/* 오른쪽 */}
        <div className="footer-right">
          <ul>
            <li><Link to="/items/home" onClick={() => window.scrollTo(0, 0)}>브랜드스토리</Link></li>
            <li><Link to="/privacy" onClick={() => window.scrollTo(0, 0)}>개인정보 처리방침</Link></li>
            <li><Link to="/terms" onClick={() => window.scrollTo(0, 0)} >이용약관</Link></li>
            <li><Link to="/community/faq" onClick={() => window.scrollTo(0, 0)}>자주묻는 질문</Link></li>
          </ul>
        </div>

      </div>

      {/* 하단 */}
      <div className="footer-bottom">
        <p>Copyright © 댕댕상점 All rights Reserved.</p>
        <p>Designed by Team3</p>
      </div>
    </footer>
  )
}

export default Footer
