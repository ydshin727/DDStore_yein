import { FormatDate, nicknameLabel } from "../common/CommunityUtils";
import useTextLimit from "../../hooks/useTextLimit";

//======================     댓글창 관리 컨테이너        ========================
export const CommentItem = ({ comment, isReply = false, canReply, postTag, ...props }) => {
  if (!comment) return null;
  const { auth, isAdmin, postAuthorId, editId, setEditId, onDelete,
    onUpdateSubmit, onReplyClick, onUserClick } = props;

  //관리자 이모지적용
  const adminInfo = nicknameLabel(comment.user_id, comment.author);
  // 글자제한 훅
  const editInput = useTextLimit(comment?.content || "", 100)

  // 권한 체크 변수 설정
  const currentUserId = auth?.isUser?.id
  const isMyComment = currentUserId && String(currentUserId) === String(comment?.user_id)
  const isPostOwner = String(postAuthorId) === String(comment?.user_id);
  const isViewerPostOwner = currentUserId && String(currentUserId) === String(postAuthorId);
  const canSee = postTag === 'question' || isAdmin || isMyComment || isViewerPostOwner;

  // 수정
  if (editId === comment.id) {
    return (
      <div className="edit-box">
        <textarea value={editInput.value}
          onChange={editInput.handleChange}
          className="edit-textarea"
        />
        <div className="char-count"> {editInput.currentLength} / {editInput.maxLength}  </div>
        <div className="edit-btns">
          <button className="save-btn" onClick={() => { onUpdateSubmit(comment.id, editInput.value); setEditId(null) }}> 저장 </button>
          <button className="cancel-btn" onClick={() => setEditId(null)}> 취소 </button>
        </div>
      </div>
    );
  }

  // 권한여부확인 (정지유저인지,아닌지)
  const handleEditAttempt = () => {
    // 1. ALL 정지 유저인지 확인 (이미 Container에서 차단 로직이 있다면 props로 넘겨받는 것이 좋습니다)
    // 2. 만약 ALL 정지 상태라면 alert 띄우고 리턴
    setEditId(comment.id);
  };

  // 일반
  return (
    <div className={`comment-item-inner ${isReply ? 'is-reply' : ''} ${isPostOwner ? 'is-post-owner' : ''}`}>
      <div className="comment-info">
        {/* 닉네임 눌렀을때 메뉴창연결 */}
        <div className="author-meta">
          <span
            className={`comment-author ${adminInfo.className} ${isPostOwner ? 'is-post-owner' : ''}`} // 관리자면 admin-text 클래스 적용
            onClick={(e) => onUserClick(e, {
              id: comment?.user_id,
              user_id: comment?.user_id,
              author: comment?.author,
              email: comment?.userEmail || ""
            })}
          >
            {adminInfo.render}
          </span>
          {/* 작성하고나서 작성자라고표시됨 */}
          {isPostOwner && <span className="post-owner-badge" >[작성자]</span>}
          <span>{FormatDate(comment.created_at)}</span>
        </div>
      </div>
      <div className="comment-content">
        {canSee ? <p>{comment.content}</p> : <p className='secret-text'>비밀 댓글입니다.</p>}
      </div>

      <div className="comment-item-btns">
        {/* 답글 버튼 (부모 댓글이면서 (관리자 혹은 게시글 주인)일 때만) */}
        {!isReply && canReply && (<button className="reply-btn" onClick={() => onReplyClick(comment.id)}>답글</button>)}
        {/* 수정 버튼 (오직작성자만 - 관리자도 남의글 수정불가) */}
        {isMyComment && (<button className="edit-btn" onClick={handleEditAttempt}>수정</button>)}
        {/* 삭제 버튼 (본인댓글,관리자만) */}
        {(isMyComment || isAdmin) && (<button className="delete-btn" onClick={() => { onDelete(comment.id) }}>삭제</button>)}
      </div>
    </div>
  );
};

export default CommentItem;