import React from "react";

import {
  useNavigate,
} from "react-router-dom";

import {

  Settings,

  Sun,

  Moon,

  Monitor,

  User,

  ChevronRight,

  Palette,

} from "lucide-react";

import {
  useTheme,
} from "../context/ThemeContext";

import {
  useAuth,
} from "../context/AuthContext";


export const SettingsPage = () => {

  const navigate =
    useNavigate();


  const {

    theme,

    setTheme,

  } = useTheme();


  const {

    user,

  } = useAuth();


  const themeOptions = [

    {

      id: "light",

      title: "Light",

      description:
        "Always use light mode.",

      icon:
        Sun,

    },

    {

      id: "dark",

      title: "Dark",

      description:
        "Always use dark mode.",

      icon:
        Moon,

    },

    {

      id: "system",

      title: "System",

      description:
        "Follow your device settings.",

      icon:
        Monitor,

    },

  ];


  return (

    <div
      className="
        max-w-5xl
        mx-auto
        space-y-6
      "
    >


      {/* ===================================================
          PAGE HEADER
         =================================================== */}

      <div
        className="
          flex
          items-start
          gap-4
        "
      >

        <div
          className="
            w-12
            h-12
            rounded-2xl
            bg-recon-light-soft
            dark:bg-recon-dark-cardHover
            text-recon-forest
            dark:text-recon-dark-accent
            flex
            items-center
            justify-center
          "
        >

          <Settings
            className="
              w-6
              h-6
            "
          />

        </div>


        <div>

          <h1
            className="
              text-2xl
              sm:text-3xl
              font-extrabold
              text-recon-light-text
              dark:text-recon-dark-text
            "
          >
            Settings
          </h1>

          <p
            className="
              mt-1
              text-sm
              text-recon-light-muted
              dark:text-recon-dark-muted
            "
          >
            Customize your ReconAI experience.
          </p>

        </div>

      </div>


      {/* ===================================================
          APPEARANCE
         =================================================== */}

      <div
        className="
          bg-white
          dark:bg-recon-dark-card
          border
          border-recon-light-border
          dark:border-recon-dark-border
          rounded-2xl
          p-6
          shadow-soft
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
            mb-6
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
            "
          >

            <Palette
              className="
                w-5
                h-5
              "
            />

          </div>


          <div>

            <h2
              className="
                text-lg
                font-extrabold
                text-recon-light-text
                dark:text-recon-dark-text
              "
            >
              Appearance
            </h2>

            <p
              className="
                text-sm
                text-recon-light-muted
                dark:text-recon-dark-muted
              "
            >
              Choose how ReconAI looks.
            </p>

          </div>

        </div>


        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-3
            gap-4
          "
        >

          {

            themeOptions.map(
              option => {

                const Icon =
                  option.icon;


                const isSelected =

                  theme ===
                  option.id;


                return (

                  <button

                    key={
                      option.id
                    }

                    onClick={() =>
                      setTheme(
                        option.id
                      )
                    }

                    className={`
                      text-left
                      p-5
                      rounded-2xl
                      border
                      transition-all

                      ${
                        isSelected

                          ? `
                            border-recon-forest
                            dark:border-recon-dark-accent
                            bg-recon-light-soft
                            dark:bg-recon-dark-cardHover
                          `

                          : `
                            border-recon-light-border
                            dark:border-recon-dark-border
                            hover:border-recon-forest/50
                          `
                      }
                    `}
                  >

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                      "
                    >

                      <div
                        className="
                          w-10
                          h-10
                          rounded-xl
                          bg-white
                          dark:bg-recon-dark-bg
                          flex
                          items-center
                          justify-center
                          text-recon-forest
                          dark:text-recon-dark-accent
                          border
                          border-recon-light-border
                          dark:border-recon-dark-border
                        "
                      >

                        <Icon
                          className="
                            w-5
                            h-5
                          "
                        />

                      </div>


                      {isSelected && (

                        <div
                          className="
                            w-3
                            h-3
                            rounded-full
                            bg-recon-forest
                            dark:bg-recon-dark-accent
                          "
                        />

                      )}

                    </div>


                    <h3
                      className="
                        mt-4
                        font-extrabold
                        text-recon-light-text
                        dark:text-recon-dark-text
                      "
                    >

                      {option.title}

                    </h3>


                    <p
                      className="
                        mt-1
                        text-sm
                        text-recon-light-muted
                        dark:text-recon-dark-muted
                      "
                    >

                      {option.description}

                    </p>

                  </button>

                );

              }
            )

          }

        </div>

      </div>


      {/* ===================================================
          ACCOUNT
         =================================================== */}

      <div
        className="
          bg-white
          dark:bg-recon-dark-card
          border
          border-recon-light-border
          dark:border-recon-dark-border
          rounded-2xl
          shadow-soft
          overflow-hidden
        "
      >

        <div
          className="
            p-6
            border-b
            border-recon-light-border
            dark:border-recon-dark-border
          "
        >

          <h2
            className="
              text-lg
              font-extrabold
              text-recon-light-text
              dark:text-recon-dark-text
            "
          >
            Account
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-recon-light-muted
              dark:text-recon-dark-muted
            "
          >
            Manage your ReconAI account.
          </p>

        </div>


        <button

          onClick={() =>
            navigate(
              "/profile"
            )
          }

          className="
            w-full
            flex
            items-center
            gap-4
            p-5
            text-left
            hover:bg-recon-light-soft
            dark:hover:bg-recon-dark-cardHover
            transition-colors
          "

        >

          <div
            className="
              w-11
              h-11
              rounded-xl
              bg-recon-light-soft
              dark:bg-recon-dark-cardHover
              text-recon-forest
              dark:text-recon-dark-accent
              flex
              items-center
              justify-center
              shrink-0
            "
          >

            <User
              className="
                w-5
                h-5
              "
            />

          </div>


          <div
            className="
              flex-1
              min-w-0
            "
          >

            <p
              className="
                font-bold
                text-recon-light-text
                dark:text-recon-dark-text
              "
            >
              My Profile
            </p>

            <p
              className="
                mt-1
                text-sm
                text-recon-light-muted
                dark:text-recon-dark-muted
                truncate
              "
            >

              {user?.email ||
                "Manage your profile"}

            </p>

          </div>


          <ChevronRight
            className="
              w-5
              h-5
              text-recon-light-muted
              dark:text-recon-dark-muted
            "
          />

        </button>

      </div>


      {/* ===================================================
          ABOUT
         =================================================== */}

      <div
        className="
          bg-white
          dark:bg-recon-dark-card
          border
          border-recon-light-border
          dark:border-recon-dark-border
          rounded-2xl
          p-6
          shadow-soft
        "
      >

        <h2
          className="
            text-lg
            font-extrabold
            text-recon-light-text
            dark:text-recon-dark-text
          "
        >
          About ReconAI
        </h2>


        <div
          className="
            mt-5
            grid
            grid-cols-1
            sm:grid-cols-2
            gap-4
          "
        >

          <div
            className="
              p-4
              rounded-xl
              bg-recon-light-bg
              dark:bg-recon-dark-bg
            "
          >

            <p
              className="
                text-xs
                font-bold
                text-recon-light-muted
                dark:text-recon-dark-muted
              "
            >
              Application
            </p>

            <p
              className="
                mt-1
                text-sm
                font-extrabold
                text-recon-light-text
                dark:text-recon-dark-text
              "
            >
              ReconAI
            </p>

          </div>


          <div
            className="
              p-4
              rounded-xl
              bg-recon-light-bg
              dark:bg-recon-dark-bg
            "
          >

            <p
              className="
                text-xs
                font-bold
                text-recon-light-muted
                dark:text-recon-dark-muted
              "
            >
              Version
            </p>

            <p
              className="
                mt-1
                text-sm
                font-extrabold
                text-recon-light-text
                dark:text-recon-dark-text
              "
            >
              1.0.0
            </p>

          </div>

        </div>

      </div>

    </div>

  );

};