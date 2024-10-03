"use client";
import LeftChatSide from "@/components/chat/LeftChatSide";
import MiddleChatSide from "@/components/chat/MiddleChatSide";
import NavBar from "@/components/NavBar";
import SideBar from "@/components/SideBar";
import { UseAppContext } from "@/context/AuthContext";
import { Conversation, Message, socketMessage, User } from "@/types/types";
import { useEffect, useState } from "react";

const Chat = () => {
  const [selectedConversation, setSelectedConversation] = useState("");
  const [receiver, setReceiver] = useState(null as User | null);

  const [socket, setSocket] = useState<any>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [message, setMessage] = useState(null as socketMessage | null);
  const [conversations, setConversations] = useState([] as Conversation[]);
  const [scrollToLastMessage, setScrollToLastMessage] = useState(false);

  const {
    chatSocket
  } = UseAppContext();
  const updateLastMessage = (message: Message) => {
    const newConversations = conversations.map((conversation) => {
      if (conversation.id === selectedConversation) {
        setScrollToLastMessage(!scrollToLastMessage);
        return { ...conversation, last_message: message };
      }
      return conversation;
    });
    setConversations(newConversations);
  };
  const sendDirectMessage = (
    message: string,
    receiver: string,
    conversation: string,
    id: string,
    reply_to: string
  ) => {
    if (socket) {
      socket.send(
        JSON.stringify({
          type: "direct_message",
          message,
          recipient: receiver,
          conversation,
          id,
          reply_to: reply_to
        })
      );
    }
  };
  
  useEffect(() => {
    if (typeof window !== "undefined" && chatSocket !== null && socket === null) {
      const createSocket = () => {

        // request online users
        chatSocket.send(
          JSON.stringify({
            type: "connected_users",
          })
        );
        chatSocket.onmessage = (event) => {
          const message = JSON.parse(event.data);
          if (message.type === "connected_users") {
            setOnlineUsers(message.connected_users);
          }
          if (message.type === "direct_message") {
            setMessage(message);
          }
        };
        setSocket(chatSocket);
      };
      createSocket();
    }
  }, [chatSocket]);
  let selectedConv = conversations.find(
    (conv) => conv.id === selectedConversation
  );
  return (
    <>
      <NavBar />
      <div className={`absolute bottom-0   flex flex-row justify-center sm:justify-start sm:items-center  sm:left-0 w-full sm:w-0  `}>
        <SideBar />
      </div>
      <div className="flex flex-row">
        <div className="grid grid-cols-12 bg-transparent  p-4 sm:h-screen-minus-100  h-screen-minus-180 w-full">
          <span className="hidden sm:col-span-2 sm:block"></span>
          <LeftChatSide
            setSelectedConversation={setSelectedConversation}
            selectedConversation={selectedConversation}
            setReceiver={setReceiver}
            onlineUsers={onlineUsers}
            socketMessage={message}
            conversations={conversations}
            setConversations={setConversations}
          />
          <MiddleChatSide
            selectedConversation={selectedConversation}
            receiver={receiver}
            onlineUsers={onlineUsers}
            sendDirectMessage={sendDirectMessage}
            socketMessage={message}
            updateLastMessage={updateLastMessage}
            conversation={selectedConv || null}
            scrollToLastMessage={scrollToLastMessage}
            setScrollToLastMessage={setScrollToLastMessage}
          />
        </div>
      </div>
    </>
  );
};

export default Chat;