import React, { useEffect, useState, useRef } from "react";
import { ILogout, IOnline, ITyperequest, Notifications } from "@/types/types";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";

const useWebSocket = (
  url: string,
  userLoggedIn: string | null,
  setcountRequests: React.Dispatch<React.SetStateAction<any>>,
  setfriendsOnlines: React.Dispatch<React.SetStateAction<IOnline[]>>,
  setTypeRequest: React.Dispatch<React.SetStateAction<ITyperequest | null>>,
  setOnlines: React.Dispatch<React.SetStateAction<IOnline[] | null>>,
  seTtrackTabsLogout: React.Dispatch<React.SetStateAction<ILogout | null>>,
  setNotifications: React.Dispatch<React.SetStateAction<Notifications[] | null>>,
  setFriendOnlines: React.Dispatch<React.SetStateAction<string[] | null>>
) => {
  const [socket, setSocket] = useState<WebSocket | null>();

  const [notifications, setRenderNotification] = useState<any>([]);
  const [chatSocket, setChatSocket] = useState<WebSocket | null>(null);
  const { t } = useTranslation();
  const ws = useRef<WebSocket | null>(null);
  const wsChat = useRef<WebSocket | null>(null);
  const wsChatNotification = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (userLoggedIn !== null) {
     
      if (!wsChatNotification.current) {
        wsChatNotification.current = new WebSocket(
          `${process.env.NEXT_PUBLIC_WS_URI}chat/`
        );

        wsChatNotification.current.onopen = () => {
        };
        wsChatNotification.current.onmessage = (e) => {
          try {
            const notify = JSON.parse(e.data);
            if(notify.type === 'connected_users')
            {
              setFriendOnlines(notify.connected_users)
            }
            if (notify.type === "direct_message") {
              toast.success(`New message get Received`);
            }
          } catch (error) {
          }
        };
      }
      if (!wsChat.current) {
        wsChat.current = new WebSocket(
          `${process.env.NEXT_PUBLIC_WS_URI}chat/`
        );
        wsChat.current.onopen = () => {
          if (wsChat.current !== null) {
            setChatSocket(wsChat.current);
          } else {
            setChatSocket(null);
          }
        };
      }

      if (!ws.current) {
        ws.current = new WebSocket(url);

        ws.current.onopen = () => {
          if (ws.current !== null) {
            setSocket(ws.current);
          } else {
            setSocket(undefined);
          }
        };

        ws.current.onmessage = (e) => {
          try {
            const notify = JSON.parse(e.data);
            if (
              notify.type === "invite_game" ||
              notify.type === "accept_game"
            ) {
              if (notify.to_user === userLoggedIn) {
                const notification: Notifications = {
                  gameId: notify.gameId,
                  id: notify.id,
                  from_user: notify.from_user.id,
                  to_user: notify.to_user,
                  message:
                    notify.type === "invite_game"
                      ? `You have a new game invite from user ${notify.from_user.username}`
                      : notify.type === "accept_game"
                        ? `Your game invite has been accepted by user ${notify.from_user.username}`
                        : "",
                  type_notification: notify.type,
                  is_read: false,
                  created_at: new Date().toISOString(),
                  from_user_details: {
                    id: notify.from_user.id,
                    username: notify.from_user.username,
                    image: notify.from_user.image,
                    first_name: notify.from_user.first_name,
                    last_name: notify.from_user.last_name,
                  },
                };
                setRenderNotification((prevNotify: any) => [
                  ...prevNotify,
                  notification,
                ]);
                setNotifications((prevNotify: any) => [
                  ...prevNotify,
                  notification,
                ]);
                
              }
            } else if (notify.type === "match_ready") {
              if (notify.to_user === userLoggedIn) {
                const data = {
                  id: notify.id,
                  from_user: notify.from_user.id,
                  to_user: notify.to_user,
                  message: `Your game with ${notify.from_user.username} is ready to start`,
                  type_notification: notify.type,
                  from_user_details: {
                    id: notify.from_user.id,
                    username: notify.from_user.username,
                    image: notify.from_user.image,
                    first_name: notify.from_user.first_name,
                    last_name: notify.from_user.last_name,
                  },
                };
                setRenderNotification((prevNotify: any) => [...prevNotify, data]);
              }
            } else if (notify.type === "send_event") {
              const { type, action, to_user, from_user } = notify;
              if(action === 'cancel_request')
              {
                setRenderNotification((prev: any) => 
                  prev.filter((user: any) => 
                    !(user.from_user === from_user && 
                      user.to_user === to_user && 
                      user.type_notification === 'request')
                  )
                );             
              }
              setTypeRequest({
                type: type,
                action: action,
                from_user: from_user,
                to_user: to_user,
              });
            } else {
              const { type, user } = notify;
              if (type === "notify_user_status") {
                const { action } = notify;
                if (action === "logout") {
                  if (userLoggedIn === user.id) {
                    seTtrackTabsLogout({
                      id: user.id,
                      isLogOut: true,
                    });
                  }
                  setOnlines((PreviousOnlines) => {
                    if (PreviousOnlines) {
                      return PreviousOnlines?.filter(
                        (online) => online.id !== user.id
                      );
                    }
                    return null;
                  });
                } else if (action === "login") {
                  setfriendsOnlines((prevFriends) => {
                    const existingUserIndex = prevFriends.findIndex(
                      (friend) => friend.id === user.id
                    );
                    if (existingUserIndex !== -1) {
                      const updatedFriends = [...prevFriends];
                      updatedFriends[existingUserIndex] = user;
                      return updatedFriends;
                    }
                    return [...prevFriends, user];
                  });
                }
              } else {
                if (notify.notification.notification.to_user === userLoggedIn) {
                  setTypeRequest({
                    type: notify.notification.notification.type_notification,
                    to_user: notify.notification.notification.from_user,
                  });
                  setNotifications((prevNotify: any) => [
                    ...prevNotify,
                    notify.notification.notification,
                  ]);
                  setRenderNotification((prevNotify: any) => [
                    ...prevNotify,
                    notify.notification.notification,
                  ]);
                  setcountRequests((prevCount: any) => ({
                    ...prevCount,
                    request: prevCount.request + 1,
                  }));
                }
              }
            }
          } catch (error) {
            t("erroroccurred");
          }
        };

        ws.current.onclose = () => {
          socket?.send(JSON.stringify({ send: "test" }));
          setSocket(null);
        };

        ws.current.onerror = () => {
          t("erroroccurred");
        };
      }

      return () => {
        if (ws.current) {
          ws.current.close();
        }
      };
    }
    if (userLoggedIn === null) {
      if (wsChat.current) {
        wsChat.current.close();
        wsChat.current = null;
        setChatSocket(null);
      }
      if (socket) {
        socket.close();
        ws.current = null;
        setSocket(null);
      }
      if (wsChatNotification.current) {
        wsChatNotification.current.close();
        wsChatNotification.current = null;
      }
    }
    return undefined;
  }, [url, userLoggedIn, setcountRequests]);

  return { socket, notifications, chatSocket };
};

export default useWebSocket;
