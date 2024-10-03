"use client";
import MessageWrap from "./MessageWrap";
import { Message, User } from "@/types/types";
import { useTranslation } from "@/hooks/useTranslation";
import { Loader } from "lucide-react";
import React, { SetStateAction, useState } from "react";

const MessagesWrap = ({
  messages,
  id,
  lastMessageRef,
  setReplyTo,
  setScrollToReply,
  receiver,
  getMessages,
  allMessagesGeted
}: {
  messages: Message[];
  id: string;
  lastMessageRef: React.RefObject<HTMLDivElement>;
  setReplyTo: React.Dispatch<SetStateAction<Message | null>>;
  setScrollToReply: React.Dispatch<SetStateAction<null>>
  receiver: User | null;
  getMessages: () => void;
  allMessagesGeted: boolean;
}) => {
  const { t } = useTranslation();
  const [gettingMessages, setGettingMessages] = useState(false);
  const findReplyTo = (id: string) => {
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].id === id) {
        return messages[i];
      }
    }
    return null;
  };
  return (
    <div className="m-2">
      <div className="flex justify-center">
        {!allMessagesGeted && !gettingMessages && (
        <button className="bg-gray-800 text-white text-xs px-2 py-1 rounded-lg"
          onClick={async () => {
            setGettingMessages(true);
            await getMessages();
            setGettingMessages(false);
          }}
          > 
          {t("view_more")}
        </button>
        )}
        {gettingMessages && (
          <div className="text-white text-xs px-2 py-1 rounded-lg">
            <Loader size={20} className="animate-spin" />
            </div>
        )}

      </div>
      {messages && messages.length > 0 ? (
        messages.map((message, index) => (
          <MessageWrap
            key={message.id}
            message={message}
            id={id}
            index={index}
            messagesLength={messages.length}
            lastMessageRef={lastMessageRef}
            setReplyTo={setReplyTo}
            messageReply={findReplyTo(message.reply_to)}
            setScrollToReply={setScrollToReply}
            receiver={receiver}
          />
        ))
      ) : (
        <div className="flex items-center justify-center mt-32 ">
          <h1 className="text-white text-sm opacity-50 text-center">
            {t("no_messages")}
          </h1>
        </div>
      )}
    </div>
  );
};
export default MessagesWrap;
