import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCommunityList, removeCommunityPost, sortCommunity } from '../slice/communitySlice';
import '../css/container/notice.css'
import { usePagenation } from '../components/common/CommunityPagination';
import CommunityTagBar from '../components/common/CommunityTagBar';
import CommunityUtils, { FormatDate, getTagLabel, nicknameLabel, getStatusLabel, ScrollToTopButton } from '../components/common/CommunityUtils';
import useCommunityMenu from '../hooks/useCommunityMenu';
import CommunityUserMenu from '../components/common/CommunityUserMenu';
import CommunityModal from '../components/common/CommunityModal';
import useCommunitySorted from '../hooks/useCommunitySorted';


// =====================         공지사항 컨테이너       ===============================

const NoticeContainer = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  //리덕스 스토어에서 공지사항데이터,로딩상태 가져오기
  const { filterItems, loading, tagOptions, sortConfig, items } = useSelector(state => state.community);
  const auth = useSelector(state => state.auth)
  const isAdmin = auth.isUser?.userRole === 'ROLE_ADMIN'

  //게시글 정렬 훅
  const sortedItems = useCommunitySorted(filterItems)
  //페이징 공용 훅,숫자따라 목록수달라짐 , 게시글정렬훅 전달
  const { currentItems, currentPage, setCurrentPage, totalItems, itemsPerPage, resetPage } = usePagenation(sortedItems, 5)
  //모달 훅
  const { menuInfo, modalInfo, handleUserClick, handleMenuAction, closeMenu, closeModal } = useCommunityMenu(auth, items)


  // fliterItems 검색시 페이지 1로 리셋
  useEffect(() => {
    resetPage()
  }, [filterItems, resetPage])
  // 초기DB (notice)
  useEffect(() => {
    dispatch(fetchCommunityList('notice'))
  }, [dispatch])
  // 조회순,작성일순 함수 slice
  const onSort = (key) => {
    dispatch(sortCommunity(key))
  }
  //어떤글을 지울지 알수있게 el.id
  const onDeleteFn = async (id) => {
    //확인누르면 부정if 해서 try
    if (!confirm("삭제 하시겠습니까?"))
      return

    // 스토어를통해 게시글삭제 함수
    dispatch(removeCommunityPost(id))
      .unwrap()
      .then(() => {
        alert("삭제완료")
      })
      .catch((err) => {
        console.error("삭제실패", err)
        alert("삭제 중 오류발생")
      })
  }

  if (loading && filterItems.length === 0) return <div>...loading</div>




  return (
    <div className="notice">
      <div className="notice-con">
        <h2 className="notice-title">공지사항</h2>
        <div className="notice-header">
          <div className="notice-header-con">
            {/* 로그인상태 + 관리자일때만 등장 */}
            {isAdmin && (
              <button className="write-btn" onClick={() => navigate(`/community/notice/write`)}>
                글쓰기
              </button>
            )}
          </div>
        </div>

        {/* 공통 필터바 컨테이너 */}
        <CommunityTagBar category={"notice"} tagOptions={tagOptions} />

        <table className='notice-table'>
          <thead>
            <tr>
              <th>번호</th>
              <th>제목</th>
              <th>작성자</th>
              {/* 누르면 검색필터 적용 */}
              <th onClick={() => onSort('updated_at')} style={{ cursor: 'pointer' }}>
                작성일{sortConfig.key === 'updated_at' ? (sortConfig.direction === 'desc' ? '▼' : '▲') : ''}
              </th>
              <th onClick={() => onSort('view_count')} style={{ cursor: 'pointer' }}>
                조회수{sortConfig.key === 'view_count' ? (sortConfig.direction === 'desc' ? '▼' : '▲') : ''}
              </th>

              {isAdmin && <th>관리</th>}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((el, index) => {
              // 게시글 역순 계산
              const boardNumber = totalItems - (currentPage - 1) * itemsPerPage - index
              const is_Fixed = el.is_fixed //고정확인
              const adminInfo = nicknameLabel(el.userId || el.user_id, el.author); // 관리자 이미지 적용
              return (
                <tr key={el.id} className={is_Fixed ? 'fixed-row' : ''}>
                  {/* 상단고정글은 따로등록 (글번호X)  */}
                  <td>{is_Fixed ? <span className='fixed-badge'>필독</span> : boardNumber}</td>

                  {/* 제목버튼 클릭해서 내부진입 */}
                  <td className='td-title' onClick={() => navigate(`/community/notice/detail/${el.id}`)}>
                    <span className={is_Fixed ? 'fixed-title' : ''}>
                      <span className='notice-tag'>[{getTagLabel(tagOptions, el.category, el.tag)}]</span>
                      {el.title}
                    </span>
                  </td>

                  <td className='author-td'>
                    <div className='author-wrapper' onClick={(e) => handleUserClick(e, el)}>
                      {adminInfo.render}
                    </div>
                  </td>

                  <td>{FormatDate(el.updated_at)}</td>
                  <td>{el.view_count}</td>

                    {isAdmin && (
                      <td className='admin-manage-td'>
                        <button className='notice-edit' onClick={() => navigate(`/community/notice/write/${el.id}`)}>수정</button>
                        <button className='notice-delete-btn' onClick={() => onDeleteFn(el.id)}>삭제</button>
                      </td>
                    )}
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

        {/* 모달 컴포넌트 */}
        <CommunityModal
          isOpen={modalInfo.isOpen}
          actionType={modalInfo.type}
          data={modalInfo.data}
          targetUser={menuInfo.targetUser}
          onClose={closeModal}
        />

        <ScrollToTopButton />
      </div>
    </div>
  )
}


export default NoticeContainer
