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
import {
  LOGIN_ROUTE,
  SIGNUP_ROUTE,
  SEND_OTP,
  VERIFY_OTP,
  RESET_PASSWORD,
  CHECK_EMAIL,
  CHECK_EMAIL_EXISTS,
} from '@/utils/constants';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { useGoogleLogin } from '@react-oauth/google';

const Auth = () => {
  const navigate = useNavigate();
  const { setUserInfo } = useAppStore();

  // State Variables
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmPassword] = useState('');
  const [googleEmail, setGoogleEmail] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmail] = useState('');
  const [googleLoginEmail, setGoogleLoginEmail] = useState(null);
  const [otp, setOtp] = useState('');
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [isResetOTPSent, setIsResetOTPSent] = useState(false);
  const [isResetOTPVerified, setIsResetOTPVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingForget, setIsLoadingForget] = useState(false);

  // Google Authentication Handlers
  const handleGoogleAuthLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const { access_token } = response;
        if (!access_token) {
          toast.error('Failed to retrieve access token from Google');
          return;
        }

        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        const userInfo = await userInfoResponse.json();

        if (userInfo?.email) {
          setGoogleLoginEmail(userInfo.email);
          handleGoogleLogin(userInfo.email);
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
        { email, password: 'password', fromGoogle: true },
        { withCredentials: true }
      );
      if (response.data?.user?.id) {
        setUserInfo(response.data.user);
        navigate(response.data.user.profileSetup ? '/chat' : '/profile');
      }
    } catch (error) {
      console.error('Error validating Google login:', error);
      toast.error(error.response?.data?.message || 'Google login failed');
    }
  };

  // Form Validation
  const validateLogin = () => {
    if (!email) {
      toast.error('Email is required');
      return false;
    }
    if (!password) {
      toast.error('Password is required');
      return false;
    }
    return true;
  };

  const validateSignup = () => {
    if (!googleEmail) {
      toast.error('Please verify your email using Google Auth');
      return false;
    }
    if (!password) {
      toast.error('Password is required');
      return false;
    }
    if (password !== confirmpassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  // Login Handler
  const handleLogin = async () => {
    if (validateLogin()) {
      try {
        const response = await apiClient.post(
          LOGIN_ROUTE,
          { email, password, fromGoogle: false },
          { withCredentials: true }
        );
        if (response.data?.user?.id) {
          setUserInfo(response.data.user);
          navigate(response.data.user.profileSetup ? '/chat' : '/profile');
        }
      } catch (error) {
        console.error('Error during login:', error);
        toast.error(error.response?.data?.message || 'Login failed');
      }
    }
  };

  // Signup Handler
  const handleSignup = async () => {
    if (validateSignup()) {
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
        console.error('Error during signup:', error);
        toast.error(error.response?.data?.message || 'Signup failed');
        if (error.response?.data?.message === 'Email already exists') {
          setGoogleEmail(null);
          setIsVerified(false);
          setIsEmailVerified(false);
        }
      }
    }
  };

  // OTP Handlers
  const handleSendOTP = async () => {
    setIsLoading(true);
    try {
      const emailCheckResponse = await apiClient.post(CHECK_EMAIL, { email }, { withCredentials: true });

      if (emailCheckResponse.status === 200) {
        await apiClient.post(SEND_OTP, { email }, { withCredentials: true });
        setIsOTPSent(true);
        toast.success(`OTP sent to ${email}`);
      }
    } catch (error) {
      console.error('Error during email check or OTP sending:', error);
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      if (!otp) {
        toast.error('Please enter the OTP.');
        return;
      }
      const response = await apiClient.post(VERIFY_OTP, { email, otp }, { withCredentials: true });
      setIsEmailVerified(true);
      toast.success('OTP verified successfully');
      setGoogleEmail(email);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error(error.response?.data?.message || 'OTP verification failed');
    }
  };

  // Reset Password Handlers
  const handleResetSendOTP = async () => {
    setIsLoadingForget(true);
    try {
      const emailCheckResponse = await apiClient.post(CHECK_EMAIL_EXISTS, { email: resetEmail }, { withCredentials: true });

      if (emailCheckResponse.status === 200) {
        await apiClient.post(SEND_OTP, { email: resetEmail }, { withCredentials: true });
        setIsResetOTPSent(true);
        toast.success(`OTP sent to ${resetEmail}`);
      }
    } catch (error) {
      console.error('Error sending reset OTP:', error);
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoadingForget(false);
    }
  };

  const handleResetVerifyOTP = async () => {
    try {
      if (!resetOtp) {
        toast.error('Please enter the OTP.');
        return;
      }
      const response = await apiClient.post(VERIFY_OTP, { email: resetEmail, otp: resetOtp }, { withCredentials: true });
      setIsResetOTPVerified(true);
      toast.success('OTP verified successfully');
    } catch (error) {
      console.error('Error verifying reset OTP:', error);
      toast.error(error.response?.data?.message || 'OTP verification failed');
    }
  };

  const handleGoogleAuth = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const { access_token } = response;
        
        if (!access_token) {
          toast.error('Failed to retrieve access token from Google');
          return;
        }
        
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        const userInfo = await userInfoResponse.json();
        
        if (!userInfo?.email) {
          throw new Error('Failed to retrieve email from Google');
        }
        
        const emailCheckResponse = await apiClient.post(CHECK_EMAIL, { email: userInfo.email }, { withCredentials: true });
        if (emailCheckResponse.status === 200) {
          setGoogleEmail(userInfo.email);
          setIsVerified(true);
          setIsEmailVerified(true);
          toast.success(`Google email verified: ${userInfo.email}`);
        } else {
          toast.error(`Email ${userInfo.email} already exists`);
        }
      } catch (error) {
        console.error('Error during Google authentication:', error);
        toast.error(error.response?.data?.message || 'Error in Email Verification');
        setGoogleEmail(null);
        setIsVerified(false);
        setIsEmailVerified(false);
      }
    },
    onError: () => {
      toast.error('Google Verification failed');
      setGoogleEmail(null);
      setIsVerified(false);
      setIsEmailVerified(false);
    },
  });
  

  const handleResetPassword = async () => {
    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await apiClient.post(
        RESET_PASSWORD,
        { email: resetEmail, password: newPassword },
        { withCredentials: true }
      );
      toast.success('Password reset successfully');
      window.location.reload();
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error.response?.data?.message || 'Password reset failed');
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
            <p className="font-medium text-center">Complete Your Auth Please</p>
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
  {!isForgotPassword ? (
    <>
      {/* Google Login */}
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

      {/* Divider */}
      <div className="flex items-center justify-center gap-2 mt-5">
        <hr className="w-full border-gray-300" />
        <span className="text-gray-500 text-sm font-medium">OR</span>
        <hr className="w-full border-gray-300" />
      </div>

      {/* Email and Password Login */}
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

        {/* Forgot Password Link */}
        <div className="flex items-center justify-center mt-3">
          <button
            className="text-sm font-medium text-purple-500 hover:underline hover:text-purple-600 transition duration-200"
            onClick={() => setIsForgotPassword(true)}
          >
            Forgot Password?
          </button>
        </div>
      </div>
    </>
  ) : (
    /* Forgot Password Flow */
    <div className="flex flex-col gap-5">
      {!isResetOTPSent && !isResetOTPVerified && (
        <>
          <p className="text-gray-500 text-sm font-medium text-center">
            Enter your registered email to reset your password.
          </p>
          <Input
            placeholder="Email"
            type="email"
            className="rounded-full p-6"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
          />
          <Button
            className="rounded-full p-6 bg-purple-500 text-white"
            onClick={() =>  handleResetSendOTP()}
          >
            {isLoadingForget ? (
          <div className="flex items-center justify-center">
            <span className="animate-bounce mr-1">.</span>
            <span className="animate-bounce delay-200 mr-1">.</span>
            <span className="animate-bounce delay-400">.</span>
          </div>
        ) : (
          "Send OTP"
        )}
          </Button>
          <button
          className="text-sm font-medium text-purple-500 hover:underline mt-3"
          onClick={() => setIsForgotPassword(false)}
        >
          Back to Login
        </button>
        </>
      )}

      {isResetOTPSent && !isResetOTPVerified && (
        <>
          <p className="text-gray-500 text-sm font-medium text-center">
            Enter the OTP sent to your email.
          </p>
          <Input
            placeholder="Enter OTP"
            type="text"
            className="rounded-full p-6"
            value={resetOtp}
            onChange={(e) => setResetOtp(e.target.value)}
          />
          <Button
            className="rounded-full p-6 bg-green-500 text-white"
            onClick={() => handleResetVerifyOTP()}
          >
            Verify OTP
          </Button>
          <button
          className="text-sm font-medium text-purple-500 hover:underline mt-3"
          onClick={() => setIsForgotPassword(false)}
        >
          Back to Login
        </button>
        </>
      )}

      {isResetOTPVerified && (
        <>
          <p className="text-gray-500 text-sm font-medium text-center">
            Set your new password.
          </p>
         

          <Input
  placeholder="Password"
  type="password"
  className="rounded-full p-6"
  value={newPassword} 
  onChange={(e) => setNewPassword(e.target.value)}
/>
<Input
  placeholder="Confirm Password"
  type="password"
  className="rounded-full p-6"
  value={confirmNewPassword} // Corrected value
  onChange={(e) => setConfirmNewPassword(e.target.value)}
/>
          <Button className="rounded-full p-6 bg-black text-white"
          onClick={() => handleResetPassword()}
          >
            Reset Password
          </Button>
          <button
          className="text-sm font-medium text-purple-500 hover:underline mt-3"
          onClick={() => setIsForgotPassword(false)}
        >
          Back to Login
        </button>
        </>
      )}
    </div>
  )}
