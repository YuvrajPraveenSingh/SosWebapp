import React from 'react'
import {Router, Route, Routes } from 'react-router-dom';
import Home from './Components/Home';
import Login from './Components/Login';
import Register from './Components/Register';

function App() {
  return (
    
    <div>
      <Routes>
         <Route path='/' element={<Home/>} />
         <Route path='/login' element={<Login/>} />
         <Route path='/register' element={<Register/>} />
      </Routes>
    </div>
    
  )
}

export default App