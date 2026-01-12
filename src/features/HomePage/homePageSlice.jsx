import { createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import { parseDate } from '../ProjectPage/projectPageSlice';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const loadProjects = createAsyncThunk(
    'homePage/loadProjects',
    async(username, thunkAPI) => {
        const { dispatch } = thunkAPI;
        try {
            const res = await axios.get(`${API_URL}/projects`, { params: {username: username} });
            dispatch(clearProjects());
            for(let project of res.data.projects) {
                dispatch(addProject(project));
            }
            return res.data;
        } catch(err) {
            return thunkAPI.rejectWithValue(err.response?.data || { message: 'Failed to load projects' });;
        }
    }
);

export const createProject = createAsyncThunk(
    'homePage/createProject',
    async(project, thunkAPI) => {
        const { dispatch, getState } = thunkAPI;
        const state = getState();
        for(let current of state.homePage.projects) {
            if(project.projectName === current.name) {
                return thunkAPI.rejectWithValue('Project Already Exists');
            }
        }
        try {
            const res = await axios.post(`${API_URL}/projects`, 
                {
                    ...project,
                    projectCreationDate: parseDate(new Date())
                });
            dispatch(addProject(res.data.newProject));
            return res.data;
        } catch(err) {
            return thunkAPI.rejectWithValue(err.response?.data || 'Error in Thunk');
        }
    }
);

export const renameProject = createAsyncThunk(
    'homePage/renameProject',
    async(info, thunkAPI) => {
        try {
            const projectRes = await axios.put(`${API_URL}/projects`, { projectID: info.id, projectName: info.newName });
            const taskRes = await axios.put(`${API_URL}/tasks`, 
                { 
                    user: info.user, 
                    projectName: info.currentName,
                    newName: info.newName, 
                    targetField: 'projectName',
                    searchType: 'username' 
                }
            );
            return {
                'Project Res': projectRes.data,
                'Task Res': taskRes.data
            };
        } catch(err) {
            return thunkAPI.rejectWithValue(err.response?.data || 'Error in rename thunk');
        }
    }
);

export const deleteProject = createAsyncThunk(
    'homePage/deleteProject',
    async(projectID, thunkAPI) => {
        try {
            const res = await axios.delete(
                `${API_URL}/projects`, 
                { params: { projectID } }
            );
            if(!res.data.success) return thunkAPI.rejectWithValue(res.data.message);
            
            return projectID;
        } catch(err) {
            return thunkAPI.rejectWithValue(err);
        }
    }
)

export const homePageSlice = createSlice({
    name: 'homePage',
    initialState: {
        projects: [],
        isLoading: false,
        hasError: false,
        errorMsg: ''
    },
    reducers: {
        setName: (state, action) => {
            for(let project of state.projects) {
                if(project.id === action.payload.id) {
                    project.name = action.payload.newName;
                }
            }
        },
        clearProjects: (state) => {
            state.projects = [];
        },
        addProject: (state, action) => {
            state.projects.push({
                id: action.payload.projectID,
                name: action.payload.projectName,
                creationDate: action.payload.projectCreationDate,
                currentTasks: [],
                completedTasks: []
            });
        },
        setCurrentTasks: (state, action) => {
            state.currentTasks = action.payload;
        },
        setCompletedTasks: (state, action) => {
            state.completedTasks = action.payload;
        },
        setErrorMsg: (state, action) => {
            state.errorMsg = action.payload;
        },
        setHasError: (state, action) => {
            state.hasError = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadProjects.pending, state => {
                state.isLoading = true;
                state.hasError = false;
            })
            .addCase(loadProjects.fulfilled, state => {
                state.isLoading = false;
                state.hasError = false;
            })
            .addCase(loadProjects.rejected, state => {
                state.isLoading = false;
                state.hasError = true;
            })
            .addCase(createProject.pending, state => {
                state.isLoading = true;
                state.hasError = false;
            })
            .addCase(createProject.fulfilled, state => {
                state.isLoading = false;
                state.hasError = false;
            })
            .addCase(createProject.rejected, (state, action) => {
                state.isLoading = false;
                state.hasError = true;
                state.errorMsg = action.payload;
            })
            .addCase(renameProject.pending, state => {
                state.isLoading = true;
                state.hasError = false;
            })
            .addCase(renameProject.fulfilled, (state) => {
                state.isLoading = false;
                state.hasError = false;
            })
            .addCase(renameProject.rejected, state => {
                state.isLoading = false;
                state.hasError = true;
            })
            .addCase(deleteProject.pending, state => {
                state.isLoading = true;
                state.hasError = false;
            })
            .addCase(deleteProject.fulfilled, (state, action) => {
                state.isLoading = false;
                state.hasError = false;
                state.projects = state.projects.filter(project => 
                    project.id !== action.payload
                );
            })
            .addCase(deleteProject.rejected, state => {
                state.isLoading = false;
                state.hasError = true;
            })
    }
});

export const { 
    setName, 
    addProject, 
    clearProjects,
    setCurrentTasks, 
    setCompletedTasks,
    setErrorMsg,
    setHasError 
} = homePageSlice.actions;

export default homePageSlice.reducer;