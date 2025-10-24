import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NavBar.css';

import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/LoginPage/loginPageSlice';

const NavBar = () => {
    const dispatch =useDispatch();
    const navigate = useNavigate();
    const user = useSelector(state => state.mainPage.user);

    const [showDropdown, setShowDropdown] = useState(false);

    //Functions
    const handleLogout = () => {
        dispatch(logout())
        .then(res => {
            if(res.meta.requestStatus === 'fulfilled') {
                navigate('/login');
            }
        });
    }

    useEffect(() => {
        document.addEventListener('click', () => {
            if(!document.getElementById('avatar-icon').matches(':hover')) {
                setShowDropdown(false);
            }
        });
        return document.removeEventListener('click', () => {
            if(!document.getElementById('avatar-icon').matches(':hover')) {
                setShowDropdown(false);
            }
        });
    },[]);
    
    return(
        <div id='nav-container'>
            <div id='avatar-dropdown' className={showDropdown ? 'visible' : ''}>
                <ul id='avatar-dropdown-options'>
                    <li id='logout' className='avatar-option' onClick={handleLogout}>
                        Logout
                    </li>
                    <li id='settings' className='avatar-option'>
                        Settings
                    </li>
                </ul>
            </div>
            <h2 className='title'>AX2</h2>
            <h1>Welcome, {user}</h1>
            <ul id='nav-links'>
                <li id='avatar-icon' onClick={() => setShowDropdown(!showDropdown)}>
                    <a href='#'>{user.charAt(0).toUpperCase()}</a>
                </li>
            </ul>
        </div>
    );
}

export default NavBar;