// src/store/authStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
// import { response } from "../../../backend_/app.js";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  // Check if user is authenticated
  checkAuth: async () => {
    try {
      console.log("⭐ Checking authentication...");
      const res = await axiosInstance.get("/users/check"); // Ensure this endpoint exists in backend
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // Signup function
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      console.log("⭐ Signing up with data:", data);
      
      const res = await axiosInstance.post("/users/signup", data);
      console.log('⭐⭐res.data:',res.data);
      
      const token = res.data.token; // Extract token
     
      Cookies.set("token", token, { expires: 7, secure: true }); // Store token in cookies
      
      set({ authUser: res.data });
      toast.success("Account created successfully");

      get().connectSocket();
    } catch (error) {
      console.log("Signup Error:", error);
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  // Login function
  // login: async (data) => {
  //   set({ isLoggingIn: true });
  //   try {
  //     console.log("⭐ Logging in with data:", data);
  //   //  Axios login api
  //     const res = await axiosInstance.post("/users/login", data);
  //     console.log('⭐000000000000res:',res);
      
  //     if (res.data.status) {
  //       // Store JWT token in localStorage
  //       localStorage.setItem('token', res.data.Token);

  //     } else {
  //       setErrorMessage('Invalid credentials. Please try again.');
  //     }
  //   } catch (error) {
  //     setErrorMessage('An error occurred. Please try again later.');
  //     console.error(error);
  //   }
  //    // Redirect to dashboard or home page
  //     const token = res.data.Token; // Extract token

  //     Cookies.set("token", token, { expires: 7, secure: true }); // Store token in cookies

  //     set({ authUser: res.data });
  //     toast.success("Logged in successfully");
  //     get().connectSocket();

  //   } catch (error) {

  //     toast.error(error.r?.data?.message || "Login failed");

  //   } finally {
  //     set({ isLoggingIn: false });
  //   }
  // },

  // login function
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      console.log("⭐ Logging in with data:", data);
      const res = await axiosInstance.post("/users/login", data); // Use 'res' here
      
      if (res.data.status) {
        localStorage.setItem("token", res.data.Token); // Store JWT token
      } else {
        setErrorMessage('Invalid credentials. Please try again.');
      }
  
      const token = res.data.Token; // Extract token
      Cookies.set("token", token, { expires: 7, secure: true }); // Store token in cookies
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      setErrorMessage('An error occurred. Please try again later.');
      console.error(error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },  

  // Logout function
  logout: async () => {
    try {
      await axiosInstance.post("/users/logout");
      Cookies.remove("token"); // Remove token on logout
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },

  // Update profile function
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/users/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in update profile:", error);
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // Connect to WebSocket
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || !authUser._id || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: { userId: authUser._id },
    });

    socket.connect();
    set({ socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  // Disconnect from WebSocket
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));