</TabsContent>




<TabsContent className="flex flex-col gap-5" value="signup">
  {isEmailVerified ? (
    // Email Verified: Show password fields
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-center">
        <FaCheckCircle className="text-green-500" size={32} />
        <span className="ml-2 text-green-500 font-medium">Email Verified</span>
      </div>
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
    </div>
  ) : (
    // Email Not Verified: Show verification options
    <div>
     {/* Google Verification Button */}
<Button
  className="flex items-center justify-center rounded-full w-full h-14 bg-blue-500 text-white text-lg font-medium" // Adjusted size
  onClick={() => handleGoogleAuth()}
>
  <FcGoogle className="mr-2" size={24} /> Verify Email with Google
</Button>

{/* Separator */}
<div className="flex items-center justify-center gap-2 mt-5 mb-5"> {/* Added bottom margin */}
  <hr className="w-full border-gray-300" />
  <span className="text-gray-500 text-sm font-medium">OR</span>
  <hr className="w-full border-gray-300" />
</div>


      {/* OTP Section */}
      <div className="flex flex-col gap-3">
      <Input
  placeholder="Email"
  type="email"
  className="rounded-full p-6"
  value={email} 
  onChange={(e) => setEmail(e.target.value)}
/>

        <Button
          className="rounded-full p-3 bg-purple-500 text-white text-sm font-medium"
          onClick={() => handleSendOTP()}
        >
          {isLoading ? (
          <div className="flex items-center justify-center">
            <span className="animate-bounce mr-1">.</span>
            <span className="animate-bounce delay-200 mr-1">.</span>
            <span className="animate-bounce delay-400">.</span>
          </div>
        ) : (
          "Send OTP"
        )}
        </Button>
      </div>

      {isOTPSent && (
        <div className="flex flex-col items-center justify-center gap-5 mt-5">
          <p className="text-gray-500 text-sm font-medium">Enter OTP</p>
          <Input
            placeholder="Enter OTP"
            type="text"
            className="rounded-full p-4 w-2/3 text-center"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <Button
            className="rounded-full p-6 bg-green-500 text-white"
            onClick={() => handleVerifyOTP()}
          >
            Verify OTP
          </Button>
        </div>
      )}
    </div>
  )}
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


