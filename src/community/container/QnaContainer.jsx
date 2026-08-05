import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { checkCommunityAndRestoreRestriction, fetchCommunityList, sortCommunity } from '../slice/communitySlice'
import '../css/container/qna.css'
import Pagination, { usePagenation } from '../components/common/CommunityPagination'
import CommunityTagBar from '../components/common/CommunityTagBar'
import CommunityUserMenu from '../components/common/CommunityUserMenu'
import CommunityModal from '../components/common/CommunityModal'
import { FormatDate, getStatusLabel, getTagLabel, nicknameLabel, ScrollToTopButton } from '../components/common/CommunityUtils'
import CommunityAPI from '../communityApis/CommunityAPI'
import useCommunityMenu from '../hooks/useCommunityMenu'
import useCommunitySorted from '../hooks/useCommunitySorted'
import { fetchAllComments } from '../slice/communityCommentSlice'


// ==========================    Q&A 컨테이너     ==========================
const QnaContainer = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // 스토어 내용가져오기
  const { filterItems, tagOptions, loading, sortConfig, items } = useSelector(state => state.community)
  const auth = useSelector(state => state.auth)
  const isAdmin = auth.isUser?.userRole === 'ROLE_ADMIN'
  // 댓글 개수 계산용
  const { comments } = useSelector(state => state.comment)

  //게시글 정렬훅
  const sortedItems = useCommunitySorted(filterItems)
  // 공용 페이징
  const { currentItems, currentPage, setCurrentPage, totalItems, itemsPerPage } = usePagenation(sortedItems, 10)
  //훅 정보
  const { menuInfo, modalInfo, handleUserClick, handleMenuAction, closeMenu, closeModal } = useCommunityMenu(auth, items);
  // 조회순,작성일순 함수 slice
  const onSort = (key) => { dispatch(sortCommunity(key)) }
  // 초기 데이터 로드 (QNA 카테고리)
  useEffect(() => {
    dispatch(fetchCommunityList('qna'))
    dispatch(fetchAllComments())
    // 커뮤니티정지기간 만료여부 자동체크
    if (auth.isUser) {
      dispatch(checkCommunityAndRestoreRestriction(auth.isUser));
    }
  }, [dispatch, auth.isUser])

  // 글쓰기 버튼 클릭 시 권한 체크 로직
  const qnaWrite = async () => {
    if (!auth.isState) {
      alert('회원만 작성 가능합니다.')
      if (confirm("회원이 아닙니다. 로그인하시겠습니까?")) {
        navigate('/auth/login')
      }
      return;
    }
    try {
      // 현재 유저 ID이면서 status가 ACTIVE(정지 활성화)인 기록만 가져옴
      const res = await CommunityAPI.fetchCommunityActiveRestriction(auth.isUser.id)
      const activeData = res.data || res;
      // 정지일경우 차단
      if (activeData.length > 0) {
        const active = activeData[0];
        alert(`이용 제한 중입니다.\n 사유: ${active.reason}\n 종료: ${active.end_date.split('T')[0]} \n\n 1:1문의글만 가능합니다.`);
        navigate('/community/qna/write')
      }
      navigate('/community/qna/write');
    } catch (err) {
      navigate('/community/qna/write');
    }
  };

  if (loading && filterItems.length === 0) return <div>...loading</div>

  return (
    <div className="qna">
      <div className="qna-con">
        <h2 className="qna-title">질문 게시판 (Q&A)</h2>
        <div className="qna-header">
          {isAdmin && (
            <div className='admin-dashboard-summary'>
              <div className="admin-summary" onClick={() => handleMenuAction('admin_pending_list')}>
                미답변 질문: <strong>{filterItems.filter(el => !el.is_fixed && el.status !== 'COMPLETED').length}</strong>
              </div>
              <div className='admin-summary-item restricted' onClick={async () => {
                const activeList = await CommunityAPI.fetchCommunityAllActiveRestrictions();
                handleMenuAction('admin_user_restrict_list', activeList);
              }}>
                이용 제한 유저: <strong>조회</strong>
              </div>
            </div>
          )}
          {auth.isUser && <button className="write-btn" onClick={qnaWrite}>글쓰기</button>}
        </div>
      </div>

      <div className="qna-filter-group">

        {/* 공용 게시판필터 컨테이너*/}
        <CommunityTagBar category={'qna'} tagOptions={tagOptions} />

        <table className="qna-table">
          <thead>
            {/* 클릭시 이벤트 및 아이콘 적용 */}
            <tr>
              <th>번호</th>
              <th>제목</th>
              <th>작성자</th>
              <th onClick={() => onSort('updated_at')} style={{ cursor: 'pointer' }}>
                작성일{sortConfig.key === 'updated_at' ? (sortConfig.direction === 'desc' ? '▼' : '▲') : ''}
              </th>
              <th onClick={() => onSort('view_count')} style={{ cursor: 'pointer' }}>
                조회수{sortConfig.key === 'view_count' ? (sortConfig.direction === 'desc' ? '▼' : '▲') : ''}
              </th>
              {/* 답변확인 여부 정렬 */}
              <th onClick={() => onSort('status')} style={{ cursor: 'pointer' }}>
                상태 {sortConfig.key === 'status' ? (sortConfig.direction === 'desc' ? '▼' : '▲') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((el, index) => {
              // 글번호 계산
              const boardNumber = totalItems - (currentPage - 1) * itemsPerPage - index
              const isFixed = el.is_fixed
              const commentCount = comments?.filter(c => String(c.post_id) === String(el.id)).length || 0;
              // 관리자 이모지
              const adminInfo = nicknameLabel(el.user_id, el.author);
              return (
                <tr key={el.id} className={isFixed ? 'fixed-row' : ''}>
                  <td>{isFixed ? <span className='fixed-badge'>필독</span> : boardNumber}</td>
                  {/* 제목 클릭 시 상세 페이지 이동 */}
                  <td className='td-title' onClick={() => navigate(`/community/qna/detail/${el.id}`)} >
                    <span className={isFixed ? 'fixed-title' : 'post-title'}>
                      {!isFixed && <span className='qna-tag'>[{getTagLabel(tagOptions, 'qna', el.tag)}]</span>}
                      {el.title}
                      {commentCount > 0 && <span className='comment-count-text'> ({commentCount})</span>}

                      {/* 제목 옆 작은 상태 뱃지 */}
                      {!isFixed && (
                        <span className={`status-badge ${el.status === 'COMPLETED' ? 'done' : 'waiting'}`}>
                          {getStatusLabel(el.status)}
                        </span>
                      )}
                    </span>
                  </td>

                  <td className="author-td">
                    <div className="author-wrapper"  onClick={(e) => handleUserClick(e, el)} style={{ cursor: 'pointer' }}>
                      {adminInfo.render}
                    </div>
                  </td>

                  <td className='date-td'>{FormatDate(el.updated_at)}</td>
                  <td>{el.view_count}</td>
                  <td>
                    {!isFixed && (
                      <span className={`status-label-box ${el.status === 'COMPLETED' ? 'done' : 'waiting'}`}>
                        {getStatusLabel(el.status)}
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* 메뉴 컴포넌트 */}
        {menuInfo.isOpen && (
          <CommunityUserMenu
            targetUser={menuInfo.targetUser}
            auth={auth}
            position={menuInfo.position}
            onClose={closeMenu}
            onAction={handleMenuAction}
          />
        )}

        {/* 공용 페이징 훅 */}
        <Pagination
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />

        {/* 모달 */}
        <CommunityModal
          isOpen={modalInfo.isOpen}
          actionType={modalInfo.type}
          data={modalInfo.data}
          targetUser={menuInfo.targetUser} //누구를 대상으로할지
          onClose={closeModal}
        />
      </div>
      <ScrollToTopButton/>
    </div>
  );
}

export default QnaContainer