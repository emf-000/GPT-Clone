import "./Chatwindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect } from "react";
import { ScaleLoader } from "react-spinners";

function ChatWindow() {
  const { 
    prompt, setPrompt, 
    reply, setReply, 
    currThreadId, prevChats, setPrevChats, setNewChat, 
    allThreads, setAllThreads 
  } = useContext(MyContext);

  const [loading, setLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const getReply = async () => {
    if (!prompt) return;
    setLoading(true);
    setNewChat(false);

    const token = localStorage.getItem("token");

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        message: prompt,
        threadId: currThreadId,
      }),
    };

    try {
      const response = await fetch(`${backendUrl}/api/chat`, options);
      if (!response.ok) throw new Error("Failed to get reply");
      const res = await response.json();
      setReply(res.reply);

      // Update last message in Sidebar
      setAllThreads((threads) =>
        threads.map((t) =>
          t.threadId === currThreadId
            ? { ...t, title: t.title, lastMessage: res.reply }
            : t
        )
      );
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (prompt && reply) {
      const newChats = [
        ...prevChats,
        { role: "user", content: prompt },
        { role: "assistant", content: reply },
      ];
      setPrevChats(newChats);
    }
    setPrompt("");
  }, [reply]);

  return (
    <div className="chatWindow">
      {/* Chat messages */}
      <Chat />

      {/* Loader centered */}
      {loading && (
        <div className="loadingOverlay">
          <ScaleLoader color="#fff" loading={loading} />
          <div className="loadingText">Typing...</div> {/* optional */}
        </div>
      )}

      {/* Chat input */}
      <div className="chatInput">
        <div className="inputBox">
          <input
            placeholder="Ask anything"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" ? getReply() : null}
          />
          <div id="submit" onClick={getReply}>
            <i className="fa-solid fa-paper-plane"></i>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
