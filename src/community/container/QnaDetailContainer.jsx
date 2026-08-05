import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCommunityDetail, clearDetail, removeCommunityPost, updateViewCount, updateStatus } from '../slice/communitySlice'
import { clearComments } from '../slice/communityCommentSlice'
import CommentContainer from '../components/comment/CommentContainer'
import CommunityModal from '../components/common/CommunityModal'
import { getTagLabel, nicknameLabel, ScrollToTopButton } from '../components/common/CommunityUtils'
import useCommunityMenu from '../hooks/useCommunityMenu'
import CommunityUserMenu from '../components/common/CommunityUserMenu'
import '../css/container/qnaDetail.css'
import useCommunityAuth from '../hooks/useCommunityAuth'

const QnaDetailContainer = () => {
  const { id } = useParams() // URL 파라미터에서 게시글 ID 추출
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // 스토어에서 데이터 및 권한 정보 가져오기
  const { detail, loading, tagOptions, items } = useSelector(state => state.community)
  const auth = useSelector(state => state.auth)
  //방어로직 훅
  const { isAdmin, user, isDataReady } = useCommunityAuth('qna', { detailData: detail })
  //커뮤니티 훅
  const { menuInfo, modalInfo, handleUserClick, handleMenuAction, closeMenu, closeModal } = useCommunityMenu(auth, items)
  // 본인 확인
  const isOwner = auth.isState && String(detail?.user_id) === String(auth.isUser?.id);
  const is_Fixed = detail?.is_fixed //고정글여부
  // 조회 권한 (고정글,질문글,관리자,작성자)
  const canSeeCon = is_Fixed || detail?.tag === 'question' || isAdmin || isOwner

  useEffect(() => {
    if (id) {
      // 1. 상세 데이터 불러오기
      dispatch(fetchCommunityDetail(id))
      // 2. 슬라이스에 저장된 조회수증가 실행
      dispatch(updateViewCount(id))
    }
    // 컴포넌트 언마운트 시 데이터 비우기 (메모리 관리)
    return () => {
      dispatch(clearDetail())
      dispatch(clearComments())
    }
  }, [id, dispatch])

  // 데이터가 로딩 중이거나 아직 훅에서 준비가 안 됐을 때 방어
  if (loading || !isDataReady) return <div className="loading">데이터를 불러오는 중입니다...</div>;

  // 데이터 로드가 끝났는데 detail이 없는 경우
  if (!detail) return <div className="error">게시글을 찾을 수 없습니다.</div>;

  // 삭제 로직
  const onDeleteFn = async () => {
    if (!confirm("정말로 삭제하시겠습니까?")) return
    dispatch(removeCommunityPost(id))
      .unwrap()
      .then(() => {
        alert("삭제되었습니다.")
        navigate('/community/qna')
      })
  }

  // 답변상태
  const statusCheckToggle = () => {
    if (!detail) return
    const nextStatus = detail.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
    const message = nextStatus === 'PENDING' ? "다시 '답변대기'상태로 되돌리시겠습니까? " : "'답변완료' 상태로 변경하시겠습니까?";
    if (!confirm(message)) return;
    dispatch(updateStatus({ id: detail.id, status: nextStatus })).unwrap().then(() => alert("변경되었습니다."));
  };



  return (
    <div className="qna-detail">
      <div className="qna-detail-con">
        <div className="detail-header">
          <div className="title-area">
            <div className="status-wrapper">
              <span className="tag">
                {/* 고정일땐 태그 [필독]으로 */}
                {is_Fixed ? <span className='fixed-badge'>필독</span> : `[${getTagLabel(tagOptions, detail.category, detail.tag)}]`}
              </span>
              <h2>{detail.title}</h2>
              {!is_Fixed && (
                <span className={`status-badge ${detail.status === 'COMPLETED' ? 'done' : 'pending'}`}>
                  {detail.status === 'COMPLETED' ? '답변완료' : '답변대기중'}
                </span>
              )}

              {/* 답변완료 체크(관리자) */}
              {isAdmin && !is_Fixed && (
                <button onClick={statusCheckToggle} className={`status-toggle-btn ${detail.status === 'COMPLETED' ? 'is-completed' : ''}`}>
                  {detail.status === 'COMPLETED' ? '답변취소' : '답변완료 체크'}
                </button>
              )}
            </div>

            <div className="info">
              <div className="info-left">
                <span className='author' onClick={(e) => handleUserClick(e, detail)} style={{ cursor: 'pointer' }}>
                  작성자:
                  {(() => {
                    const adminInfo = nicknameLabel(detail.user_id, detail.author);
                    return (
                      <span style={{ marginLeft: '8px' }}>
                        {adminInfo.render}
                      </span>
                    );
                  })()}
                </span>
              </div>
              <div className="info-right">
                <span>작성일: {detail.created_at?.split('T')[0]}</span>
                <span>조회수: {detail.view_count}</span>
              </div>
            </div>

          </div>
        </div>

        {/* 본문 */}
        {canSeeCon ? (
          <div className="content-text">{detail.content}</div>
        ) : (
          <div className="locked_message">비공개글입니다. 작성자와 관리자만 확인할 수 있습니다.</div>
        )}

        {/* 댓글영역 컨테이너연결 */}
        {!is_Fixed && (
          <>
            <hr className='detail-comment-content' />
            <CommentContainer
              category='qna'
              post_id={id}
              postAuthorId={detail.user_id}
              postTag={detail.tag}
              onAction={handleMenuAction}
            />
          </>
        )}

        {/* 하단버튼 */}
        <div className="detail-buttons">
          <button className="list-btn" onClick={() => navigate('/community/qna')}>목록으로</button>

          {/* 게시글작성자만 수정 */}
          <div className="action-group">
            <div className="action-group-btn">
              {isOwner && (<button className='edit-btns' onClick={() => navigate(`/community/qna/write/${id}`)}> 수정 </button>)}
              {/* 삭제는 작성자,관리자 */}
              {(isOwner || isAdmin) && (<button className='delete-btn' onClick={onDeleteFn}> 삭제 </button>)}
            </div>

            {/* 메뉴 */}
            {menuInfo.isOpen && (
              <CommunityUserMenu
                targetUser={menuInfo.targetUser}
                auth={auth}
                position={menuInfo.position}
                onClose={closeMenu}
                onAction={handleMenuAction}
              />
            )}

            {/* 모달 */}
            <CommunityModal
              isOpen={modalInfo.isOpen}
              actionType={modalInfo.type}
              data={modalInfo.data}
              targetUser={detail}
              onClose={closeModal}
            />

          </div>

        </div>
      </div>
      <> <ScrollToTopButton /></>
    </div>
  )
}

export default QnaDetailContainer