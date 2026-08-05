import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { API_JSON_SERVER_URL } from '../../apis/commonApi'
import axios from 'axios'


//=====================     댓글 관리 슬라이스      =========================


// 해당 게시판(category)의 댓글,답글 목록 가져오기
export const fetchComments = createAsyncThunk(
  'community/fetchComments',
  async ({ category, post_id }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_JSON_SERVER_URL}/community_comments?post_id=${post_id}`)
      return res.data  //서버에서 계층으로 가공해서 주거나,프론트에서 가공
    } catch (err) {
      return rejectWithValue(err.response?.data || "불러오기 실패")
    }
  }
)

// 모든 댓글 가져오기
export const fetchAllComments = createAsyncThunk(
  'community/fetchAllComments',
  async (_, { rejectWithValue }) => {
    try {
      // 쿼리 스트링 없이 전체 요청
      const res = await axios.get(`${API_JSON_SERVER_URL}/community_comments`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "전체 불러오기 실패");
    }
  }
);


//댓글 추가
export const addComment = createAsyncThunk(
  'community/addComment',
  async (commentData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_JSON_SERVER_URL}/community_comments`, commentData)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data || "서버 통신오류가 발생했습니다.")
    }
  })

//댓글 수정
export const updateComment = createAsyncThunk(
  'comment/updateComment',
  async ({ id, content }, { rejectWithValue }) => {
    try {
      //content 내부 부분만 수정
      const res = await axios.patch(`${API_JSON_SERVER_URL}/community_comments/${id}`, {
        content,
        updated_at: new Date().toISOString() //수정시간 기록
      })
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data || "수정실패")
    }
  }
)

//댓글 삭제 
export const removeComment = createAsyncThunk(
  'community/removecomment',
  async (comment_id, { rejectWithValue }) => {
    try {
      //서버의DB에서 해당id를가진 댓글 삭제요청
      await axios.delete(`${API_JSON_SERVER_URL}/community_comments/${comment_id}`)
      return comment_id // 삭제성공시 삭제한id를반환하여 업데이트
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

const communityCommentSlice = createSlice({
  name: 'comment',
  initialState: {
    comments: [],
    loading: false,
    error: null,
  },



  reducers: {
    clearComments: (state) => {
      state.comments = []
    }
  },


  extraReducers: (builder) => {
    builder
      //목록 호출
      .addCase(fetchComments.pending, (state) => { state.loading = true })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false
        state.comments = action.payload
      })
      //등록
      .addCase(addComment.fulfilled, (state, action) => {
        state.comments.push(action.payload)
      })
      //수정
      .addCase(updateComment.fulfilled, (state, action) => {
        const index = state.comments.findIndex(el => el.id === action.payload.id)
        if (index !== -1) {
          state.comments[index] = action.payload; //상태업데이트
        }
      })
      //삭제
      .addCase(removeComment.fulfilled, (state, action) => {
        state.comments = state.comments.filter(el => el.id !== action.payload)
      })
      //모든 댓글
      .addCase(fetchAllComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload; // 전체 데이터 저장
      })
  }
})

export const { clearComments } = communityCommentSlice.actions
export default communityCommentSlice