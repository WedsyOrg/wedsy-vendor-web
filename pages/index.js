import CalenderIcon from "@/components/icons/CalenderIcon";
import MessageIcon from "@/components/icons/MessageIcon";
import NotificationIcon from "@/components/icons/NotificationIcon";
import { Button, Datepicker } from "flowbite-react";
import { useRouter } from "next/router";
import { MdLocationPin, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";

export default function Home({ user }) {
  const router = useRouter();
  const [expandOngoing, setExpandOngoing] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [revenue, setRevenue] = useState({
    thisMonth: 0,
    totalBookings: 0,
    thisMonthBookings: 0
  });
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [stats, setStats] = useState({
    leads: { total: 0, breakdown: [] },
    confirmedBookings: { total: 0, breakdown: [] }
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [currentLeadIndex, setCurrentLeadIndex] = useState(0);
  const [currentBookingIndex, setCurrentBookingIndex] = useState(0);
  const [followUps, setFollowUps] = useState({
    calls: { total: 0, breakdown: [] },
    chats: { total: 0, breakdown: [] }
  });
  const [followUpsLoading, setFollowUpsLoading] = useState(false);
  const [currentCallIndex, setCurrentCallIndex] = useState(0);
  const [currentChatIndex, setCurrentChatIndex] = useState(0);
  const [ongoingOrder, setOngoingOrder] = useState(null);
  const [ongoingOrderLoading, setOngoingOrderLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const dashboardRef = useRef(null);


  // Lazy loading function that fetches all data at once
  const fetchAllDashboardData = useCallback(async () => {
    if (dataLoaded) return; // Prevent multiple calls
    
    setLoading(true);
    setRevenueLoading(true);
    setStatsLoading(true);
    setFollowUpsLoading(true);
    setOngoingOrderLoading(true);
    
    try {
      // Fetch all data in parallel
      const [upcomingRes, revenueRes, statsRes, followUpsRes, ongoingRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/order?source=upcoming-events`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/order?source=revenue`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/order?source=stats`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/order?source=follow-ups`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/order?source=ongoing-order`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
      ]);

      // Process all responses
      const [upcomingData, revenueData, statsData, followUpsData, ongoingData] = await Promise.all([
        upcomingRes.json(),
        revenueRes.json(),
        statsRes.json(),
        followUpsRes.json(),
        ongoingRes.json()
      ]);

      // Set all data
      if (upcomingData.events) {
        setUpcomingEvents(upcomingData.events);
      }
      if (revenueData.revenue) {
        setRevenue(revenueData.revenue);
      }
      if (statsData.stats) {
        setStats(statsData.stats);
      }
      if (followUpsData.followUps) {
        setFollowUps(followUpsData.followUps);
      }
      if (ongoingData.message === "success" && ongoingData.ongoingOrder) {
        setOngoingOrder(ongoingData.ongoingOrder);
      }
      
      setDataLoaded(true);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setRevenueLoading(false);
      setStatsLoading(false);
      setFollowUpsLoading(false);
      setOngoingOrderLoading(false);
    }
  }, [dataLoaded]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !dataLoaded && user?.profileCompleted) {
          setIsVisible(true);
          fetchAllDashboardData();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (dashboardRef.current) {
      observer.observe(dashboardRef.current);
    }

    return () => {
      if (dashboardRef.current) {
        observer.unobserve(dashboardRef.current);
      }
    };
  }, [dataLoaded, user?.profileCompleted, fetchAllDashboardData]);

  const nextEvent = () => {
    setCurrentEventIndex((prev) => 
      prev < upcomingEvents.length - 1 ? prev + 1 : 0
    );
  };

  const prevEvent = () => {
    setCurrentEventIndex((prev) => 
      prev > 0 ? prev - 1 : upcomingEvents.length - 1
    );
  };

  const nextLead = () => {
    setCurrentLeadIndex((prev) => 
      prev < stats.leads.breakdown.length - 1 ? prev + 1 : 0
    );
  };

  const prevLead = () => {
    setCurrentLeadIndex((prev) => 
      prev > 0 ? prev - 1 : stats.leads.breakdown.length - 1
    );
  };

  const nextBooking = () => {
    setCurrentBookingIndex((prev) => 
      prev < stats.confirmedBookings.breakdown.length - 1 ? prev + 1 : 0
    );
  };

  const prevBooking = () => {
    setCurrentBookingIndex((prev) => 
      prev > 0 ? prev - 1 : stats.confirmedBookings.breakdown.length - 1
    );
  };

  const nextCall = () => {
    setCurrentCallIndex((prev) => 
      prev < followUps.calls.breakdown.length - 1 ? prev + 1 : 0
    );
  };

  const prevCall = () => {
    setCurrentCallIndex((prev) => 
      prev > 0 ? prev - 1 : followUps.calls.breakdown.length - 1
    );
  };

  const nextChat = () => {
    setCurrentChatIndex((prev) => 
      prev < followUps.chats.breakdown.length - 1 ? prev + 1 : 0
    );
  };

  const prevChat = () => {
    setCurrentChatIndex((prev) => 
      prev > 0 ? prev - 1 : followUps.chats.breakdown.length - 1
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDayOfWeek = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { weekday: "long" });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatEventDate = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDayNumber = (dateTime) => {
    const date = new Date(dateTime);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? "Today" : diffDays === 1 ? "Day 1" : `Day ${diffDays}`;
  };

  return (
    <>
      <div className="sticky top-0 w-full flex flex-row items-center gap-3 px-6 border-b py-3 shadow-lg bg-white z-10">
        <img src="/assets/icons/wedsy.png" />
        <p className="grow text-lg font-medium">Business</p>
        <CalenderIcon />
        <NotificationIcon />
        <MessageIcon />
      </div>

      {/*completed profile component */}
      <div ref={dashboardRef} className="flex flex-col gap-8 py-4 px-6 bg-custom-bg-blue">
        {!user?.profileCompleted && (
          <Link href={"/settings/profile"}>
            <Button className="bg-white text-black shadow-lg rounded-xl w-full">
              Complete your profile
            </Button>
          </Link>
        )}
        {user?.profileCompleted && !user?.paymentCompleted && (
          <Link href={"/settings/account-details"}>
            <Button className="bg-white text-black shadow-lg rounded-xl w-full">
              Complete your Payment Details
            </Button>
          </Link>
        )}
        {user?.profileCompleted && user?.paymentCompleted && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
              </svg>
              <span className="font-medium">Profile & Payment Complete!</span>
            </div>
            <p className="text-sm mt-1">You're all set to start receiving bookings</p>
          </div>
        )}
        
        <Link href="/bidding">
          <Button className="bg-white text-black shadow-lg rounded-xl w-full">
            {user?.profileCompleted ? "View Bidding Requests" : "Find Hairstylist!"}
          </Button>
        </Link>

      {/*completed profile component */}
      


        {/* Upcoming Event Card  */}
        {!dataLoaded && loading ? (
          <div className="rounded-lg shadow-lg bg-gray-200 w-full p-6 flex flex-col items-center justify-center animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-24 mb-4"></div>
            <div className="h-8 bg-gray-300 rounded w-32 mb-4"></div>
            <div className="h-3 bg-gray-300 rounded w-40"></div>
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className="rounded-lg shadow-lg bg-[#2B3F6C] text-white w-full p-3 flex flex-col relative">
            {/* Navigation dots */}
            <div className="flex flex-row justify-center gap-1 items-center">
              {upcomingEvents.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 w-1.5 rounded-full ${
                    index === currentEventIndex ? "bg-white" : "bg-black"
                  }`}
                />
              ))}
            </div>
            
            {/* Navigation arrows */}
            {upcomingEvents.length > 1 && (
              <>
                <button
                  onClick={prevEvent}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2  rounded-full p-1 hover:bg-white/30 transition-colors"
                >
                  <MdChevronLeft className="text-white" size={16} />
                </button>
                <button
                  onClick={nextEvent}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2  rounded-full p-1 hover:bg-white/30 transition-colors"
                >
                  <MdChevronRight className="text-white" size={16} />
                </button>
              </>
            )}

            <div className="flex flex-row justify-between gap-1 items-center text-xs">
              <p>Upcoming</p>
              <p className="underline">View all</p>
            </div>
            
            {upcomingEvents[currentEventIndex] && (
              <>
                <p className="text-xl my-4 font-semibold">
                  {upcomingEvents[currentEventIndex].customerName}
                </p>
                <div className="flex flex-row justify-between gap-1 items-end text-xs">
                  <p>
                    {formatDate(upcomingEvents[currentEventIndex].date)}, {getDayOfWeek(upcomingEvents[currentEventIndex].date)}
                    <br /> {formatTime(upcomingEvents[currentEventIndex].time)}
                  </p>
                  <p className="flex flex-row items-center gap-1">
                    <MdLocationPin size={12} />
                    {upcomingEvents[currentEventIndex].location}
                  </p>
                </div>
              </>
            )}
          </div>
        ) : !loading ? (
          <div className="rounded-lg shadow-lg bg-gray-100 text-gray-600 w-full p-6 flex flex-col items-center justify-center">
            <p className="text-sm">No upcoming events</p>
            <p className="text-xs mt-1">You don't have any confirmed bookings yet</p>
          </div>
        ) : (
          <div className="rounded-lg shadow-lg bg-gray-100 w-full p-6 flex flex-col items-center justify-center">
            <p className="text-sm text-gray-600">Loading upcoming events...</p>
          </div>
        )}
        {/*end of Upcoming Event Card */}


        {/* Revenue this month Card */}
        <div className="rounded-lg shadow-lg p-4" style={{backgroundColor: '#F9A8D4'}}>
          <p className="text-sm text-black">Revenue this month</p>
          {!dataLoaded && revenueLoading ? (
            <div className="my-4 flex flex-col items-center justify-center animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-40"></div>
            </div>
          ) : (
            <>
              <p className="my-4 text-3xl font-bold text-black">{formatCurrency(revenue.thisMonth)}</p>
              <p className="text-black">
                You have {revenue.thisMonthBookings} bookings this month
              </p>
            </>
          )}
        </div>
        {/* End of Revenue this month Card */}

        {/* Leads and Confirmed Bookings Card */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {/* Leads Card */}
          <div className="flex flex-col gap-2 shadow-lg rounded-xl p-4 bg-white relative">
            <p className="col-span-3 font-medium">Leads</p>
            {!dataLoaded && statsLoading ? (
              <div className="flex flex-col items-center justify-center h-20 animate-pulse">
                <div className="h-12 bg-gray-300 rounded w-16 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-20"></div>
              </div>
            ) : (
              <>
                <p className="text-5xl font-semibold text-center">{stats.leads.total}</p>
                {stats.leads.breakdown.length > 0 && (
                  <>
                    {/* Navigation arrows for leads */}
                    {stats.leads.breakdown.length > 1 && (
                      <>
                        <button
                          onClick={prevLead}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full p-1 hover:bg-gray-300 transition-colors"
                        >
                          <MdChevronLeft size={16} />
                        </button>
                        <button
                          onClick={nextLead}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2  rounded-full p-1 hover:bg-gray-300 transition-colors"
                        >
                          <MdChevronRight size={16} />
                        </button>
                      </>
                    )}
                    
                    <div className="flex flex-row items-center justify-between">
                      <p className="text-xs">{stats.leads.breakdown[currentLeadIndex]?.type || "Total"}</p>
                      <div className="flex flex-row justify-center gap-1 items-center">
                        {stats.leads.breakdown.map((_, index) => (
                          <div
                            key={index}
                            className={`h-1.5 w-1.5 rounded-full ${
                              index === currentLeadIndex ? "bg-black" : "bg-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-xs text-gray-600">
                        {stats.leads.breakdown[currentLeadIndex]?.count || 0} {stats.leads.breakdown[currentLeadIndex]?.type || "Total"}
                      </p>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Confirmed Bookings Card */}
          <div className="flex flex-col gap-2 shadow-lg rounded-xl p-4 bg-white relative">
            <p className="col-span-3 font-medium">Confirmed Bookings</p>
            {!dataLoaded && statsLoading ? (
              <div className="flex flex-col items-center justify-center h-20 animate-pulse">
                <div className="h-12 bg-gray-300 rounded w-16 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-20"></div>
              </div>
            ) : (
              <>
                <p className="text-5xl font-semibold text-center">{stats.confirmedBookings.total}</p>
                {stats.confirmedBookings.breakdown.length > 0 && (
                  <>
                    {/* Navigation arrows for bookings */}
                    {stats.confirmedBookings.breakdown.length > 1 && (
                      <>
                        <button
                          onClick={prevBooking}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2  rounded-full p-1 hover:bg-gray-300 transition-colors"
                        >
                          <MdChevronLeft size={16} />
                        </button>
                        <button
                          onClick={nextBooking}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2  rounded-full p-1 hover:bg-gray-300 transition-colors"
                        >
                          <MdChevronRight size={16} />
                        </button>
                      </>
                    )}
                    
                    <div className="flex flex-row items-center justify-between">
                      <p className="text-xs">{stats.confirmedBookings.breakdown[currentBookingIndex]?.type || "Total"}</p>
                      <div className="flex flex-row justify-center gap-1 items-center">
                        {stats.confirmedBookings.breakdown.map((_, index) => (
                          <div
                            key={index}
                            className={`h-1.5 w-1.5 rounded-full ${
                              index === currentBookingIndex ? "bg-black" : "bg-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-xs text-gray-600">
                        {stats.confirmedBookings.breakdown[currentBookingIndex]?.count || 0} {stats.confirmedBookings.breakdown[currentBookingIndex]?.type || "Total"}
                      </p>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
        {/* End of Leads and Confirmed Bookings Card */}



        {/* Requests Card */}
        {/* <div className="grid grid-cols-3 gap-3 shadow-lg rounded-xl p-4 bg-white text-sm">
          <p className="col-span-3 font-medium">Requests</p>
          <div className="flex flex-col gap-2">
            <p className="text-5xl font-semibold text-center">0</p>
            <p className="text-center">Total</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-5xl font-semibold text-center">0</p>
            <p className="text-center">Attended</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-5xl font-semibold text-center">0</p>
            <p className="text-center">Unattended</p>
          </div>
        </div> */}
        {/* End of Requests Card */}


        {/* Follow Ups Card */}
        <p className="text-xl font-bold text-center">FOLLOW UPS</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {/* Chats Card */}
          <div className="flex flex-col gap-2 shadow-lg rounded-xl p-4 bg-white relative overflow-hidden">
            <p className="col-span-3 font-medium">Chats</p>
            {!dataLoaded && followUpsLoading ? (
              <div className="flex flex-col items-center justify-center h-20 animate-pulse">
                <div className="h-12 bg-gray-300 rounded w-16 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-20"></div>
              </div>
            ) : (
              <>
                <p className="text-5xl font-semibold text-center">{followUps.chats.total}</p>
                {followUps.chats.breakdown.length > 0 && (
                  <>
                    {/* Navigation arrows for chats */}
                    {followUps.chats.breakdown.length > 1 && (
                      <>
                        <button
                          onClick={prevChat}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2  rounded-full p-1 hover:bg-gray-300 transition-colors "
                        >
                          <MdChevronLeft size={16} />
                        </button>
                        <button
                          onClick={nextChat}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2  rounded-full p-1 hover:bg-gray-300 transition-colors"
                        >
                          <MdChevronRight size={16} />
                        </button>
                      </>
                    )}
                    
                    <div className="flex flex-row items-center justify-between">
                      <p className="text-xs font-medium">{followUps.chats.breakdown[currentChatIndex]?.type || "Total"}</p>
                      <div className="flex flex-row justify-center gap-1 items-center">
                        {followUps.chats.breakdown.map((_, index) => (
                          <div
                            key={index}
                            className={`h-1.5 w-1.5 rounded-full transition-colors ${
                              index === currentChatIndex ? "bg-black" : "bg-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-xs text-gray-600">
                        {followUps.chats.breakdown[currentChatIndex]?.count || 0} {followUps.chats.breakdown[currentChatIndex]?.type || "Total"}
                      </p>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Calls Card */}
          <div className="flex flex-col gap-2 shadow-lg rounded-xl p-4 bg-white relative overflow-hidden">
            <p className="col-span-3 font-medium">Calls</p>
            {!dataLoaded && followUpsLoading ? (
              <div className="flex flex-col items-center justify-center h-20 animate-pulse">
                <div className="h-12 bg-gray-300 rounded w-16 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-20"></div>
              </div>
            ) : (
              <>
                <p className="text-5xl font-semibold text-center">{followUps.calls.total}</p>
                {followUps.calls.breakdown.length > 0 && (
                  <>
                    {/* Navigation arrows for calls */}
                    {followUps.calls.breakdown.length > 1 && (
                      <>
                        <button
                          onClick={prevCall}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2  rounded-full p-1 hover:bg-gray-300 transition-colors "
                        >
                          <MdChevronLeft size={16} />
                        </button>
                        <button
                          onClick={nextCall}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2  rounded-full p-1 hover:bg-gray-300 transition-colors"
                        >
                          <MdChevronRight size={16} />
                        </button>
                      </>
                    )}
                    
                    <div className="flex flex-row items-center justify-between">
                      <p className="text-xs font-medium">{followUps.calls.breakdown[currentCallIndex]?.type || "Total"}</p>
                      <div className="flex flex-row justify-center gap-1 items-center">
                        {followUps.calls.breakdown.map((_, index) => (
                          <div
                            key={index}
                            className={`h-1.5 w-1.5 rounded-full transition-colors ${
                              index === currentCallIndex ? "bg-black" : "bg-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-xs text-gray-600">
                        {followUps.calls.breakdown[currentCallIndex]?.count || 0} {followUps.calls.breakdown[currentCallIndex]?.type || "Total"}
                      </p>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>        
        {/* End of Follow Ups Card */}
      </div>
      
      {/*ongoing_order */}
      <div className="rounded-t-2xl px-6 pb-4 pt-2 text-white sticky bottom-0 w-full" style={{backgroundColor: '#840032'}}>
        <div
          className="block w-24 h-2 rounded-full bg-white mx-auto mb-4"
          onClick={() => {
            setExpandOngoing(!expandOngoing);
          }}
        />
        <div className="flex flex-row justify-between items-center">
          <p className="text-white font-bold">ONGOING ORDER</p>
          <p className="text-white font-bold">{getCurrentTime()}</p>
        </div>
        {expandOngoing && ongoingOrder && (
          <div className="bg-white rounded-xl mt-6 p-4 text-black">
            {/* Header - Day and Date */}
            <div className="flex flex-row justify-between items-center mb-4">
              <p className="font-semibold text-base">{getDayNumber(ongoingOrder.eventDateTime)}</p>
              <p className="font-semibold text-base">{formatEventDate(ongoingOrder.eventDateTime)}</p>
            </div>

            {/* Location */}
            <div className="flex flex-row items-center gap-2 mb-6">
              <div className="w-3 h-3 flex items-center justify-center">
              <img src="/icons/Ellipse 41.svg" alt="User" className="w-3 h-3" />
              </div>
              <p className="text-sm text-black">{ongoingOrder.location}</p>
            </div>

            {/* Services - Two distinct entries as shown in image */}
            {ongoingOrder.services && ongoingOrder.services.length > 0 && (
              <div className="space-y-4">
                {ongoingOrder.services.slice(0, 2).map((service, index) => (
                  <div key={index} className="space-y-2">
                    {/* First row - People count and Service type */}
                    <div className="flex flex-row items-center gap-4">
                      {/* People count - Group icon */}
                      <div className="flex flex-row items-center gap-1">
                        <div className="w-3 h-3 flex items-center justify-center">
                        <img src="/icons/User.svg" alt="User" className="w-3 h-3" />
                        </div>
                        <span className="text-sm font-medium text-black">{service.noOfPeople || (index + 1)}</span>
                      </div>

                      {/* Service type - Grid icon */}
                      <div className="flex flex-row items-center gap-1">
                      <div className="w-3 h-3 flex items-center justify-center">
                          <img src="/icons/Category.svg" alt="User" className="w-3 h-3" />
                        </div>
                        <span className="text-sm font-semibold text-black">{service.preferredLook || service.makeupStyle || (index === 0 ? 'Bridal' : 'Party')}</span>
                      </div>
                    </div>

                    {/* Second row - Service details - Hamburger icon */}
                    <div className="flex flex-row items-center gap-1">
                      <div className="w-3 h-3 flex items-center justify-center">
                       <img src="/icons/Burger.svg" alt="User" className="w-3 h-3" />

                      </div>
                      <span className="text-sm text-black">{service.addOns || 'Hair styling, Saree draping'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
        
        {/* Amount section - outside the white card as shown in image */}
        {expandOngoing && ongoingOrder && (
          <div className="mt-4">
            <p className="text-sm text-white mb-2">Amount to be received</p>
            <p className="text-2xl font-bold text-white mb-4">{formatCurrency(ongoingOrder.amount)}</p>
            <button className="w-full bg-white py-3 rounded-lg font-semibold text-sm uppercase" style={{color: '#840032'}}>
              CONFIRM PAYMENT
            </button>
          </div>
        )}
        
        {expandOngoing && !ongoingOrder && !ongoingOrderLoading && (
          <div className="bg-white rounded-xl mt-6 p-4 text-black text-center">
            <p className="text-gray-600">No ongoing orders</p>
          </div>
        )}
        {expandOngoing && ongoingOrderLoading && (
          <div className="bg-white rounded-xl mt-6 p-4 text-black text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        )}
      </div>
    </>
  );
}
