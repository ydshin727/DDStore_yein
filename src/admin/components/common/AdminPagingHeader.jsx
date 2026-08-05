import React from 'react'
import '../../css/common/AdminPagingHeader.css'
import { FilterInput, searchInput } from './AdminCommonFn';

const AdminPagingHeader = ({tableType,filterStatus,onChangeFn,searchData,
  onSearchFn, setPage, setFilterStatus, filterStatus2, setFilterStatus2
}) => {
  // 공통 검색버튼 함수
  const onSearchBtnFn = () =>{
    onSearchFn();
    setPage(1);
  }
  // filter버튼 함수실행(flag로 나눈건 필터가 2개이상인것을 나누기위함)
  const onFilterBtnFn = (e, flag) =>{
    if(flag){
      setFilterStatus2(e.target.value);
    }else{
      setFilterStatus(e.target.value);
    }
    setPage(1);
  }
  // 검색명을 구분하기 위해 타입별로 나눠서 리턴
  const searchType = ()=>{
    switch(tableType){
      case 'member':
        return '유저'
      case 'items':
        return '제품'
      case 'order':
        return '주문자'
      case 'orderstore':
        return '가게'
      case 'community':
        return '제목'
    }
  }
  // 필터링을 구분하기위해 타입별로 나눠서 리턴
  const filterType =()=>{
    switch(tableType){
      case 'member':
        return {
          'ROLE_ADMIN':'관리자',
          'ROLE_MEMBER':'일반회원'
        }
      case 'items':
        return {
          'fashion':'패션',
          'feed':'사료/간식',
          'living':'생활용품',
          'toy':'장난감'
        }
      case 'order':
        return {
          '주문완료':'주문완료',
          '주문확인':'주문확인',
          '배송중':'배송중',
          '배송완료':'배송완료',
          '수령완료':'수령완료',
        }
      case 'community':
        return {
          'PENDING':'답변대기',
          'COMPLETED':'답변완료'
        }
    }
  }
  // 필터링명을 구분하기 위해 타입별로 나눠서 리턴
  const filterName = ()=>{
    switch(tableType){
      case 'member':
        return '권한'
      case 'items':
        return '카테고리'
      case 'community':
        return '답변상태'
      case 'order':
        return '주문상태'
    }
  }
  return (
    <div className="adminPaging-header">
      <div className="status-filter">
        {/* orderstore(가게)쪽은 필터링할게 없으므로 제거 */}
        {tableType && tableType === 'orderstore' ? <></>:
        tableType === 'order' ?
          <>
          {FilterInput(filterStatus, onFilterBtnFn, filterType(),filterName())}
            <select value={filterStatus2} onChange={
              (e)=>onFilterBtnFn(e,true)}>
              <option value="전체">배송방법</option>
              <option value="배달">배달</option>
              <option value="매장">매장</option>
            </select>
          </> : <>
            {FilterInput(filterStatus, onFilterBtnFn, filterType(),filterName())}</>}
      </div>
      <div className="searchBar">
        {searchInput(onChangeFn, searchData.searchDetail,
            `${searchType()}명을 입력해주세요`, onSearchBtnFn
          )}
            <button onClick={onSearchBtnFn}>검색</button>
      </div>
    </div>
  )
}

export default AdminPagingHeader
