import { useEffect } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import useChatStore from "../store/useChatStore";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { useState } from "react";

const ChatContainer = () => {
    const { messages, getMessages, isMessagesLoading, selectedUser } = useChatStore();
    const { authUser } = useAuthStore();

    useEffect(() => {
        getMessages(selectedUser._id);
    }, [selectedUser._id, getMessages]);

    if (isMessagesLoading) {
        // if (true){
        return (
            <div className="flex-1 flex flex-col overflow-auto">
                <ChatHeader />
                <MessageSkeleton />
                <MessageInput />
            </div>
        );
    }

 

    return (
        <div className="flex-1 flex flex-col overflow-auto">
            <ChatHeader></ChatHeader>
            {/* add chat bubble start */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
                {messages.map((meg) => {
                    return(

                 
                    <div
                        key={meg.userId}
                        className={`chat ${meg.senderId === authUser.userData.userId ? "chat-end" : "chat-start"}`}
                    >
                        <div className="chat-image avatar">
                            <div className="size-10 rounded-full border">
                                <img
                                    src={
                                        meg.senderId === authUser.userData.userId
                                            ? authUser.profilePic || "avatar.png"
                                            : selectedUser.profilePic || "avatar.png"
                                    }
                                    alt="profile pic"
                                />
                            </div>
                        </div>
                       <div>

                        {meg?.text}
                       </div>
                        <div className="chat-header mb-1">
                            <time datetime="text-xs opacity-50 ml-1">{meg.createdAt}</time>
                        </div>
                    </div>   )
                })}
            </div>
            {/* add chat bubble end */}
            <MessageInput></MessageInput>
        </div>
    );
};

export default ChatContainer;
