"use client";
import { useTranslation } from "@/hooks/useTranslation";
import { Message, User } from "@/types/types";
import timeAgo from "@/utils/timeAgo";
import {
  CircleEllipsis,
  CornerUpLeft,
  CornerUpRight,
  Reply,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const MessageWrap = ({
  message,
  messagesLength,
  lastMessageRef,
  index,
  id,
  setReplyTo,
  messageReply,
  setScrollToReply,
  receiver,
}: {
  message: Message;
  messagesLength: number;
  lastMessageRef: any;
  index: number;
  id: string;
  setReplyTo: any;
  messageReply: Message | null;
  setScrollToReply: any;
  receiver: User | null;
}) => {
  const [refresh, setRefresh] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  setTimeout(() => {
    setRefresh(!refresh);
  }, 30000);

  const { t } = useTranslation();
  const refOptions = useRef(null) as any;
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (refOptions.current && !refOptions.current.contains(event.target)) {
        setShowOptions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <>
      <div
        key={message.id}
        className={`flex  ${message.sender === id ? "flex-row-reverse sm:flex-row-reverse" : "flex-row sm:flex-row"}`}
        {...(index === messagesLength - 1 && {
          ref: lastMessageRef,
        })}
      >
        <div
          className={`flex  flex-col ${message.sender === id ? "items-end" : "items-start"}`}
        >
          {messageReply && (
            <div
              className={`flex  m-1  hover:cursor-pointer relative right-0 ${message.sender === id ? "flex-row items-end justify-end " : "flex-row-reverse items-end justify-start"}`}
              onClick={() => {
                setScrollToReply(messageReply.id);
              }}
            >
              <div className="bg-gray-600 p-2  w-32 sm:48 rounded-md  mt-0 flex flex-row items-center gap-2 justify-between	word-breaks">
                <p className="text-white text-sm">
                  {messageReply.content.length > 10
                    ? messageReply.content.slice(0, 10) + "..."
                    : messageReply.content}
                </p>
                <p className="text-white text-[0.5rem] opacity-50">
                  {timeAgo(messageReply.created_at, t("lang"))}
                </p>
              </div>
              {message.sender === id ? (
                <CornerUpLeft className="min-w-12  " />
              ) : (
                <CornerUpRight className="min-w-12" />
              )}
            </div>
          )}
          <div
            className={`flex  ${
              message.sender === id
                ? "flex flex-col  sm:flex-row-reverse items-end sm:items-center"
                : " flex flex-col  sm:flex-row items-start sm:items-center"
            }`}
          >
            <div
              className={`flex items-center justify-center ${
                message.sender === id ? "hidden" : "block"
              }`}
            >
              <img
                src={receiver?.image || "images/default.jpg"}
                alt="receiver"
                className="w-6 h-6 rounded-full"
              />
            </div>
            <div
              id={`message-${index}`}
              className={`bg-[#212121] p-2  rounded-md m-2 mt-0 max-w-[200px] lg:max-w-[400px] break-words  ${
                message.sender === id
                  ? "bg-gradient-to-l from-purple-600 to-blue-600"
                  : ""
              }`}
            >
              <p className="text-white text-sm">{message.content}</p>
              <p className={`text-white text-xs opacity-50`}>
                {timeAgo(message.created_at, t("lang"))}
              </p>
              <p className={`text-white text-xs opacity-50`}>
                {message.edited ? "edited " : ""}
              </p>
            </div>
            {message.sender === id ? (
              <div
                className={`flex items-start flex-row-reverse`}
                ref={refOptions}
              >
                <button
                  className="flex items-center justify-center z-2"
                  onClick={() => setShowOptions(!showOptions)}
                >
                  <CircleEllipsis className="w-4 h-4 m-2 cursor-pointer" />
                </button>
                <button
                  className={`flex items-center justify-center transform transition duration-300 z-1 ${
                    showOptions
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-2"
                  }`}
                  onClick={() => {
                    if (showOptions) setReplyTo(message);
                  }}
                >
                  <Reply className="w-4 h-4 m-2 cursor-pointer" />
                </button>
              </div>
            ) : (
              <div className="flex items-end flex-row" ref={refOptions}>
                <button
                  className="flex items-center justify-center  z-1"
                  onClick={() => setShowOptions(!showOptions)}
                >
                  <CircleEllipsis className="w-4 h-4 m-2 cursor-pointer" />
                </button>
                <button
                  className={`flex items-center justify-center transform transition duration-300  z-1 ${
                    showOptions
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-[-0.5rem]"
                  }`}
                  onClick={() => {
                    if (showOptions) setReplyTo(message);
                  }}
                >
                  <Reply className="w-4 h-4 m-2 cursor-pointer" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
export default MessageWrap;
