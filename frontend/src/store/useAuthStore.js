import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,


  checkAuth: async () => {
    try {
      console.log('⭐⭐BASE_URL',BASE_URL);
      const res = await axiosInstance.get("/users/check",);
      console.log('res:',res);
      
      set({ authUser: res.data });
      get().connectSocket();
      
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/users/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/users/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("users/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      console.error("Logout Error:", error); // Debugging
      toast.error(error?.response?.data?.message || "Logout failed, try again.");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/users/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {    
    const {authUser } = get();
    // check socket connectio::
    if(!authUser || get().socket?.connected ) return;

    const socket = io(BASE_URL ,{
      query:{ userId: authUser._id, },
      withCredentials: true, 
      transports: ["websocket", "polling"]
    })
    socket.connect()

    set({ socket:socket })

    socket.on("getOnlineUsers" , (userIds) =>{
      console.log("online Users List from server::", userIds);
      
      set({ onlineUsers: userIds })
    })
  },

  
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
  
}));