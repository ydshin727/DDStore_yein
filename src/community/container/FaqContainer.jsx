import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchCommunityList, removeCommunityPost, updateViewCount } from '../slice/communitySlice'
import CommunityUtils, { getTagLabel, ScrollToTopButton } from '../components/common/CommunityUtils'
import '../../../src/community/css/container/faq.css'
import CommunityTagBar from '../components/common/communityTagBar'
import Pagination, { usePagenation } from '../components/common/CommunityPagination'


// ======================       FAQ 컨테이너       ===================================


const FaqContainer = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { filterItems, tagOptions, loading } = useSelector((state) => state.community)
  const auth = useSelector((state) => state.auth)
  const isAdmin = auth.isUser?.userRole === 'ROLE_ADMIN'

  // 아코디언 상태관리: 펼쳐진 게시글의 ID저장( 없으면null)
  const [expandId, setExpandId] = useState(null)

  // 페이징 공용 훅 , 숫자에따라 보여지는 목록수가 달라짐
  const { currentItems, currentPage, setCurrentPage, totalItems, itemsPerPage, resetPage } = usePagenation(filterItems, 5);

  // filterItems가 변경될때 (검색시) 페이지를1로 리셋
  useEffect(() => {
    resetPage()
  }, [filterItems, resetPage])

  //초기 데이터 (Faq)
  useEffect(() => {
    dispatch(fetchCommunityList('faq'))
  }, [dispatch])

  //아코디언 열람기능
  const handleToggle = (id) => {
    if (expandId === id) {
      setExpandId(null);
    } else {
      setExpandId(id);
      dispatch(updateViewCount(id)); // 펼칠 때 조회수 증가
    }
  };

  // 삭제기능함수 slice활용
  const onDeleteFn = async (id) => {
    if (!confirm("삭제하시겠습니까?"))
      return
    dispatch(removeCommunityPost(id))
    try {
      alert("삭제완료")
    } catch (err) {
      console.error(err)
    }
  }

  if (loading && filterItems.length === 0) return <div>...loading</div>

  return (

    <div className="faq">
      <div className="faq-con">
        <h2 className="faq-title">자주 묻는 질문 (FAQ)</h2>
        <div className="faq-header">
          <div className="faq-header-con">
            {isAdmin && (<button className='write-btn' onClick={() => navigate(`/community/faq/write`)}>글쓰기</button>)}
          </div>
        </div>

        {/* 공통 필터바 컨테이너 적용 */}
        <CommunityTagBar category={"faq"} tagOptions={tagOptions} />

        <div className="faq-accordion-list">
          {currentItems.map((el) => (
            <div key={el.id} className={`faq-item ${expandId === el.id ? 'active' : ''}`}>
              {/* 질문 영역 */}
              <div className="faq-question" onClick={() => handleToggle(el.id)}>
                <span className="q-mark">Q</span>
                <span className="faq-subject"> [{getTagLabel(tagOptions, 'faq', el.tag)}] {el.title}  </span>
                <span className="arrow">{expandId === el.id ? '▲' : '▼'}</span>
              </div>

              {/* 답변 영역 (관리자 버튼 포함) */}
              {expandId === el.id && (
                <div className="faq-answer">
                  <div className="answer-content">{el.content}</div>
                  {/* 관리자 전용 수정/삭제 버튼 */}
                  {isAdmin && (
                    <div className="faq-admin-controls">
                      <button className="edit-btn" onClick={() => navigate(`/community/faq/write/${el.id}`)}> 수정 </button>
                      <button className="delete-btn" onClick={() => onDeleteFn(el.id)}> 삭제 </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 공용 페이징 컴포넌트 */}
        <Pagination
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
        <ScrollToTopButton />
      </div>
    </div>
  )
}

export default FaqContainer
