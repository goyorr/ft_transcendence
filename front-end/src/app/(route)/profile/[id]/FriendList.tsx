"use client";

import { UseAppContext } from "@/context/AuthContext";
import { IRequests, user } from "@/types/types";
import AxiosInstance from "@/utils/axiosInstance";
import { getCookie } from "cookies-next";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avv, AvatarImage } from "@/components/ui/avatar";
import { FaUserFriends } from "react-icons/fa";


import React, { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";
import { toast } from "sonner";

interface IProps {
  friends: user[];
  setFriends: React.Dispatch<React.SetStateAction<user[]>>;
  params: {
    id: string;
  };
}

const RenderIcons: React.FC<any> = ({
  Friend_id,
  friendsLoggesUser,
  friendRequests,
  userLoggedIn,
  socket,
}) => {
  const [isFriendRequestSend, setIsFriendRequestSend] = useState(false);
  const [isFriendRequestPending, setIsFriendRequestPending] = useState(false);
  const [isFriendLoggedUser, setIsFriendLoggedUser] = useState(false);
  const { t } = useTranslation();
  useEffect(() => {
    setIsFriendRequestSend(
      friendRequests.some(
        (friendRequest: any) => friendRequest.from_user === Friend_id
      )
    );
    setIsFriendRequestPending(
      friendRequests.some(
        (friendRequest: any) => friendRequest.to_user === Friend_id
      )
    );
    setIsFriendLoggedUser(
      friendsLoggesUser?.some(
        (friendLogged: any) => friendLogged.id === Friend_id
      )
    );
  }, [friendsLoggesUser, friendRequests]);

  const AcceptRequest = async () => {
    const access = getCookie("access");
    try {
      const response = await AxiosInstance("/api/v1/accept_request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json",
        },
        data: JSON.stringify({ from_user_id: Friend_id }),
      });

      const data = await response.data;

      if (response.statusText === "OK" && data.accept === true) {
        setIsFriendLoggedUser(true);
        const notification = {
          from_user: userLoggedIn,
          to_user: Friend_id,
          created_at: new Date(),
          type_notification: "accept",
          is_read: false,
        };

        if (socket) {
          socket.send(JSON.stringify(notification));
        }
        toast.success(t("friendrequesracce"));
      } else {
        toast.error(t("friendrequesracceerror"));
      }
    } catch (error: any) {
      if (error.response) {
        const { status } = error.response;
        if (status === 400) {
          toast.error(t("badrequest"));
        } else if (status === 404) {
          toast.error(t("sendrequestorusernotfound"));
        } else if (status === 500) {
          toast.error(t("servererror"));
        } else {
          toast.error(t("unexpectederror"));
        }
      } else if (error.request) {
        toast.error(t("networkerror"));
      } else {
        toast.error(t("error"));
      }
    }
  };

  const sendRequest = async () => {
    const access = getCookie("access");

    const notification = {
      from_user: userLoggedIn,
      to_user: Friend_id,
    };

    try {
      const response = await AxiosInstance("/api/v1/send_request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json",
        },
        data: notification,
      });

      if (response.statusText === "Created") {
        const data = await response.data;
        setIsFriendRequestPending(true);
        const notification = {
          from_user: data.from_user,
          to_user: data.to_user,
          message: "",
          created_at: new Date(),
          type_notification: "request",
          is_read: false,
        };
        if (socket) {
          socket.send(JSON.stringify(notification));
        }
        toast.success(t("friendrequestsend"));
      } else {
        toast.error(t("friendrequestsenderror"));
      }
    } catch (error: any) {
      if (error.response) {
        const { status } = error.response;
        if (status === 400) {
          toast.error(t("badrequest"));
        } else if (status === 404) {
          toast.error(t("sendrequestorusernotfound"));
        } else if (status === 500) {
          toast.error(t("servererror"));
        } else {
          toast.error(t("unexpectederror"));
        }
      } else if (error.request) {
        toast.error(t("networkerror"));
      } else {
        toast.error(t("error"));
      }
    }
  };

  const CancelRequest = async () => {
    try {
      const response = await AxiosInstance("/api/v1/requests", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getCookie("access")}`,
          "Content-Type": "application/json",
        },
        data: {
          to_user: Friend_id,
        },
      });

      if (response.statusText === "OK") {
        setIsFriendRequestSend(false);
        setIsFriendRequestPending(false);
        setIsFriendLoggedUser(false);
        toast.success(t("cancelrequestsuccess"));
      } else {
        toast.error(t("cancelrequesterror"));
      }
    } catch (error: any) {
      if (error.response) {
        const { status } = error.response;
        if (status === 400) {
          toast.error(t("badrequest"));
        } else if (status === 404) {
          toast.error(t("sendrequestorusernotfound"));
        } else {
          toast.error(t("unexpectederror"));
        }
      } else if (error.request) {
        toast.error(t("networkerror"));
      } else {
        toast.error(t("error"));
      }
    }
  };

  const handleClick = () => {
    if (
      !isFriendRequestSend &&
      !isFriendRequestPending &&
      !isFriendLoggedUser
    ) {
      sendRequest();
    }

    if (isFriendRequestPending) {
      CancelRequest();
    }

    if (isFriendRequestSend) {
      AcceptRequest();
    }
  };

  return (
    <>
      {Friend_id !== userLoggedIn && (
        <button
          onClick={handleClick}
          className="backdrop-blur-sm bg-black/30 px-[8px]   rounded-lg text-sm"
        >
          {isFriendRequestSend && (
            <svg
              className="text-white"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width={18}
              height={18}
              fill={"none"}
            >
              <path
                d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M8 12.5L10.5 15L16 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}

          {isFriendRequestPending && (
            <svg
              className="text-white"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width={18}
              height={18}
              fill={"none"}
            >
              <path
                d="M15 9L9 14.9996M15 15L9 9.00039"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          )}

          {!isFriendRequestPending &&
            !isFriendLoggedUser &&
            !isFriendRequestSend && (
              <svg
                className="text-white"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width={18}
                height={18}
                fill={"none"}
              >
                <path
                  d="M12 7.5C12 9.433 10.433 11 8.5 11C6.567 11 5 9.433 5 7.5C5 5.567 6.567 4 8.5 4C10.433 4 12 5.567 12 7.5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M13.5 11C15.433 11 17 9.433 17 7.5C17 5.567 15.433 4 13.5 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M13.1429 20H3.85714C2.83147 20 2 19.2325 2 18.2857C2 15.9188 4.07868 14 6.64286 14H10.3571C11.4023 14 12.3669 14.3188 13.1429 14.8568"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19 14V20M22 17L16 17"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            )}

          {isFriendLoggedUser && (
            <Link href={`/chat?receiver=${Friend_id}`}>
              <svg
                className="text-white"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width={18}
                height={18}
                color={"#000000"}
                fill={"none"}
              >
                <path
                  d="M7.79098 19C7.46464 18.8681 7.28441 18.8042 7.18359 18.8166C7.05968 18.8317 6.8799 18.9637 6.52034 19.2275C5.88637 19.6928 5.0877 20.027 3.90328 19.9983C3.30437 19.9838 3.00491 19.9765 2.87085 19.749C2.73679 19.5216 2.90376 19.2067 3.23769 18.5769C3.70083 17.7034 3.99427 16.7035 3.54963 15.9023C2.78384 14.7578 2.13336 13.4025 2.0383 11.9387C1.98723 11.1522 1.98723 10.3377 2.0383 9.55121C2.29929 5.53215 5.47105 2.33076 9.45292 2.06733C10.8086 1.97765 12.2269 1.97746 13.5854 2.06733C17.5503 2.32964 20.712 5.50498 20.9965 9.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14.6976 21.6471C12.1878 21.4862 10.1886 19.5298 10.0241 17.0737C9.99195 16.593 9.99195 16.0953 10.0241 15.6146C10.1886 13.1585 12.1878 11.2021 14.6976 11.0411C15.5539 10.9862 16.4479 10.9863 17.3024 11.0411C19.8122 11.2021 21.8114 13.1585 21.9759 15.6146C22.008 16.0953 22.008 16.593 21.9759 17.0737C21.9159 17.9682 21.5059 18.7965 21.0233 19.4958C20.743 19.9854 20.928 20.5965 21.2199 21.1303C21.4304 21.5152 21.5356 21.7076 21.4511 21.8466C21.3666 21.9857 21.1778 21.9901 20.8003 21.999C20.0538 22.0165 19.5504 21.8123 19.1508 21.5279C18.9242 21.3667 18.8108 21.2861 18.7327 21.2768C18.6546 21.2675 18.5009 21.3286 18.1936 21.4507C17.9174 21.5605 17.5966 21.6283 17.3024 21.6471C16.4479 21.702 15.5539 21.7021 14.6976 21.6471Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          )}
        </button>
      )}
    </>
  );
};

const FriendList: React.FC<IProps> = ({ friends, setFriends }) => {
  const { friendsLoggesUser, userLoggedIn, socket } = UseAppContext();

  const { t } = useTranslation();

  const [friendRequests, setFriendrequests] = useState<IRequests[]>([]);
  const [originalFriends] = useState<any[]>([...friends]);

  const [isLoading,setisLoading] = useState<boolean>(false);

  const getFriendRequests = async () => {
    try {
      setisLoading(true)
      const response = await AxiosInstance.get("api/v1/FriendRequests", {
        headers: {
          Authorization: `Bearer ${getCookie("access")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200 && response.statusText === "OK") {
        const data = await response.data;
        setFriendrequests(data.requests);
        setisLoading(false)
      }
    } catch (e) {
      toast.error("Error Occurred while getting FriendRequests");
      setisLoading(true)
    }
  };

  useEffect(() => {
    getFriendRequests();
  }, []);

  const searchFriends = (searchValue: string) => {
    if (searchValue.length === 0) {
      return originalFriends;
    }

    const filteredFriends = friends.filter(
      (friend) =>
        friend.username.startsWith(searchValue) ||
        friend.username.endsWith(searchValue) ||
        friend.username.includes(searchValue)
    );

    return filteredFriends.length ? filteredFriends : originalFriends;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    if (value.length === 0) {
      setFriends(originalFriends);
    } else {
      setFriends(searchFriends(value));
    }
  };

  return (
    <section className="rounded-lg row-span-2 p-2 flex flex-col bg-[#121212]">
    <h1 className="font-extrabold px-[4px] pt-[8px] pb-[10px] flex flex-row items-center gap-4">
      <FaUserFriends size={28}></FaUserFriends> {t("friends")} ({isLoading ? "..." : friends.length})
    </h1>

    {isLoading ? (
      <div className="flex flex-col gap-2 mt-4">
        {Array(5).fill("").map((_, index) => (
          <div key={index} className="backdrop-blur-sm bg-black/30 rounded-xl border-[0.1px] p-2 animate-pulse">
            <div className="flex flex-row justify-between items-center">
              <div className="flex flex-row gap-2">
                <div className="rounded-lg w-[36px] h-[36px] bg-gray-700"></div>
                <div className="flex flex-col justify-center">
                  <div className="w-[100px] h-[14px] bg-gray-600 rounded-md mb-1"></div>
                  <div className="w-[60px] h-[12px] bg-gray-600 rounded-md"></div>
                </div>
              </div>
              <div className="w-[60px] h-[24px] bg-gray-700 rounded-md"></div>
            </div>
          </div>
        ))}
      </div>
    ) : friends.length === 0 ? (
      <span className="p-4  rounded-md mt-4 flex justify-center">
        <p className="text-gray-400 text-center w-full text-xl font-extrabold">{t("nofriendyet")}</p>
      </span>
    ) : (
      <>
        <input
          type="text"
          placeholder={t("findfriends")}
          className="p-2 text-xs rounded-md mb-2 outline-none bg-transparent"
          onChange={handleChange}
        />
        <ScrollArea>
          <div className="friends flex flex-col mt-2 max-h-[38rem] gap-2">
            {friends.map((friend) => (
              <div key={friend.id} className="backdrop-blur-sm bg-black/30 rounded-xl border-[0.1px]">
                <div className="friend1 p-2 flex flex-row justify-between items-center">
                  <Link href={`/profile/${friend.id}`} className="flex flex-row gap-2">
                    <Avv className="rounded-lg mr-2 w-[36px] h-[36px] shadow-inner shadow-gray-900">
                      <AvatarImage
                        src={`https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/default.jpg`}
                      />
                    </Avv>
                    <section className="flex flex-col justify-center">
                      {friend.id === userLoggedIn ? (
                        <h1 className="font-extrabold">You</h1>
                      ) : (
                        <h1 className="font-bold text-xs">
                          {friend.first_name && friend.first_name.length > 6
                            ? friend.first_name.slice(0, 6) + "."
                            : friend.first_name[0].toUpperCase() + friend.first_name.slice(1)}
                          {friend.last_name && friend.last_name.length > 6
                            ? " " + friend.last_name.slice(0, 6) + "."
                            : " " + friend.last_name[0].toUpperCase() + friend.last_name.slice(1)}
                        </h1>
                      )}
                      <h6 className="text-xs text-gray-400">
                        {friend.username && friend.username}
                      </h6>
                    </section>
                  </Link>
                  <RenderIcons
                    Friend_id={friend.id}
                    friendRequests={friendRequests}
                    friendsLoggesUser={friendsLoggesUser}
                    userLoggedIn={userLoggedIn}
                    socket={socket}
                  />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </>
    )}
  </section>
  );
};

export default FriendList;
