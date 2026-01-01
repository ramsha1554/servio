import {Routes, Route } from 'react-router-dom';

import SignUp from './pages/SignUp.jsx';
import SignIn from './pages/SignIn.jsx';
export const serverUrl="http://localhost:8000"
import ForgotPassword from './pages/ForgotPassword.jsx';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import useGetCurrentUser from './hooks/useGetCurrentUser.jsx';
function App() {
  const {userData}=useSelector((state)=>state.user)
  return <>
  
  <Routes>

  <Route path='/signup' element={!userData?<SignUp/>:<Navigate to={"/"}/>}/>
    <Route path='/signin' element={!userData?<SignIn/>:<Navigate to={"/"}/>}/>
      <Route path='/forgot-password' element={!userData?<ForgotPassword/>:<Navigate to={"/"}/>}/>
      <Route path='/' element={userData?<Home/>:<Navigate to={"/signin"}/>}/>


  </Routes>
  
  
  </>;
}

export default App;
