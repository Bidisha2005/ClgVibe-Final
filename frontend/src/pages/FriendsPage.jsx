import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getUserFriends, 
  getFriendRequests, 
  acceptFriendRequest, 
  getRecommendedUsers,
  sendFriendRequest
} from "../lib/api";
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Search, 
  MessageCircle,
  MoreHorizontal,
  Clock
} from "lucide-react";
import {Link} from "react-router"

const FriendsPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("friends");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch user's friends
  const { data: friendsData = [], isLoading: friendsLoading } = useQuery({
    queryKey: ["userFriends"],
    queryFn: getUserFriends,
  });

  // Fetch friend requests
  const { data: requestsData = { incoming: [], outgoing: [] }, isLoading: requestsLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  // Fetch recommended users
  const { data: recommendedUsers = [], isLoading: recommendedLoading } = useQuery({
    queryKey: ["recommendedUsers"],
    queryFn: getRecommendedUsers,
  });

  // Accept friend request mutation
  const acceptRequestMutation = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["userFriends"] });
    },
  });

  // Send friend request mutation
  const sendRequestMutation = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
    },
  });

  // Filter friends based on search query
  const filteredFriends = friendsData.filter(friend => 
    friend.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.course?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter recommended users
  const filteredRecommendedUsers = recommendedUsers.filter(user => 
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.course?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Friends</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content opacity-70 size-5" />
            <input
              type="text"
              placeholder="Search friends..."
              className="input input-bordered pl-10 pr-4 w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed bg-base-200 p-1 w-full sm:w-fit mb-6 overflow-x-auto">
        <button
          className={`tab ${activeTab === "friends" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("friends")}
        >
          <Users className="size-4 mr-2" />
          Friends ({friendsData.length || 0})
        </button>
        <button
          className={`tab ${activeTab === "requests" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("requests")}
        >
          <UserPlus className="size-4 mr-2" />
          Requests ({requestsData.incoming?.length || 0})
        </button>
        <button
          className={`tab ${activeTab === "suggested" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("suggested")}
        >
          <UserCheck className="size-4 mr-2" />
          Suggested ({recommendedUsers.length || 0})
        </button>
      </div>

      {/* Loading States */}
      {(friendsLoading || requestsLoading || recommendedLoading) && (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {/* Friends List */}
      {!friendsLoading && activeTab === "friends" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => (
              <div key={friend._id} className="card bg-base-100 shadow-md">
                <div className="card-body p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-12 rounded-full relative">
                          <img src={friend.profilePic} alt={friend.fullName} />
                          <div className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-white ${friend.isOnline ? "bg-success" : "bg-base-300"}`}></div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold">{friend.fullName}</h3>
                        <p className="text-sm text-base-content opacity-70">
                          {friend.year} • {friend.course}
                        </p>
                        {friend.mutualFriends > 0 && (
                          <p className="text-xs text-base-content opacity-50">
                            {friend.mutualFriends} mutual friends
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="btn btn-circle btn-sm btn-ghost">
                        <Link to={`/chat/${friend._id}`}>
                        <MessageCircle className="size-5" />
                        </Link>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-10">
              <Users className="size-16 mx-auto text-base-content opacity-30 mb-4" />
              <p className="text-base-content opacity-70">No friends found</p>
              <button 
                className="btn btn-primary mt-4"
                onClick={() => setActiveTab("suggested")}
              >
                Find Friends
              </button>
            </div>
          )}
        </div>
      )}

      {/* Friend Requests */}
      {!requestsLoading && activeTab === "requests" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requestsData.incoming?.length > 0 ? (
            requestsData.incoming.map((request) => (
              <div key={request._id} className="card bg-base-100 shadow-md">
                <div className="card-body p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-12 rounded-full">
                          <img src={request.sender?.profilePic} alt={request.sender?.fullName} />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold">{request.sender?.fullName}</h3>
                        <p className="text-sm text-base-content opacity-70">
                          {request.sender?.course} • {request.sender?.year}
                        </p>
                        <p className="text-xs text-base-content opacity-50 flex items-center">
                          <Clock className="size-3 mr-1" />
                          Sent {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="card-actions justify-end mt-4">
                    <button className="btn btn-sm btn-outline btn-error">
                      <UserX className="size-4 mr-1" />
                      Decline
                    </button>
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => acceptRequestMutation.mutate(request._id)}
                    >
                      <UserCheck className="size-4 mr-1" />
                      Accept
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-10">
              <UserPlus className="size-16 mx-auto text-base-content opacity-30 mb-4" />
              <p className="text-base-content opacity-70">No pending requests</p>
            </div>
          )}
        </div>
      )}

      {/* Suggested Friends */}
      {!recommendedLoading && activeTab === "suggested" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecommendedUsers.length > 0 ? (
            filteredRecommendedUsers.map((user) => (
              <div key={user._id} className="card bg-base-100 shadow-md">
                <div className="card-body p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-12 rounded-full">
                          <img src={user.profilePic} alt={user.fullName} />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold">{user.fullName}</h3>
                        <p className="text-sm text-base-content opacity-70">
                          {user.course} • {user.year}
                        </p>
                        {user.mutualFriends > 0 && (
                          <p className="text-xs text-base-content opacity-50">
                            {user.mutualFriends} mutual friends
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="card-actions justify-end mt-4">
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => sendRequestMutation.mutate(user._id)}
                    >
                      <UserPlus className="size-4 mr-1" />
                      Add Friend
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-10">
              <UserCheck className="size-16 mx-auto text-base-content opacity-30 mb-4" />
              <p className="text-base-content opacity-70">No suggestions available</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FriendsPage;