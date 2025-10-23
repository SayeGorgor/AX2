import './App.css';
import LoginPage from '../features/LoginPage/LoginPage';
import MainPage from '../features/MainPage/MainPage';
import ProtectedRoute from './ProtectedRoute';
import { Routes, Route } from 'react-router-dom'
import { useSelector } from 'react-redux';

function App() {
  const user = useSelector(state => state.mainPage.user);
  return (
    <Routes>
      <Route path='/login' element={<LoginPage />} />
      <Route path='/' 
        element={
          <ProtectedRoute user={user}>
            <MainPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  )
}

export default App
