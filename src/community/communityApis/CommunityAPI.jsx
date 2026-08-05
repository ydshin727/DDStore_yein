import axios from 'axios'
import React from 'react'
import { API_JSON_SERVER_URL } from '../../apis/commonApi'


const CommunityAPI = {
  // 게시글 목록 가져오기 (서버에서 카테고리 필터링)
  fetchCommunityList: async (category) => {
    const res = await axios.get(`${API_JSON_SERVER_URL}/community?category=${category}`)
    //최신순정렬
    return res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  },
  // 상세정보 불러오기
  fetchCommunityDetail: async (id) => {
    const res = await axios.get(`${API_JSON_SERVER_URL}/community/${id}`)
    return res.data
  },
  // 게시글 생성
  createCommunityPost: async (postData) => {
    const res = await axios.post(`${API_JSON_SERVER_URL}/community`, postData)
    return res.data
  },
  // 게시글 수정
  updateCommunityPost: async (id, postData) => {
    const res = await axios.put(`${API_JSON_SERVER_URL}/community/${id}`, postData)
    return res.data
  },
  // 게시글 삭제하기
  removeCommunityPost: async (id) => {
    await axios.delete(`${API_JSON_SERVER_URL}/community/${id}`)
    return id
  },
  // 조회수 증가 로직
  updateCommunityViewCount: async (id) => {
    const res = await axios.get(`${API_JSON_SERVER_URL}/community/${id}`)
    const patchRes = await axios.patch(`${API_JSON_SERVER_URL}/community/${id}`, {
      view_count: (res.data.view_count || 0) + 1 // +1 증가후 patch
    })
    return patchRes.data
  },
  // 질문 답변 상태
  updateCommunityStatus: async (id, status) => {
    // status 인자에 'COMPLETED', 'PENDING' 또는 { status: '...' } 등을 상황에 맞게 넘겨줌
    const res = await axios.patch(`${API_JSON_SERVER_URL}/community/${id}`,
      typeof status === 'object' ? status : { status }
    )
    return res.data
  },

  //---------- 유저 관리, 활동 제한  ------------------------
  // 활동 제한(정지) 적용
  restrictCommunityUser: async (userId, restrictionData) => {
    const res = await axios.post(`${API_JSON_SERVER_URL}/restrictions`, {
      user_id: userId,
      ...restrictionData,
      status: 'ACTIVE',
      created_at: new Date().toISOString()
    })
    return res.data
  },
  // 활동 제한 해제
  liftCommunityRestriction: async (userId) => {
    const searchRes = await axios.get(`${API_JSON_SERVER_URL}/restrictions?user_id=${userId}&status=ACTIVE`)
    if (searchRes.data.length === 0) throw new Error("정지기록이 없습니다.")

    const recordId = searchRes.data[0].id
    await axios.patch(`${API_JSON_SERVER_URL}/restrictions/${recordId}`, {
      status: 'LIFTED',
      lifted_at: new Date().toDateString()
    })
    return userId
  },
  // 유저 활동제한 상태확인
  fetchCommunityActiveRestriction: async (userId) => {
    const res = await axios.get(`${API_JSON_SERVER_URL}/restrictions?user_id=${userId}&status=ACTIVE`)
    return res.data
  },
  // 유저정지기록 확인
  fetchCommunityUserRestriction: async (userId) => {
    const res = await axios.get(`${API_JSON_SERVER_URL}/restrictions?user_id=${userId}`)
    return res.data
  },
  //  정지기록있는 전체유저
  fetchCommunityAllActiveRestrictions: async () => {
    try {
      const res = await axios.get(`${API_JSON_SERVER_URL}/restrictions?status=ACTIVE`);
      return res.data;
    } catch (error) {
      console.error("전체 정지 목록 호출 에러:", error);
      throw error;
    }
  },
  // 정지 기간 만료 체크 및 자동 복구
  checkAndPatchRestriction: async (userId) => {
    const res = await axios.get(`${API_JSON_SERVER_URL}/restrictions?user_id=${userId}&status=ACTIVE`)
    if (res.data.length === 0) return null

    const record = res.data[0]
    const now = new Date()
    if (now > new Date(record.end_date)) {
      await axios.patch(`${API_JSON_SERVER_URL}/restrictions/${record.id}`, {
        status: 'LIFTED',
        lifted_at: new Date().toISOString()
      })
      return { isRestored: true }
    }
    return { isRestored: false, data: record }
  },

  // --- 기타 정보 조회 ---
  fetchCommunityUserGrade: async (userId) => {
    const res = await axios.get(`${API_JSON_SERVER_URL}/grades?userId=${userId}`)
    return res.data[0] || { currentGrade: 'Welcome', totalSpent: 0 }
  },
  fetchCommunityMemberInfo: async (userId) => {
    try {
      const res = await axios.get(`${API_JSON_SERVER_URL}/member/${userId}`)
      return res.data
    } catch (err) { return null }
  },


  // -------------- 유저 댓글,정보  ---------------------------
  //유저정보관련 (모달액션)
  //유저등급 및 누적금액
  fetchCommunityUserGrade: async (userId) => {
    const res = await axios.get(`${API_JSON_SERVER_URL}/grades?userId=${userId}`)
    return res.data[0] || { currentGrade: 'Welcome', totalSpent: 0 }
  },

  // 유저ID로 멤버정보(이메일) 가져오기
  fetchCommunityMemberInfo: async (userId) => {
    try {
      const res = await axios.get(`${API_JSON_SERVER_URL}/member/${userId}`)
      return res.data
    } catch (err) {
      console.error('멤버 정보 로드 실패', err)
      return null
    }
  },
  //후기 데이터 호출
  fetchAllComments: async () => {
    const res = await axios.get(`${API_JSON_SERVER_URL}/comments`)
    return res.data
  },

}

export default CommunityAPI