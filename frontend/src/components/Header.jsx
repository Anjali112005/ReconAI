import React, {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {

  Menu,

  Search,

  User,

  LogOut,

  ChevronDown,

  Settings,

} from "lucide-react";

import { ThemeToggle } from "./ThemeToggle";

import {
  useAuth,
} from "../context/AuthContext";


export const Header = ({
  onOpenSidebar,
}) => {

  const navigate =
    useNavigate();


  const {

    user,

    logout,

  } = useAuth();


  const [

    isProfileOpen,

    setIsProfileOpen,

  ] = useState(false);


  /* =======================================================
     LOGOUT
     ======================================================= */

  const handleLogout = () => {

    setIsProfileOpen(false);

    logout();

    navigate(
      "/login",
      {
        replace: true,
      }
    );

  };


  /* =======================================================
     USER DISPLAY
     ======================================================= */

  const userName =

    user?.name ||

    user?.fullName ||

    user?.email?.split("@")[0] ||

    "User";


  const userEmail =

    user?.email ||

    "";


  const userInitial =

    userName
      .charAt(0)
      .toUpperCase();


  return (

    <header
      className="
        sticky
        top-0
        z-30
        h-16
        bg-white/80
        dark:bg-recon-dark-bg/80
        backdrop-blur-md
        border-b
        border-recon-light-border
        dark:border-recon-dark-border
        px-4
        lg:px-8
        flex
        items-center
        justify-between
        transition-colors
      "
    >


      {/* ===================================================
          LEFT SECTION
         =================================================== */}

      <div
        className="
          flex
          items-center
          gap-3
        "
      >

        <button

          onClick={onOpenSidebar}

          className="
            lg:hidden
            p-2
            rounded-xl
            text-recon-light-muted
            dark:text-recon-dark-muted
            hover:bg-gray-100
            dark:hover:bg-recon-dark-card
            transition-colors
          "

          aria-label="Open navigation menu"
        >

          <Menu
            className="
              w-5
              h-5
            "
          />

        </button>


        <div
          className="
            relative
            hidden
            md:block
            w-72
          "
        >

          <Search
            className="
              w-4
              h-4
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-recon-light-muted
              dark:text-recon-dark-muted
            "
          />

          <input

            type="text"

            placeholder="Search transactions, references, cases..."

            className="
              w-full
              pl-9
              pr-4
              py-1.5
              text-xs
              font-medium
              rounded-xl
              bg-recon-light-bg
              dark:bg-recon-dark-card
              border
              border-recon-light-border
              dark:border-recon-dark-border
              text-recon-light-text
              dark:text-recon-dark-text
              placeholder-recon-light-muted
              dark:placeholder-recon-dark-muted
              focus:outline-none
              focus:ring-2
              focus:ring-recon-forest/20
              dark:focus:ring-recon-dark-accent/20
              transition-all
            "

          />

        </div>

      </div>


      {/* ===================================================
          RIGHT SECTION
         =================================================== */}

      <div
        className="
          flex
          items-center
          gap-3
        "
      >

        <ThemeToggle />


        <div className="relative">


          {/* ===============================================
              PROFILE BUTTON
             =============================================== */}

          <button

            onClick={() =>

              setIsProfileOpen(
                previous =>
                  !previous
              )

            }

            className="
              flex
              items-center
              gap-2
              pl-1
              pr-2
              py-1
              rounded-xl
              hover:bg-gray-100
              dark:hover:bg-recon-dark-card
              transition-colors
            "

            aria-label="Open user profile menu"

            aria-expanded={
              isProfileOpen
            }

          >


            <div
              className="
                w-9
                h-9
                rounded-xl
                bg-recon-forest
                dark:bg-recon-dark-accent
                text-white
                flex
                items-center
                justify-center
                font-extrabold
                text-sm
                shadow-soft
              "
            >

              {userInitial}

            </div>


            <div
              className="
                hidden
                sm:block
                text-left
                max-w-[150px]
              "
            >

              <p
                className="
                  text-xs
                  font-extrabold
                  text-recon-light-text
                  dark:text-recon-dark-text
                  truncate
                "
              >

                {userName}

              </p>


              <p
                className="
                  text-[10px]
                  font-medium
                  text-recon-light-muted
                  dark:text-recon-dark-muted
                  truncate
                "
              >

                {userEmail}

              </p>

            </div>


            <ChevronDown
              className={`
                hidden
                sm:block
                w-4
                h-4
                text-recon-light-muted
                dark:text-recon-dark-muted
                transition-transform

                ${
                  isProfileOpen
                    ? "rotate-180"
                    : ""
                }
              `}
            />

          </button>


          {/* ===============================================
              DROPDOWN
             =============================================== */}

          {isProfileOpen && (

            <>


              {/* BACKDROP */}

              <button

                className="
                  fixed
                  inset-0
                  z-[-1]
                  cursor-default
                "

                onClick={() =>
                  setIsProfileOpen(false)
                }

                aria-label="Close profile menu"

              />


              <div
                className="
                  absolute
                  right-0
                  top-12
                  z-50
                  w-64
                  rounded-2xl
                  bg-white
                  dark:bg-recon-dark-card
                  border
                  border-recon-light-border
                  dark:border-recon-dark-border
                  shadow-xl
                  overflow-hidden
                "
              >


                {/* USER DETAILS */}

                <div
                  className="
                    p-4
                    border-b
                    border-recon-light-border
                    dark:border-recon-dark-border
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >

                    <div
                      className="
                        w-10
                        h-10
                        rounded-xl
                        bg-recon-light-soft
                        dark:bg-recon-dark-cardHover
                        text-recon-forest
                        dark:text-recon-dark-accent
                        flex
                        items-center
                        justify-center
                        font-extrabold
                        text-sm
                      "
                    >

                      {userInitial}

                    </div>


                    <div
                      className="
                        min-w-0
                        flex-1
                      "
                    >

                      <p
                        className="
                          text-sm
                          font-extrabold
                          text-recon-light-text
                          dark:text-recon-dark-text
                          truncate
                        "
                      >

                        {userName}

                      </p>


                      <p
                        className="
                          text-[11px]
                          font-medium
                          text-recon-light-muted
                          dark:text-recon-dark-muted
                          truncate
                        "
                      >

                        {userEmail}

                      </p>

                    </div>

                  </div>

                </div>


                {/* MENU ITEMS */}

                <div className="p-2">


                  {/* MY PROFILE */}

                  <button

                    onClick={() => {

                      setIsProfileOpen(false);

                      navigate(
                        "/profile"
                      );

                    }}

                    className="
                      w-full
                      flex
                      items-center
                      gap-3
                      px-3
                      py-2.5
                      rounded-xl
                      text-left
                      text-xs
                      font-bold
                      text-recon-light-text
                      dark:text-recon-dark-text
                      hover:bg-recon-light-soft
                      dark:hover:bg-recon-dark-cardHover
                      transition-colors
                    "

                  >

                    <User
                      className="
                        w-4
                        h-4
                      "
                    />

                    <span>
                      My Profile
                    </span>

                  </button>


                  {/* SETTINGS */}

                  <button

                    onClick={() => {

                      setIsProfileOpen(false);

                      navigate(
                        "/settings"
                      );

                    }}

                    className="
                      w-full
                      flex
                      items-center
                      gap-3
                      px-3
                      py-2.5
                      rounded-xl
                      text-left
                      text-xs
                      font-bold
                      text-recon-light-text
                      dark:text-recon-dark-text
                      hover:bg-recon-light-soft
                      dark:hover:bg-recon-dark-cardHover
                      transition-colors
                    "

                  >

                    <Settings
                      className="
                        w-4
                        h-4
                      "
                    />

                    <span>
                      Settings
                    </span>

                  </button>

                </div>


                {/* LOGOUT */}

                <div
                  className="
                    p-2
                    border-t
                    border-recon-light-border
                    dark:border-recon-dark-border
                  "
                >

                  <button

                    onClick={
                      handleLogout
                    }

                    className="
                      w-full
                      flex
                      items-center
                      gap-3
                      px-3
                      py-2.5
                      rounded-xl
                      text-left
                      text-xs
                      font-bold
                      text-rose-600
                      dark:text-rose-400
                      hover:bg-rose-50
                      dark:hover:bg-rose-950/40
                      transition-colors
                    "

                  >

                    <LogOut
                      className="
                        w-4
                        h-4
                      "
                    />

                    <span>
                      Logout
                    </span>

                  </button>

                </div>

              </div>

            </>

          )}

        </div>

      </div>

    </header>

  );

};