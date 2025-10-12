import React, { useEffect, useState } from "react";
import "../styles/globals.css";
import { useRouter } from "next/router";
import StickFooter from "@/components/layout/StickyFooter";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PageTransition from "@/components/PageTransition";
import PageTransitionLoader from "@/components/PageTransitionLoader";
import { usePageTransition } from "@/hooks/usePageTransition";

function MyApp({ Component, pageProps }) {
  const [isLandscape, setIsLandscape] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [logIn, setLogIn] = useState(false);
  const [user, setUser] = useState({});
  const { isLoading } = usePageTransition();

  const Logout = () => {
    setLogIn(true);
    setUser({});
    localStorage.removeItem("token");
    router.push("/login");
  };
  const CheckLogin = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/vendor`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          if (router.pathname !== "/login" && router.pathname !== "/signup") {
            router.push("/login");
          }
          localStorage.removeItem("token");
          setLogIn(true);
          return;
        } else {
          return response.json();
        }
      })
      .then((response) => {
        if (response) {
          setLogIn(false);
          setUser(response);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      if (
        router.pathname !== "/login" &&
        router.pathname !== "/signup" &&
        !router.pathname.startsWith("icon") &&
        !router.pathname.startsWith("screenshots")
      ) {
        router.push("/login");
      }
      setLogIn(true);
      setLoading(false);
    } else if (localStorage.getItem("token")) {
      setLoading(true);
      CheckLogin();
    }
  }, []);
  return (
    <>
      {isLandscape ? (
        <div className="flex items-center justify-center h-screen bg-gray-200">
          <h1 className="text-xl md:text-2xl lg:text-3xl text-center text-gray-800">
            Please view this page in portrait orientation.
          </h1>
        </div>
      ) : loading ? (
        <>
          <div className="grid place-content-center h-screen bg-white">
            <motion.img
              src="/loading_screen.png"
              className="max-w-[70vw]"
              alt="loading..."
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
                delay: 0.2
              }}
            />
          </div>
        </>
      ) : (
        <div className="bg-white text-black flex flex-col h-screen w-screen">
          <div className="grow overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={router.asPath}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.3,
                  ease: "easeInOut"
                }}
                className="h-full overflow-scroll"
              >
                <Component
                  {...pageProps}
                  userLoggedIn={!logIn}
                  user={user}
                  CheckLogin={CheckLogin}
                  Logout={Logout}
                />
              </motion.div>
            </AnimatePresence>
          </div>
          {router?.pathname !== "/login" && router?.pathname !== "/signup" && (
            <StickFooter />
          )}
        </div>
      )}
      <PageTransitionLoader isLoading={isLoading} />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default MyApp;
