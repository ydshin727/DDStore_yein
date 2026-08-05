import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { clearDetail, fetchCommunityDetail, fetchCommunityList, removeCommunityPost, updateViewCount } from '../slice/communitySlice'
import '../css/container/noticeDetail.css'
import CommunityUtils, { FormatDate, getTagLabel, nicknameLabel, ScrollToTopButton } from '../components/common/CommunityUtils'



//  ===================           공지사항 세부           ====================
const NoticeDetailContainer = () => {

  //특정 공지사항의id값을 가져옴
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // 리덕스 스토어에서 상세DB,로딩 가져오기
  const { detail: notice, loading, tagOptions, detail } = useSelector(state => state.community)
  const auth = useSelector(state => state.auth)
  const isAdmin = auth.isUser?.userRole === 'ROLE_ADMIN'


  useEffect(() => {
    // 스토어에서 데이터호출
    if (id) {
      dispatch(fetchCommunityDetail(id))
        .unwrap()
        .then(() => {
          dispatch(updateViewCount(id))
        })
        .catch(() => {
          alert("게시글을 찾을수 없습니다.")
          navigate(-1)
        })
    }
    // 벗어나면 상세데이터 초기화
    // 보이는거방지
    return () => {
      dispatch(clearDetail())
    }
  }, [dispatch, id, navigate])


  // 리덕스 스토어에서 삭제기능 불러오기
  const onDeleteFn = (id) => {
    if (!confirm("삭제할까요?"))
      return

    dispatch(removeCommunityPost(id))
      .unwrap()
      .then(() => {
        alert("삭제 성공")
        navigate('/community/notice')
      })
      .catch((err) => {
        console.error("삭제실패", err)
        alert("삭제처리중 오류발생")
      })
  }

  //안들어가면에러뜸 데이터가져오기전에 화면띄우려고해서 404에러나옴...
  if (loading || !notice) { return <div className="loading">...loading</div> }

  return (
    <div className="notice-detail">
      <div className="notice-detail-con">
        {/* 1. 제목 영역: 오직 태그/제목과 필독 뱃지만 들어감 */}
        <div className="detail-header">
          <div className="title-area">
            <div className="status-wrapper">
              <span className="category-tag">
                {detail?.is_fixed ? <span className='fixed-badge'>필독</span> : `[${getTagLabel(tagOptions, detail.category, detail.tag)}]`}
              </span>
              <h2>{notice.title}</h2>
            </div>
          </div>

          <div className="info">
            <div className="info-left">
              <div className="author">
                작성자:
                {/* nicknameLabel의 리턴 구조에 맞춰 렌더링 */}
                {nicknameLabel(notice.user_id, notice.author).render}
              </div>

            </div>

            <div className="info-right">
              <span>작성일: {notice.created_at?.split('T')[0]}</span>
              <span>조회수: {notice.view_count}</span>
            </div>
          </div>
        </div>

        {/* 3. 본문 내용 */}
        <div className="detail-text">
          {notice.content}
        </div>

        {/* 4. 하단 버튼 영역 */}
        <div className="detail-buttons">
          <button className="list-btn" onClick={() => navigate('/community/notice')}>목록으로</button>

          {isAdmin && (
            <div className="action-group">
              <button className='edit-btn' onClick={() => navigate(`/community/notice/write/${notice.id}`)}>수정</button>
              <button className='delete-btn' onClick={() => onDeleteFn(notice.id)}>삭제</button>
            </div>
          )}
        </div>

        <ScrollToTopButton />
      </div>
    </div>
  )
}

export default NoticeDetailContainer