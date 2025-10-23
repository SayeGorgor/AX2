import { useSelector, useDispatch } from 'react-redux';
import { setShowProjectPage } from '../MainPage/mainPageSlice';
import { setProjectDate, setProjectName } from '../ProjectPage/projectPageSlice';

import {
    deleteProject, 
    createProject, 
    setAddProjectWindowVisible,
    loadProjects,
    clearProjects,
    renameProject,
    setErrorMsg,
    setHasError,
} from './homePageSlice';

import { useEffect, useState, useRef } from 'react';
import CloseWindowButton from '../../assets/close_window.svg?react';
import OptionsButton from '../../assets/options_button.svg?react';
import './HomePage.css';

const HomePage = () => {
    //Redux
    const dispatch = useDispatch();
    const projects = useSelector(state => state.homePage.projects);
    const addProjectWindowVisible = useSelector(state => state.homePage.addProjectWindowVisible);
    const user = useSelector(state => state.mainPage.user);
    const errorMsg = useSelector(state => state.homePage.errorMsg);

    //Use State
    const [name, setName] = useState('');
    const [newName, setNewName] = useState(''); 
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);
    const [renamingActive, setRenamingActive] = useState(false);
    const [currentProject, setCurrentProject] = useState('');
    const [currentProjectID, setCurrentProjectID] = useState('');

    //Ref 
    const renamingActiveRef = useRef(renamingActive);
    
    //Functions
    const handleProjectClick = (e, date) => {
        if(e.target.tagName === 'DIV') {
            dispatch(setProjectName(e.target.children[0].textContent));
            dispatch(setProjectDate(date));
            dispatch(setShowProjectPage(true));
        }
    }

    const handleFormSubmit = async(e) => {
        e.preventDefault();
        const res = await dispatch(createProject({ username: user, projectName: name }));
        if(res.meta.requestStatus === 'fulfilled') {
            dispatch(setErrorMsg(''));
            dispatch(setHasError(false));
            dispatch(setAddProjectWindowVisible(false));
        }
        dispatch(loadProjects(user));
        setName('');
    }

    const handleCreateProjectClick = () => {
        dispatch(setAddProjectWindowVisible(true));
    }

    const handleCloseWindowClick = () => {
        dispatch(setAddProjectWindowVisible(false));
        dispatch(setErrorMsg(''));
        dispatch(setHasError(false));
        setName('');
    }

    const handleMouseEnter = (e) => {
        if(e.currentTarget.children[3].classList.contains('hidden')) {
            e.currentTarget.children[3].classList.remove('hidden');
        }
    }

    const handleProjectMouseLeave = (e) => {
        if(e.currentTarget.tagName === 'DIV' && !showOptionsMenu) {
            e.currentTarget.children[3].classList.add('hidden');
        }
    }

    const handleOptionButtonMouseLeave = (e) => {
        setTimeout(() => {
            const optionsMenu = document.getElementById('options-menu-container');
            if(!e.target.parentElement.matches(':hover') && !showOptionsMenu) {
                e.target.classList.add('hidden');
            }
        }, 50);
    }

    const handleOptionButtonClick = (e, id) => {
        const optionsMenu = document.getElementById('options-menu-container');
        const list = document.getElementById('tasks-list');
        const rect = e.target.getBoundingClientRect();
        optionsMenu.style.top = (`${rect.top - 170 + list.scrollTop}px`);
        setShowOptionsMenu(true);
        setCurrentProject(e.currentTarget.parentElement);
        setCurrentProjectID(id);
    }

    const handleRenameClick = () => {
        const list = document.getElementById('tasks-list');
        const renameField = document.getElementById('rename-field');
        const renameInput = document.getElementById('rename-input');

        if (!currentProject || !list || !renameField) return;

        const target = currentProject.children[0];
        const targetRect = target.getBoundingClientRect();
        const listRect = list.getBoundingClientRect();

        renameInput.style.width = `${targetRect.width}px`;
        renameField.style.top = `${targetRect.top - listRect.top + list.scrollTop}px`;
        renameField.style.left = `${targetRect.left - listRect.left + list.scrollLeft}px`;

        setRenamingActive(true);
    }

    const handleDeleteClick = (e) => {
        dispatch(deleteProject(currentProject.id));
        setShowOptionsMenu(false);
    }

    const rename = async(e) => {
        e.preventDefault();
        if(newName) {
            await dispatch(renameProject(
                { 
                    newName, 
                    user, 
                    id: currentProjectID, 
                    currentName: currentProject.children[0].textContent 
                }
            ));
            dispatch(loadProjects(user));
        }
        setRenamingActive(false);
        setNewName('');
    }

    //Use Effect
    useEffect(() => {
        dispatch(loadProjects(user))

        return () => dispatch(clearProjects());
    }, []);

    useEffect(() => {
        renamingActiveRef.current = renamingActive;
    }, [renamingActive]);

    useEffect(() => {
        const handleWindowClick = (e) => {
            const optionButtons = document.querySelectorAll('.options-button');
            const buttonsNotHovered = Array.from(optionButtons).every(button => !button.matches(':hover'));
            if(!document.getElementById('rename-li').matches(':hover') && 
            !document.getElementById('rename-input').matches(':hover') &&
            !document.getElementById('add-project-btn').matches(':hover')) {
                rename(e);
            }
            if(!document.getElementById('options-menu-container').matches(':hover') && 
            !document.getElementById('rename-input').matches(':hover') && 
            !document.getElementById('add-project-btn').matches(':hover') &&
            buttonsNotHovered) {
                setShowOptionsMenu(false);
                Array.from(optionButtons).forEach(button => button.classList.add('hidden'));
            }
        }
        document.addEventListener('click', handleWindowClick);

        return () => document.removeEventListener('click', handleWindowClick);
    }, []);

    return(
        <>  
            <div id='create-project-window' className={addProjectWindowVisible ? '' : 'hidden'}>
                <CloseWindowButton className='close-window-btn' onClick={handleCloseWindowClick} />
                <h2>Create New Project</h2>
                <p id='error-msg'>{errorMsg}</p>
                <form id='create-project-form' onSubmit={handleFormSubmit}>
                    <label>
                        Project Name:
                        <input id='project-name-field' type='text' 
                        value={name} onChange={(e) => setName(e.target.value)}/>
                    </label>
                    <button id='add-project-btn' type='submit' disabled={name.length === 0}>Add Project</button>
                </form>
            </div>
            <div id='homepage-container'>
                <h2 id='projects-title'>Projects</h2>
                <ul id='tasks-list'>
                    {projects.map(project => 
                        <li>
                            <div id={project.id} className='task-card' onClick={(e) => handleProjectClick(e, project.creationDate)}
                                 onMouseEnter={handleMouseEnter} onMouseLeave={handleProjectMouseLeave}>
                                <h4>{project.name}</h4>
                                <p id='tasks-complete'>
                                    Tasks Complete: <span className='completed-tasks'>0</span>
                                    /
                                    <span className='total-tasks'>0</span>
                                </p>
                                <p>{`Created: ${project.creationDate}`}</p>
                                <OptionsButton className='options-button hidden' onMouseLeave={handleOptionButtonMouseLeave}
                                               onClick={(e) => handleOptionButtonClick(e, project.id)} />
                            </div>
                        </li>
                    )}
                        <div id='options-menu-container' className={showOptionsMenu ? '' : 'hidden'}>
                            <ul id='options-menu'>
                                <li id='rename-li' onClick={handleRenameClick}>
                                    Rename
                                </li>
                                <li id='delete-li' onClick={handleDeleteClick}>
                                    Delete
                                </li>
                            </ul>
                        </div>
                        <div id='rename-field' className={renamingActive ? '' : 'hidden'}>
                            <form onSubmit={rename}>
                                <input id='rename-input' type='text' value={newName} 
                                    onChange={(e) => setNewName(e.target.value)} />
                            </form>
                        </div>
                </ul>
                {projects.length > 4 && <hr />}
                <button id='new-project-btn' onClick={handleCreateProjectClick}>New Project</button>
            </div>
        </>
    );
}

export default HomePage;