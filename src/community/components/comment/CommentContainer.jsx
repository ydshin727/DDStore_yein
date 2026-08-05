import React, { act, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addComment, fetchComments, updateComment, removeComment } from '../../slice/communityCommentSlice';
import { updateStatus } from '../../slice/communitySlice';
import CommunityAPI from '../../communityApis/CommunityAPI';
import CommentItem from './CommentItem';
import CommunityUserMenu from '../common/CommunityUserMenu';
import CommunityModal from '../common/CommunityModal';
import useCommunityMenu from '../../hooks/useCommunityMenu';
import useTextLimit from '../../hooks/useTextLimit';
import '../../css/comment/commentContainer.css'
import useCommunityAuth from '../../hooks/useCommunityAuth';


//======================   댓글/대댓글 관리 컨테이너    ========================

const CommentContainer = ({ category, post_id, postAuthorId, postTag, onAction }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 스토어 데이터 추출
  const { comments } = useSelector(state => state.comment);
  const auth = useSelector(state => state.auth);
  // 접근정보 훅
  const { checkIsRestricted, activeRestriction } = useCommunityAuth(category)
  const { items } = useSelector(state => state.community)
  // 현재 게시글에 해당하는 댓글 필터링
  const postComments = comments.filter(el => String(el.post_id) === String(post_id))
  // 필터링된 댓글에서 부모댓글(parent_id없는것) 필터링
  const parentComments = postComments.filter(el => !el.parent_id)
  //메뉴 훅
  const { menuInfo, modalInfo, handleUserClick, handleMenuAction, closeMenu, closeModal } = useCommunityMenu(auth, items);

  // 답글 입력창 위치 제어 상태
  const [replyTarget, setReplyTarget] = useState(null);
  const [editId, setEditId] = useState(null)
  // 글자수제한 (훅 이용)
  const mainInput = useTextLimit("", 100)

  // 권한변수(관리자냐,본인꺼냐)
  const isAdmin = auth.isUser?.userRole === 'ROLE_ADMIN';
  const isOwner = auth.isUser && String(auth.isUser.id) === String(postAuthorId);
  // 댓글 작성 권한 (관리자 혹은 게시글 주인) question은 누구든지, 아닌경우(1:1문의글,신고) 작성자와 관리자만
  const canRead = postTag === 'question' ? true : (isAdmin || isOwner);
  const canWrite = auth.isState && canRead

  // 데이터 초기 로드
  useEffect(() => {
    if (post_id) {
      dispatch(fetchComments({ category, post_id }));
    }
  }, [dispatch, category, post_id]);

  // 외부클릭시 실행 (답글창닫기)
  useEffect(() => {
    const handleClickOutside = (e) => {
      // 클릭된 요소가 '답글 작성' 버튼이거나 '답글 입력창' 내부라면 닫지 않음
      if (e.target.closest('.reply-input-wrapper') || e.target.closest('.btn-reply')) {
        return;
      }
      setReplyTarget(null); // 그 외 지역 클릭 시 닫기
    };

    if (replyTarget) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [replyTarget]);




  // 등록 (댓글/답글 통합)
  const handleAdd = async (content, parent_id = null) => {
    if (!auth.isUser) {
      if (confirm('로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/auth/login');
      }
      return;
    }
    //정지유저 차단
    if (activeRestriction && activeRestriction.status === 'ACTIVE' && activeRestriction.type === 'ALL') {
      alert(`전체 활동 제한 상태입니다. (사유: ${activeRestriction.reason})`);
      return;
    }

    if (checkIsRestricted(postAuthorId, postTag)) return;

    if (!content.trim()) return alert("내용을 입력해주세요");
    if (!confirm(parent_id ? "답글을 등록하시겠습니까?" : "댓글을 등록하시겠습니까?")) return;

    const newComment = {
      category,
      post_id,
      user_id: auth.isUser?.id,
      author: auth.isUser?.userName,
      role: auth.isUser?.userRole, // ROLE_ADMIN     
      content,
      parent_id, // 대댓글인 경우 부모 ID, 일반 댓글은 null
      created_at: new Date().toISOString()
    };

    dispatch(addComment(newComment))
      .unwrap()
      .then(() => {
        //관리자가 댓글달면 게시글상태 COMPLETED로 변경
        if (isAdmin) dispatch(updateStatus({ id: post_id, status: 'COMPLETED' }));
        //입력창 초기화
        if (!parent_id) mainInput.resetValue()
        setReplyTarget(null) //등록후 창 닫기
        alert('등록되었습니다.');
      })
  };

  // 수정
  const handleUpdate = (id, content) => {
    if (checkIsRestricted(postAuthorId, postTag)) return
    if (!confirm("수정하시겠습니까?")) return;
    dispatch(updateComment({ id, content }))
      .unwrap()
      .then(() => alert("수정되었습니다."))
  };

  // 삭제
  const handleDelete = (id) => {
    const targetComment = comments.find(el => el.id === id);
    const isMyComment = auth.isUser && String(auth.isUser.id) === String(targetComment?.user_id);
    if (!isMyComment && checkIsRestricted(postAuthorId, postTag)) return;
    if (!confirm("댓글을 정말 삭제하시겠습니까?")) return;

    dispatch(removeComment(id))
      .unwrap()
      .then(() => alert("삭제되었습니다."))
  };

  return (
    <div className="comment-container">
      <h3 className="comment-count">  댓글 {comments.length}개   </h3>

      {canRead ? (
        <>
          {/* 댓글 입력 영역 */}
          <div className="comment-write-section">
            {canWrite ? (
              <div className="comment-input-box">
                <textarea value={mainInput.value}
                  onChange={mainInput.handleChange}
                  placeholder='댓글을 입력하세요.'
                />
                <div className="char-count-wrapper"> {mainInput.currentLength} / {mainInput.maxLength}  </div>
                <button onClick={() => handleAdd(mainInput.value)}> 등록 </button>
              </div>
            ) : (
              <p className='notice-msg'> 권한이 있는 사람만 작성 가능합니다. </p>
            )}
          </div>

          {/* 댓글 리스트 */}
          <ul className="comment-list">
            {parentComments.map(comment => (
              <li key={comment.id} className='comment-item'>

                <CommentItem
                  comment={comment}
                  editId={editId}
                  setEditId={setEditId}
                  onDelete={handleDelete}
                  onUpdateSubmit={handleUpdate} // 수정 핸들러 반드시 전달
                  onReplyClick={setReplyTarget}
                  onAction={onAction}
                  auth={auth} isAdmin={isAdmin}
                  postTag={postTag} postAuthorId={postAuthorId}
                  onUserClick={handleUserClick}
                  canReply={canWrite}
                />

                {/* 대댓글 리스트 */}
                <div className="reply-section">
                  {postComments.filter(el => String(el.parent_id) === String(comment.id)).map(reply => (
                    <div key={reply.id} className="reply-item">
                      <span className='reply-mark'></span>
                      <CommentItem
                        comment={reply}
                        isReply={true}
                        editId={editId}
                        setEditId={setEditId}
                        onDelete={handleDelete}
                        onUpdateSubmit={handleUpdate}
                        onAction={onAction}
                        auth={auth} isAdmin={isAdmin} postTag={postTag} postAuthorId={postAuthorId}
                        onUserClick={handleUserClick}
                      />
                    </div>
                  ))}
                </div>

                {/* 답글 입력창 */}
                {replyTarget === comment.id && canWrite && (
                  <div className="reply-input-wrapper">
                    <ReplyInput onReplySubmit={handleAdd} parentId={comment.id} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="locked-comment-message">
          비공개글의 댓글은 작성자와 관리자만 확인할 수 있습니다.
        </div>
      )}

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
        targetUser={menuInfo.targetUser}
        onClose={closeModal}
      />

    </div>
  );
};

// 내부용 답글 입력창 컴포넌트 (CommentContainer 함수 밖) 별도의 컨테이너안만듬
const ReplyInput = ({ onReplySubmit, parentId }) => {
  const replyInput = useTextLimit("", 100)
  return (
    <div className="comment-input-box">
      <textarea value={replyInput.value} onChange={replyInput.handleChange} placeholder='답글을 입력하세요.'></textarea>
      <button onClick={() => onReplySubmit(replyInput.value, parentId)}> 답글등록 </button>
    </div>
  )
}

export default CommentContainer;