"use client";

import { usePathname, useRouter } from "next/navigation";
import useWebSocket from "./useWebSocket";

import { motion, AnimatePresence } from "framer-motion";

import moment from "moment";
import {
  Notifications,
  AuthContextType,
  user,
  request,
  DateRange,
  IOnline,
  ITyperequest,
  ILogout,
  IGamesData,
} from "@/types/types";
import { IoNotifications } from "react-icons/io5";
import { Toaster, toast } from "sonner";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getCookie } from "cookies-next";
import { TwoFa } from "@/types/types";
import AxiosInstance from "@/utils/axiosInstance";
import Settings from "@/components/update_data";
import ModeBox from "@/components/modeBox";
import { useTranslation } from "@/hooks/useTranslation";
import ListBlocks from "@/components/ListBlocks";

const initialUser: user | null = null;
const initialTwoFa: TwoFa = {
  source: "",
  isLogged_in: false,
  twoFaRequired: false,
};

const initialTokens = {
  access: "",
  refresh: "",
};

const initialRequests: request = {
  request: 0,
  messages: 0,
  game: 0,
};

const AuthContext = createContext<AuthContextType>({
  userLoggedIn: null,
  user: initialUser,
  setUser: () => {},
  TwoFa: initialTwoFa,
  setTwoFa: () => {},
  Tokens: initialTokens,
  SetTokens: () => {},
  next: null,
  setNext: () => {},
  prev: null,
  setPrev: () => {},
  dateRange: null,
  setDateRange: () => {},
  socket: null,
  notifications: null,
  friends: [],
  setFriends: () => {},
  countRequests: initialRequests,
  setcountRequests: () => {},
  Notifications: null,
  setNotifications: () => {},
  setShowSetting: () => {},
  showSetting: false,
  friendsLoggesUser: null,
  setsendSokcets: () => {},
  setfriendsOnlines: () => {},
  friendsOnlines: [],
  typeRequest: null,
  boxToggle: false,
  hideOnlines: false,
  setOnlines: () => {},
  setGamesData: () => {},
  setUserLogOut: () => {},
  setToggleBox: () => {},
  setHideOnlines: () => {},
  setShowBlocks: () => {},
  onlines: null,
  GamesData: null,
  chatSocket: null,
  setUserLoggedIn: () => {},
  friendOnlines:null
});

