import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import React from 'react'
import CommunityAPI from '../communityApis/CommunityAPI'




// =================      게시판 관련 Slice           =============================

// 목록 가져오기
export const fetchCommunityList = createAsyncThunk('community/fetchAll', (category) => CommunityAPI.fetchCommunityList(category))
//상세정보 불러오기
export const fetchCommunityDetail = createAsyncThunk('community/fetchDetail', (id) => CommunityAPI.fetchCommunityDetail(id))
//게시글 삭제하기
export const removeCommunityPost = createAsyncThunk('community/removePost', (id) => CommunityAPI.removeCommunityPost(id))
//조회수 증가
export const updateViewCount = createAsyncThunk('community/updateViewCount', (id) => CommunityAPI.updateCommunityViewCount(id))
//질문 답변유무
export const updateStatus = createAsyncThunk('community/updateStatus', ({ id, status }) => CommunityAPI.updateCommunityStatus(id, status))
// 커뮤니티 정지 관련
export const restrictUser = createAsyncThunk('community/restrictUser', ({ userId, restrictionData }) => CommunityAPI.restrictCommunityUser(userId, restrictionData))
// 활동제한 해제
export const liftCommunityRestriction = createAsyncThunk('community/liftRestriction', (userId) => CommunityAPI.liftCommunityRestriction(userId))
// 유저 활동제한 상태확인
export const fetchCommunityActiveRestriction = createAsyncThunk('community/fetchActive', (userId) => CommunityAPI.fetchCommunityActiveRestriction(userId))
// 유저 정지기록 확인
export const fetchCommunityUserRestrictions = createAsyncThunk('community/fetchHistory', (userId) => CommunityAPI.fetchCommunityUserRestriction(userId))
// 정지기록있는 전체유저
export const fetchAllActiveRestrictions = createAsyncThunk('community/fetchAllActive', () => CommunityAPI.fetchCommunityAllActiveRestrictions())
// 정지기간 만료 체크 및 자동복구
export const checkCommunityAndRestoreRestriction = createAsyncThunk('community/checkAndRestore', (userId) => CommunityAPI.checkAndPatchRestriction(userId))

