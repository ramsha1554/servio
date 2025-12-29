import {Routes, Route } from 'react-router-dom';

import SignUp from './pages/SignUp.jsx';
import SignIn from './pages/SignIn.jsx';
export const serverUrl="http://localhost:8000"
function App() {
  return <>
  
  <Routes>

    <Route path="/signup" element={<SignUp />} />
    
    <Route path="/signin" element={<SignIn />} />

      <Route path='/forgot-password' element={!userData?<ForgotPassword/>:<Navigate to={"/"}/>}/>


  </Routes>
  
  
  </>;
}

export default App;
