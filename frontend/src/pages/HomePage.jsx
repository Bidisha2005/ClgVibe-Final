import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router";
import { 
  CheckCircleIcon, 
  MapPinIcon, 
  UserPlusIcon, 
  UsersIcon, 
  MessageSquare, 
  SparklesIcon,
  GlobeIcon,
  StarIcon
} from "lucide-react";

import { capitialize } from "../lib/utils";

import FriendCard from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
  });

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-cyan-50/30 p-4 sm:p-6 lg:p-8">
      {/* Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-300/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-cyan-300/10 rounded-full blur-3xl animate-pulse-slower"></div>
      </div>
      
      <div className="container mx-auto space-y-16 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-indigo-100/50">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                <GlobeIcon className="text-white size-7" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
               The ClgVibe
              </h1>
            </div>
            <p className="text-slate-600 text-lg max-w-2xl">
              Bridge the Year Gap. Build the Bond.
            </p>
          </div>
         
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white/80 backdrop-blur-md p-5 rounded-xl border border-indigo-100/50 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <UsersIcon className="text-indigo-600 size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{friends.length}</p>
              <p className="text-slate-500 text-sm">College Friends</p>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-md p-5 rounded-xl border border-indigo-100/50 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <MessageSquare className="text-purple-600 size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{recommendedUsers.length}</p>
              <p className="text-slate-500 text-sm">New Suggestions</p>
            </div>
          </div>
          
         
        </div>

        {/* Friends */}
        <section className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-indigo-100/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <MessageSquare className="text-indigo-600 size-6" />
                </div>
                Your Friends
              </h2>
              <p className="text-slate-500 text-lg">
                Stay connected with your college friends and classmates
              </p>
            </div>
          </div>

          {loadingFriends ? (
            <div className="flex justify-center py-16">
              <div className="flex flex-col items-center space-y-4">
                <div className="loading loading-spinner loading-lg text-indigo-500"></div>
                <p className="text-slate-500">Loading your friends...</p>
              </div>
            </div>
          ) : friends.length === 0 ? (
            <NoFriendsFound />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {friends.map((friend) => (
                <FriendCard key={friend._id} friend={friend} />
              ))}
            </div>
          )}
        </section>

        {/* Recommended Users */}
        <section className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-indigo-100/50">
          <div className="mb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                    <SparklesIcon className="text-purple-600 size-6" />
                  </div>
                  Discover New Friends
                </h2>
                <p className="text-slate-500 text-lg max-w-3xl">
                  Connect with students from different year and course to grow your network
                </p>
              </div>
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-16">
              <div className="flex flex-col items-center space-y-4">
                <div className="loading loading-spinner loading-lg text-purple-500"></div>
                <p className="text-slate-500">Finding new friends for you...</p>
              </div>
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-10 text-center rounded-2xl border border-indigo-100/50 shadow-sm">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-5">
                <UsersIcon className="text-indigo-400 size-10" />
              </div>
              <h3 className="font-bold text-2xl text-slate-700 mb-3">No recommendations available</h3>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">
                We're working on finding the perfect friends for you. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {recommendedUsers.map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

                return (
                  <div
                    key={user._id}
                    className="card bg-gradient-to-b from-white to-indigo-50/30 hover:shadow-xl transition-all duration-500 rounded-2xl border border-indigo-100/50 overflow-hidden group hover:-translate-y-1.5"
                  >
                    <div className="card-body p-6 space-y-5">
                      <div className="flex items-center gap-4">
                        <div className="avatar size-18 rounded-full overflow-hidden border-2 border-white shadow-lg group-hover:shadow-indigo-200/60 transition-shadow">
                          <img src={user.profilePic} alt={user.fullName} className="object-cover w-full h-full" />
                        </div>

                        <div>
                          <h3 className="font-semibold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">
                            {user.fullName}
                          </h3>
                          {user.location && (
                            <div className="flex items-center text-sm text-slate-500 mt-1.5">
                              <MapPinIcon className="size-4 mr-1.5" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Year + Course */}
                      <div className="flex flex-col gap-3 my-2">
                        {user.year && (
                          <span className="badge bg-indigo-100/80 text-indigo-700 border-indigo-200/50 px-3 py-2.5 text-sm">
                            🎓 {capitialize(user.year)}
                          </span>
                        )}
                        {user.course && (
                          <span className="badge bg-purple-100/80 text-purple-700 border-purple-200/50 px-3 py-2.5 text-sm">
                            📘 {capitialize(user.course)}
                          </span>
                        )}
                      </div>

                      {user.bio && (
                        <p className="text-sm text-slate-600 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                          {user.bio}
                        </p>
                      )}

                      {/* Button */}
                      <button
                        className={`btn w-full mt-4 rounded-xl py-3.5 font-medium transition-all duration-300 group/btn ${
                          hasRequestBeenSent 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:shadow-sm" 
                            : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-md hover:shadow-lg group-hover/btn:scale-105"
                        }`}
                        onClick={() => sendRequestMutation(user._id)}
                        disabled={hasRequestBeenSent || isPending}
                      >
                        {hasRequestBeenSent ? (
                          <>
                            <CheckCircleIcon className="size-5 mr-2 group-hover/btn:scale-110 transition-transform" />
                            Connection Requested
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="size-5 mr-2 group-hover/btn:scale-110 transition-transform" />
                            Add Friend
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
        </section>
        
      </div>
<footer className="footer sm:footer-horizontal footer-center bg-base-300 text-base-content p-4">
  <aside>
    <p>Copyright © {new Date().getFullYear()} - All right reserved by Bidisha Kundu</p>
  </aside>
</footer>
    </div>
    
  );
};

export default HomePage;
