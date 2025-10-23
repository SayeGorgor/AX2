import { useState } from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { 
    switchPages, 
    setUsernameInput,
    setPwdInput, 
    attemptLogin, 
    attemptSignUp, 
    setEmailInput
 } from './loginPageSlice';
import { setUser } from '../MainPage/mainPageSlice';

import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const [passwordConfirm, setPasswordConfirm] = useState('');

    //Redux
    const dispatch = useDispatch();
    const usernameInput = useSelector(state => state.loginPage.usernameInput);
    const pwdInput = useSelector(state => state.loginPage.pwdInput);
    const showLogin = useSelector(state => state.loginPage.showLogin);
    const emailInput = useSelector(state => state.loginPage.emailInput);
    const message = useSelector(state => state.loginPage.message);
    const hasError = useSelector(state => state.loginPage.hasError);

    //Functions
    const handlePageSwitch = (e) => {
        e.preventDefault();
        dispatch(switchPages());
    }

    const handleLogin = async(e) => {
        e.preventDefault();
        const credentials = { username: usernameInput, password: pwdInput };
        dispatch(attemptLogin(credentials))
        .then(res => {
            dispatch(setPwdInput(''));
            if(res.meta.requestStatus === 'fulfilled') {
                dispatch(setUser(usernameInput));
                dispatch(setUsernameInput(''));
                navigate('/');
            }
        })
    }

    const handleSignUp = async(e) => {
        e.preventDefault();
        const newUser = {
            username: usernameInput,
            password: pwdInput,
            email: emailInput,
        }
        setPasswordConfirm('');
        dispatch(attemptSignUp({ newUser, pwdInput, passwordConfirm }))
        .then(res => {
            if(res.meta.requestStatus === 'fulfilled') {
                dispatch(switchPages());
            }
        })
    }

    return(
        <div id='login-container'>
            <h1 id='title'>AX2</h1>
            <div id='login-field-container'>
                {showLogin ?
                 <form onSubmit={handleLogin}>
                    <h2>Log In</h2>
                    {message.length > 0 && <p id='error-message' className={hasError ? 'bad' : 'good'}>{message}</p>}
                    <div className='input-container'>
                        <label>Username</label>
                        <input 
                            id='username-field' 
                            name='username-field' 
                            type='text' 
                            autoComplete='username'
                            value={usernameInput} 
                            onChange={(e) => dispatch(setUsernameInput(e.target.value))}
                            required
                        />
                    </div>
                    <div className='input-container'>
                        <label>Password</label>
                        <input 
                            id='password-field' 
                            name='password-field' 
                            type='password' 
                            autoComplete='current-password'
                            value={pwdInput} 
                            onChange={(e) => dispatch(setPwdInput(e.target.value))}
                            required
                        />
                    </div>
                    <button type='submit'>Login</button>
                    <p>Dont have an account?</p>
                    <a href='#' onClick={handlePageSwitch}>Sign Up</a>
                </form> :
                <form onSubmit={handleSignUp}>
                    <h2>Sign Up</h2>
                    {message.length > 0 && <p id='error-message' className={hasError ? 'bad' : 'good'}>{message}</p>}
                    <div className='input-container'>
                        <label>Username</label>
                        <input 
                            id='username-field' 
                            name='username-field' 
                            type='text' 
                            autoComplete='username'
                            value={usernameInput} 
                            onChange={(e) => dispatch(setUsernameInput(e.target.value))}
                            required
                        />
                    </div>
                    <div className='input-container'>
                        <label>Email</label>
                        <input 
                            id='email-field' 
                            name='email-field' 
                            type='email' 
                            value={emailInput} 
                            autoComplete='email'
                            onChange={(e) => dispatch(setEmailInput(e.target.value))}
                            required
                        />
                    </div>
                    <div className='input-container'>
                        <label>Password</label>
                        <input 
                            id='password-field' 
                            name='password-field' 
                            type='password' 
                            value={pwdInput} 
                            autoComplete='new-password'
                            onChange={(e) => dispatch(setPwdInput(e.target.value))}
                            required
                        />
                    </div>
                    <div className='input-container'>
                        <label>Confirm Password</label>
                        <input 
                            id='password-confirm-field' 
                            name='password-confirm-field' 
                            type='password'
                            value={passwordConfirm} 
                            autoComplete='confirm-password'
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            required
                        />
                    </div>
                    <button type='submit'>Sign Up</button>
                    <p>Already have an account?</p>
                    <a href='#' onClick={handlePageSwitch}>Log In</a>
                </form>}
            </div>
        </div>
    );
}

export default LoginPage;