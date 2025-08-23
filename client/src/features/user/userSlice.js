import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import toast from 'react-hot-toast';
import axios from 'axios';
import api from '../../api/axios';

const initialState = {
    value: null,
    loading: false,
    error: null
}

export const fetchUser = createAsyncThunk('user/fetchUser', async (token) => {
    try {
        const {data} = await api.get('/api/user/data', {
            headers: {Authorization: `Bearer ${token}`}
        })
        return data.success ? data.user : null;
    } catch (error) {
        console.error('Fetch user error:', error);
        throw error;
    }
})

export const updateUser = createAsyncThunk('user/update', async ({token, userData}) => {
    try {
        const {data} = await api.post('/api/user/update', userData, {
            headers: {Authorization: `Bearer ${token}`}
        })

        if(data.success){
            toast.success(data.message);
            return data.user;
        }
        else{
            toast.error(data.message);
            return null;    
        }
    } catch (error) {
        console.error('Update user error:', error);
        throw error;
    }
})

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.loading = false;
                state.value = action.payload;
                state.error = null;
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.loading = false;
                state.value = action.payload;
                state.error = null;
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
})

export const {clearError} = userSlice.actions;
export default userSlice.reducer