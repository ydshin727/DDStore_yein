import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import React from 'react'
import { API_JSON_SERVER_URL } from '../../apis/commonApi'



// ===================    주문처(orderStore) 관련 Slice      ========================


//매장 목록 조회
export const fetchOrderStores = createAsyncThunk(
  'orderStore/fetchList',
  async ( _ , {rejectWithValue}) => {
    try {
      const res = await axios.get(`${API_JSON_SERVER_URL}/orderstore`)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data || "매장목록을 불러오는데 실패했습니다.")
    }
  }
)
//매장정보 가져오기
export const fetchOrderStoresDetail = createAsyncThunk (
  'orderstore/fetchDetail',
  async (id) => {
    const res = await axios.get(`${API_JSON_SERVER_URL}/orderstore/${id}`)
    return res.data
  }
)

// 신규 매장등록
export const addOrderStore = createAsyncThunk(
  'orderStore/add',
  async (newStore) => {
    const res = await axios.post(`${API_JSON_SERVER_URL}/orderstore`, newStore)
    return res.data
  }
)

// 매장 정보 수정 (PATCH)
export const updateOrderStore = createAsyncThunk(
  'orderStore/update',
  async ({ id, storeData } , {rejectWithValue} ) => {
    try {
      const res = await axios.patch(`${API_JSON_SERVER_URL}/orderstore/${id}`, storeData)
      return res.data 
    } catch {
      return rejectWithValue(err.reponse?.data || "매장정보 수정에 실패했습니다.")
    }
  }
)

//매장 삭제 (DELETE)
export const removeOrderStore = createAsyncThunk(
  'orderStore/remove',
  async (id, {rejectWithValue}) => {
    try {
      await axios.delete(`${API_JSON_SERVER_URL}/orderstore/${id}`)
      return id; // 삭제성공시 id반환
    } catch (err) {
      return rejectWithValue(err.response?.data || "매장 삭제에 실패했습니다.")
    }
  }
)

  const communityOrderStoreSlice = createSlice({
    name: 'orderStore',
    initialState: {
      orderstores: [],  // 매장목록 배열
      activeStore: null, // 현재 선택(지도에표시)한 매장
      loading: false, // 로딩상태
      error: null, 
    },

    reducers: {
      //선택된 매장 변경 액션
      setActiveStore: (state,action) => {
        state.activeStore = action.payload
      },
      clearError: (state) => {
        state.error = null
      }
    },

    extraReducers: (builder) => {
      builder
      // 목록 조회
        .addCase(fetchOrderStores.pending, (state) => {
          state.loading = true
        })
        .addCase(fetchOrderStores.fulfilled, (state, action) => {
          state.loading = false
          state.orderstores = action.payload
          // 데이터있으면 첫매장 기본활성화
          if (action.payload.length > 0 && !state.activeStore) {
            state.activeStore = action.payload[0]
          }
        })
        .addCase(fetchOrderStores.rejected, (state, action) => {
          state.loading = false
          state.error = action.payload
        })

        // 매장 등록
        .addCase(addOrderStore.fulfilled, (state, action) => {
          state.orderstores.push(action.payload) //목록에추가
        })

        // 매장 수정
        .addCase(updateOrderStore.fulfilled, (state, action)=> {
          const index = state.orderstores.findIndex(el => String(el.id) === String(action.payload.id))
          if (index !== -1) {
            state.orderstores[index] === action.payload //데이터교체
          }
          if (state.activeStore?.id === action.payload.id) {
            state.activeStore = action.payload // 보고있는 매장 정보도 갱신
          }
        })

        // 매장 삭제
        .addCase(removeOrderStore.fulfilled, (state, action) => {
          state.orderstores = state.orderstores.filter(el =>String(el.id) !== String(action.payload))
          // 활성화된 매장이 삭제될 경우 초기화
          if (state.activeStore?.id === action.payload) {
            state.activeStore = state.orderstores.length > 0 ? state.orderstores[0] : null
          }
        })
    }
  })

export const { setActiveStore, clearError } = communityOrderStoreSlice.actions;
export default communityOrderStoreSlice
