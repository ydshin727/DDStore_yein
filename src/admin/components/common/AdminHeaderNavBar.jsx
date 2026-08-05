import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../../css/common/adminHeaderNavBar.css'

// 어드민페이지 헤더의 네비게이션 햄버거 메뉴 세팅
// 반응형페이지를 위한 메뉴

const AdminHeaderNavBar = () => {
  // 체크박스의 값을 저장할 bool변수(햄버거메뉴를 누를때)
  const [check, setCheck] = useState(false);

  // 링크이동을 위한 navigate변수
  const navigate = useNavigate();

  // navigate로 누른뒤에는 메뉴 요소들은 초기화
  const onClickFn = (str)=>{
    navigate(str);
    setCheck(false);
  }
  return (
    <div className='admin-headerNavbar'>
      {/* label을 눌러도 checkbox를 누른 효과를 내기 위한 세팅 */}
      {/* span을 이용해 햄버거 메뉴를 제작 */}
      <label htmlFor='menu'
      className={"menuIcon " + (check && "on")}>
        <span /><span /><span />
        {/* checkBox는 css에서 dispaly:none으로 안보이게 세팅 */}
        <input type='checkbox' id='menu' name='menu'
      onChange={()=>check?setCheck(false):setCheck(true)}/>
      </label>
      {/* check의 값에 따라 on위치, off위치 지정 */}
      <div className={"sideBar " + (check && "on")}>
        <ul>
          <li onClick={()=> onClickFn('/items')}>Home</li>
          <li onClick={()=> onClickFn('/admin/main')}>Main</li>
          <li onClick={()=> onClickFn('/admin/member')}>Member</li>
          <li onClick={()=> onClickFn('/admin/product')}>Product</li>
          <li onClick={()=> onClickFn('/admin/productadd')}>ProductAdd</li>
          <li onClick={()=> onClickFn('/admin/order')}>orderList</li>
          <li onClick={()=> onClickFn('/admin/orderstore')}>Store</li>
          <li onClick={()=> onClickFn('/admin/qna')}>QnA</li>
        </ul>
      </div>
    </div>
  )
}

export default AdminHeaderNavBar
