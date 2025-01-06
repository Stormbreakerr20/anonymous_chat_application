import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc'; 
import { FaCheckCircle } from 'react-icons/fa'; 
import Background from '@/assets/login2.png';
import Victory from '@/assets/victory.svg';
import { Input } from '@/components/ui/input.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client.js';
import { LOGIN_ROUTE, SIGNUP_ROUTE } from '@/utils/constants';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { useGoogleLogin } from '@react-oauth/google';

const Auth = () => {
  const navigate = useNavigate();
  const { setUserInfo } = useAppStore();
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmPassword] = useState('');
  const [googleEmail, setGoogleEmail] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmail] = useState('');
  const [googleLoginEmail, setGoogleLoginEmail] = useState(null);

  const handleGoogleAuthLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const { access_token } = response;
  
        if (!access_token) {
          toast.error('Failed to retrieve access token from Google');
          return;
        }
  
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });
  
        const userInfo = await userInfoResponse.json();
        console.log(userInfo?.email)
        if (userInfo?.email) {
          setGoogleLoginEmail(userInfo.email); 
          console.log(userInfo.email)

          handleGoogleLogin(userInfo.email)
          toast.success(`Google email verified: ${userInfo.email}`);
        } else {
          throw new Error('Failed to retrieve email from Google');
        }
      } catch (error) {
        console.error('Error fetching Google user info:', error);
        toast.error('Google Verification failed');
  
        setGoogleEmail(null);
        setIsVerified(false);
      }
    },
    onError: () => {
      toast.error('Google Verification failed');
      setGoogleEmail(null);
      setIsVerified(false);
    },
  });
  

  const handleGoogleLogin = async (email) => {
    try {
      const response = await apiClient.post(
        LOGIN_ROUTE,
        { email ,password:"password" ,fromGoogle:true},
        { withCredentials: true }
      );
  
      if (response.data?.user?.id) {
        setUserInfo(response.data.user);
        if (response.data.user.profileSetup) {
          navigate('/chat');
        } else {
          navigate('/profile');
        }
      }
    } catch (error) {
      console.error('Error validating Google login:', error);
      toast.error(error.response?.data?.message || 'Google login failed');
    }
  };
  
  // const extractGoogleEmailAndLogin = async (accessToken) => {
  //   try {
  //     const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //     });
  
  //     const userInfo = await userInfoResponse.json();
  
  //     if (userInfo?.email) {
  //       toast.success(`Google email verified: ${userInfo.email}`);
  //       await handleGoogleLogin(userInfo.email); // Call handleGoogleLogin with the extracted email
  //     } else {
  //       throw new Error('Failed to retrieve email from Google');
  //     }
  //   } catch (error) {
  //     console.error('Error extracting Google email:', error);
  //     toast.error('Failed to extract email from Google');
  //   }
  // };
  

  const handleGoogleAuth = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const { access_token } = response;
  
        if (!access_token) {
          toast.error('Failed to retrieve access token from Google');
          return;
        }
  
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });
  
        const userInfo = await userInfoResponse.json();
  
        if (userInfo?.email) {
          setGoogleEmail(userInfo.email);
          setIsVerified(true); 
          toast.success(`Google email verified: ${userInfo.email}`);
        } else {
          throw new Error('Failed to retrieve email from Google');
        }
      } catch (error) {
        console.error('Error fetching Google user info:', error);
        toast.error('Google Verification failed');
  
        setGoogleEmail(null);
        setIsVerified(false);
      }
    },
    onError: () => {
      toast.error('Google Verification failed');
      setGoogleEmail(null);
      setIsVerified(false);
    },
  });
  
  const validateLogin = () => {
    if(!email.length){
      toast.error("Email is required");
      return false;
    }
    if(!password.length){
      toast.error("Password is required");
      return false;
    }
    return true;
  }

  const handleLogin = async () => {
    // if (googleEmail) {
      
    //   try {
    //     const response = await apiClient.post(
    //       LOGIN_ROUTE,
    //       { email: googleEmail },
    //       { withCredentials: true }
    //     );
  
    //     if (response.data.user.profileSetup) {
    //         navigate('/chat');
    //       } else {
    //         navigate('/profile');
    //       }
    //   } catch (error) {
    //     console.error(error);
    //     toast.error(error.response?.data?.message || 'Google login failed');
    //   }
    // } else if (validateLogin()) {
      
      try {
        const response = await apiClient.post(
          LOGIN_ROUTE,
          { email, password,fromGoogle:false },
          { withCredentials: true }
        );
  
        if (response.data?.user?.id) {
          setUserInfo(response.data.user);
          if (response.data.user.profileSetup) {
            navigate('/chat');
          } else {
            navigate('/profile');
          }
        }
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || 'Login failed');
      }
    
  };
  

  const validateSignup = async  () => {
    if (!googleEmail) {
      toast.error('Please verify your email using Google Auth');
      return false;
    }
    if (!password.length) {
      toast.error('Password is required');
      return false;
    }
    console.log(password)
    console.log(confirmpassword)
    if (password !== confirmpassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  
  const handleSignup = async () => {
    const isValid = await validateSignup();
    if (isValid) {
      try {
        const response = await apiClient.post(
          SIGNUP_ROUTE,
          { email: googleEmail, password },
          { withCredentials: true }
        );
  
        if (response.status === 201 && response.data?.user) {
          setUserInfo(response.data.user);
          navigate('/profile');
        }
      } catch (error) {
        console.error(error);
        const errorMessage = error.response?.data?.message || 'Signup failed';
        toast.error(errorMessage);
  
        if (errorMessage === 'Email already exists') {
          setGoogleEmail(null);
          setIsVerified(false);
        }
      }
    }
  };
  return (
    <div className="h-[100vh] w-[100vw] flex items-center justify-center">
      <div className="h-[80vh] items-center justify-center bg-white border-2 border-white text-opacity-90 shadow-2xl w-[80vw] md:w-[90vw] lg:w-[70vw] xl:w-[60vw] rounded-3xl grid xl:grid-cols-2">
        {}
        <div className="flex flex-col gap-10 items-center justify-center">
          <div className="flex items-center justify-center flex-col">
            <div className="flex items-center justify-center">
              <h1 className="text-5xl font-bold md:text-6xl">Welcome</h1>
              <img src={Victory} alt="victory emoji" className="h-[100px]" />
            </div>
            <p className="font-medium text-center">Fill in your details</p>
          </div>
          <div className="flex items-center justify-center w-full">
            <Tabs className="w-3/4" defaultValue="login">
              <TabsList className="bg-transparent rounded-none w-full flex">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300"
                >
                  Signup
                </TabsTrigger>
              </TabsList>
              <TabsContent className="flex flex-col gap-5 mt-10" value="login">
  {!isVerified ? (
    <Button
      className="flex items-center justify-center rounded-full p-6 bg-blue-500 text-white"
      onClick={() => handleGoogleAuthLogin()}
    >
      <FcGoogle className="mr-2" size={24} /> Login with Google
    </Button>
  ) : (
    <div className="flex items-center justify-center">
      <FaCheckCircle className="text-green-500" size={32} />
      <span className="ml-2 text-green-500 font-medium">Email Verified</span>
    </div>
  )}

  <div className="flex items-center justify-center gap-2 mt-5">
    <hr className="w-full border-gray-300" />
    <span className="text-gray-500 text-sm font-medium">OR</span>
    <hr className="w-full border-gray-300" />
  </div>

  <div className={`transition-all duration-500 ${googleEmail ? 'hidden' : 'flex flex-col gap-5'}`}>
    <Input
      placeholder="Email"
      className="rounded-full p-6"
      onChange={(e) => setEmail(e.target.value)}
    />
    <Input
      placeholder="Password"
      type="password"
      className="rounded-full p-6"
      onChange={(e) => setPassword(e.target.value)}
    />
    <Button className="rounded-full p-6 bg-black text-white" onClick={handleLogin}>
      Login
    </Button>
  </div>
</TabsContent>


              <TabsContent className="flex flex-col gap-5 " value="signup">
                {!isVerified ? (
                  <Button
                    className="flex items-center justify-center rounded-full p-6 bg-blue-500 text-white"
                    onClick={() => handleGoogleAuth()}
                  >
                    <FcGoogle className="mr-2" size={24} /> Verify Email with Google
                  </Button>
                ) : (
                  <div className="flex items-center justify-center">
                    <FaCheckCircle className="text-green-500" size={32} />
                    <span className="ml-2 text-green-500 font-medium">Email Verified</span>
                  </div>
                )}
                <Input
                  placeholder="Password"
                  type="password"
                  className="rounded-full p-6"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Input
                  placeholder="Confirm Password"
                  type="password"
                  className="rounded-full p-6"
                  value={confirmpassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button className="rounded-full p-6 bg-black text-white" onClick={handleSignup}>
                  Sign Up
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        {}
        <div className="hidden xl:flex justify-center items-center">
          <img src={Background} alt="background login" className="h-[600px]" />
        </div>
      </div>
    </div>
  );
};

export default Auth;


