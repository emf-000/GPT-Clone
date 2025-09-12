import "./Chat.css";
import React, { useContext, useState, useEffect } from "react";
import { MyContext } from "./MyContext";
import ReactMarkDown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function Chat() {
    const {newChat, prevChats, reply} = useContext(MyContext);
    const [latestReply, setLatestReply] = useState(null);

     useEffect(() => {
        console.log("prevChats updated:", prevChats);
    }, [prevChats]);
    
    useEffect(() => {
        if(reply === null) {
            setLatestReply(null);
            return;
        }
        
        if(!prevChats?.length) return;
        
        const content = reply.split(" ");
        let idx = 0;
        
        const interval = setInterval(() => {
            setLatestReply(content.slice(0, idx+1).join(" "));
            idx++;
            if(idx >= content.length) clearInterval(interval);
        }, 40)
        
        return () => clearInterval(interval);
    }, [prevChats, reply])

    return (
        <div className="chats">
            {newChat && (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '60vh',
                    textAlign: 'center'
                }}>
                    <h1>SigmaGPT</h1>
                    <p>How can I help you today?</p>
                </div>
            )}
            
            {prevChats && prevChats.length > 0 && prevChats.map((chat, index) => (
                <div key={index}>
                    {chat.role === "user" ? (
                        <div className="userDiv">
                            <div className="userMessage">
                                {chat.content}
                            </div>
                        </div>
                    ) : (
                        <div className="gptDiv">
                            <div className="gptMessage">
                                {index === prevChats.length - 1 && latestReply ? (
                                    <ReactMarkDown rehypePlugins={[rehypeHighlight]}>
                                        {latestReply}
                                    </ReactMarkDown>
                                ) : (
                                    <ReactMarkDown rehypePlugins={[rehypeHighlight]}>
                                        {chat.content}
                                    </ReactMarkDown>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default Chat;