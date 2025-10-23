import { createSlice, createAsyncThunk, nanoid } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const parseDate = date => {
    return(`${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`);
}

export const loadTasks = createAsyncThunk(
    'projectPage/loadTasks',
    async(info, thunkAPI) => {
        try {
            const res = await axios.get(
                `${API_URL}/tasks`, 
                { params: {projectName: info.projectName, user: info.user}, headers: { 'Cache-Control': 'no-cache' } },
                );
            return res.data.tasks;
        } catch(err) {
            thunkAPI.rejectWithValue(err.response?.data || 'Error Loading Tasks');
        }
    }
);

export const createTask = createAsyncThunk(
    'projectPage/createTask',
    async(taskData, thunkAPI) => {
        try {
            const res = axios.post(`${API_URL}/tasks`, 
                {
                    ...taskData,
                    taskID: nanoid(),
                    taskCreationDate: parseDate(new Date())
                }
            );
            return res.data;
        } catch(err) {
            return thunkAPI.rejectWithValue(err.response?.data || 'Error In Thunk');
        }
    }
);

export const deleteTask = createAsyncThunk(
    'projectPage/deleteTask',
    async(id, thunkAPI) => {
        const { dispatch, getState } = thunkAPI;
        const state = getState();
        const taskIDs = [];
        for(let task of state.projectPage.selectedTasks) {
            taskIDs.push(task.id);
        }
        try {
            const res = await axios.delete(`${API_URL}/tasks`, { params: { taskIDs: taskIDs, id: id } });
            dispatch(clearTasks());
            return res.data;
        } catch(err) {
            return thunkAPI.rejectWithValue(err.response?.data || 'Error In Deletion Thunk')
        }
    }
);

export const toggleComplete = createAsyncThunk(
    'projectPage/toggleComplete',
    async(info, thunkAPI) => {
        const { getState } = thunkAPI;
        const state = getState();
        const taskIDs = [];
        for(let task of state.projectPage.selectedTasks) {
            taskIDs.push(task.id);
        }
        try {
            if(info.newDate === '') {
                const res = await axios.put(`${API_URL}/tasks`, 
                    { 
                        taskIDs: [info.id], 
                        taskCompletionDate: info.newDate, 
                        targetField: 'completionDate', 
                        searchType: 'id' 
                    }
                );
            } else {
                const res = await axios.put(`${API_URL}/tasks`, 
                    { 
                        taskIDs: taskIDs, 
                        taskCompletionDate: info.newDate, 
                        targetField: 'completionDate', 
                        searchType: 'id' 
                    });
            }
            return res.data;
        } catch(err) {
            return thunkAPI.rejectWithValue(err.response?.data || 'Error in Update Thunk');
        }
    }
);

export const renameTask = createAsyncThunk(
    'projectPage/renameTask',
    async(info, thunkAPI) => {
        try {
            const res = await axios.put(`${API_URL}/tasks`, 
                { 
                    taskID: info.taskID,
                    newText: info.newText, 
                    targetField: 'text',
                    searchType: 'username' 
                }
            );
            return res.data;
        } catch(err) {
            return thunkAPI.rejectWithValue(err.response?.data || 'Error in Rename Task Thunk');
        }
}
)

export const projectPageSlice = createSlice({
    name: 'projectPage',
    initialState: {
        projectName: '',
        projectCreationDate: parseDate(new Date()),
        currentTasks: [],
        completedTasks: [],
        selectedTasks: [],
        buttonsDisabled: true,
        addTaskWindowVisible: false,
        isLoading: false,
        hasError: false
    },
    reducers: {
        setButtonsDisabled: (state, action) => {
            state.buttonsDisabled = action.payload;
        },
        setProjectName: (state, action) => {
            state.projectName = action.payload;
        },
        setSelectedTasks: (state, action) => {
            state.selectedTasks = action.payload;
        },
        setAddTaskWindowVisible: (state, action) => {
            state.addTaskWindowVisible = action.payload;
        },
        setPPCurrentTasks: (state, action) => {
            state.currentTasks = action.payload;
        },
        setPPCompletedTasks: (state, action) => {
            state.completedTasks = action.payload;
        },
        setProjectDate: (state, action) => {
            state.projectCreationDate = action.payload;
        },
        addTask: (state, action) => {
            state.currentTasks.push({
                id: action.payload.taskID,
                creationDate: action.payload.taskCreationDate,
                completionDate: '',
                text: action.payload.text
            });
        },
        removeTasks: (state, action) => {
            for(let target of state.selectedTasks) {
                state.currentTasks = state.currentTasks.filter(task => task.id !== target.id);
                state.completedTasks = state.completedTasks.filter(task => task.id !== target.id);
            }
        },
        clearTasks: (state, action) => {
            state.currentTasks = [];
            state.completedTasks = [];
        },
        markComplete: (state, action) => {
            for(let selectedTask of state.selectedTasks) {
                state.completedTasks.push({
                    ...selectedTask,
                    completionDate: parseDate(new Date())
                });
                state.currentTasks = state.currentTasks.filter(task => task.id !== selectedTask.id);
            }
            state.selectedTasks = [];
        },
        markIncomplete: (state, action) => {
            state.completedTasks = state.completedTasks.filter(task => task.id !== action.payload.id);
            state.currentTasks.push({
                id: action.payload.id,
                creationDate: action.payload.creationDate,
                completionDate: action.payload.completionDate,
                text: action.payload.text
            });
        },
        handleSelect: (state, action) => {
            for(let selectedTask of state.selectedTasks) {
                if(selectedTask.id === action.payload.id) {
                    state.selectedTasks = state.selectedTasks.filter(task => task.id !== selectedTask.id);
                    return;
                }
            }
            state.selectedTasks.push(action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadTasks.pending, state => {
                state.isLoading = true;
                state.hasError = false;
            })
            .addCase(loadTasks.fulfilled, (state, action) => {
                state.isLoading = false;
                state.hasError = false;
                state.currentTasks = action.payload.filter(t => !t.taskCompletionDate);
                state.completedTasks = action.payload.filter(t => !!t.taskCompletionDate);
            })
            .addCase(loadTasks.rejected, state => {
                state.isLoading = false;
                state.hasError = true;
            })
            .addCase(createTask.pending, state => {
                state.isLoading = true;
                state.hasError = false;
            })
            .addCase(createTask.fulfilled, (state, action) => {
                state.isLoading = false;
                state.hasError = false;
            })
            .addCase(createTask.rejected, state => {
                state.isLoading = false;
                state.hasError = true;
            })
            .addCase(deleteTask.pending, state => {
                state.isLoading = true;
                state.hasError = false;
            })
            .addCase(deleteTask.fulfilled, state => {
                state.isLoading = false;
                state.hasError = false;
            })
            .addCase(deleteTask.rejected, state => {
                state.isLoading = false;
                state.hasError = true;
            })
            .addCase(toggleComplete.pending, state => {
                state.isLoading = true;
                state.hasError = false;
            })
            .addCase(toggleComplete.fulfilled, state => {
                state.isLoading = false;
                state.hasError = false;
            })
            .addCase(toggleComplete.rejected, state => {
                state.isLoading = false;
                state.hasError = true;
            })
    }
});

export const {
     setButtonsDisabled, 
     addTask, 
     removeTasks, 
     clearTasks,
     markComplete,
     markIncomplete, 
     handleSelect,
     setProjectName,
     setProjectDate,
     setSelectedTasks,
     setPPCurrentTasks,
     setPPCompletedTasks,
     setAddTaskWindowVisible 
} = projectPageSlice.actions;

export default projectPageSlice.reducer;