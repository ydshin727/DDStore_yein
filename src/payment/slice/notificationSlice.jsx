import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { API_JSON_SERVER_URL } from '../../apis/commonApi'
import axios from 'axios'

// yein - 알림 Slice

const url = API_JSON_SERVER_URL

// 알림 목록 가져오기
export const fetchNotification = createAsyncThunk(
  'notification/fetch',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${url}/notification?userId=${userId}`)
      return res.data
    } catch (error) {
      return rejectWithValue("알림 로딩 실패")
    }
  }
)

// 알림 생성 -> 어드민에서 사용
export const addNotification = createAsyncThunk(
  'notification/add',
  async (notiData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${url}/notification`, notiData)
      return res.data
    } catch (error) {
      return rejectWithValue("알림 생성 실패")
    }
  }
)

// 선택 알림 읽음 처리
export const readNotification = createAsyncThunk(
  'notification/read',
  async (ids, { rejectWithValue }) => {
    try {
      // ids 배열에 담긴 모든 알림의 isRead를 true로 바꿈
      await Promise.all(ids.map(id => axios.patch(`${url}/notification/${id}`, { isRead: true })))
      return ids
    } catch (error) {
      return rejectWithValue("알림 읽음 처리 실패")
    }
  }
)

// 선택 알림 삭제
export const deleteNotification = createAsyncThunk(
  'notification/delete',
  async (ids, { rejectWithValue }) => {
    try {
      await Promise.all(ids.map(id => axios.delete(`${url}/notification/${id}`)))
      return ids
    } catch (error) {
      return rejectWithValue("알림 삭제 실패")
    }
})

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    data: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 개별 성공 로직 (fulfilled)
      .addCase(fetchNotification.fulfilled, (state, action) => {
        state.data = action.payload
      })
      .addCase(addNotification.fulfilled, (state, action) => { 
        state.data.push(action.payload)
      })
      .addCase(readNotification.fulfilled, (state, action) => {
        state.data = state.data.map(noti => 
          action.payload.includes(noti.id) ? { ...noti, isRead: true } : noti)
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.data = state.data.filter(noti => 
          !action.payload.includes(noti.id))
      })
      // 공통 로직 (pending, fulfilled, rejected)
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.loading = true
          state.error = null
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'),
        (state) => {
          state.loading = false
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.error = action.payload || "서버 통신 중 에러가 발생했습니다"
        }
      )
  }
})

export default notificationSlice