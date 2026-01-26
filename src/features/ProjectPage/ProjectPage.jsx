import { useSelector, useDispatch } from 'react-redux';
import { 
    setButtonsDisabled, 
    handleSelect,
    setSelectedTasks,
    createTask,
    loadTasks,
    clearTasks,
    deleteTask,
    toggleComplete,
    parseDate,
    renameTask,
} from './projectPageSlice';
import { setShowProjectPage } from '../MainPage/mainPageSlice';

import { useState, useEffect, useRef } from 'react';
import BackArrow from '../../assets/back_arrow.svg?react';
import CloseWindowButton from '../../assets/close_window.svg?react';
import OptionsButton from '../../assets/options_button.svg?react';
import './ProjectPage.css';

const ProjectPage = () => {
    const tasksRef = useRef([]);

    //Redux
    const dispatch = useDispatch();
    const buttonsDisabled = useSelector(state => state.projectPage.buttonsDisabled);
    const currentTasks = useSelector(state => state.projectPage.currentTasks);
    const completedTasks = useSelector(state => state.projectPage.completedTasks);
    const projectName = useSelector(state => state.projectPage.projectName);
    const selectedTasks = useSelector(state => state.projectPage.selectedTasks);
    const projectCreationDate = useSelector(state => state.projectPage.projectCreationDate);
    const user = useSelector(state => state.mainPage.user);

    const totalTasks = completedTasks.length + currentTasks.length;

    //Use States
    const [newTask, setNewTask] = useState('');
    const [taskType, setTaskType] = useState('binary');
    const [reloadCount, setReloadCount] = useState(0);
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);
    const [renamingActive, setRenamingActive] = useState(false);
    const [currentTask, setCurrentTask] = useState('');
    const [currentTaskID, setCurrentTaskID] = useState('');
    const [newText, setNewText] = useState('');
    const [addTaskWindowVisible, setAddTaskWindowVisible] = useState(false);
    const [truncatedTasksText, setTruncatedTasksText] = useState({});

    //Functions
    const toggleSelect = (e) => {
        if(e.target.tagName === 'DIV') {
            const checkbox = e.target.children[2].children[0];
            checkbox.checked = !checkbox.checked;
            const div = (e.target.tagName === 'DIV') ? e.target : e.target.parentElement.parentElement;
            dispatch(
                handleSelect({
                    id: div.id,
                    creationDate: div.children[1].children[1].textContent,
                    completionDate: '',
                    text: div.children[0].textContent
                })
            );
        }
    }

    const handleMarkCompleteClick = async() => {
        await dispatch(toggleComplete({newDate: parseDate(new Date())}));
        const checkboxes = document.querySelectorAll('task-target');
        for(let checkbox of checkboxes) {
            checkbox.checked = false;
        }
        await dispatch(loadTasks({ projectName, user }));
        dispatch(setSelectedTasks([]));
        setReloadCount(reloadCount + 1);
    }

    const handleMarkIncompleteClick = async(targetID) => {
        await dispatch(toggleComplete({ id: targetID, newDate: ''}));
        dispatch(loadTasks({ projectName, user }));
    }

    const handleBackArrowClick = () => {
        setAddTaskWindowVisible(false);
        dispatch(setShowProjectPage(false));
        dispatch(setSelectedTasks([]));
        setNewTask('');
    }

    const handleCreateTaskClick = () => {
        setAddTaskWindowVisible(true);
    }

    const handleCloseWindowClick = () => {
        setAddTaskWindowVisible(false);
        setNewTask('');
    }

    const handleDeleteTaskClick = async() => {
        const res = await dispatch(deleteTask());
        if(res.meta.requestStatus === 'rejected') {
        }
        const checkboxes = document.querySelectorAll('checkbox-target');
        for(let checkbox of checkboxes) {
            checkbox.checked = false;
        }
        await dispatch(loadTasks({ projectName, user }));
        dispatch(setSelectedTasks([]));
        setReloadCount(reloadCount + 1);
    }

    const handleAddTask = async(e) => {
        e.preventDefault();
        const res = await dispatch(createTask({
            user: user,
            projectName: projectName,
            taskType: taskType,
            text: newTask
        }));
        if(res.meta.requestStatus === 'fulfilled') {
            await dispatch(loadTasks({ projectName, user }));
        }
        setAddTaskWindowVisible(false);
        setNewTask('');
    }

    const handleTaskMouseEnter = (e) => {
        if(e.target && e.target.children[3].classList.contains('hidden')) {
            e.target.children[3].classList.remove('hidden');
        }
    }

    const handleTaskMouseLeave = (e) => {
        if(!showOptionsMenu) {
            e.currentTarget.children[3].classList.add('hidden');
        }
    }

    const handleButtonMouseLeave = (e) => {
        if(!e.target.parentElement.matches(':hover')) {
            e.target.classList.add('hidden');
        }
    }

    const handleOptionButtonClick = (e, id) => {
        const optionsMenu = document.getElementById('options-menu-container');
        const list = document.getElementById('current-tasks-list');
        const rect = e.currentTarget.getBoundingClientRect();
        optionsMenu.style.top = (`${rect.top - 220 + list.scrollTop}px`);
        setShowOptionsMenu(true);
        setCurrentTask(e.currentTarget.parentElement);
        setCurrentTaskID(id);
    }

    const handleOptionButtonMouseLeave = (e) => {
        setTimeout(() => {
            if(!e.target.parentElement.matches(':hover') && !showOptionsMenu) {
                e.target.classList.add('hidden');
            }
        }, 50);
    }

    const handleMouseEnter = (e) => {
        if(e.currentTarget.children[3].classList.contains('hidden')) {
            e.currentTarget.children[3].classList.remove('hidden');
        }
    }

    const handleRenameClick = () => {
        const list = document.getElementById('current-tasks-list');
        const renameField = document.getElementById('rename-field');
        const renameInput = document.getElementById('rename-input');

        if (!currentTask || !list || !renameField) return;

        const target = currentTask.children[0];
        const targetRect = target.getBoundingClientRect();
        const listRect = list.getBoundingClientRect();

        renameInput.style.width = `${targetRect.width}px`;
        renameField.style.top = `${targetRect.top - listRect.top + list.scrollTop}px`;
        renameField.style.left = `${targetRect.left - listRect.left + list.scrollLeft}px`;

        setRenamingActive(true);
    }

    const handleDeleteClick = async() => {
        await dispatch(deleteTask(currentTaskID));
        dispatch(loadTasks({ projectName, user}));
        setShowOptionsMenu(false);
    }

    const rename = async(e) => {
        e.preventDefault();
        if(newText) {
            await dispatch(renameTask(
                { 
                    newText, 
                    taskID: currentTaskID
                }
            ));
            dispatch(loadTasks({ projectName, user }));
        }
        setRenamingActive(false);
        setNewText('');
    }



    //Use Effect
    //Close renaming fields and task options windows on click
    useEffect(() => {
        const handleWindowClick = (e) => {
            const optionButtons = document.querySelectorAll('.task-options-button');
            const taskButtons = document.querySelectorAll('.task-btn');
            const optionButtonsNotHovered = Array.from(optionButtons).every(button => !button.matches(':hover'));
            const taskButtonsNotHovered = Array.from(taskButtons).every(button => !button.matches(':hover'));
            const isInside = (el) => el && el.contains(e.target);

            
            if(!document.getElementById('options-menu-container').matches(':hover') && 
            !document.getElementById('rename-input').matches(':hover') && 
            !document.getElementById('create-task-btn').matches(':hover') &&
            !document.querySelector('.back-arrow').matches(':hover') &&
            !isInside(document.getElementById('create-task-window')) &&
            optionButtonsNotHovered && taskButtonsNotHovered) {
                setRenamingActive(false);
                setShowOptionsMenu(false);
                Array.from(optionButtons).forEach(button => button.classList.add('hidden'));
            }
        }
        document.addEventListener('click', handleWindowClick);

        dispatch(loadTasks({ projectName, user }))

        return () => {
            dispatch(clearTasks());
            document.removeEventListener('click', handleWindowClick);
        };
    }, []);

    //Allow buttons to be clicked when tasks are selected
    useEffect(() => {
        if(selectedTasks.length > 0) {
            dispatch(setButtonsDisabled(false));
        } else {
            dispatch(setButtonsDisabled(true));
        }
    }, [selectedTasks]);

    //Set which tasks text were truncated
    useEffect(() => {
        let results = {};
        tasksRef.current.forEach((task, index) => {
            if(!task) return;
            results[index] = task.scrollWidth > task.clientWidth;
        });

        setTruncatedTasksText(results);
    }, [currentTasks]);

    return(
        <>
            <BackArrow className='back-arrow' onClick={handleBackArrowClick} />
            <div id='create-task-window' className={addTaskWindowVisible ? '' : 'hidden'}>
                <form id='create-task-form' onSubmit={handleAddTask}>
                    <CloseWindowButton className='close-window-btn' onClick={handleCloseWindowClick} />
                    <h2>Create New Task</h2>
                    <label>
                        Enter Task:
                        <input id='new-task-field' className='text-field' type='text' 
                               value={newTask} onChange={(e) => setNewTask(e.target.value)}/>
                    </label>
                    <label id='master-label'>
                        Task Type:
                        <div id='options'>
                            <label 
                                id='binary-label' 
                                className='check-label' 
                                htmlFor='radio1'
                            >
                                Binary
                                <input id='radio1' name='task-type' type='radio' value='binary' 
                                       onClick={(e) => setTaskType(e.target.value)} defaultChecked />
                            </label>
                            <label id='continuous-label' className='check-label' for='radio2'>
                                Continuos
                                <input id='radio2' name='task-type' type='radio' value='continuous'
                                       onClick={(e) => setTaskType(e.target.value)} />
                            </label>
                        </div>
                    </label>
                    <button type='submit' disabled={newTask.length === 0}>Add Task</button>
                </form>
            </div>
            <div id='project-title-container'>
                <h1>{projectName}</h1>
                <div id='title-left'>
                    <h3>{`Created: ${projectCreationDate}`}</h3>
                    <h3>{`Tasks Complete: ${completedTasks.length}/${totalTasks}`}</h3>
                </div>
            </div>
            <hr id='hr1' />
            <div id='main-content'>
                <div id='current-tasks-container'>
                    <h2>Current Tasks</h2>
                    <ul id='current-tasks-list' className='task-list'>
                        {currentTasks.map((task, index) => 
                            <li key={index}>
                                <div 
                                    id={task.taskID} 
                                    className='task current-task' 
                                    onClick={toggleSelect} 
                                    onMouseEnter={handleMouseEnter} 
                                    onMouseLeave={handleTaskMouseLeave}
                                    data-text={task.text}
                                    data-top={index === 0 ? 'true' : 'false'}
                                >
                                    <p ref={el => tasksRef.current[index] = el}>{task.text}</p>
                                    <div className='created-date-section'>
                                        <h6>Created</h6>
                                        <span>{task.taskCreationDate}</span>
                                    </div>
                                    <label className='checkbox-container'>
                                        <input type='checkbox' className='checkbox-target' onClick={toggleSelect}/>
                                        <span className='checkmark'></span>
                                    </label>
                                    <OptionsButton 
                                        className='task-options-button hidden' 
                                        onMouseLeave={handleOptionButtonMouseLeave}
                                        onClick={(e) => handleOptionButtonClick(e, task.taskID)} 
                                    />
                                    <div className={`
                                        full-task-text
                                        ${truncatedTasksText[index] ? 'truncated' : ''}
                                    `}>
                                        {task.text}
                                    </div>
                                </div>
                            </li>
                        )}
                        <div id='options-menu-container' className={showOptionsMenu ? 'visible' : ''}>
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
                                <input id='rename-input' type='text' value={newText} 
                                    onChange={(e) => setNewText(e.target.value)} />
                            </form>
                        </div>
                    </ul>
                    {currentTasks.length > 3 && <hr className='task-hr' />}
                </div>
                <div id='completed-tasks-container'>
                    <h2>Completed Tasks</h2>
                    <ul key={reloadCount} className='task-list'>
                        {completedTasks.map((task, index) =>
                            <li key={index}>
                                <div id={task.taskId} className='task completed-task' onMouseEnter={handleTaskMouseEnter} 
                                     onMouseLeave={handleTaskMouseLeave}>
                                    <p>{task.text}</p>
                                    <div className='created-date-section'>
                                        <h6>Created</h6>
                                        <span>{task.taskCreationDate}</span>
                                    </div>
                                    <div className='completion-date-section'>
                                        <h6>Completed</h6>
                                        <span>{task.taskCompletionDate}</span>
                                    </div>
                                    <button className='mark-incomplete-btn hidden' onMouseLeave={handleButtonMouseLeave}
                                            onClick={() => handleMarkIncompleteClick(task.taskID)}>Mark Incomplete</button>
                                </div>
                            </li>
                        )}
                    </ul>
                    {completedTasks.length > 3 && <hr className='task-hr' />}
                </div>
            </div>
            <div id='buttons'>
                <button id='create-task-btn' className='task-btn' onClick={handleCreateTaskClick}>Create Task</button>
                <button id='delete-btn' className='task-btn' onClick={handleDeleteTaskClick} disabled={buttonsDisabled}>Delete</button>
                <button id='mark-complete-btn' className='task-btn' disabled={buttonsDisabled} 
                        onClick={handleMarkCompleteClick}>Mark Complete</button>
            </div>
        </>
    );
}

export default ProjectPage;