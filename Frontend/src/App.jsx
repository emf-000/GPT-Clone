import './App.css';
import Sidebar from "./Sidebar.jsx";
import Chatwindow from "./Chatwindow.jsx";
import { MyContext } from "./MyContext.jsx";
import { useState } from 'react';
import { v1 as uuidv1 } from "uuid";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

function App() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]); 
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const providerValues = {
    prompt, setPrompt,
    reply, setReply,
    currThreadId, setCurrThreadId,
    newChat, setNewChat,
    prevChats, setPrevChats,
    allThreads, setAllThreads
  };

  return (
    <MyContext.Provider value={providerValues}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div className='app'>
                  <button 
                    className="hamburger" 
                    onClick={() => setSidebarVisible(!sidebarVisible)}
                    aria-label="Toggle sidebar"
                  >
                    ☰
                  </button>

                  <Sidebar 
                    isVisible={sidebarVisible} 
                    closeSidebar={() => setSidebarVisible(false)} 
                  />

                  <Chatwindow />
                </div>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </MyContext.Provider>
  );
}

export default App;
