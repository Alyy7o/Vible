import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import api from '../../api/axios';

const initialState = {
    messages: [],
    loading: false,
    error: null
}

export const fetchMessages = createAsyncThunk('messages/fetchMessages', async ({token, userId}) => {
    try {
        const {data} = await api.post('/api/message/get', {to_user_id: userId}, {
            headers: {Authorization: `Bearer ${token}`}
        })

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch messages');
        }

        return data.messages || [];
    } catch (error) {
        console.error('Fetch messages error:', error);
        throw error;
    }
})

const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        setMessages: (state, action) => {
            state.messages = action.payload;
            state.error = null;
        },
        addMessage: (state, action) => {
            // Check if message already exists to prevent duplicates
            const exists = state.messages.find(msg => msg._id === action.payload._id);
            if (!exists) {
                state.messages.push(action.payload);
            }
            state.error = null;
        },
        resetMessages: (state) => {
            state.messages = [];
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMessages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMessages.fulfilled, (state, action) => {
                state.loading = false;
                state.messages = action.payload;
                state.error = null;
            })
            .addCase(fetchMessages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
})

export const {setMessages, addMessage, resetMessages, clearError} = messagesSlice.actions;
export default messagesSlice.reducer