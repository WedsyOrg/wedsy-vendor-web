import CalenderIcon from "@/components/icons/CalenderIcon";
import MessageIcon from "@/components/icons/MessageIcon";
import NotificationIcon from "@/components/icons/NotificationIcon";
import { Button, Datepicker } from "flowbite-react";
import { useRouter } from "next/router";
import { MdLocationPin, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigation } from "@/utils/navigation";

export default function Home({ user }) {
  const router = useRouter();
  const { navigateTo } = useNavigation();
  const [expandOngoing, setExpandOngoing] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [showUpcomingModal, setShowUpcomingModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [revenue, setRevenue] = useState({
    thisMonth: 0,
    totalBookings: 0,
    thisMonthBookings: 0
  });
  const [ordersToday, setOrdersToday] = useState({
    count: 0,
    amount: 0
  });
  const [stats, setStats] = useState({
    leads: { total: 0, breakdown: [] },
    confirmedBookings: { total: 0, breakdown: [] }
  });
  const [currentLeadIndex, setCurrentLeadIndex] = useState(0);
  const [currentBookingIndex, setCurrentBookingIndex] = useState(0);
  const [followUps, setFollowUps] = useState({
    calls: { total: 0, breakdown: [] },
    chats: { total: 0, breakdown: [] }
  });
  const [currentCallIndex, setCurrentCallIndex] = useState(0);
  const [currentChatIndex, setCurrentChatIndex] = useState(0);
  const [ongoingOrder, setOngoingOrder] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [smoothScrollY, setSmoothScrollY] = useState(0);
  const dashboardRef = useRef(null);
  
  // Guided tour state
  const [showTour, setShowTour] = useState(false);
  const [currentTourStep, setCurrentTourStep] = useState(0);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    data: {
      user: {
        name: "Priya Sharma"
      },
      wedsyPackageBooking: {
        date: "2024-01-15",
        time: "10:00",
        address: {
          formatted_address: "123 Koramangala 5th Block, Bangalore, Karnataka 560034"
        },
        wedsyPackages: [
          {
            name: "Bridal Makeup Package",
            quantity: 1,
            price: 15000
          },
          {
            name: "Hair Styling",
            quantity: 1,
            price: 5000
          }
        ]
      },
      amount: {
        payableToVendor: 18000,
        total: 20000
      }
    },
    error: null
  });

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
      } else {
        setOngoingOrder(null);
      }
      if (ordersTodayData.ordersToday) {
        setOrdersToday(ordersTodayData.ordersToday);
      }
      
      setDataLoaded(true);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
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

  // Scroll event listener for smooth ongoing order banner movement
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth interpolation for scroll movement
  useEffect(() => {
    const smoothScroll = () => {
      setSmoothScrollY(prev => {
        const diff = scrollY - prev;
        return prev + diff * 0.1; // Smooth interpolation factor
      });
    };

    const interval = setInterval(smoothScroll, 16); // 60fps
    return () => clearInterval(interval);
  }, [scrollY]);

  // Smooth scroll function for ongoing order click
  const smoothScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Handle ongoing order click with smooth scroll and modal
  const handleOngoingOrderClick = () => {
    // Smooth scroll to top with easing
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Delay opening modal to allow smooth scroll to complete
    setTimeout(() => {
      setShowOrderDetails(true);
    }, 300);
  };

  // Handle modal close with smooth scroll
  const handleModalClose = () => {
    setShowOrderDetails(false);
    // Smooth scroll to current position to maintain scroll state
    setTimeout(() => {
      window.scrollTo({
        top: scrollY,
        behavior: 'smooth'
      });
    }, 150);
  };

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

  const handleViewAllClick = () => {
    setShowUpcomingModal(true);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const closeModal = () => {
    setShowUpcomingModal(false);
    setSelectedEvent(null);
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

  const fetchOrderDetails = useCallback(async () => {
    if (!ongoingOrder?.orderId) {
      setOrderDetails({ data: null, error: null });
      return;
    }

    setOrderDetails(prev => ({ ...prev, error: null }));

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/order/${ongoingOrder.orderId}?populate=true`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error(`Failed to fetch ongoing order details (${response.status})`);
      }

      const data = await response.json();
      setOrderDetails({
        data,
        error: null
      });
    } catch (error) {
      console.error("Error fetching ongoing order details:", error);
      // No data when API fails
      setOrderDetails({
        data: null,
        error: "Failed to load order details"
      });
    }
  }, [router, ongoingOrder?.orderId]);

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

  // Fetch order details when modal opens
  useEffect(() => {
    if (showOrderDetails) {
      fetchOrderDetails();
    }
  }, [showOrderDetails, fetchOrderDetails]);

  // Auto-swipe events every 7 seconds
  useEffect(() => {
    if (upcomingEvents.length > 1) {
      const timer = setInterval(() => {
        setCurrentEventIndex((prev) => 
          prev < upcomingEvents.length - 1 ? prev + 1 : 0
        );
      }, 7000); // 7 seconds

      return () => clearInterval(timer);
    }
  }, [upcomingEvents.length]);

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
        {/* Complete Profile Button - Only show if profile is incomplete */}
        {!user?.profileCompleted && (
          <div className="relative mb-6">
            <button
              onClick={() => router.push('/settings/profile')}
              className="w-full bg-white rounded-xl py-4 px-6 shadow-lg text-lg font-bold text-black shadow-xl transition-shadow duration-200"
            >
              Complete Your Profile
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative mb-6">
          <button
            onClick={() => router.push('/find-hairstylist')}
            className="w-full bg-white rounded-xl py-4 px-6 shadow-lg text-lg font-bold text-black shadow-xl transition-shadow duration-200 "
          >
            Find Hairstylist!
          </button>
        </div>

        {/* Upcoming Event Card */}
        <div className="flex justify-center">
          {!dataLoaded && false ? (
            <div className="w-[344px] h-[147px] rounded-[15px] bg-gray-200 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-300 rounded w-32 mb-4"></div>
              <div className="h-3 bg-gray-300 rounded w-40"></div>
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="w-[344px] h-[147px] rounded-[15px] bg-[#2B3F6C] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-white p-3 flex flex-col relative overflow-hidden">
              {/* Header with dots and view all */}
              <div className="flex flex-row justify-between items-center mb-1 relative">
                <p className="text-sm font-medium">Upcoming</p>
                
                {/* Centered dots - always show 3 dots in cyclic manner */}
                <div className="absolute left-1/2 transform -translate-x-1/2 flex gap-1">
                  {Array.from({ length: 3 }, (_, index) => {
                    // Cyclic dot calculation: 0, 1, 2, 0, 1, 2...
                    const isActive = (currentEventIndex % 3) === index;
                    
                    return (
                      <div
                        key={index}
                        className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                          isActive ? "bg-white" : "bg-black"
                        }`}
                      />
                    );
                  })}
                </div>
                
                <button 
                  onClick={handleViewAllClick}
                  className="text-sm underline hover:text-gray-300 transition-colors cursor-pointer"
                >
                  View all
                </button>
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
                <div 
                  key={currentEventIndex}
                  className="animate-fadeIn flex flex-col flex-1"
                  style={{
                    animation: 'fadeIn 0.5s ease-in-out'
                  }}
                >
                  <p className="text-lg font-bold text-center my-2 flex-1 flex items-center justify-center">
                    {upcomingEvents[currentEventIndex].customerName}
                  </p>
                  <div className="flex flex-row justify-between items-end text-sm">
                    <div className="flex flex-col">
                      <p className="font-medium text-xs">
                        {formatDate(upcomingEvents[currentEventIndex].date)}, {getDayOfWeek(upcomingEvents[currentEventIndex].date)}
                      </p>
                      <p className="text-xs opacity-90">
                        {upcomingEvents[currentEventIndex]?.time ? formatTime(upcomingEvents[currentEventIndex].time) : ""}
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
                </div>
              )}
            </div>
          ) : !false ? (
            <div className="w-[344px] h-[147px] rounded-[15px] bg-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-gray-600 flex flex-col items-center justify-center p-4">
              <p className="text-sm font-medium">No upcoming events</p>
              <p className="text-xs mt-1 text-gray-500">You don&apos;t have any confirmed bookings yet</p>
            </div>
          ) : (
            <div className="w-[344px] h-[147px] rounded-[15px] bg-gray-100 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center">
              <p className="text-sm text-gray-600">No upcoming events</p>
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
        <div className="w-full h-[147px] shadow-lg p-6 bg-transparent font-semibold">
          <p className="text-sm font-semibold text-[#000000] mb-2 ">Revenue this month</p>
          {false ? (
            <div className="my-4 flex flex-col items-center justify-center animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-40"></div>
            </div>
          ) : (
            <>
              <p className="text-4xl font-semibold text-[#000000] mb-2">{formatCurrency(revenue.thisMonth)}</p>
              <p className="text-sm text-[#000000">
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
            {false ? (
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
                        {Array.from({ length: 3 }, (_, index) => {
                          // Cyclic dot calculation: 0, 1, 2, 0, 1, 2...
                          const isActive = (currentLeadIndex % 3) === index;
                          
                          return (
                            <div
                              key={index}
                              className={`h-1.5 w-1.5 rounded-full ${
                                isActive ? "bg-black" : "bg-gray-300"
                              }`}
                            />
                          );
                        })}
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
            {false ? (
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
                        {Array.from({ length: 3 }, (_, index) => {
                          // Cyclic dot calculation: 0, 1, 2, 0, 1, 2...
                          const isActive = (currentBookingIndex % 3) === index;
                          
                          return (
                            <div
                              key={index}
                              className={`h-1.5 w-1.5 rounded-full ${
                                isActive ? "bg-black" : "bg-gray-300"
                              }`}
                            />
                          );
                        })}
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
            {false ? (
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
                        {Array.from({ length: 3 }, (_, index) => {
                          // Cyclic dot calculation: 0, 1, 2, 0, 1, 2...
                          const isActive = (currentChatIndex % 3) === index;
                          
                          return (
                            <div
                              key={index}
                              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                                isActive ? "bg-black" : "bg-gray-300"
                              }`}
                            />
                          );
                        })}
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
            {false ? (
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
                        {Array.from({ length: 3 }, (_, index) => {
                          // Cyclic dot calculation: 0, 1, 2, 0, 1, 2...
                          const isActive = (currentCallIndex % 3) === index;
                          
                          return (
                            <div
                              key={index}
                              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                                isActive ? "bg-black" : "bg-gray-300"
                              }`}
                            />
                          );
                        })}
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
      

      {/* Ongoing Order Banner */}
      {!showOrderDetails && (
        <div 
          className="fixed bottom-20 left-0 right-0 px-6 py-3 cursor-pointer flex flex-col items-center bg-[#2B3F6C]"
          onClick={handleOngoingOrderClick}
          style={{
            zIndex: 50,
            transform: `translateY(${Math.min(smoothScrollY * 0.015, 3)}px) translateX(${Math.sin(smoothScrollY * 0.01) * 2}px) scale(${1 + Math.sin(smoothScrollY * 0.005) * 0.02})`,
            transition: 'none' // Disable CSS transition for smooth interpolation
          }}
        >
          {/* Handle */}
          <div 
            className="mb-2"
            style={{
              transform: `translateX(${Math.sin(smoothScrollY * 0.02) * 1}px) rotate(${Math.sin(smoothScrollY * 0.01) * 2}deg)`
            }}
          >
            <div className="bg-white rounded-2xl w-[84px] h-[7px]"></div>
          </div>
          
          {/* Banner Content */}
          <div className="w-full flex justify-between items-center">
            <p 
              className="text-white font-bold text-sm"
              style={{
                transform: `translateY(${Math.sin(smoothScrollY * 0.008) * 1}px) translateX(${Math.sin(smoothScrollY * 0.015) * 0.5}px)`
              }}
            >
              ONGOING ORDER
            </p>
            {ongoingOrder && (stats?.amountToReceive ?? 0) > 0 && (
              <p 
                className="text-white font-bold text-sm"
                style={{
                  transform: `translateY(${Math.sin(smoothScrollY * 0.012) * 1}px) translateX(${Math.sin(smoothScrollY * 0.018) * 0.5}px)`
                }}
              >
                {getCurrentTime()}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      <AnimatePresence>
        {showOrderDetails && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: {
                duration: 0.2,
                ease: "easeIn"
              }
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end"
            onClick={handleModalClose}
          >
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{
                y: "100%",
                opacity: 0,
                transition: {
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                  duration: 0.4,
                  ease: "easeIn"
                }
              }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                duration: 0.5,
                ease: "easeOut"
              }}
              className="w-full max-h-[85vh] bg-[#2B3F6C] flex flex-col"
              style={{ borderRadius: '10px 10px 0 0' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: -20,
                  transition: {
                    duration: 0.3,
                    ease: "easeIn"
                  }
                }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="px-6 py-4 flex flex-col items-center sticky top-0 z-10 flex-shrink-0" 
                style={{ borderRadius: '10px 10px 0 0' }}
              >
                {/* Handle */}
                <motion.div 
                  className="mb-3"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="bg-white rounded-2xl w-[84px] h-[7px]"></div>
                </motion.div>
                
                {/* Header Content */}
                <div className="w-full flex justify-between items-center">
                  <motion.p 
                    className="text-white font-bold text-lg"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{
                      x: -20,
                      opacity: 0,
                      transition: {
                        duration: 0.3,
                        ease: "easeIn"
                      }
                    }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    ONGOING ORDER
                  </motion.p>
                  {ongoingOrder && (stats?.amountToReceive ?? 0) > 0 && (
                    <motion.p 
                      className="text-white font-bold text-lg"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{
                        x: 20,
                        opacity: 0,
                        transition: {
                          duration: 0.3,
                          ease: "easeIn"
                        }
                      }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                    >
                      {getCurrentTime()}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            
            {/* Scrollable Content Area */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{
                opacity: 0,
                y: 20,
                transition: {
                  duration: 0.4,
                  ease: "easeIn"
                }
              }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-20"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{
                  scale: 0.95,
                  opacity: 0,
                  transition: {
                    duration: 0.3,
                    ease: "easeIn"
                  }
                }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="bg-white border border-red-300 mb-4 overflow-hidden"
                style={{ borderRadius: '10px 10px 10px 10px' }}
              >
                <div className="p-6">
                {false ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full mx-auto mb-4"
                    />
                    <p className="text-gray-500">No order details</p>
                  </motion.div>
                ) : orderDetails.error ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <p className="text-gray-500">{orderDetails.error}</p>
                  </motion.div>
                ) : orderDetails.data ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="space-y-4"
                  >
                    {/* Day and Date - render only when data available */}
                    {selectedEvent && (
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          {selectedEvent?.eventDateTime && (
                            <>
                              <h3 className="text-lg font-semibold text-gray-800">{getDayNumber(selectedEvent.eventDateTime)}</h3>
                              <p className="text-sm text-gray-500">{formatEventDate(selectedEvent.eventDateTime)}</p>
                            </>
                          )}
                        </div>
                        <div className="text-right">
                          {selectedEvent?.time && <p className="text-gray-600">{formatTime(selectedEvent.time)}</p>}
                        </div>
                      </div>
                    )}
                    
                    {/* Location - only if provided */}
                    {selectedEvent?.location && (
                    <div className="flex items-center mb-4">
                      <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-gray-700">{selectedEvent.location}</p>
                    </div>
                    )}
                    
                    {/* Services - render only if available */}
                    {orderDetails?.data?.services && orderDetails.data.services.length > 0 && (
                      <div className="space-y-4">
                        {orderDetails.data.services.map((svc, idx) => (
                          <div key={idx} className="flex items-start space-x-3">
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span className="text-sm font-medium text-gray-800">{svc.qty || 1}</span>
                            </div>
                            <div className="flex-shrink-0 mt-0.5">
                              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800 text-sm">{svc.title || `Service ${idx + 1}`}</p>
                            </div>
                            <div className="flex-shrink-0 mt-0.5">
                              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-600 text-sm">{svc.details || "Details coming soon"}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No order details available</p>
                  </div>
                )}
                </div>
              </motion.div>
              
              {/* Payment Section - Inside Scrollable Area */}
              <div className="px-2 py-4">
                <p className="text-white text-lg mb-2">Amount to be received</p>
                <p className="text-white text-3xl font-bold mb-4">
                  {require("@/utils/text").toPriceString(stats?.amountToReceive ?? 0)}
                </p>
                <button 
                  className="w-full bg-white text-[#2B3F6C] font-bold py-4 px-6 rounded-xl shadow-lg hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    toast.success("Payment confirmation sent!", {
                      position: "top-right",
                      autoClose: 3000,
                    });
                    handleModalClose();
                  }}
                >
                  CONFIRM PAYMENT
                </button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
      
      {/* CSS Animation for swipe effect */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>

      {/* Upcoming Events Modal */}
      {showUpcomingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[70vh] flex flex-col overflow-hidden">
            {/* Header - Fixed */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-900">Upcoming Appointments</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Events List - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              {upcomingEvents.map((event, index) => (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{event.customerName}</h3>
                      <p className="text-xs text-gray-600 truncate">{event.service}</p>
                      <div className="flex flex-col gap-1 mt-1">
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs text-gray-600">
                            {formatDate(event.date)}, {getDayOfWeek(event.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {event?.time && <span className="text-xs text-gray-600">{formatTime(event.time)}</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          <MdLocationPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <span className="text-xs text-gray-600 truncate">{event.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-[#2B3F6C]">{event.price}</p>
                      <p className="text-xs text-gray-500">{event.duration}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Empty state if no events */}
              {upcomingEvents.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">No Upcoming Appointments</h3>
                  <p className="text-xs text-gray-600">You don&apos;t have any confirmed bookings yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Individual Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[80vh] flex flex-col overflow-hidden">
            {/* Header - Fixed */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-900">Appointment Details</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Event Details - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-[#2B3F6C] rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg font-bold text-white">
                    {selectedEvent.customerName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{selectedEvent.customerName}</h3>
                <p className="text-sm text-gray-600">{selectedEvent.service}</p>
              </div>

              <div className="space-y-3">
                {/* Date & Time */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-5 h-5 text-[#2B3F6C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-semibold text-gray-900">Date & Time</span>
                  </div>
                  <p className="text-gray-700">
                    {formatDate(selectedEvent.date)}, {getDayOfWeek(selectedEvent.date)}
                  </p>
                  {selectedEvent?.time && <p className="text-gray-700">{formatTime(selectedEvent.time)}</p>}
                </div>

                {/* Location */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <MdLocationPin className="w-5 h-5 text-[#2B3F6C]" />
                    <span className="font-semibold text-gray-900">Location</span>
                  </div>
                  <p className="text-gray-700">{selectedEvent.location}</p>
                </div>

                {/* Service Details */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-5 h-5 text-[#2B3F6C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-semibold text-gray-900">Service Details</span>
                  </div>
                  <p className="text-gray-700 mb-1">{selectedEvent.service}</p>
                  <p className="text-sm text-gray-600">Duration: {selectedEvent.duration}</p>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-5 h-5 text-[#2B3F6C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="font-semibold text-gray-900">Contact Information</span>
                  </div>
                  <p className="text-gray-700 mb-1">{selectedEvent.phone}</p>
                  <p className="text-gray-700">{selectedEvent.email}</p>
                </div>

                {/* Price */}
                <div className="bg-[#2B3F6C] rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Total Amount</span>
                    <span className="text-2xl font-bold">{selectedEvent.price}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleModalClose}
                  className="flex-1 bg-gray-200 text-gray-800 font-semibold py-2 px-3 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                >
                  Close
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    // Add action for contact customer
                    toast.success("Contacting customer...", {
                      position: "top-right",
                      autoClose: 3000,
                    });
                  }}
                  className="flex-1 bg-[#2B3F6C] text-white font-semibold py-2 px-3 rounded-lg hover:bg-[#1e2a4a] transition-colors text-sm"
                >
                  Contact
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      )}
      </AnimatePresence>
    </>
  );
}
