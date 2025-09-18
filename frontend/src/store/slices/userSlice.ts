import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { User, UserCreateData, UserUpdateData } from '../../types/user.types';
import * as userAPI from '../../services/userService';

interface UserState {
    currentUser: User | null;
    users: User[];
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    currentUser: null,
    users: [],
    loading: false,
    error: null
};

// Async thunks
export const fetchUsers = createAsyncThunk(
    'user/fetchUsers',
    async () => {
        return await userAPI.getUsers();
    }
);

// Update createUser to use UserCreateData type
export const createUser = createAsyncThunk<User, UserCreateData>(
    'user/createUser',
    async (userData) => {
        return await userAPI.createUser(userData);
    }
);

export const updateUser = createAsyncThunk<User, { id: string; userData: UserUpdateData }>(
    'user/updateUser',
    async ({ id, userData }) => {
        return await userAPI.updateUser(id, userData);
    }
);

export const deleteUser = createAsyncThunk(
    'user/deleteUser',
    async (id: string) => {
        await userAPI.deleteUser(id);
        return id;
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.currentUser = action.payload;
        },
        clearUser: (state) => {
            state.currentUser = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Une erreur est survenue';
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.users.push(action.payload);
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                const index = state.users.findIndex(user => user.id === action.payload.id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.users = state.users.filter(user => user.id !== action.payload);
            });
    }
});

export const { setUser, clearUser, clearError } = userSlice.actions;

export const selectCurrentUser = (state: { user: UserState }) => state.user.currentUser;
export const selectUsers = (state: { user: UserState }) => state.user.users;
export const selectLoading = (state: { user: UserState }) => state.user.loading;
export const selectError = (state: { user: UserState }) => state.user.error;

export default userSlice.reducer;
