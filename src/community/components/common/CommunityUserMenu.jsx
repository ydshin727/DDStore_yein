import React from 'react'
import '../../../community/css/common/communityUserMenu.css'
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

const CommunityUserMenu = ({ targetUser, auth, onClose, position, onAction }) => {
  const isAdmin = auth.isUser?.userRole === 'ROLE_ADMIN'
  const myId = String(auth.isUser?.id || "");
  const targetId = String(targetUser?.user_id || "");
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const isME = myId === targetId;

  const handleMenuAction = (actionType) => {
    if(actionType === 'admin_user_detail') {
      navigate(`/admin/member?userId=${targetUser.user_id}`)
      onClose()
      return
    }
    const paths = {
      'profile_edit': `/auth/detail/${targetUser.user_id}`,
      'admin_user_detail': `/auth/detail/${targetUser.user_id}`,
      'payment_history': `/payment/list`,
    }
    if (paths[actionType]) {
      navigate(paths[actionType])
      onClose()
      return
    }
    onAction({
      type: actionType,
      data: targetUser
    })
    onClose()
  }



  return (
    <div className="userMenu" onClick={onClose}> {/* 바깥화면 클릭시 메뉴닫기추가*/}
      <div className={`userMenu-con ${isAdmin && !isME ? 'is-admin' : ''}`}
        style={{ top: position.y, left: position.x }}
        onClick={(e) => e.stopPropagation()}  //메뉴 안쪽클릭시 닫힘방지
      >
        <ul>

          {/* 본인용 */}
          {isME && (
            <>
              <li className="owner-header">내 정보관리</li>
              <li onClick={() => handleMenuAction('profile_edit')}>내 정보</li>
              <li onClick={() => handleMenuAction('payment_history')}>내 결제내역</li>
              <li onClick={() => handleMenuAction('user_profile_view')}>내 등급 확인</li>
              <li onClick={() => handleMenuAction('user_posts')}>내 작성글</li>
              <li onClick={() => handleMenuAction('review')}>내 후기글</li>
            </>
          )}

          {/* 관리자용 (유저 클릭시) */}
          {isAdmin && !isME && (
            <>
              <li className='admin-header'>운영 관리</li>
              <li onClick={() => handleMenuAction('admin_user_detail')}>회원 상세정보</li>
              <li onClick={() => handleMenuAction('user_profile_view')}>유저 등급 확인</li>
              <li onClick={() => handleMenuAction('admin_pending_list')}>미답변 질문보기</li>
              <li onClick={() => handleMenuAction('admin_user_history')}>유저 게시글</li>
              <li onClick={() => handleMenuAction('review')}>유저 후기글</li>
              <li onClick={() => handleMenuAction('admin_user_restrict')}>활동 제한 설정</li>

            </>
          )}

          {/* 일반유저 */}
          {!isME && !isAdmin && (
            <>
              <li className="user-header">작성자 정보</li>
              <li onClick={() => handleMenuAction('user_profile_view')}>회원 등급 확인</li>
              <li onClick={() => handleMenuAction('user_posts')}>작성자가 쓴 글 보기</li>
              <li onClick={() => handleMenuAction('review')}>유저의 후기글</li>
            </>
          )}

        </ul>
      </div>
    </div>
  )
}

export default CommunityUserMenu