// 함수가아닌 객체여야함
const communitySlice = createSlice({
  name: 'community',
  initialState: {
    items: [],        //게시판목록
    detail: null,     //상세 데이터
    filterItems: [],    //검색어 필터가 적용된 화면출력
    loading: false,
    activeRestriction: null,      // 현재 활성화된 정지 정보 (단건)
    userRestrictionHistory: [],   // 해당 유저의 전체 정지 이력
    allActiveRestrictions: [],    // 관리자용: 전체 정지 유저 목록
    error: null,
    sortConfig: { key: 'updated_at', direction: 'desc' },
    orderstore: [],  //orderstore 전용공간
    //커뮤니티 태그옵션
    tagOptions: {
      notice: [
        { value: 'alert', label: '공지사항' },
        { value: 'event', label: '이벤트' },
        { value: 'etc', label: '기타' }
      ],
      faq: [
        { value: 'event', label: '이벤트' },
        { value: 'account', label: '계정' },
        { value: 'payment', label: '결제' },
        { value: 'refund', label: '환불' },
        { value: 'service', label: '서비스' },
        { value: 'etc', label: '기타' }
      ],
      qna: [
        { value: 'question', label: '질문' },
        { value: 'report', label: '신고' },
        { value: 'secret', label: '1:1문의' }
      ],
      review: [
        { value: 'general', label: '일반' }
      ],
      orderstore: [
        { value: 'general', label: '일반' }
      ]
    }
  },

  reducers: {
    //데이터 비움
    clearDetail: (state) => { state.detail = null },

    //검색어 필터
    searchCommunity: (state, action) => {
      const { tag, filter, search } = action.payload
      let result = [...state.items]
      //태그필터
      if (tag && tag !== "all") result = result.filter(el => el.tag === tag)
      //검색어필터
      if (search && search.trim()) {
        const keyword = search.toLowerCase()
        result = result.filter(el => {
          const title = el.title || ""; const content = el.content || ""; const author = el.author || ""
          if (filter === "all") return title.includes(keyword) || content.includes(keyword)
          if (filter === "title") return title.includes(keyword)
          if (filter === "content") return content.includes(keyword)
          if (filter === "author") return author.includes(keyword)
          return true
        })
      }
      state.filterItems = result
    },
    //정렬
    sortCommunity: (state, action) => {
      const key = action.payload; let direction = 'desc'
      if (state.sortConfig.key === key && state.sortConfig.direction === 'desc') direction = 'asc'
      state.sortConfig = { key, direction }
      state.filterItems.sort((a, b) => {
        if (a[key] < b[key]) return direction === 'asc' ? -1 : 1
        if (a[key] > b[key]) return direction === 'asc' ? 1 : -1
        return 0
      })
    },
  },

  extraReducers: (builder) => {
    builder
      //목록 호출 상태관리
      .addCase(fetchCommunityList.pending, (state) => { state.loading = true })
      .addCase(fetchCommunityList.fulfilled, (state, action) => {
        state.loading = false; state.items = action.payload; state.filterItems = action.payload
      })
      //상세 데이터호출 상태관리
      .addCase(fetchCommunityDetail.fulfilled, (state, action) => { state.detail = action.payload })
      // 삭제처리: 성공 시 item 배열에서 해당 글을 즉시 삭제
      .addCase(removeCommunityPost.fulfilled, (state, action) => {
        //원본+필터링된리스트 양쪽 모두 삭제 반영
        state.items = state.items.filter(item => item.id !== action.payload)
        state.filterItems = state.filterItems.filter(item => item.id !== action.payload)
      })
      // 조회수 업데이트 성공시, detail 상태 반영
      .addCase(updateViewCount.fulfilled, (state, action) => { state.detail = action.payload })
      .addCase(updateStatus.fulfilled, (state, action) => { state.detail = action.payload })
      // 커뮤니티 정지관련
      .addCase(restrictUser.fulfilled, (state, action) => {
        state.activeRestriction = action.payload; // DB에 반환된 reason값 포함 저장
        alert("해당 유저의 활동이 성공적으로 제한되었습니다.");
      })
      // 제한 해제 성공 시 처리
      .addCase(liftCommunityRestriction.fulfilled, (state, action) => {
        state.activeRestriction = null //상태 비우기
        alert("활동 제한이 해제되었습니다.");
      })
      .addCase(fetchCommunityActiveRestriction.fulfilled, (state, action) => {
        state.activeRestriction = action.payload[0] || null
      })
      //유저정지기록 처리
      .addCase(fetchCommunityUserRestrictions.fulfilled, (state, action) => {
        state.userRestrictionHistory = action.payload
      })
      .addCase(fetchAllActiveRestrictions.fulfilled, (state, action) => {
        state.allActiveRestrictions = action.payload
      })
      // 자동 해지 및 조회 시
      .addCase(checkCommunityAndRestoreRestriction.fulfilled, (state, action) => {
        if (!action.payload || action.payload.isRestored) {
          // 기록이 없거나, 방금 기간 만료로 LIFTED가 된 경우 상태를 비웁니다.
          state.activeRestriction = null;
          if (action.payload?.isRestored) {
            alert("이용 정지 기간이 만료되어 권한이 자동 복구되었습니다.");
          }
        } else {
          // 아직 ACTIVE 기간이 남은 경우에만 정지 정보를 유지합니다.
          state.activeRestriction = action.payload.data;
        }
      })
      .addCase(checkCommunityAndRestoreRestriction.rejected, (state, action) => {
        console.error("자동 복구 체크 실패:", action.payload);
      });


  }
})


export const { clearDetail, searchCommunity, sortCommunity } = communitySlice.actions;
export default communitySlice