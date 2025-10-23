import { createSlice } from '@reduxjs/toolkit';

export const mainPageSlice = createSlice({
    name: 'mainPage',
    initialState: {
        user: '',
        selected: [],
        showProjectPage: false
    },
    reducers: {
        select: (state, action) => {
            state.selected.push(action.payload);
        },
        unselect: (state, action) => {
            state.selected = state.selected.filter(task => task.id !== action.payload.id);
        },
        setShowProjectPage: (state, action) => {
            state.showProjectPage = action.payload;
        },
        setUser: (state, action) => {
            state.user = action.payload;
        }
    }
});

export const { select, unselect, setShowProjectPage, setUser } = mainPageSlice.actions;

export default mainPageSlice.reducer;