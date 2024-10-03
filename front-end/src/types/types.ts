
export interface ITyperequest {
  'type':string,
  'to_user':string,
  action?:string,
  from_user?:string,
}


export interface IGamesData {
  loses:number,
  wins:number,
  tournaments:number,
  totlgames:number,
}

export interface TwoFa {
  source: string,
  isLogged_in: boolean
  twoFaRequired: boolean
}

export interface FriendRequest {
  from_user: number;
  to_user: number;
}


export interface Errors {
  email: string;
  password: string;
  is_Error: Boolean
}


export interface RegisterData {
  method: string,
  url: string,
  data: {
    email: string,
    username: string,
    password: string
  },
  headers:
  {
    'Content-Type': string
  }
}


export interface dataLogin {
  email: string,
  password?: string,
  username?: string,
  first_name?: string,
  last_name?: string,
}

export interface errorHandling {
  email?: string,
  username?: string,
  password?: string,
  first_name?: string,
  last_name?: string,
}


export interface AuthResponseData {
  access: string;
  refresh: string;
  twofa?: boolean
}

export interface ErrorOtp {
  status: boolean,
  message: string,
}

export interface DataProps {
  id?:string,
  first_name: string,
  last_name: string,
  username: string,
  email: string,
  image: File | null | string,
  cover_image: File | null | string,
  enableTwoFA?: boolean,
  phone_number?: string | null,
  intra_id?:number | null,
}

export interface DoghnutChartProps {
  win: number;
  lose: number;
}

export interface Game {
  id: number;
  Winner_scr: number;
  Loser_scr: number;
  mode: string;
  type_game: string;
  date: string;
  opponent: number
  result: boolean
}

export interface ComponentPops {
  link: string;
  games: any[];
}

export type DateRange = {
  from: Date | null;
  to: Date | null;
};


export interface Filters {
  result?: string
  mode?: string
  type?: string
  Range?: DateRange
}


export interface Notifications {
  gameId?: string,
  id: string,
  from_user: string,
  to_user: string,
  message: string,
  type_notification: string,
  is_read: boolean,
  created_at: string,
  from_user_details: {
    id: string,
    username: string,
    image: string,
    first_name: string,
    last_name: string,
  }
}

export interface TypeBlockList {
  id: number,
  blocker_id: string,
  blocked_id: string,
  blocked_user_details:
  {
    id: string,
    username: string,
    image: string,
    first_name: string,
    last_name: string,
  }
}

export interface Tournament {
  id: string,
  name: string,
  alias: string,
  start_date: string,
  end_date: string,
  player_count: number,
  max_players: number,
  is_player_joined: boolean,
  is_expired: boolean,
  is_end: boolean,
  organizer:number,
  organizer_info:
  {
    id:string,
    image:string | null,
    username:string
  }
}

export interface user {
  id: string,
  username: string,
  image: string,
  first_name: string,
  last_name: string,
  nickname?:string
}

export interface request {
  request: 0,
  messages: 0,
  game: 0
}

export interface  IOnline
{
  id:string,
  image:string,
  username:string,
  first_name?:string,
  last_name?:string
}


export interface ILogout {
  isLogOut:boolean,
  id:string | null,
}

