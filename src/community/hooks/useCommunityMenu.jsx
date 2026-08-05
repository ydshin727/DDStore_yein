import React, { useState } from 'react'
import CommunityAPI from '../communityApis/CommunityAPI'


//========= 커뮤니티 공용메뉴 및 모달제어 훅    ============
const useCommunityMenu = (auth, items) => {
  // 메뉴,모달 상태관리
  const [menuInfo, setMenuInfo] = useState({
    isOpen: false,
    targetUser: null,
    position: { x: 0, y: 0 }
  })
  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    type: '',
    data: []
  })

  // 메뉴창오픈 (이름 클릭시)
  const handleUserClick = (e, user) => {
    e.preventDefault()
    setMenuInfo({
      isOpen: true,
      targetUser: user,
      position: { x: e.clientX, y: e.clientY }
    })
  }

  // 메뉴 액션에따른 데이터 호출 및 모달 제어
  const handleMenuAction = async (action, customData = null ) => {
    const actionType = typeof action === 'string' ? action : action.type
    const targetUser = typeof action === 'object' ? action.data : menuInfo.targetUser
    const targetId = String(targetUser?.user_id || targetUser?.id || '')
    try {
      // 이용 제한유저 조회
      if (customData) {
        setModalInfo({
          isOpen: true,
          type: actionType,
          data: customData
        });
        closeMenu();
        return; // 데이터가 이미 있으니 아래 API 호출 로직은 건너뜀
      }
      //등급조회
      if (actionType === 'user_profile_view') {
        const gradeData = await CommunityAPI.fetchCommunityUserGrade(targetId)
        setModalInfo({ isOpen: true, type: actionType, data: gradeData })
      }
      //활동제한기록 조회 (정지,기록)
      else if (actionType === 'admin_user_restrict') {
        const restrictData = await CommunityAPI.fetchCommunityUserRestriction(targetId)
        setModalInfo({ isOpen: true, type: actionType, data: restrictData })
      }
      // 유저후기 조회 (DB에서 이메일 확인 후, review필터링)
      else if (actionType === 'review') {
        try {
          const memberId = targetUser?.user_id || targetUser?.id
          const memberInfo = await CommunityAPI.fetchCommunityMemberInfo(memberId)

          if (!memberInfo || !memberInfo.userEmail) {
            alert('해당유저의 이메일정보를 찾을수 없습니다.')
            return
          }
          // 찾은 이메일저장
          const targetEmail = memberInfo.userEmail
          // 상품후기 DB(comments)가져와서 이메일로 필터링
          const allComments = await CommunityAPI.fetchAllComments()
          const userReviews = allComments.filter(comment => String(comment.userEmail) === String(targetEmail)
          )
          // 모달로 전송
          setModalInfo({ isOpen: true, type: 'user_comments', data: userReviews })
        } catch (err) {
          console.error('후기 로드중 오류 발생', err)
        }
      }

      // 작성글 목록 (내글, 유저글, 관리자이력)
      else if (['user_posts', 'my_posts', 'admin_user_history', 'admin_pending_list'].includes(actionType)) {
        const userId = actionType === 'my_posts' ? auth.isUser?.id : targetId
        let filtered = items || []

        if (actionType === 'admin_pending_list') {
          // 1. 미답변 질문 리스트 (유저 상관없이 전체 Q&A 중 미완료 건)
          filtered = filtered.filter(post => post.category === 'qna' && post.status !== 'COMPLETED')
        } else {
          // 2. 특정 유저의 글 목록 (ID 일치 확인)
          filtered = filtered.filter(post => String(post.user_id) === userId)
        }
        setModalInfo({ isOpen: true, type: actionType, data: filtered })
      }
      closeMenu()
    } catch (err) {
      console.error("데이터로드 실패", err)
    }
  }


  // 메뉴,모달 닫기
  const closeMenu = () => setMenuInfo(prev => ({ ...prev, isOpen: false }))
  const closeModal = () => setModalInfo(prev => ({ ...prev, isOpen: false }))


  return {
    menuInfo,
    modalInfo,
    handleUserClick,
    handleMenuAction,
    closeMenu,
    closeModal
  }
}

export default useCommunityMenu