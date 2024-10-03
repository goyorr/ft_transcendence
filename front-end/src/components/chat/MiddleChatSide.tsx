"use client";

import { useEffect, useRef, useState } from "react";
import { getCookie } from "cookies-next";
import { UseAppContext } from "@/context/AuthContext";
import timeAgo from "@/utils/timeAgo";
import AxiosInstance from "@/utils/axiosInstance";
import MessagesWrap from "./MessagesWrap";
import { Gamepad2, MessageSquareOff, X } from "lucide-react";
import { Conversation, Message, socketMessage, User } from "@/types/types";
import ChatGameSocket from "@/components/chat/ChatGameSocket";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";

interface Props {
  selectedConversation: string;
  receiver: User | null;
  onlineUsers: string[];
  sendDirectMessage: (
    message: string,
    receiver: string,
    conversation: string,
    id: string,
    reply_to: string
  ) => void;
  socketMessage: socketMessage | null;
  updateLastMessage: (message: Message) => void;
  conversation: Conversation | null;
  setScrollToLastMessage: React.Dispatch<React.SetStateAction<boolean>>;
  scrollToLastMessage: boolean;
}
const MiddleChatSide = ({
  selectedConversation,
  conversation,
  receiver,
  onlineUsers,
  sendDirectMessage,
  socketMessage,
  updateLastMessage,
  scrollToLastMessage,
  setScrollToLastMessage,
}: Props) => {
  const { t } = useTranslation();
  const [disableSend, setDisableSend] = useState(false);

  const lastMessageRef = useRef<HTMLDivElement>(null);
  const { user, socket, userLoggedIn } = UseAppContext();

  const { pk: id } = user;

  const [messages, setMessages] = useState([] as Message[]);
  const [replyTo, setReplyTo] = useState(null as Message | null);
  useEffect(() => {
    if (!receiver) return;
    const appendSocketMessage = (message: socketMessage) => {
      if (message && message.conversation === selectedConversation) {
        AxiosInstance(`/api/v1/readMessage/${message.id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${getCookie("access")}`,
          },
        });

        setMessages([
          ...messages,
          {
            content: message.message,
            sender: message.sender,
            conversation: selectedConversation,
            created_at: new Date().toISOString(),
            id: message.id,
            receiver: receiver.id,
            updated_at: new Date().toISOString(),
            edited: false,
            deleted: false,
            reply_to: message.reply_to,
          },
        ]);
      }
    };
    if (socketMessage) appendSocketMessage(socketMessage);
  }, [socketMessage]);
  const [allMessagesGeted, setAllMessagesGeted] = useState(false);
  const [lastReceivedMessage, setLastReceivedMessage] = useState("");
  const getMessages = async () => {
    try {
      // get last message in messages 
      
      let lastMessage = messages[0]?.id || "";
      if (lastReceivedMessage !== receiver?.id)
        lastMessage = "";
      const res = await AxiosInstance(
        `/api/v1/getMessages/${selectedConversation}?lastgeted=${lastMessage}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${getCookie("access")}`,
          },
        }
      );
      if (res.data.length < 20) setAllMessagesGeted(true);
      else setAllMessagesGeted(false);
      if (lastReceivedMessage !== receiver?.id)
        setMessages([...res.data]);
      else
        setMessages([...res.data, ...messages]);
      if (messages.length <= 20) {
        setScrollToLastMessage(!scrollToLastMessage);
      }
    } catch (error) {
      toast.error(t("failedToGetMessages"));
    }
    setDisableSend(false);
    setLastReceivedMessage(receiver?.id || "");

  };
  useEffect(() => {
    setDisableSend(true);
    

    if (receiver) {      
      getMessages();
    }
  }, [selectedConversation, receiver]);
  const ScrollAreaRef = useRef(null);
  useEffect(() => {
    if (lastMessageRef.current)
      lastMessageRef.current.scrollIntoView({ behavior: "instant" });
  }, [scrollToLastMessage,receiver]);
  const [scrollToReply, setScrollToReply] = useState(null);
  useEffect(() => {
    if (scrollToReply) {
      const message = messages.find((message) => message.id === scrollToReply);
      if (message) {
        const index = messages.indexOf(message);
        if (index !== -1) {
          const messageRef = document.getElementById(`message-${index}`);
          if (messageRef) {
            messageRef.scrollIntoView({ behavior: "smooth" });
            messageRef.style.border = "3px solid lightblue";
            setTimeout(() => {
              messageRef.style.border = "none";
            }, 3000);
          }
          setScrollToReply(null);
        }
      }
    }
  }, [scrollToReply]);
  const inputRef = useRef<HTMLInputElement>(null);
  const sendMessage = async () => {
    if (disableSend) return;
    if (
      !inputRef?.current?.value ||
      inputRef?.current?.value.trim() === "" ||
      !receiver ||
      !selectedConversation
    )
      return;

    setDisableSend(true);
    try {
      const res = await AxiosInstance("/api/v1/sendMessage", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getCookie("access")}`,
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          content: inputRef?.current?.value,
          conversation: selectedConversation,
          replyTo: replyTo?.id,
        }),
      });
      if (res.status === 201) {
        updateLastMessage(res.data);
        sendDirectMessage(
          res.data.content,
          receiver.id,
          selectedConversation,
          res.data.id,
          res.data.reply_to
        );
        setMessages([...messages, res.data]);
        setReplyTo(null);
        setScrollToLastMessage(!scrollToLastMessage);
        inputRef.current.value = "";
      } else {
        toast.error(t("failedToSendMessage"));
      }
    } catch (error) {
      toast.error(t("failedToSendMessage"));
    }
    setDisableSend(false);
  };

  const [hideInvite, setHideInvite] = useState(false);

  function invite() {
    if (hideInvite) {
      
    } else {
      if (socket != null) {
        socket.send(
          JSON.stringify({
            type: "invite_game",
            from: userLoggedIn,
            to: receiver?.id,
            gameId: conversation && conversation.id,
          })
        );
      }
    }
    setHideInvite(!hideInvite);
  }

  if (hideInvite) {
    return (
      <ChatGameSocket
        id1={userLoggedIn}
        id2={receiver?.id}
        gameId={conversation && conversation.id}
      />
    );
  } else {
    return (
      <>
        <div className="bg-[#010420] sm:h-screen-minus-100  h-screen-minus-180 col-span-10 sm:col-span-7  border-lg shadow-[17px_-11px_33px_13px_#5695DA4A]">
          {receiver && (
            <div className="flex  flex-col h-full">
              <div className="flex items-center  p-4  h-16">
                <Link href={`/profile/${receiver.id}`}>
                  <img
                    src={receiver.image || "images/default.jpg"}
                    alt="user"
                    className="w-10 h-10 rounded-full cursor-pointer"
                  />
                </Link>
                <div className="flex flex-col items-start justify-start">
                  <Link href={`/profile/${receiver.id}`}>
                    <h1 className="text-white text-lg ml-2 hidden md:block">
                      {`${receiver.first_name} ${receiver.last_name}`}
                    </h1>
                  </Link>
                  {onlineUsers.includes(receiver.id) ? (
                    <div className="flex items-center  right-2 bottom-1 md:relative  md:ml-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      <p className="text-white text-sm opacity-50">
                        {t("chatonline")}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center  right-2 bottom-1 md:relative  md:ml-4">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                      <p className="text-white text-sm opacity-50">
                        {t("chatoffline")}
                      </p>
                    </div>
                  )}
                </div>
                <div className="ml-auto flex items-center gap-4">
                  {conversation && !conversation.isBlocked && (
                    <button onClick={invite}>
                      {hideInvite ? <X /> : <Gamepad2 />}
                    </button>
                  )}
                </div>
              </div>

              <div
                className="h-[78%] overflow-y-auto scrollbar-hide"
                ref={ScrollAreaRef}
              >
                <div className=" m-0 ml-4 mr-4">
                  <MessagesWrap
                    messages={messages}
                    id={id}
                    receiver={receiver}
                    lastMessageRef={lastMessageRef}
                    setReplyTo={setReplyTo}
                    setScrollToReply={setScrollToReply}
                    getMessages={getMessages}
                    allMessagesGeted={allMessagesGeted}
                  />
                </div>
              </div>
              <div
                id="input"
                className="h-12 flex  w-full m-4 mb-0 items-center justify-center md:space-x-4"
              >
                {conversation && conversation.isBlocked ? (
                  <div className="bg-red-500 p-2 rounded-md">
                    {conversation && conversation.blockedBy === id ? (
                      <p className="text-white text-sm">{t("blockUser")}</p>
                    ) : (
                      <p className="text-white text-sm">{t("blockedByUser")}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-start justify-start flex-col">
                    {replyTo && (
                      <div className="bg-[#212121] p-2 rounded-md m-2   flex flex-row items-center justify-between w-40 sm:w-64">
                        <p className="text-white text-sm">
                          {replyTo.content.length > 16
                            ? replyTo.content.slice(0, 16) + "..."
                            : replyTo.content}
                        </p>
                        <p className="text-white text-xs opacity-50">
                          {timeAgo(replyTo.created_at, t("lang"))}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-center flex-row w-[60vw]  sm:w-[50vw] h-4">
                      <img
                        src={receiver?.image || "images/default.jpg"}
                        alt="receiver"
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <input
                        type="text"
                        placeholder={t("typeMessage")}
                        className="bg-[#333] w-full h-10 text-white items-center justify-center flex rounded-md placeholder-white placeholder-opacity-50 indent-4"
                        ref={inputRef}
                        maxLength={256}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") sendMessage();
                        }}
                      />
                      <img
                        src="/chat/sendButton.svg"
                        alt="send"
                        className="w-8 h-8 cursor-pointer bg-blue-500 rounded-full ml-2"
                        onClick={sendMessage}
                      />
                      <div></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {!receiver && (
            <div className="flex items-center justify-center h-full flex-col border-lg">
              <MessageSquareOff className="text-white w-32 h-32 border-lg" />
              <h1 className="text-white text-lg">{t("selectUser")}</h1>
            </div>
          )}
        </div>
      </>
    );
  }
};

export default MiddleChatSide;
