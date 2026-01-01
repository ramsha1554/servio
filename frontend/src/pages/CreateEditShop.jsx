import react from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
 import { useSelector } from 'react-redux';
import {IOIosArrowBack} from "react-icons/io5"
import { useNavigate } from 'react-router-dom';

function CreateEditShop() {
    const navigate=useNavigate()
    const {myShopData}=useSelector(state=>state.owner)
  return (
    <div className='w-full min-h-screen bg-[#fff9f6] flex flex-col items-center'>
      <Nav />
      <div className='w-full flex justify-center items-center mt-20 mb-10 px-4 sm:px-6'>
        <CreateEditShopForm />
      </div>
    </div>
  );
}
export default CreateEditShop;