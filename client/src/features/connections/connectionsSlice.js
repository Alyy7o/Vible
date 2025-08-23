import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import api from '../../api/axios';

const initialState = {
    connections: [],
    pendingConnections: [],
    followers: [],
    following: [],
    loading: false,
    error: null
}

export const fetchConnections = createAsyncThunk('connections/fetchConnections', async (token) => {
    try {
        const {data} = await api.get('/api/user/connections', {
            headers: {Authorization: `Bearer ${token}`}
        })
        return data.success ? data : null;
    } catch (error) {
        console.error('Fetch connections error:', error);
        throw error;
    }
})

const connectionsSlice = createSlice({
    name: 'connections',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchConnections.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchConnections.fulfilled, (state, action) => {
                state.loading = false;
                if(action.payload){
                    state.connections = action.payload.connections
                    state.pendingConnections = action.payload.pendingConnections
                    state.followers = action.payload.followers
                    state.following = action.payload.following 
                }
                state.error = null;
            })
            .addCase(fetchConnections.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
})

export const {clearError} = connectionsSlice.actions;
export default connectionsSlice.reducer