export interface AuthContextType {
  userLoggedIn: string | null;
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  TwoFa: TwoFa;
  setTwoFa: React.Dispatch<React.SetStateAction<TwoFa>>;
  Tokens: {
    'access': string,
    'refresh': string,
  }
  SetTokens: React.Dispatch<React.SetStateAction<{
    'access': string;
    'refresh': string;
  }>>;
  next: any;
  setNext: React.Dispatch<React.SetStateAction<any>>;
  prev: any;
  setPrev: React.Dispatch<React.SetStateAction<any>>;
  dateRange: any;
  setDateRange: React.Dispatch<React.SetStateAction<any>>;
  socket: any;
  notifications: any;
  friends: user[],
  setFriends: React.Dispatch<React.SetStateAction<user[]>>,
  countRequests: request,
  setcountRequests: React.Dispatch<React.SetStateAction<request>>,
  Notifications:Notifications[] | null,
  setNotifications: React.Dispatch<React.SetStateAction<Notifications[] | null>>,
  setShowSetting: React.Dispatch<React.SetStateAction<boolean>>,
  setsendSokcets: React.Dispatch<React.SetStateAction<boolean | null>>,
  setToggleBox: React.Dispatch<React.SetStateAction<boolean>>,
  setfriendsOnlines: React.Dispatch<React.SetStateAction<IOnline[]>>,
  onlines:IOnline[] | null,
  setOnlines: React.Dispatch<React.SetStateAction<IOnline[] | null>>,
  setUserLogOut: React.Dispatch<React.SetStateAction<boolean>>,
  setHideOnlines: React.Dispatch<React.SetStateAction<boolean>>,
  setShowBlocks: React.Dispatch<React.SetStateAction<boolean>>,
  setGamesData: React.Dispatch<React.SetStateAction<IGamesData | null>>,
  friendsOnlines:IOnline[],
  showSetting:boolean,
  boxToggle:boolean,
  hideOnlines:boolean,
  friendsLoggesUser:user[] | null,
  typeRequest: ITyperequest | null,
  friendOnlines: string[] | null,
  GamesData:IGamesData | null,
  chatSocket: WebSocket | null,
  setUserLoggedIn: React.Dispatch<React.SetStateAction<string | null>>,

}

export interface IProfile {
  id: string,
  first_name: string,
  last_name: string,
  username: string,
  email: string,
  image: string,
  cover: string,
  phone_number: string,
  friends: number[],
  win: number,
  lose: number,
  level: number,
  total_game: number,
  coin: number,
  country: string
  same_user?: boolean,
  user_logged: number,
  isBlocker?: boolean,
  isBlocked: boolean,
  cover_image: string | null,
}

export interface GameData {
  end_time: string;
  id: number;
  is_played: boolean;
  p1: user,
  p2: user,
  player_1: number;
  player_2: number;
  round_number: number;
  start_time: string;
  tournament_id: number;
  winner_id: number | null;
  name_tournament: string,
};

export interface MultiPLayerData {
  game_id: number;
  player_1: user,
  player_2: user,
  player_3: user,
  player_4: user,
};

export interface GameInfo {
  Loser_scr: number;
  Winner_scr: number;
  date: string;
  id: number;
  mode: string;
  opponent: number;
  opponent_info: user;
  player: number;
  player_info: user;
  result: boolean;
  type_game: string;
  winner_id: number
  winner_alias: string
  loser_alias: string
}

export type Player = {
  id: string,
  image: string | null,
  username: string
}

export interface TournamentWinner {
  createdAt: string,
  players: Player[],
  tournament: number,
  name_tournament: string,
  winner: number,
}

export interface PlayerAchievement{
  player:number,
  achievement_name:string,
  achievement_name_display:string,
  date_awarded:string,
}


export interface AvatarUser {
  width:string,
  height:string,
  src:string | File | null,
  alt:string,
  header?:string,
  onClick?: () => void;
  ref?:React.Ref<HTMLImageElement>
}

export type ParseData = {
  success: boolean,
  fieldsError: errorHandling
}

export interface IRequests{
  'from_user':number,
  'to_user':number,
}





export interface Message {
  content: string;
  conversation: string;
  created_at: string;
  id: string;
  receiver: string;
  sender: string;
  updated_at: string;
  edited: boolean;
  deleted: boolean;
  reply_to: string;
}
export interface User {
  id: string;
  username: string;
  image: string;
  first_name: string;
  last_name: string;
}
export interface Conversation {
  id: string;
  user1: string;
  user2: string;
  user1_details: User
  user2_details: User
  last_message: Message;
  unread_messages: number;
  created_at: string;
  isBlocked: boolean;
  isFriend: boolean;
  blockedBy: string;
}
export interface socketMessage {
  type: string;
  message: string;
  sender: string;
  conversation: string;
  id : string,
  reply_to: string
}


export interface IDataChart {
  'month':string;
  'win':number;
  'lose':number
}

export interface IDoghnut {
  
}


export interface LanguageContextType {
  language: string | null;
  changeLanguage: (lang: string) => void;
}


export interface IChartData {
  results: string;
  visitors: any; 
  fill: string;
}


export interface ChartData {
  month: string;
  win: number;
  lose: number;
}

export interface Accumulator {
  min: number;
  max: number;
}


