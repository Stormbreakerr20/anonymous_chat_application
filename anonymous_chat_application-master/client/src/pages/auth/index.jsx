import React, { useState } from 'react';
import Background from '@/assets/login2.png';
import Victory from '@/assets/victory.svg';
import { Input } from '@/components/ui/input.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {apiClient} from '@/lib/api-client.js';
import { LOGIN_ROUTE, SIGNUP_ROUTE } from '@/utils/constants';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { FaDice } from 'react-icons/fa';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Auth = () => {
  // State variables
  const navigate = useNavigate();
  const { setUserInfo } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const validateLogin = () => {
    if(!email.length){
      toast.error("Anonymous Id is required");
      return false;
    }
    if(!password.length){
      toast.error("Password is required");
      return false;
    }
    return true;
  }

  const validateSignup = () => {
    if(!email.length){
      toast.error("Anonymous Id is required");
      return false;
    }
    if(!password.length){
      toast.error("Password is required");
      return false;
    }
    return true;
  }
  
  const handleLogin = async () => {
    if(validateLogin()){
        try {
            const response = await apiClient.post(LOGIN_ROUTE, {email, password},{withCredentials:true});
            if(response.data?.user?.id){
                setUserInfo(response.data.user);
                
                if(response.data.user.profileSetup){
                    navigate('/chat');
                } else {
                    navigate('/profile');
                }
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Login failed");
        }
    }
};

const handleSignup = async () => {
    if(validateSignup()){
        try {
            const response = await apiClient.post(SIGNUP_ROUTE, {email, password},{withCredentials : true});
            if(response.status === 201 && response.data?.user){
                setUserInfo(response.data.user);
                console.log(response.data.user);
                navigate('/profile');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Signup failed");
        }
    }
};

const generateRandomId = async () => {
  try {
    const response = await apiClient.get('/api/auth/generate-name');
    if (response.data?.name) {
      setEmail(response.data.name);
      
    }
  } catch (error) {
    toast.error("Failed to generate anonymous id");
  }
};

  return (
    <div className="h-[100vh] w-[100vw] flex items-center justify-center">
      <div className="h-[80vh] items-center justify-center bg-gray-50 border-2 border-white text-opacity-90 shadow-2xl w-[80vw] md:w-[90vw] lg:w-[70vw] xl:w-[60vw] rounded-3xl grid xl:grid-cols-2">
        <div className="flex flex-col gap-10 items-center justify-center">
          <div className="flex items-center justify-center flex-col">
            <div className="flex items-center justify-center">
              <h1 className="text-5xl font-bold md:text-6xl">Welcome</h1>
              <img src={Victory} alt='victory emoji' className='h-[100px]'/>
            </div>
            <p className='font-medium text-center'>fill in deets</p>
          </div> 
          <div className='flex items-center justify-center w-full'>
            <Tabs className='w-3/4' defaultValue='login'>  
              <TabsList className='bg-transparent rounded-none w-full flex'>
                <TabsTrigger value='login' className='data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2
                rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300'>Login</TabsTrigger>
                <TabsTrigger value='signup' className='data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2
                rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300'>Signup</TabsTrigger>
              </TabsList>
              <TabsContent className='flex flex-col gap-5 mt-10' value='login'>
                <div className="input-group">
                  <div className="name-input-container">
                    <Input 
                      placeholder="Anonymous Id" 
                      className="rounded-full p-6 flex-1" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                    />
                  </div>
                </div>
                <div className="input-group">
                  <div className="name-input-container">
                    <Input 
                      placeholder="Password" 
                      type="password"
                      className="rounded-full p-6 flex-1" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                    />
                  </div>
                </div>
                <Button className="rounded-full p-6 bg-black text-white" onClick={handleLogin}>Login</Button>
              </TabsContent>
              <TabsContent className='flex flex-col gap-5' value='signup'>
                <div className="input-group1">
                  <div className="input-container-with-icon flex items-center">
                    <Input 
                      placeholder="Anonymous Id" 
                      className="rounded-full p-6 pr-16 w-full" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                    />
                    <div className="icon-wrapper justify-center p-2">
                      <button onClick={generateRandomId} className="icon-button">
                        <FaDice size={18} className="text-purple-500" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="input-group">
                  <Input 
                    placeholder="Password" 
                    type="password"
                    className="rounded-full p-6" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                </div>
                <div className="auth-button-container">
                  <Button className="rounded-full p-6 bg-black text-white w-full" onClick={handleSignup}>
                    Sign Up
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <div className='hidden xl:flex justify-center items-center'>
          <img src={ Background } alt='background login' className='h-[600px]' />
        </div>
      </div>
    </div>
  )
}

export default Auth;