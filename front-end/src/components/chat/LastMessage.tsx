"use client";
import { useTranslation } from "@/hooks/useTranslation";
import timeAgo from "@/utils/timeAgo";
import { useState } from "react";

const MessagesWrap: React.FC<any> = ({
  conversation,
  selectedConversation,
}) => {
  const [refresh, setRefresh] = useState(false);
  const { t } = useTranslation();
  setTimeout(() => {
    setRefresh(!refresh);
  }, 30000);
  return (
    <div className="mr-4 hidden lg:block ml-auto">
      <div className="text-white text-xs opacity-50 ">
        <h1 className="text-white">
          {timeAgo(
            conversation?.last_message?.created_at ||
              conversation.created_at ||
              "",
            t("lang")
          )}
        </h1>
      </div>
      {conversation.unread_messages > 0 &&
        selectedConversation !== conversation.id && (
          <div className="bg-red-500 rounded-full h-4 w-4 justify-center flex ml-8 mt-2">
            <h1 className="text-white text-xs">
              {conversation.unread_messages}
            </h1>
          </div>
        )}
    </div>
  );
};
export default MessagesWrap;
