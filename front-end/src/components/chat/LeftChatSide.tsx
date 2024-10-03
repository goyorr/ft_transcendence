"use client";
import { UseAppContext } from "@/context/AuthContext";
import AxiosInstance from "@/utils/axiosInstance";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import LastMessage from "./LastMessage";
import { Conversation, socketMessage, User } from "@/types/types";
import { useTranslation } from "@/hooks/useTranslation";
import { MessageSquareX, Search } from "lucide-react";
import { toast } from "sonner";

interface Props {
  setSelectedConversation: (id: string) => void;
  selectedConversation: string;
  setReceiver: (user: User) => void;
  onlineUsers: string[];
  socketMessage: socketMessage | null;
  conversations: Conversation[];
  setConversations: (conversations: Conversation[]) => void;
}

const LeftChatSide = ({
  setSelectedConversation,
  selectedConversation,
  setReceiver,
  onlineUsers,
  socketMessage,
  conversations,
  setConversations,
}: Props) => {
  const { user } = UseAppContext();
  const [searchInput, setSearchInput] = useState("");
  const [filteredConversations, setFilteredConversations] = useState<
    Conversation[]
  >([]);
  const { pk: id } = user;
  const [updateConversations, setUpdateConversations] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await AxiosInstance(`/api/v1/getConversations`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${getCookie("access")}`,
          },
        });
        setConversations(res.data);

        const url = new URL(window.location.href);
        const paramReceiver = url.searchParams.get("receiver") || "";
        for (let i = 0; i < res.data.length; i++) {
          if (
            res.data[i].user1 === paramReceiver ||
            res.data[i].user2 === paramReceiver
          ) {
            const receiver =
              res.data[i].user1 === id
                ? res.data[i].user2_details
                : res.data[i].user1_details;
            setSelectedConversation(res.data[i].id);
            setReceiver(receiver);
          }
        }
      } catch (error) {
        toast.error(t("erroroccurred"));
      }
    };
    getConversations();
  }, [updateConversations]);
  useEffect(() => {
    const appendSocketMessage = (message: socketMessage) => {
      const conversation = conversations.find(
        (conversation) =>
          conversation.user1 === message.sender ||
          conversation.user2 === message.sender
      );
      if (message && conversation) {
        if (conversation.id !== selectedConversation) {
          conversation.unread_messages = conversation.unread_messages + 1;
        }
        conversation.last_message = {
          content: message.message,
          sender: message.sender,
          conversation: conversation.id,
          created_at: new Date().toISOString(),
          id: String(Math.random()),
          receiver:
            conversation.user1 === id ? conversation.user2 : conversation.user1,
          updated_at: new Date().toISOString(),
          edited: false,
          deleted: false,
          reply_to: "",
        };
        setConversations([...conversations]);
      } else if (message && conversation === undefined) {
        setUpdateConversations(!updateConversations);
      }
    };
    if (socketMessage) appendSocketMessage(socketMessage);
  }, [socketMessage]);
  useEffect(() => {
    if (selectedConversation) {
      const conversation = conversations.find(
        (conversation) => conversation.id === selectedConversation
      );
      if (conversation) {
        conversation.unread_messages = 0;
      }
    }
  }, [selectedConversation]);
  useEffect(() => {
    if (searchInput !== "") {
      const filteredConversations = conversations.filter((conversation) => {
        const user =
          conversation.user1 === id
            ? conversation.user2_details
            : conversation.user1_details;
        const fullName = user.first_name + " " + user.last_name;
        return (
          user.first_name.toLowerCase().includes(searchInput.toLowerCase()) ||
          user.last_name.toLowerCase().includes(searchInput.toLowerCase()) ||
          fullName.toLowerCase().includes(searchInput.toLowerCase()) ||
          user.username.toLowerCase().includes(searchInput.toLowerCase())
        );
      });
      setFilteredConversations(filteredConversations);
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchInput, conversations]);
  conversations.sort((a, b) => {
    if (a.last_message && b.last_message) {
      return (
        new Date(b.last_message.created_at).getTime() -
        new Date(a.last_message.created_at).getTime()
      );
    } else if (a.last_message && !b.last_message) {
      return (
        new Date(b.created_at).getTime() -
        new Date(a.last_message.created_at).getTime()
      );
    } else if (!a.last_message && b.last_message) {
      return (
        new Date(b.last_message.created_at).getTime() -
        new Date(a.created_at).getTime()
      );
    } else {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
  });
  return (
    <div className="bg-[#010420] sm:h-screen-minus-100  h-screen-minus-180 col-span-2 mr-4 md:col-span-3 rounded-lg shadow-[17px_-11px_33px_13px_#5695DA4A]">
      <div className="flex p-0  border-[#333] flex-col h-full border-md">
        <div className=" hidden items-center justify-center m-2 mr-0 ml-0  md:flex">
          <Search className="w-5 h-5 relative  opacity-50 md:left-4  cursor-pointer sm:opacity-100" />

          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="bg-[#D9D9D92B] p-2 pl-8 w-full h-8 text-white placeholder-white placeholder-opacity-50  relative right-2 hidden md:block border-none rounded-full"
            placeholder={t("search")}
          />
        </div>
        <div className="h-[0.5px] w-full bg-[#FFFFFF1C] mt-2  hidden md:block"></div>
        <div className="h-full overflow-y-auto scrollbar-hide justify-start flex flex-col items-center overflow-x-hidden">
          {filteredConversations.map((conversation) => (
            <div
              className={`h-12 flex items-center    m-1  cursor-pointer flex-row hover:bg-[#2D2D2D] rounded-full
                justify-center  w-11/12
                ${selectedConversation === conversation.id ? "bg-[#2D2D2D]" : ""}`}
              key={conversation.id}
              onClick={() => {
                setSelectedConversation(conversation.id);
                setReceiver(
                  conversation.user1 === id
                    ? conversation.user2_details
                    : conversation.user1_details
                );
              }}
            >
              <img
                src={
                  conversation.user1 === id
                    ? conversation.user2_details.image || "images/default.jpg"
                    : conversation.user1_details.image || "images/default.jpg"
                }
                className="w-10 h-10 rounded-full absolute md:relative md:left-4"
              />
              {onlineUsers.includes(
                conversation.user1 === id
                  ? conversation.user2_details.id
                  : conversation.user1_details.id
              ) ? (
                <div className="bg-green-500 rounded-full h-2 w-2 relative bottom-3 md:right-6 right-4 z-10"></div>
              ) : (
                <div className="bg-red-500 rounded-full h-2 w-2 relative bottom-3 md:right-6 right-4 z-10"></div>
              )}
              <div className="flex flex-col hidden md:block">
                <h1 className="text-white text-start text-sm ml-4 ">
                  {conversation.user1 === id
                    ? conversation.user2_details.username
                    : conversation.user1_details.username}
                </h1>
                <h2 className="text-white text-xs ml-4 opacity-50 hidden lg:block">
                  {conversation?.last_message?.content.length > 15
                    ? conversation?.last_message?.content.slice(0, 15) + "..."
                    : conversation?.last_message?.content}
                </h2>
              </div>
              <LastMessage
                conversation={conversation}
                selectedConversation={selectedConversation}
              />
            </div>
          ))}
          {filteredConversations.length === 0 && conversations.length !== 0 && (
            <div className=" items-center justify-center h-12 text-white hidden md:flex  flex-col  pt-16">
              <MessageSquareX className="text-white min-w-16 min-h-16" />
              <h1 className="text-white text-sm text-center">
                {t("no_conversations_match")}
              </h1>
            </div>
          )}
          {conversations.length === 0 && (
            <div className=" items-center justify-center h-12 text-white hidden md:flex flex-col  p-4 m-4 pt-16">
              <MessageSquareX className="text-white min-w-16 min-h-16" />
              <h1 className="text-white text-sm text-center">
                {t("no_conversations")}
              </h1>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeftChatSide;
