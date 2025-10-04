import CalenderIcon from "@/components/icons/CalenderIcon";
import MessageIcon from "@/components/icons/MessageIcon";
import NotificationIcon from "@/components/icons/NotificationIcon";
import { Button, Datepicker } from "flowbite-react";
import { useRouter } from "next/router";
import { MdLocationPin, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { toast } from "react-toastify";

export default function Home({ user }) {
  const router = useRouter();
  const [expandOngoing, setExpandOngoing] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState([
  ]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [revenue, setRevenue] = useState({
    thisMonth: 0,
    totalBookings: 0,
    thisMonthBookings: 0
  });
  const [ordersToday, setOrdersToday] = useState({
    count: 0,
    amount: 0
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
  
  // Guided tour state
  const [showTour, setShowTour] = useState(false);
  const [currentTourStep, setCurrentTourStep] = useState(0);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);

  // Comprehensive tour steps covering all pages
  const tourSteps = [
    {
      title: 'Welcome to WEDSY!',
      message: 'Welcome to your vendor dashboard! Let\'s explore all the features to help you grow your business.',
      action: 'This is your main dashboard where you\'ll manage everything.'
    },
    {
      title: 'Complete Your Profile',
      message: 'First, complete your profile to start receiving bookings. Add your business details, photos, and services.',
      action: 'Click here to complete your profile',
      highlight: 'profile'
    },
      {
        title: 'Bidding Requests',
        message: 'Find new customers by browsing bidding requests. Submit your proposals to get more bookings.',
        action: 'Let\'s explore the bidding section',
        navigateTo: '/chats/bidding'
      },
    {
      title: 'Package Management',
      message: 'Create and manage your service packages. Set different pricing for bridal, party, and groom services.',
      action: 'Let\'s check out package management',
      navigateTo: '/chats/packages'
    },
    {
      title: 'Personal Packages',
      message: 'Create custom packages for your clients with personalized pricing and services.',
      action: 'Explore personal package creation',
      navigateTo: '/chats/personal-packages'
    },
    {
      title: 'Create Personal Leads',
      message: 'Create your own leads and reach out to potential customers directly.',
      action: 'Let\'s see how to create leads',
      navigateTo: '/personal-leads'
    },
    {
      title: 'Create New Lead',
      message: 'Learn how to create a new lead by filling out customer details and requirements.',
      action: 'See the lead creation process',
      navigateTo: '/personal-leads/create'
    },
    {
      title: 'Personal Packages Management',
      message: 'Manage your personal packages, create new ones, and track their performance.',
      action: 'Explore package management',
      navigateTo: '/personal-packages'
    },
    {
      title: 'Create Personal Package',
      message: 'Learn how to create a new personal package with custom pricing and services.',
      action: 'See package creation process',
      navigateTo: '/personal-packages/create'
    },
    {
      title: 'Orders Management',
      message: 'View and manage all your orders, track their status, and handle customer requests.',
      action: 'Let\'s check your orders',
      navigateTo: '/orders'
    },
    {
      title: 'Community',
      message: 'Connect with other vendors, share experiences, and learn from the community.',
      action: 'Explore the community section',
      navigateTo: '/community'
    },
    {
      title: 'Create Community Post',
      message: 'Share your experiences, ask questions, or help other vendors in the community.',
      action: 'See how to create community posts',
      navigateTo: '/community/create'
    },
    {
      title: 'Reviews',
      message: 'View customer reviews and ratings to understand your performance and improve.',
      action: 'Check your reviews and ratings',
      navigateTo: '/reviews'
    },
    {
      title: 'Notifications',
      message: 'Stay updated with all your notifications, bookings, and important updates.',
      action: 'Check your notifications',
      navigateTo: '/notifications'
    },
    {
      title: 'Calendar',
      message: 'Manage your schedule, view upcoming bookings, and plan your work efficiently.',
      action: 'Explore your calendar',
      navigateTo: '/calender'
    },
    {
      title: 'Settings Overview',
      message: 'Access all your account settings, profile management, and configuration options.',
      action: 'Let\'s explore settings',
      navigateTo: '/settings'
    },
    {
      title: 'Profile Settings',
      message: 'Update your business profile, photos, services, and contact information.',
      action: 'Manage your profile details',
      navigateTo: '/settings/profile'
    },
    {
      title: 'Account Details',
      message: 'Configure your payment details, bank information, and financial settings.',
      action: 'Set up your account details',
      navigateTo: '/settings/account-details'
    },
    {
      title: 'Analytics',
      message: 'View detailed analytics about your business performance, bookings, and revenue.',
      action: 'Check your business analytics',
      navigateTo: '/settings/analytics'
    },
    {
      title: 'Notification Center',
      message: 'Customize your notification preferences and manage how you receive updates.',
      action: 'Configure your notifications',
      navigateTo: '/settings/notification-center'
    },
    {
      title: 'Settlements',
      message: 'Track your payments, settlements, and financial transactions.',
      action: 'Check your settlements',
      navigateTo: '/settings/settlements'
    },
    {
      title: 'Settlement Transactions',
      message: 'View detailed transaction history and payment records.',
      action: 'See your transaction details',
      navigateTo: '/settings/settlements/transactions'
    },
    {
      title: 'Back to Dashboard',
      message: 'Return to your main dashboard to start using all the features you\'ve learned about.',
      action: 'You\'re now ready to use WEDSY!',
      navigateTo: '/'
    },
    {
      title: 'Tour Complete!',
      message: 'Congratulations! You\'ve explored all the features of WEDSY. You\'re now ready to grow your business!',
      action: 'Start building your successful business!'
    }
  ];


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
      const [upcomingRes, revenueRes, statsRes, followUpsRes, ongoingRes, ordersTodayRes] = await Promise.all([
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
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/order?source=orders-today`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
      ]);

      // Process all responses
      const [upcomingData, revenueData, statsData, followUpsData, ongoingData, ordersTodayData] = await Promise.all([
        upcomingRes.json(),
        revenueRes.json(),
        statsRes.json(),
        followUpsRes.json(),
        ongoingRes.json(),
        ordersTodayRes.json()
      ]);

      // Set all data
      console.log("Upcoming Events Data:", upcomingData);
      if (upcomingData.events) {
        setUpcomingEvents(upcomingData.events);
      } else {
        console.log("No upcoming events found or API error:", upcomingData);
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
      if (ordersTodayData.ordersToday) {
        setOrdersToday(ordersTodayData.ordersToday);
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

  const isOrderCurrentlyOngoing = (order) => {
    if (!order || !order.eventDateTime) return false;
    
    const eventDate = new Date(order.eventDateTime);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    
    // Check if the event is today (ongoing)
    return eventDay.getTime() === today.getTime();
  };

  // Tour functions
  const startTour = () => {
    setShowTour(true);
    setCurrentTourStep(0);
  };

  const nextTourStep = () => {
    const currentStep = tourSteps[currentTourStep];
    
    // If current step has navigation, navigate first
    if (currentStep.navigateTo) {
      router.push(currentStep.navigateTo);
    }
    
    if (currentTourStep < tourSteps.length - 1) {
      setCurrentTourStep(currentTourStep + 1);
    } else {
      completeTour();
    }
  };

  const skipTour = () => {
    completeTour();
  };

  const completeTour = () => {
    setShowTour(false);
    setTourCompleted(true);
    localStorage.setItem('vendor-tour-completed', 'true');
  };

  // Auto-advance tour with delay
  useEffect(() => {
    if (showTour && currentTourStep < tourSteps.length) {
      const timer = setTimeout(() => {
        nextTourStep();
      }, 3000); // 3 seconds per step

      return () => clearTimeout(timer);
    }
  }, [showTour, currentTourStep]);

  // Check if user is first-time and should see tour
  useEffect(() => {
    const tourCompleted = localStorage.getItem('vendor-tour-completed');
    const justSignedUp = localStorage.getItem('vendor-just-signed-up');
    
    if (!tourCompleted && justSignedUp === 'true') {
      // Clear the signup flag
      localStorage.removeItem('vendor-just-signed-up');
      // Start tour immediately for first-time users
      startTour();
    }
  }, [user]);

  return (
    <>
      {/* Tour Overlay */}
      {showTour && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {tourSteps[currentTourStep]?.title}
              </h3>
              <button
                onClick={skipTour}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              {tourSteps[currentTourStep]?.message}
            </p>
            
            <p className="text-sm text-blue-600 mb-4 font-medium">
              {tourSteps[currentTourStep]?.action}
            </p>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentTourStep + 1) / tourSteps.length) * 100}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Step {currentTourStep + 1} of {tourSteps.length}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={skipTour}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Skip Tour
                </button>
                <button
                  onClick={nextTourStep}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {currentTourStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="sticky top-0 w-full flex flex-row items-center justify-between px-6 py-4 bg-white z-10">
        <div className="flex items-center gap-3">
          <img src="/assets/icons/wedsy.png" alt="WEDSY" className="h-8" />
          <p className="text-lg font-semibold text-black">Business</p>
        </div>
        <div className="flex items-center gap-4">
          <CalenderIcon />
          <div className="relative">
            <NotificationIcon />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
          <MessageIcon />
        </div>
      </div>

      {/* Search Bar and Upcoming Event Section with Background */}
      <div className="relative px-6 py-8 bg-cover bg-center bg-no-repeat bg-[url('/assets/background/bg-brushPowder.jpg')]">
        {/* Search Bar */}
        <div className="relative mb-6">
          <button
            onClick={() => router.push('/find-hairstylist')}
            className="w-full bg-white rounded-xl py-4 px-6 shadow-lg text-lg font-bold text-black hover:shadow-xl transition-shadow duration-200"
          >
            Find Hairstylist!
          </button>
        </div>

        {/* Upcoming Event Card */}
        <div className="flex justify-center">
          {!dataLoaded && loading ? (
            <div className="w-[344px] h-[147px] rounded-[15px] bg-gray-200 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-300 rounded w-32 mb-4"></div>
              <div className="h-3 bg-gray-300 rounded w-40"></div>
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="w-[344px] h-[147px] rounded-[15px] bg-[#2B3F6C] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-white p-3 flex flex-col relative overflow-hidden">
              {/* Header with dots and view all */}
              <div className="flex flex-row justify-between items-center mb-1">
                <p className="text-sm font-medium">Upcoming</p>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {upcomingEvents.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1.5 w-1.5 rounded-full ${
                          index === currentEventIndex ? "bg-white" : "bg-black"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm underline">View all</p>
                </div>
              </div>
              
              {/* Navigation arrows */}
              {upcomingEvents.length > 1 && (
                <>
                  <button
                    onClick={prevEvent}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 transition-colors"
                  >
                    <MdChevronLeft className="text-white" size={14} />
                  </button>
                  <button
                    onClick={nextEvent}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 transition-colors"
                  >
                    <MdChevronRight className="text-white" size={14} />
                  </button>
                </>
              )}
              
              {upcomingEvents[currentEventIndex] && (
                <>
                  <p className="text-lg font-bold text-center my-2 flex-1 flex items-center justify-center">
                    {upcomingEvents[currentEventIndex].customerName}
                  </p>
                  <div className="flex flex-row justify-between items-end text-sm">
                    <div className="flex flex-col">
                      <p className="font-medium text-xs">
                        {formatDate(upcomingEvents[currentEventIndex].date)}, {getDayOfWeek(upcomingEvents[currentEventIndex].date)}
                      </p>
                      <p className="text-xs opacity-90">
                        {formatTime(upcomingEvents[currentEventIndex].time)}
                      </p>
                    </div>
                    <div className="flex flex-row items-end gap-1">
                      <MdLocationPin size={12} className="mb-0.5" />
                      <div className="flex flex-col items-end">
                        <p className="text-xs">{upcomingEvents[currentEventIndex].location.split(',')[0]},</p>
                        <p className="text-xs">{upcomingEvents[currentEventIndex].location.split(',')[1]}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : !loading ? (
            <div className="w-[344px] h-[147px] rounded-[15px] bg-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-gray-600 flex flex-col items-center justify-center p-4">
              <p className="text-sm font-medium">No upcoming events</p>
              <p className="text-xs mt-1 text-gray-500">You don&apos;t have any confirmed bookings yet</p>
            </div>
          ) : (
            <div className="w-[344px] h-[147px] rounded-[15px] bg-gray-100 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center">
              <p className="text-sm text-gray-600">Loading upcoming events...</p>
            </div>
          )}
        </div>
      </div>

      {/*completed profile component */}
      <div ref={dashboardRef} className="flex flex-col gap-6 py-4 bg-gray-50 pb-32">

        {user?.profileCompleted && (
          <div 
            className={`transition-all duration-300 ${
              showTour && tourSteps[currentTourStep]?.highlight === 'vendor-bidding' ? 'ring-4 ring-blue-500 ring-opacity-50 rounded-xl p-2' : ''
            }`}
          >
            <Link href="/chats/bidding">
              <Button className="bg-white text-black shadow-lg rounded-xl w-full">
                View Bidding Requests
              </Button>
            </Link>
          </div>
        )}

      {/*completed profile component */}
      




        {/* Revenue this month Card */}
        <div className="w-full h-[147px] rounded-lg shadow-lg p-6 bg-[#FF97BE]">
          <p className="text-sm font-medium text-white mb-2">Revenue this month</p>
          {!dataLoaded && revenueLoading ? (
            <div className="my-4 flex flex-col items-center justify-center animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-40"></div>
            </div>
          ) : (
            <>
              <p className="text-4xl font-bold text-white mb-2">{formatCurrency(revenue.thisMonth)}</p>
              <p className="text-sm text-white">
                You have {revenue.thisMonthBookings} bookings this month
              </p>
            </>
          )}
        </div>
        {/* End of Revenue this month Card */}


        {/* Leads and Confirmed Bookings Card */}
        <div className="px-6">
          <div className="grid grid-cols-2 gap-3 text-sm">
          {/* Leads Card */}
          <div className="w-[158px] h-[155px] flex flex-col gap-2 shadow-lg rounded-xl p-4 bg-white relative">
            <div className="flex justify-between items-center">
              <p className="font-medium text-gray-800">Leads</p>
            </div>
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
                      <p className="text-xs text-gray-600">{stats.leads.breakdown[currentLeadIndex]?.type || "Packages/ Bookings"}</p>
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
                  </>
                )}
              </>
            )}
          </div>

          {/* Confirmed Bookings Card */}
          <div className="w-[158px] h-[155px] flex flex-col gap-2 shadow-lg rounded-xl p-4 bg-white relative">
            <div className="flex justify-between items-center">
              <p className="font-medium text-gray-800">Confirmed Bookings</p>
            </div>
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
                      <p className="text-xs text-gray-600">{stats.confirmedBookings.breakdown[currentBookingIndex]?.type || "Total/This month/ Packages/ Bidding/Personal"}</p>
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
        </div>

        {/* Follow Ups Card */}
        <div className="px-6 mt-6">
          <p className="text-xl font-bold text-center text-gray-700 mb-4">FOLLOW UPS</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
          {/* Chats Card */}
          <div className="flex flex-col gap-2 shadow-lg rounded-xl p-4 bg-white relative overflow-hidden w-[158px] h-[155px]">
            <p className="font-medium text-gray-800">Chats</p>
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
                      <p className="text-xs text-gray-600">{followUps.chats.breakdown[currentChatIndex]?.type || "Packages/ Bookings"}</p>
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
                  </>
                )}
              </>
            )}
          </div>

          {/* Calls Card */}
          <div className="flex flex-col gap-2 shadow-lg rounded-xl p-4 bg-white relative overflow-hidden">
            <p className="font-medium text-gray-800">Calls</p>
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
                      <p className="text-xs text-gray-600">{followUps.calls.breakdown[currentCallIndex]?.type || "Total/This month/ Packages/ Bidding/Personal"}</p>
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
                  </>
                )}
              </>
            )}
          </div>
          </div>        
          {/* End of Follow Ups Card */}
        </div>
      </div>
      

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {/* Ongoing Order Banner */}
        {!showOrderDetails && (
          <div 
            className="px-6 py-3 cursor-pointer flex flex-col items-center bg-[#840032]"
            onClick={() => setShowOrderDetails(true)}
          >
          {/* Handle */}
          <div className="mb-2">
            <div className="bg-white rounded-2xl w-[84px] h-[7px]"></div>
          </div>
          
          {/* Banner Content */}
          <div className="w-full flex justify-between items-center">
            <p className="text-white font-bold text-sm">ONGOING ORDER</p>
            <p className="text-white font-bold text-sm">{getCurrentTime()}</p>
          </div>
        </div>
        )}
        
        {/* Navigation Bar */}
        <div className="bg-white px-6 py-3 w-[393px] h-[91px] shadow-[0px_-1px_4px_0px_rgba(0,0,0,0.25)]">
          <div className="flex justify-around items-center px-2">
            {/* Dashboard */}
            <div className="flex flex-col items-center w-[55px] h-[36px] border border-[#840032]">
              <div className="w-8 h-8 flex items-center justify-center mb-2">
                <img src="/assets/icons/wedsy.png" alt="WEDSY" className="h-5" />
              </div>
              <span className="text-xs text-[#840032] font-medium">Dashboard</span>
            </div>

            {/* Bids */}
            <div className="flex flex-col items-center w-[22px] h-[36px] bg-black">
              <div className="w-8 h-8 flex items-center justify-center mb-2">
                <span className="text-white font-bold text-2xl">B</span>
              </div>
              <span className="text-xs text-gray-600">Bids</span>
            </div>

            {/* Create - Elevated Button that overlaps the banner */}
            <div className="flex flex-col items-center -mt-4 w-[42px] h-[57px] border-[3px] border-[#2B3F6C]">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2 shadow-lg border-2 border-gray-200">
                <svg className="w-8 h-8 text-[#840032]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-xs text-gray-600">Create</span>
            </div>

            {/* Packages */}
            <div className="flex flex-col items-center w-[20px] h-[24px]">
              <div className="w-8 h-8 flex items-center justify-center mb-2">
                <span className="text-black font-bold text-2xl">P</span>
              </div>
              <span className="text-xs text-gray-600">Packages</span>
            </div>

            {/* Settings */}
            <div className="flex flex-col items-center w-[41px] h-[39px]">
              <div className="w-8 h-8 flex items-center justify-center mb-2">
                <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-xs text-gray-600">Settings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end"
          onClick={() => setShowOrderDetails(false)}
        >
          <div 
            className="w-full rounded-t-3xl max-h-[calc(100vh-120px)] overflow-y-auto mb-20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 flex flex-col items-center bg-[#840032]">
              {/* Handle */}
              <div className="mb-3">
                <div className="bg-white rounded-2xl w-[84px] h-[7px]"></div>
              </div>
              
              {/* Header Content */}
              <div className="w-full flex justify-between items-center">
                <p className="text-white font-bold text-lg">ONGOING ORDER</p>
                <p className="text-white font-bold text-lg">{getCurrentTime()}</p>
              </div>
            </div>
            
            {/* Order Details Card */}
            <div className="p-6 bg-white">
              <div className="bg-white p-6 mb-4">
                {/* Order Details will be loaded from API */}
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading order details...</p>
                </div>
              </div>
            </div>
            
            {/* Amount to be Received Section */}
            <div className="px-6 py-6 bg-[#840032]">
              <p className="text-white text-lg mb-2">Amount to be received</p>
              <p className="text-white text-3xl font-bold mb-4">₹0</p>
              <button 
                className="w-full bg-white text-[#840032] font-bold py-3 px-6 rounded-xl"
                onClick={() => {
                  toast.success("Payment confirmation sent!", {
                    position: "top-right",
                    autoClose: 3000,
                  });
                  setShowOrderDetails(false);
                }}
              >
                CONFIRM PAYMENT
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
