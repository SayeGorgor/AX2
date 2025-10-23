import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const attemptLogin = createAsyncThunk(
    'loginPage/attemptLogin', 
    async(credentials, thunkAPI) => {
        try {
            const res = await axios.post(`${API_URL}/login`, credentials);
            return res.data;
        } catch(err) {
            return thunkAPI.rejectWithValue(err.response?.data || { message: 'Login failed' });
        }
    }
)

export const attemptSignUp = createAsyncThunk(
    'loginPage/attemptSignUp',
    async(newUserData, thunkAPI) => {
        const { newUser, pwdInput, passwordConfirm } = newUserData;
        if(pwdInput !== passwordConfirm) {
            return thunkAPI.rejectWithValue(err.response?.data || { message: 'Password Fields Must Match' });
        }
        try {
            const res = await axios.post(`${API_URL}/signup`, newUser);
            return res.data;
        } catch(err) {
            return thunkAPI.rejectWithValue(err.response?.data || { message: 'Sign Up Failed' });
        }
    }
)

export const logout = createAsyncThunk(
    'loginPage/logout',
    async(thunkAPI) => {
        try {
            const res = await axios.get(`${API_URL}/logout`, { withCredentials: true });
            return res.data;
        } catch(err) {
            return thunkAPI.rejectWithValue(err.response?.data || { message: 'Error Logging Out' });
        }
    }
)

export const loginPageSlice = createSlice({
    name: 'loginPage',
    initialState: {
        showLogin: true,
        usernameInput: '',
        pwdInput: '',
        emailInput: '',
        isLoading: false,
        isLoggedIn: false,
        hasError: false,
        message: '',
    },
    reducers: {
        switchPages: (state, action) => {
            state.showLogin = !state.showLogin;
            state.usernameInput = '';
            state.pwdInput = '';
            state.emailInput = '';
        },
        setUsernameInput: (state, action) => {
            state.usernameInput = action.payload;
        },
        setPwdInput: (state, action) => {
            state.pwdInput = action.payload;
        },
        setEmailInput: (state, action) => {
            state.emailInput = action.payload;
        },
        compare: (state, action) => {
            if(action.payload.pwdInput === action.payload.passwordConfirm) {
                state.hasError = false;
            } else {
                state.hasError = true;
                state.message = 'Password and Confirm Password must match';
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(attemptLogin.pending, state => {
                state.isLoading = true;
                state.message = '';
                state.hasError = false;
            })
            .addCase(attemptLogin.fulfilled, state => {
                state.isLoading = false;
                state.message = '';
                state.isLoggedIn = true;
                state.hasError = false;
            })
            .addCase(attemptLogin.rejected, (state, action) => {
                state.isLoading = false;
                state.message = action.payload?.message || 'Login Failed';
                state.hasError = true;
            })
            .addCase(attemptSignUp.pending, state => {
                state.isLoading = true;
                state.message = '';
                state.hasError = false;
            })
            .addCase(attemptSignUp.fulfilled, state => {
                state.isLoading = false;
                state.message = 'Account Created Successfully';
                state.hasError = false;
            })
            .addCase(attemptSignUp.rejected, (state, action) => {
                state.isLoading = false;
                state.message = action.payload?.message || 'Error Signing Up';
                state.hasError = true;
            })
            .addCase(logout.pending, state => {
                state.isLoading = true;
                state.message = '';
                state.hasError = false;
            })
            .addCase(logout.fulfilled, state => {
                state.isLoading = false;
                state.message = '';
                state.hasError = false;
                state.isLoggedIn = false;
            })
            .addCase(logout.rejected, (state, action) => {
                state.isLoading = false;
                state.message = action.payload?.message || 'Error Logging Out';
                state.hasError = true;
            })
    }
});

export const { switchPages, setUsernameInput, setPwdInput, setEmailInput, compare } = loginPageSlice.actions;

export default loginPageSlice.reducer;