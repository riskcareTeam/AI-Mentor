// src/context/UserContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  login: string;
  avatar_url: string;
  email: string;
  skills: Array<any> | [];
  repos: Array<any>;
  selectedRepo: string;
  [key: string]: any;
}

interface UserContextType {
  user: User | null;
  setUserData: (userData: User | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const setUserData = (userData: User | null) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');  // Clear user session from localStorage
  };

  return (
    <UserContext.Provider value={{ user, setUserData, logout }}>
      {children}
    </UserContext.Provider>
  );
};
