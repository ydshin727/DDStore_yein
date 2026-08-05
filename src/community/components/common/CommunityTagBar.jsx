import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { searchCommunity } from '../../slice/communitySlice';
import '../../css/common/communityTagBar.css'

// ================      게시판 필터바         =====================

const CommunityTagBar = ({ category, tagOptions }) => {
  //게시판 필터바 공통 컨테이너
  const dispatch = useDispatch()
  //카테고리별 동적 추출
  const currentOptions = tagOptions[category] || [];
  
  //필터상태관리
  const [tag, setTag] = useState("all");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  
  //slice생성한 검색
  const onSearchFn = () => {
    dispatch(searchCommunity({ tag, filter, search, category }))
  }

  // tag 바뀔때 즉시 필터링
  useEffect(()=> {
    onSearchFn()
  },[tag])

  // 카테고리변경시 초기화
  useEffect(() => {
    setTag("all");
    setSearch("");
  }, [category]);


  return (
    <div className="community-filter-group">

      <div className="community-tag-group">
        {/* 태그 선택: 선택해도 목록이 바로 바뀌지 않고 상태만 업데이트됨 */}
        <select value={tag} onChange={(e) => setTag(e.target.value)}>
          <option value="all">전체보기</option>
          {currentOptions?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="community-search-group">
        {/* 검색조건 */}
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">제목+내용</option>
          <option value="title">제목</option>
          <option value="content">내용</option>
          <option value="author">작성자</option>
        </select>
      </div>

      {/* 검색어 입력 */}
      <div className="community-searchInput-box">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearchFn()} // 엔터키 지원
          placeholder='검색어를 입력하세요.'
        />
        <button className="search-btn" onClick={onSearchFn}>검색</button>
      </div>

    </div>
  )
}

export default CommunityTagBar