import React from 'react'
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const {id: callId} = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const {authUser, isLoading} = useAuthUser();
  const {data: tokenData} = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initCall = async () => {
      if (!tokenData?.token || !authUser || !callId) return;

      try {
        console.log("Initializing Stream video client..");

        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        };

        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        const callInstance = videoClient.call("default", callId);
        await callInstance.join({create: true});

        console.log("Joined call successfully");

        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        console.error("Error joining call:", error);
        toast.error("Could not join the call. Please try again.")
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();
  }, [tokenData, authUser, callId]);

  if (isLoading || isConnecting) return <PageLoader/>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {client && call ? (
        <StreamVideo client={client}>
          <StreamCall call={call}>
            <CallContent />
          </StreamCall>
        </StreamVideo>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center p-8 bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
            <p className="text-gray-300 mb-6">Could not initialize call. Please refresh or try again later.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const navigate = useNavigate();

  if (callingState === CallingState.LEFT) {
    navigate("/");
    return null;
  }

  return (
    <StreamTheme>
      <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gray-800/60 backdrop-blur-md border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <h1 className="text-lg font-semibold">Live Call</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-300 bg-gray-700/50 px-3 py-1 rounded-full">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <button 
              onClick={() => navigate("/")}
              className="text-gray-300 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 relative p-2 md:p-4">
          <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl">
            <SpeakerLayout 
              participantsBarPosition="bottom"
              className="h-full"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 bg-gray-800/60 backdrop-blur-md border-t border-gray-700">
          <div className="max-w-2xl mx-auto">
            <CallControls 
              onLeave={() => navigate("/")}
            />
          </div>
        </div>
      </div>
      
      {/* Custom styles for call controls */}
      <style>{`
        .str-video__call-controls {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
        }
        
        .str-video__call-controls button {
          background: rgba(255, 255, 255, 0.1) !important;
          border-radius: 50% !important;
          width: 3rem !important;
          height: 3rem !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.2s ease !important;
          border: none !important;
          color: white !important;
        }
        
        .str-video__call-controls button:hover {
          background: rgba(255, 255, 255, 0.2) !important;
          transform: scale(1.05) !important;
        }
        
        .str-video__call-controls button[title*="Leave"] {
          background: #ef4444 !important;
        }
        
        .str-video__call-controls button[title*="Leave"]:hover {
          background: #dc2626 !important;
        }
        
        .str-video__participant-details {
          color: white !important;
        }
        
        .str-video__participant-list {
          background: rgba(0, 0, 0, 0.5) !important;
          border-radius: 0.5rem !important;
        }
        
        .str-video__speaker-layout__participants-bar {
          background: rgba(0, 0, 0, 0.7) !important;
          padding: 0.5rem !important;
          border-radius: 0.5rem !important;
          margin: 0.5rem !important;
        }
        
        .str-video__participant-list__item {
          border-radius: 0.5rem !important;
          overflow: hidden !important;
          margin: 0.25rem !important;
        }
      `}</style>
    </StreamTheme>
  );
};

export default CallPage;