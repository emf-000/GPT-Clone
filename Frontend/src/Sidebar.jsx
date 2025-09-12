import "./Sidebar.css";
import { useContext, useEffect, useState } from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";
import { useNavigate } from "react-router-dom";

function Sidebar({ isVisible, closeSidebar }) {
  const {
    allThreads,
    setAllThreads,
    currThreadId,
    setNewChat,
    setPrompt,
    setReply,
    setCurrThreadId,
    setPrevChats,
  } = useContext(MyContext);

  const [isThreadLoading, setIsThreadLoading] = useState(false);
  const [error, setError] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const getAllThreads = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendUrl}/api/thread`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      const res = await response.json();
      const filteredData = res.map((thread) => ({
        threadId: thread.threadId,
        title: thread.title,
      }));
      setAllThreads(filteredData);
    } catch {
      setError("Failed to fetch thread list");
    }
  };

  useEffect(() => {
    getAllThreads();
  }, [currThreadId]);

  const createNewChat = () => {
    setNewChat(true);
    setPrompt("");
    setReply(null);
    setCurrThreadId(uuidv1());
    setPrevChats([]);
    closeSidebar();
  };

  const changeThread = async (newThreadId) => {
    if (isThreadLoading || newThreadId === currThreadId) return;
    setIsThreadLoading(true);
    setError(null);
    setCurrThreadId(newThreadId);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendUrl}/api/thread/${newThreadId}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const res = await response.json();
      if (Array.isArray(res)) {
        const validChats = res.filter(
          (chat) =>
            chat &&
            chat.role &&
            chat.content &&
            (chat.role === "user" || chat.role === "assistant")
        );
        setPrevChats(validChats);
        setNewChat(false);
        setReply(null);
      } else {
        setPrevChats([]);
        setError("Invalid chat history format");
      }
    } catch {
      setError("Failed to load chat history");
      setPrevChats([]);
      setNewChat(true);
      setReply(null);
    } finally {
      setIsThreadLoading(false);
    }
    closeSidebar();
  };

  const deleteThread = async (threadId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${backendUrl}/api/thread/${threadId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      setAllThreads((prev) => prev.filter((thread) => thread.threadId !== threadId));
      if (currThreadId === threadId) createNewChat();
    } catch {
      setError("Failed to delete thread");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className={`sidebar ${isVisible ? "" : "hidden"}`}>
      {/* Top content: New chat + threads */}
      <div className="top-content">
        <button onClick={createNewChat}>+ New Chat</button>

        <div className="history">
          {isThreadLoading && <div style={{ padding: 8, fontSize: 14 }}>Loading...</div>}
          {error && <div style={{ color: "red", padding: 8, fontSize: 14 }}>{error}</div>}
          <ul>
            {allThreads?.map((thread) => (
              <li
                key={thread.threadId}
                onClick={() => changeThread(thread.threadId)}
                className={thread.threadId === currThreadId ? "highlighted" : ""}
                style={{
                  cursor: isThreadLoading ? "not-allowed" : "pointer",
                  opacity: isThreadLoading ? 0.5 : 1,
                }}
              >
                {thread.title}
                <span
                  className="fa fa-trash"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isThreadLoading) deleteThread(thread.threadId);
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom content: Logout */}
      <div className="bottom-content">
        <button
          onClick={handleLogout}
          style={{ backgroundColor: "#f44336", color: "#fff", width: "100%" }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
