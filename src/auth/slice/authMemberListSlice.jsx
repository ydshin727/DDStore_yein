import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios';
import React from 'react'
import { API_JSON_SERVER_URL } from '../../apis/commonApi';

// member관련 비동기 청크들을 call할수있는 함수 모음
const url = API_JSON_SERVER_URL;

// 멤버리스트를 호출하기 위한 async청크
export const fetchMemberList = createAsyncThunk(
  'authMember/fetchMemberList',
  async (_,{ rejectWithValue }) => {
    try {
      const res = await axios.get(`${url}/member`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);
// 멤버리스트를 추가하기 위한 async청크
export const postMemberList = createAsyncThunk(
  'authMember/postMemberList',
  async (data, { rejectWithValue }) => {
    try {
      const dataAdd = await axios.post(`${url}/member`, data);
      return data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);
// 멤버리스트를 삭제하기 위한 async청크
export const deleteMemberList = createAsyncThunk(
  'authMember/deleteMemberList',
  async (id, { rejectWithValue }) => {
    try {
      const dataDel = await axios.delete(`${url}/member/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);
// 멤버리스트를 수정하기 위한 async청크
export const putMemberList = createAsyncThunk(
  'authMember/putMemberList',
  async (data, { rejectWithValue }) => {
    try {
      const dataPut = await axios.put(`${url}/member/${data.id}`, data);
      return data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);


const authMemberListSlice = createSlice({
  name: 'authMember',
  initialState: {
    memberData: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 완료되면 memberList에 데이터 저장
      .addCase(fetchMemberList.fulfilled, (state, actions) => {
        state.memberData = actions.payload;
      })
      // 완료되면 data에 변경사항 적용
      .addCase(postMemberList.fulfilled, (state, action) => {
        // 추가사항이므로 기존 data배열의 길이에 맞춰 추가
        state.memberData[state.memberData.length] = action.payload;
      })
      .addCase(deleteMemberList.fulfilled, (state, action) => {
        // filter로 지운 멤버id만 제거
        state.memberData = state.memberData.filter(item => item.id !== action.payload)
      })
      .addCase(putMemberList.fulfilled, (state, action) => {
        state.memberData = state.memberData.map((el, idx) => {
          // 수정한 id만 체크해서 수정데이터 넣기
          if (el.id === action.payload.id) {
            return action.payload;
          } else {
            return el;
          }
        })
      })
  }
})
export default authMemberListSlice
