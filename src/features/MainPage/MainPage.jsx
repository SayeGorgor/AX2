import HomePage from '../HomePage/HomePage';
import ProjectPage from '../ProjectPage/ProjectPage';
import NavBar from '../../components/NavBar';
import './MainPage.css';

import { useSelector } from 'react-redux';

const MainPage = () => {
    //Redux
    const showProjectPage = useSelector(state => state.mainPage.showProjectPage);

    return(
        <>
            <NavBar />
            <div id='main-page-container'>
                <div id='app-card'>
                    {showProjectPage ? <ProjectPage /> : <HomePage />}
                </div>
            </div>
        </>
    );
}

export default MainPage;