import { configureStore } from "@reduxjs/toolkit";
import loginPageReducer from './features/LoginPage/loginPageSlice';
import projectPageReducer from "./features/ProjectPage/projectPageSlice";
import mainPageReducer from "./features/MainPage/mainPageSlice";
import homePageReducer from "./features/HomePage/homePageSlice";

export const store = configureStore({
    reducer: {
        loginPage: loginPageReducer,
        mainPage: mainPageReducer,
        projectPage: projectPageReducer,
        homePage: homePageReducer
    },
    devTools: false
});