const Notification: React.FC<Notifications> = (notify) => {
  const { t } = useTranslation();

  const [hide, setHide] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => {
      setHide(true);
    }, 3000);
  }, []);

  return (
    // {notify.type_notification === "invite_game" ||
    //           notify.type_notification === "accept_game" ? (
    //             <div className="text-sm font-normal">{notify.message}</div>
    //           ) : notify.type_notification === "match_ready"
    <>
      {"id" in notify && hide == false && (
        <div
          id="toast-notification"
          className="w-full max-w-md p-4 text-gray-900 bg-white rounded-lg shadow dark:bg-gray-800 dark:text-gray-300"
          role="alert"
        >
          <div className="flex items-center mb-3">
            <span className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
              {t("newnotifi")}
            </span>
            <button
              type="button"
              className="ms-auto -mx-1.5 -my-1.5 bg-white justify-center items-center flex-shrink-0 text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
              data-dismiss-target="#toast-notification"
              aria-label="Close"
              onMouseDown={(event) => {
                event.stopPropagation();
                setHide(true);
              }}
            >
              <span className="sr-only">{t("close")}</span>
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
            </button>
          </div>
          <div className="flex items-center">
            <div className="relative inline-block shrink-0">
              <img
                className="w-12 h-12 rounded-full"
                src={`${notify.from_user_details.image != null ? `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}${notify.from_user_details.image}` : `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/default.jpg`}`}
                alt="Notification"
              />
              <span className="absolute bottom-0 right-0 inline-flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full">
                <IoNotifications color="white"></IoNotifications>
                <span className="sr-only">Message icon</span>
              </span>
            </div>
            <div className="ms-3 text-sm font-normal">
              {notify.type_notification === "match_ready" ? (
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {t("matchready")}
                </div>
              ) : (
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {notify.from_user_details.first_name}{" "}
                  {notify.from_user_details.last_name}
                </div>
              )}
              {notify.type_notification === "invite_game" ||
              notify.type_notification === "accept_game" ? (
                <div className="text-sm font-normal">{notify.message}</div>
              ) : notify.type_notification === "match_ready" ? (
                <div className="text-sm font-normal">
                  {t("gamewith")}{" "}
                  {notify.from_user_details.username.length > 8
                    ? notify.from_user_details.username.slice(0, 8)
                    : notify.from_user_details.username}{" "}
                  {t("readystart")}
                </div>
              ) : (
                <div className="text-sm font-normal">
                  {notify.type_notification === "accept"
                    ? t("requestactions")["accept"]
                    : notify.type_notification === "request"
                      ? t("requestactions")["request"]
                      : ""}
                </div>
              )}
              <span className="text-xs font-medium text-blue-600 dark:text-blue-500">
                {moment(Date.parse(notify.created_at)).fromNow()}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [user, setUser] = useState({});
  const [TwoFa, setTwoFa] = useState<TwoFa>({
    source: "",
    isLogged_in: false,
    twoFaRequired: false,
  });

  const parentRef = useRef<HTMLDivElement>(null);
  const childRef = useRef<HTMLDivElement>(null);

  const [showSetting, setShowSetting] = useState<boolean>(false);

  const [GamesData, setGamesData] = useState<IGamesData | null>(null);

  const router = useRouter();

  const [friends, setFriends] = useState<user[]>([]);
  const [friendsLoggesUser, setfriendsLoggesUser] = useState<user[]>([]);

  const [sendSokcets, setsendSokcets] = useState<boolean | null>(null);
  if (sendSokcets) {
  }
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: null,
    to: null,
  });

  const [userLoggedIn, setUserLoggedIn] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [TrackTabsLogout, seTtrackTabsLogout] = useState<ILogout | null>(null);
  const [userLogOut, setUserLogOut] = useState<boolean>(false);
  const [showBlocks, setShowBlocks] = useState<boolean>(false);

  const [countRequests, setcountRequests] = useState<request>({
    request: 0,
    messages: 0,
    game: 0,
  });

  const [next, setNext] = useState<string | null>(null);
  const [prev, setPrev] = useState<string | null>(null);
  const [Tokens, SetTokens] = useState({
    access: "",
    refresh: "",
  });

  const [Notifications, setNotifications] = useState<Notifications[] | null>(
    null
  );
  const [friendsOnlines, setfriendsOnlines] = useState<IOnline[]>([]);
  const [friendOnlines,setFriendOnlines] = useState<string[] | null>(null)
  const [typeRequest, setTypeRequest] = useState<ITyperequest | null>(null);
  const [boxToggle, setToggleBox] = useState<boolean>(false);
  const [hideOnlines, setHideOnlines] = useState<boolean>(false);

  const [onlines, setOnlines] = useState<IOnline[] | null>(null);

  const { t } = useTranslation();

  const { socket, notifications, chatSocket } = useWebSocket(
    `${process.env.NEXT_PUBLIC_WS_URI}notifications/`,
    userLoggedIn,
    setcountRequests,
    setfriendsOnlines,
    setTypeRequest,
    setOnlines,
    seTtrackTabsLogout,
    setNotifications,
    setFriendOnlines
  );

  const access = getCookie("access");

  const getDataUser = async () => {
    try {
      const response = await AxiosInstance("/api/v1/get_Or_UpdateDataUser", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });

      const data = await response.data;

      if (response.statusText !== "OK") {
        setLoading(true);
      }

      if (response.statusText === "OK") {
        setLoading(false);
        setUserLoggedIn(data.user.pk);
        setUser({ ...data.user });
        setfriendsLoggesUser(data.user.friends);
      }
    } catch (e) {
      setLoading(true);
    }
  };

  const getCountNOtification = async () => {
    try {
      const response = await AxiosInstance("/api/v1/notify", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });

      if (response.status === 200) {
        const data = await response.data;
        setNotifications(data.notifications);
      } else if (response.status === 403) {
        toast.error(t("Authenticationrequired"));
      } else if (response.status === 404) {
        toast.error(t("erroroccured"));
      } else if (response.status === 500) {
        toast.error(t("servererror"));
      } else {
        toast.error(t("unexpectederror"));
      }
    } catch (error: any) {
      if (error.response) {
        toast.error(t("servererror"));
      } else if (error.request) {
        toast.error(t("networkerror"));
      } else {
        toast.error(t("unexpectederror"));
      }
    }
  };

  useEffect(() => {
    if (
      pathname !== "/login" &&
      pathname !== "/signup" &&
      pathname !== "/reset" &&
      pathname?.split("/")[1] !== "forgot-password" &&
      pathname !== "/auth"
    ) {
      if (
        getCookie("access") === undefined ||
        getCookie("refresh") === undefined
      ) {
        setLoading(false);
      } else {
        getDataUser();
        getCountNOtification();
      }
    } else {
      setLoading(false);
    }
  }, [pathname]);

  const handlClose = () => {
    setUserLoggedIn(null);
    setUserLogOut(true);
    router.push("/login");
  };

  const checkToken = async (access: string) => {
    try {
      const response = await AxiosInstance("/api/v1/decode_and_check/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: { access_token: access },
      });
      if (response.status === 200) {
        setUserLoggedIn(null);
        setUserLogOut(true);
      } else if (response.status === 401) {
        toast.error(t("Invalidtoken"));
      } else if (response.status === 404) {
        toast.error(t("userNotFound"));
      } else {
        toast.error(t("unexpectederror"));
      }
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          toast.error(t("Invalidtoken"));
        } else if (status === 404) {
          toast.error(t("resourceNotFound"));
        } else {
          toast.error(t("servererror"));
        }
      } else if (error.request) {
        toast.error(t("networkerror"));
      } else {
        toast.error(t("unexpectederror"));
      }
    }
  };

  useEffect(() => {
    const access: string | undefined = getCookie("access");
    if (access && TrackTabsLogout !== null) {
      checkToken(access);
    }
  }, [TrackTabsLogout]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target) {
        const parent = target.parentNode as HTMLElement | null;

        if (parent && parent instanceof HTMLElement) {
          if (
            parent.classList.contains("settings") ||
            parent.classList.contains("body")
          ) {
            if (showSetting) {
              setShowSetting(false);
            }
          }
        }

        if (target.classList.contains("parent")) {
          if (boxToggle === true) {
            setToggleBox(false);
          }
        }
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [boxToggle, showSetting]);

  return (
    <>
      <Toaster richColors />
      {loading ? (
        <div className="cc">
          <div className="dots flex justify-center items-center w-full h-full"></div>
        </div>
      ) : (
        <AuthContext.Provider
          value={{
            friendsOnlines,
            setfriendsOnlines,
            setsendSokcets,
            friendsLoggesUser,
            friends,
            setFriends,
            countRequests,
            setcountRequests,
            userLoggedIn,
            user,
            setUser,
            TwoFa,
            setTwoFa,
            Tokens,
            SetTokens,
            next,
            setNext,
            prev,
            setPrev,
            dateRange,
            setDateRange,
            socket,
            notifications,
            Notifications,
            setNotifications,
            setShowSetting,
            showSetting,
            typeRequest,
            setOnlines,
            onlines,
            setToggleBox,
            boxToggle,
            setUserLogOut,
            setHideOnlines,
            hideOnlines,
            setGamesData,
            GamesData,
            setShowBlocks,
            chatSocket,
            setUserLoggedIn,
            friendOnlines
          }}
        >
          {userLoggedIn !== null && notifications.length > 0 && (
            <>
              <div
                className="notify z-40 md:fixed  lg:bottom-0 hidden lg:flex lg:flex-col  gap-2  w-[24rem]  p-4 text-gray-900  rounded-lg shadow  dark:text-gray-300 absolute0 max-h-[40rem] overflow-y-scroll"
                id="toast-notification"
              >
                {notifications.map(
                  (notification: Notifications, index: number) => (
                    <div key={index}>
                      {notification && (
                        <Notification {...notification}></Notification>
                      )}
                    </div>
                  )
                )}
              </div>
            </>
          )}

          {userLoggedIn && showSetting && (
            <div className="backdrop-blur-sm bg-[#020617]/30 w-full max-h-screen absolute z-40 top-0 bottom-0 settings">
              <Settings></Settings>
            </div>
          )}
          {userLoggedIn && showBlocks && (
            <div className="backdrop-blur-sm bg-[#020617]/30 w-full max-h-screen absolute z-40 top-0 bottom-0 settings">
              <ListBlocks></ListBlocks>
            </div>
          )}

          {TrackTabsLogout?.isLogOut &&
            TrackTabsLogout.id !== null &&
            userLogOut === false && (
              <div
                className={`fixed inset-0 flex items-center justify-center z-50`}
              >
                <div className="absolute inset-0 backdrop-blur-xl bg-black/30"></div>
                <div className="bg-gray-600 rounded-lg overflow-hidden shadow-xl transform transition-all max-w-lg w-full">
                  <div className="p-4">
                    <div className="text-lg font-semibold">
                      {t("sesexpired")}
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      {t("session_expired")}
                    </div>
                    <div className="mt-4 flex justify-start">
                      <button
                        className=" text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none  mb-4"
                        onClick={handlClose}
                      >
                        {t("signout")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          <AnimatePresence>
            {boxToggle && userLoggedIn !== null && (
              <div
                ref={parentRef}
                className="w-full h-full flex justify-center items-center fixed z-40 right-0 backdrop-blur-md bg-[#121212]/30 parent"
              >
                <motion.div
                  ref={childRef}
                  className="w-full h-full "
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.3 }}
                >
                  <ModeBox />
                </motion.div>
              </div>
            )}
          </AnimatePresence>
          {children}
        </AuthContext.Provider>
      )}
    </>
  );
};

export const UseAppContext = () => useContext(AuthContext);
