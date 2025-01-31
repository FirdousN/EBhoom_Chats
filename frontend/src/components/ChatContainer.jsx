import { useEffect } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import useChatStore from "../store/useChatStore";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { useState } from "react";
// import { formatMessageTime } from "../lib/utils";
    

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
                {messages.map((msg) => {
                    return (
                        <div
                            key={msg.userId}
                            className={`chat ${msg.senderId === authUser.userData.userId ? "chat-end" : "chat-start"}`}
                        >
                            <div className="chat-image avatar">
                                <div className="size-10 rounded-full border">
                                    <img
                                        src={
                                            msg.senderId === authUser.userData.userId
                                                ? authUser.profilePic || "avatar.png"
                                                : selectedUser.profilePic || "avatar.png"
                                        }
                                        alt="profile pic"
                                    />
                                </div>
                            </div>

                            {/*  */}
                            <div>
                                <div className="chat-header mb-1">
                                    <time className="text-xs opacity-50 ml-1">{(msg.createdAt)}</time>
                                </div>
                                <div className="chat-bubble flex flex-col">
                                    {msg.image && (
                                        <img
                                            src={msg.image}
                                            alt="Attachment"
                                            className="sm:max-w-[200px] rounded-md mb-2"
                                        />
                                    )}
                                    {msg.text && <p>{msg.text}</p>}
                                </div>
                            </div>
                            {/*  */}
                        </div>
                    );
                })}
            </div>
            {/* add chat bubble end */}
            <MessageInput></MessageInput>
        </div>
    );
};

export default ChatContainer;
