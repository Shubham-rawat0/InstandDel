import { createContext, useContext, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { userData } = useSelector((state: RootState) => state.user);
  const socketRef = useRef<Socket | null>(null);

  const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

  useEffect(() => {
    if (userData?._id && !socketRef.current) {
      const socket = io(serverUrl, { withCredentials: true });
      socketRef.current = socket;

      socket.on("connect", () => {
        socket.emit("identity", { userId: userData._id });
        console.log("Connected:", socket.id);
      });
    }
  }, [userData?._id]);

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
};

