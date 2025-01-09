import React, { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes} from 'react-router-dom'
import Chat from './pages/chat'
import Profile from './pages/profile'
import Auth from './pages/auth'
import { useAppStore } from './store'
import { apiClient } from './lib/api-client'
import { GET_USER_INFO } from './utils/constants'

const PrivateRoute = ({children}) => {
  const {userInfo} = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiClient.get(GET_USER_INFO);
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (!userInfo) {
      checkAuth();
    } else {
      setIsAuthenticated(true);
      setIsLoading(false);
    }
  }, [userInfo]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/auth" />;
};

const AuthRoute = ({children}) => {
  const {userInfo} = useAppStore();
  return userInfo ? <Navigate to="/chat" /> : children;
};

const App = () => {
  const {setUserInfo} = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await apiClient.get(GET_USER_INFO);
        if (response.data) {
          setUserInfo(response.data);
        }
      } catch (error) {
        console.error(error);
        setUserInfo(null);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, [setUserInfo]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        <Route path="/chat" element={
          <PrivateRoute>
            <Chat />
          </PrivateRoute>
        } />
        <Route path="/auth" element={
          <AuthRoute>
            <Auth />
          </AuthRoute>
        } />
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;