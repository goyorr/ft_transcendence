"use client";

import { IoIosNotificationsOutline } from "react-icons/io";
import Link from "next/link";
import { getCookie, deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { Avv, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { BsPersonLinesFill } from "react-icons/bs";

import SearchBar from "@/components/SearchBar";

import { UseAppContext } from "@/context/AuthContext";
import { useEffect, useState, MouseEvent } from "react";
import moment from "moment";
import AxiosInstance from "@/utils/axiosInstance";
import ChatGameSocket from "./chat/ChatGameSocket";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { IoSettings } from "react-icons/io5";


interface IDataGame {
  id1: string;
  id2: string | null;
  gameId: string;
}

const NavBar: React.FC = () => {
  const [handleToggle, setHandleToggle] = useState<boolean>(false);
  const {
    user,
    Notifications,
    userLoggedIn,
    setUserLoggedIn,
    socket,
    setNotifications,
    setShowSetting,
    showSetting,
    setUserLogOut,
    setHideOnlines,
  } = UseAppContext();
  const { username, image } = user;

  const { t } = useTranslation();

  const { typeRequest } = UseAppContext()

  const [dataGame, setDataGame] = useState<IDataGame | null>(null);

  const router = useRouter();

  const signout = async () => {
    try {
      await AxiosInstance("/api/v1/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("access")}`,
        },
        data: {
          refresh_token: getCookie("refresh"),
        },
      });
      setUserLogOut(true);
      setUserLoggedIn(null);
      deleteCookie("access");
      deleteCookie("refresh");
      router.push("/login");
    } catch (e) {
      toast.error(t("erroroccurred"));
    }
  };

  const HandleToggle = () => {
    setHandleToggle(!handleToggle);
  };

  const accept = async (
    e: any,
    to_user: string,
    id_notification: string,
    setNotifications: any
  ) => {
    e.preventDefault();
    try {
      const response = await AxiosInstance("/api/v1/accept_request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getCookie("access")}`,
          "Content-Type": "application/json",
        },
        data: { from_user_id: to_user, id_notification },
      });

      const data = await response.data;

      if (response.statusText === "OK" && data.accept === true) {
        setNotifications(
          Notifications?.filter(
            (notify: { id: string }) => notify.id !== id_notification
          )
        );
        const notification = {
          from_user: userLoggedIn,
          to_user: to_user,
          created_at: new Date(),
          type_notification: "accept",
          is_read: false,
        };

        if (socket) {
          socket.send(JSON.stringify(notification));
        }
      }
    } catch (e) {
      toast.error(t("erroroccurred"));
    }
  };


  const showSettings = () => {
    setShowSetting(!showSetting);
  };

  const sendBackRequest = (
    e: MouseEvent<HTMLButtonElement>,
    id: string,
    gameId: string
  ) => {
    e.preventDefault();
    if (socket != null) {
      const data = {
        id1: id,
        id2: String(userLoggedIn),
        gameId: gameId,
      };
      setDataGame(data);
      socket.send(
        JSON.stringify({
          type: "accept_game",
          from: String(userLoggedIn),
          to: id,
          gameId,
        })
      );
    }
  };

  const handleShowOnlines = () => {
    setHideOnlines((prev: boolean) => !prev);
  };

  useEffect(() => {
    if (typeRequest) {
      if (typeRequest.to_user === userLoggedIn && typeRequest.action === 'cancel_request') {
        if (Notifications) {
          const remove = Notifications.filter((notify) =>
            !(notify.from_user === typeRequest.from_user &&
              notify.to_user === typeRequest.to_user &&
              notify.type_notification === 'request')
          );
          setNotifications(remove)
        }
      }
    }
  }, [typeRequest])

  const handleClose = () => {
    setHandleToggle(false)
  }

  return (
    <>
      {dataGame && (
        <ChatGameSocket
          id1={dataGame.id1}
          id2={dataGame.id2}
          gameId={dataGame.gameId}
        />
      )}

<div className="w-full  flex flex-col lg:flex-row  items-center lg:container lg:mx-auto justify-between 2xl:gap-[38rem] 2xl:mr-[41rem]">
  <section className="flex flex-row gap-4 items-center">
    {/* Back to Home */}
    <Link
      href="/game"
      className="backdrop-blur-xl bg-black/20 shadow-inner shadow-[#3730a3] rounded-xl flex justify-center items-center p-2 cursor-pointer hover:bg-white/20 transition duration-300 ease-in-out"
    >
      <svg
        className="text-white"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={22}
        height={22}
        fill="none"
      >
        <path
          d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
    {/* Search Bar */}
    <SearchBar />
    {/* Show Online Users */}

  </section>

  <section className="left-icons flex gap-4 p-4  items-center flex-row-reverse  rounded-lg">
  <div className="flex items-center ml-8">
      <Avv>
        <AvatarImage src={image ? `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}${image}` : `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/default.jpg`} />
      </Avv>
      <Link
        href={`https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/profile/${userLoggedIn}`}
        className="ml-2 text-sm font-bold sm:block"
      >
        <h6>{username}</h6>
      </Link>
    </div>
    {/* Notifications Icon */}
    <div
      onClick={HandleToggle}
      className="relative flex items-center cursor-pointer"
    >
      <div className="backdrop-blur-xl bg-black/20 shadow-inner shadow-[#3730a3] rounded-xl p-2 transition hover:bg-white/20 duration-300 ease-in-out">
        <IoIosNotificationsOutline size={22} className="text-white" />
      </div>

      {handleToggle && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`backdrop-blur-xl bg-black/30 border translate-x-[-10.5rem] sm:translate-x-[0rem] flex flex-col shadow-2xl top-[4rem] rounded-lg h-[32rem] z-[9999999] transition-all duration-450 ease-in-out overflow-hidden notification absolute min-w-[22rem]`}
        >
          <div className="flex justify-between items-center p-4 border-b">
            <h1 className="text-xl font-extrabold">{t("notification")} ({Notifications?.length})</h1>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-100 transition duration-200">✕</button>
          </div>

          <div className={`overflow-y-scroll h-full p-4 space-y-4 ${Notifications?.length === 0 ? "flex items-center justify-center" : ""}`}>
            {Notifications?.length === 0 ? (
              <h1 className="text-gray-400">{t("nonotification")}</h1>
            ) : (
              Notifications?.map((notify, index) => (
                <div
                  key={index}
                  className={`flex items-start p-4 bg-white/10 border rounded-lg transition-all duration-200 hover:shadow-lg hover:bg-white/20 ${!notify.is_read ? "border-blue-500" : "border-gray-300"}`}
                >
                  <Avv className="w-[50px] h-[50px]">
                    <AvatarImage src={`https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/default.jpg`} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avv>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between items-center">
                      <Link href={`/profile/${notify.from_user_details.id}`}>
                        <h6 className="font-semibold text-white truncate">
                          {notify.from_user_details.username.length > 15
                            ? `${notify.from_user_details.username.slice(0, 14)}...`
                            : notify.from_user_details.username}
                        </h6>
                      </Link>
                      <span className="text-xs text-gray-500">{moment(notify.created_at).fromNow()}</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">
                      {t(`requestactions`)[notify.type_notification] || notify.message}
                    </p>
                    {notify.type_notification === "request" && (
                      <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                        <button
                          onClick={(e) => accept(e, notify.from_user, notify.id, setNotifications)}
                          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-all"
                        >
                          {t("Accept")}
                        </button>
                      </div>
                    )}
                    {(notify.type_notification === "invite_game" || notify.type_notification === "accept_game") && (//otify.to_user === String(userLoggedIn) && (
                      <div className="text-sm mt-2">
                        <button
                          onClick={(e) => sendBackRequest(e, notify.from_user_details.id, notify.gameId ?? "")}
                          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-all w-full"
                        >
                          {notify.type_notification === "invite_game"
                            ? t("gamenotification").invite_game
                            : t("gamenotification").start_game}
                        </button>
                      </div>
                    )}
                    {notify.type_notification === "match_ready" && notify.to_user === String(userLoggedIn) && (
                      <div className="text-sm mt-1 text-center text-gray-300">
                        <p>{t("tourwait")}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>

    {/* Avatar and Username */}
    

    {/* Sign Out */}
    <section
      onClick={signout}
      className="backdrop-blur-xl bg-black/30 shadow-inner shadow-[#3730a3] rounded-xl flex justify-center items-center ml-2 p-2 cursor-pointer hover:bg-white/20 transition duration-300 ease-in-out"
    >
      <svg
        className="text-[#dc2626] font-extrabold cursor-pointer"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={22}
        height={22}
        fill="none"
      >
        <path
          d="M15 17.625C14.9264 19.4769 13.3831 21.0494 11.3156 20.9988C10.8346 20.987 10.2401 20.8194 9.05112 20.484C6.18961 19.6768 3.70555 18.3203 3.10956 15.2815C3 14.723 3 14.0944 3 12.8373L3 11.1627C3 9.90561 3 9.27705 3.10956 8.71846C3.70555 5.67965 6.18961 4.32316 9.05112 3.51603C10.2401 3.18064 10.8346 3.01295 11.3156 3.00119C13.3831 2.95061 14.9264 4.52307 15 6.37501"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M21 12H10M21 12C21 11.2998 19.0057 9.99153 18.5 9.5M21 12C21 12.7002 19.0057 14.0085 18.5 14.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </section>

    {/* Show Settings */}
    <section
      onClick={showSettings}
      className="backdrop-blur-xl bg-black/20 shadow-inner shadow-[#3730a3] rounded-xl flex justify-center items-center ml-2 p-2 cursor-pointer hover:bg-white/20 transition duration-300 ease-in-out"
    >
      <IoSettings size={20}/>
    </section>
    <section className="lg:flex flex-row gap-6 rounded-full 2xl:hidden ">
      <section
        onClick={handleShowOnlines}
        className="cursor-pointer p-3 rounded-xl transition bg-black/20 shadow-inner shadow-[#3730a3]"
      >
        <BsPersonLinesFill  size={14} />
      </section>
    </section>
  </section>
</div>












      {/* <div className="p-2 bg-[#121212]">
        <section className="flex justify-between items-center w-full  rounded-md">
          <section className="flex lg:flex-row gap-6 p-2 rounded-full 2xl:hidden">
            <span
              onClick={handleShowOnlines}
              className="cursor-pointer shadow-inner shadow-[#6d28d9] p-3 rounded-full "
            >
              <BsPersonLinesFill color="#d4d4d8" size={18}></BsPersonLinesFill>
            </span>
          </section>
          <div className="border-solid border-[#6731ca82] p-2 rounded-2xl flex  justify-center items-center w-full">
            <div className="avatar flex flex-row px-6 py-3 rounded-lg">
              <div className="icons justify-center gap-2 relative flex flex-row ml-auto">
                <Link
                  href={"/game"}
                  className="backdrop-blur-xl bg-black/20 shadow-inner shadow-[#3730a3] rounded-xl flex justify-center items-center p-2 cursor-pointer hover:bg-white/20 transition duration-300 ease-in-out"
                >
                  <svg
                    className="text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width={22}
                    height={22}
                    fill={"none"}
                  >
                    <path
                      d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </div>
            </div>
            <SearchBar></SearchBar>

            <div className="avatar flex flex-row px-6 py-3 rounded-lg ">
              <div className="icons  justify-center gap-2 relative flex flex-row">
                <div
                  onClick={HandleToggle}
                  className="flex flex-row gap-[0.5px]  relative justify-center items-center cursor-pointer"
                >
                  <section className="backdrop-blur-xl bg-black/20 shadow-inner shadow-[#3730a3] rounded-xl p-2 ml-4 hover:bg-white/20 transition duration-300 ease-in-out">
                    <IoIosNotificationsOutline
                      size={22}
                      className="text-white cursor-pointer"
                    />
                  </section>
                  {handleToggle && (
                    <div
                    onClick={(e: { stopPropagation: () => any }) => e.stopPropagation()}
                    className={`backdrop-blur-xl bg-black/30 border-[0.1px] flex flex-col shadow-2xl top-[4rem] rounded-lg ${handleToggle ? "h-[32rem] z-20" : "h-[0]"} transition-all duration-[450ms] ease-in-out overflow-hidden notification absolute min-w-[22rem] sm:mr-[18rem]`}
                  >
                    <div className="flex justify-between items-center p-4 border-b">
                      <h1 className="text-xl font-extrabold">{t("notification")} ({Notifications?.length})</h1>
                      <button onClick={() => handleClose()} className="text-gray-400 hover:text-gray-100 transition-all duration-200">✕</button>
                    </div>
                  
                    <div className={`overflow-y-scroll h-full p-4 space-y-4 ${Notifications?.length === 0 ? "flex items-center justify-center" : ""}`}>
                      {Notifications !== null && Notifications?.length === 0 && (
                        <h1 className="text-gray-400">{t("nonotification")}</h1>
                      )}
                  
                      {Notifications && Notifications?.map((notify, index) => (
                        <div
                          key={index}
                          className={`flex items-start p-4 bg-white/10 border rounded-lg transition-all duration-200 hover:shadow-lg hover:bg-white/20 ${
                            !notify.is_read ? "border-blue-500" : "border-gray-300"
                          }`}
                        >
                          <Avv className="w-[50px] h-[50px]">
                            <AvatarImage src={`https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/default.jpg`} />
                            <AvatarFallback>CN</AvatarFallback>
                          </Avv>
                          <div className="ml-4 flex-1">
                            <div className="flex justify-between items-center">
                              <Link href={`/profile/${notify.from_user_details.id}`}>
                                <h6 className="font-semibold text-white truncate">
                                  {notify.from_user_details.username.length > 15
                                    ? notify.from_user_details.username.slice(0, 14) + "..."
                                    : notify.from_user_details.username}
                                </h6>
                              </Link>
                              <span className="text-xs text-gray-500">{moment(notify.created_at).fromNow()}</span>
                            </div>
                            
                            <p className="text-sm text-gray-300 mt-1">
                              {notify.type_notification === "request"
                                ? t("requestactions")["request"]
                                : notify.type_notification === "accept"
                                ? t("requestactions")["accept"]
                                : notify.type_notification === "invite_game"
                                ? `${notify.message}`
                                : notify.type_notification === "accept_game"
                                ? `${notify.message}`
                                : ""}
                            </p>
                  
                            {notify.type_notification === "request" && (
                              <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                                <button
                                  onClick={(e) => accept(e, notify.from_user, notify.id, setNotifications)}
                                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-all"
                                >
                                  {t("Accept")}
                                </button>
                              </div>
                            )}
                  
                            {(notify.type_notification === "invite_game" || notify.type_notification === "accept_game") && (
                              <div className="text-sm mt-2">
                                {notify.to_user === String(userLoggedIn) && (
                                  <button
                                    onClick={(e) => sendBackRequest(e, notify.from_user_details.id, notify.gameId ?? "")}
                                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-all w-full"
                                  >
                                    {notify.type_notification === "invite_game"
                                      ? t("gamenotification")["invite_game"]
                                      : t("gamenotification")["start_game"]}
                                  </button>
                                )}
                              </div>
                            )}
                  
                            {notify.type_notification === "match_ready" && (
                              <div className="text-sm mt-1 text-center text-gray-300">
                                {notify.to_user === String(userLoggedIn) && (
                                  <p>{t("tourwait")}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  )}
                </div>
                <section
                  onClick={showSettings}
                  className="backdrop-blur-xl bg-black/20 shadow-inner shadow-[#3730a3] rounded-xl flex justify-center items-center   ml-2 p-2 cursor-pointer hover:bg-white/20 transition duration-300 ease-in-out"
                >
                  <svg
                    className="text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width={22}
                    height={22}
                    fill={"none"}
                  >
                    <path
                      d="M5.18007 15.2964C3.92249 16.0335 0.625213 17.5386 2.63348 19.422C3.6145 20.342 4.7071 21 6.08077 21H13.9192C15.2929 21 16.3855 20.342 17.3665 19.422C19.3748 17.5386 16.0775 16.0335 14.8199 15.2964C11.8709 13.5679 8.12906 13.5679 5.18007 15.2964Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 7C14 9.20914 12.2091 11 10 11C7.79086 11 6 9.20914 6 7C6 4.79086 7.79086 3 10 3C12.2091 3 14 4.79086 14 7Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M19.5 7.14286V8M19.5 7.14286C18.777 7.14286 18.14 6.76405 17.7664 6.18888M19.5 7.14286C20.223 7.14286 20.86 6.76405 21.2336 6.18888M19.5 2.85714C20.223 2.85714 20.8601 3.236 21.2336 3.81125M19.5 2.85714C18.777 2.85714 18.1399 3.236 17.7664 3.81125M19.5 2.85714V2M22 3.28571L21.2336 3.81125M17.0003 6.71429L17.7664 6.18888M17 3.28571L17.7664 3.81125M21.9997 6.71429L21.2336 6.18888M21.2336 3.81125C21.4545 4.15141 21.5833 4.56023 21.5833 5C21.5833 5.43982 21.4545 5.84869 21.2336 6.18888M17.7664 3.81125C17.5455 4.15141 17.4167 4.56023 17.4167 5C17.4167 5.43982 17.5455 5.84869 17.7664 6.18888"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </section>

                <section className="backdrop-blur-xl bg-black/30 shadow-inner shadow-[#3730a3] rounded-xl flex justify-center items-center   ml-2 p-2 cursor-pointer hover:bg-white/20 transition duration-300 ease-in-out">
                  <svg
                    onClick={signout}
                    className="text-[#dc2626] font-extrabold cursor-pointer"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width={22}
                    height={22}
                    fill={"none"}
                  >
                    <path
                      d="M15 17.625C14.9264 19.4769 13.3831 21.0494 11.3156 20.9988C10.8346 20.987 10.2401 20.8194 9.05112 20.484C6.18961 19.6768 3.70555 18.3203 3.10956 15.2815C3 14.723 3 14.0944 3 12.8373L3 11.1627C3 9.90561 3 9.27705 3.10956 8.71846C3.70555 5.67965 6.18961 4.32316 9.05112 3.51603C10.2401 3.18064 10.8346 3.01295 11.3156 3.00119C13.3831 2.95061 14.9264 4.52307 15 6.37501"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M21 12H10M21 12C21 11.2998 19.0057 9.99153 18.5 9.5M21 12C21 12.7002 19.0057 14.0085 18.5 14.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </section>
              </div>
              <div className="avatar flex between items-center ml-8">
                <div>
                  <Avv>
                    <AvatarImage src={`${image != null ? `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}${image}` : `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/default.jpg`}`} />
                  </Avv>
                </div>
                <div className="ml-2  sm:block">
                  <Link
                    href={`https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/profile/${userLoggedIn}`}
                  >
                    <h6 className="text-sm font-bold">{username}</h6>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div> */}
    </>
  );
};

export default NavBar;
