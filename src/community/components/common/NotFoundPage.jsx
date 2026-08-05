import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'



// ========       비어있는 path값 방어      ==================
const NotFoundPage = () => {
  const navigate = useNavigate()

  useEffect(() => {
    alert("존재하지 않는 페이지거나 접근 권한이 없습니다. 이전 페이지로 돌아갑니다.");
    navigate( -1 , {replace:true});  //replace:true하면 에러기록이남지않음.
  }, [navigate]);

  return null
}

export default NotFoundPage