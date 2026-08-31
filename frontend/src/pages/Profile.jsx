import React, {
  useState,
} from "react";

import {

  User,

  Mail,

  Calendar,

  ShieldCheck,

  Save,

  Lock,

  Eye,

  EyeOff,

  CheckCircle2,

  AlertCircle,

} from "lucide-react";

import {
  useAuth,
} from "../context/AuthContext";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";


export const Profile = () => {

  const {
    user,
  } = useAuth();


  const [

    name,

    setName,

  ] = useState(
    user?.name || ""
  );


  const [

    currentPassword,

    setCurrentPassword,

  ] = useState("");


  const [

    newPassword,

    setNewPassword,

  ] = useState("");


  const [

    confirmPassword,

    setConfirmPassword,

  ] = useState("");


  const [

    showCurrentPassword,

    setShowCurrentPassword,

  ] = useState(false);


  const [

    showNewPassword,

    setShowNewPassword,

  ] = useState(false);


  const [

    loadingProfile,

    setLoadingProfile,

  ] = useState(false);


  const [

    loadingPassword,

    setLoadingPassword,

  ] = useState(false);


  const [

    message,

    setMessage,

  ] = useState("");


  const [

    error,

    setError,

  ] = useState("");


  /* =======================================================
     GET TOKEN
     ======================================================= */

  const getToken = () => {

    return (

      localStorage.getItem(
        "access_token"
      )

      ||

      localStorage.getItem(
        "token"
      )

    );

  };


  /* =======================================================
     UPDATE PROFILE
     ======================================================= */

  const handleProfileSave =
    async event => {

      event.preventDefault();

      setLoadingProfile(true);

      setMessage("");

      setError("");


      try {

        const token =
          getToken();


        const response =
          await fetch(

            `${API_URL}/auth/profile`,

            {

              method: "PUT",

              headers: {

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,

              },

              body:
                JSON.stringify({

                  name,

                }),

            }

          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(

            data.detail ||

            "Failed to update profile."

          );

        }


        /*
         * Update local user data.
         */

        localStorage.setItem(

          "user",

          JSON.stringify(data)

        );


        setMessage(
          "Profile updated successfully."
        );


        window.location.reload();


      } catch (error) {

        setError(
          error.message
        );

      } finally {

        setLoadingProfile(false);

      }

    };


  /* =======================================================
     CHANGE PASSWORD
     ======================================================= */

  const handlePasswordChange =
    async event => {

      event.preventDefault();

      setMessage("");

      setError("");


      if (
        newPassword !==
        confirmPassword
      ) {

        setError(
          "New passwords do not match."
        );

        return;

      }


      if (
        newPassword.length < 8
      ) {

        setError(
          "New password must be at least 8 characters."
        );

        return;

      }


      setLoadingPassword(true);


      try {

        const token =
          getToken();


        const response =
          await fetch(

            `${API_URL}/auth/change-password`,

            {

              method: "PUT",

              headers: {

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,

              },

              body:
                JSON.stringify({

                  current_password:
                    currentPassword,

                  new_password:
                    newPassword,

                }),

            }

          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(

            data.detail ||

            "Failed to change password."

          );

        }


        setCurrentPassword("");

        setNewPassword("");

        setConfirmPassword("");


        setMessage(
          "Password changed successfully."
        );


      } catch (error) {

        setError(
          error.message
        );

      } finally {

        setLoadingPassword(false);

      }

    };


  /* =======================================================
     USER VALUES
     ======================================================= */

  const userName =

    user?.name ||

    "User";


  const userEmail =

    user?.email ||

    "";


  const userInitial =

    userName
      .charAt(0)
      .toUpperCase();


  const createdAt =
    user?.created_at

      ? new Date(
          user.created_at
        ).toLocaleDateString(
          undefined,
          {

            year: "numeric",

            month: "long",

            day: "numeric",

          }
        )

      : "Not available";


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
          My Profile
        </h1>

        <p
          className="
            mt-1
            text-sm
            text-recon-light-muted
            dark:text-recon-dark-muted
          "
        >
          Manage your account information and security.
        </p>

      </div>


      {/* ===================================================
          SUCCESS MESSAGE
         =================================================== */}

      {message && (

        <div
          className="
            flex
            items-center
            gap-3
            p-4
            rounded-xl
            bg-emerald-50
            dark:bg-emerald-950/30
            border
            border-emerald-200
            dark:border-emerald-900
            text-emerald-700
            dark:text-emerald-400
          "
        >

          <CheckCircle2
            className="
              w-5
              h-5
              shrink-0
            "
          />

          <p
            className="
              text-sm
              font-semibold
            "
          >
            {message}
          </p>

        </div>

      )}


      {/* ===================================================
          ERROR MESSAGE
         =================================================== */}

      {error && (

        <div
          className="
            flex
            items-center
            gap-3
            p-4
            rounded-xl
            bg-rose-50
            dark:bg-rose-950/30
            border
            border-rose-200
            dark:border-rose-900
            text-rose-700
            dark:text-rose-400
          "
        >

          <AlertCircle
            className="
              w-5
              h-5
              shrink-0
            "
          />

          <p
            className="
              text-sm
              font-semibold
            "
          >
            {error}
          </p>

        </div>

      )}


      {/* ===================================================
          PROFILE SUMMARY
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
            flex-col
            sm:flex-row
            sm:items-center
            gap-5
          "
        >

          <div
            className="
              w-20
              h-20
              rounded-2xl
              bg-recon-forest
              dark:bg-recon-dark-accent
              text-white
              flex
              items-center
              justify-center
              text-2xl
              font-extrabold
              shrink-0
            "
          >

            {userInitial}

          </div>


          <div
            className="
              flex-1
            "
          >

            <h2
              className="
                text-xl
                font-extrabold
                text-recon-light-text
                dark:text-recon-dark-text
              "
            >

              {userName}

            </h2>


            <p
              className="
                mt-1
                text-sm
                text-recon-light-muted
                dark:text-recon-dark-muted
              "
            >

              {userEmail}

            </p>

          </div>


          <div
            className="
              flex
              items-center
              gap-2
              px-3
              py-2
              rounded-xl
              bg-emerald-50
              dark:bg-emerald-950/30
              text-emerald-700
              dark:text-emerald-400
            "
          >

            <ShieldCheck
              className="
                w-4
                h-4
              "
            />

            <span
              className="
                text-xs
                font-bold
              "
            >

              {user?.is_verified
                ? "Verified"
                : "Not Verified"}

            </span>

          </div>

        </div>

      </div>


      {/* ===================================================
          ACCOUNT INFORMATION
         =================================================== */}

      <div
        className="
          grid
          grid-cols-1
          lg:grid-cols-3
          gap-6
        "
      >


        <div
          className="
            lg:col-span-2
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
              mb-6
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
              Personal Information
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-recon-light-muted
                dark:text-recon-dark-muted
              "
            >
              Update your account details.
            </p>

          </div>


          <form
            onSubmit={
              handleProfileSave
            }
            className="
              space-y-5
            "
          >

            <div>

              <label
                className="
                  block
                  mb-2
                  text-sm
                  font-bold
                  text-recon-light-text
                  dark:text-recon-dark-text
                "
              >
                Full Name
              </label>


              <div className="relative">

                <User
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    w-4
                    h-4
                    text-recon-light-muted
                    dark:text-recon-dark-muted
                  "
                />

                <input

                  value={name}

                  onChange={
                    event =>
                      setName(
                        event.target.value
                      )
                  }

                  className="
                    w-full
                    pl-10
                    pr-4
                    py-3
                    rounded-xl
                    border
                    border-recon-light-border
                    dark:border-recon-dark-border
                    bg-recon-light-bg
                    dark:bg-recon-dark-bg
                    text-recon-light-text
                    dark:text-recon-dark-text
                    focus:outline-none
                    focus:ring-2
                    focus:ring-recon-forest/20
                  "

                />

              </div>

            </div>


            <div>

              <label
                className="
                  block
                  mb-2
                  text-sm
                  font-bold
                  text-recon-light-text
                  dark:text-recon-dark-text
                "
              >
                Email Address
              </label>


              <div className="relative">

                <Mail
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    w-4
                    h-4
                    text-recon-light-muted
                    dark:text-recon-dark-muted
                  "
                />

                <input

                  value={userEmail}

                  disabled

                  className="
                    w-full
                    pl-10
                    pr-4
                    py-3
                    rounded-xl
                    border
                    border-recon-light-border
                    dark:border-recon-dark-border
                    bg-gray-100
                    dark:bg-recon-dark-bg
                    text-recon-light-muted
                    dark:text-recon-dark-muted
                    cursor-not-allowed
                  "

                />

              </div>

            </div>


            <button

              type="submit"

              disabled={
                loadingProfile
              }

              className="
                inline-flex
                items-center
                gap-2
                px-5
                py-3
                rounded-xl
                bg-recon-forest
                dark:bg-recon-dark-accent
                text-white
                text-sm
                font-bold
                hover:opacity-90
                disabled:opacity-50
                transition-all
              "

            >

              <Save
                className="
                  w-4
                  h-4
                "
              />

              {
                loadingProfile
                  ? "Saving..."
                  : "Save Changes"
              }

            </button>

          </form>

        </div>


        {/* ACCOUNT DETAILS */}

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
            Account Details
          </h2>


          <div
            className="
              mt-6
              space-y-5
            "
          >

            <div
              className="
                flex
                gap-3
              "
            >

              <Calendar
                className="
                  w-5
                  h-5
                  text-recon-light-muted
                  dark:text-recon-dark-muted
                  shrink-0
                "
              />

              <div>

                <p
                  className="
                    text-xs
                    font-bold
                    text-recon-light-muted
                    dark:text-recon-dark-muted
                  "
                >
                  Member Since
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    font-bold
                    text-recon-light-text
                    dark:text-recon-dark-text
                  "
                >
                  {createdAt}
                </p>

              </div>

            </div>


            <div
              className="
                flex
                gap-3
              "
            >

              <ShieldCheck
                className="
                  w-5
                  h-5
                  text-emerald-500
                  shrink-0
                "
              />

              <div>

                <p
                  className="
                    text-xs
                    font-bold
                    text-recon-light-muted
                    dark:text-recon-dark-muted
                  "
                >
                  Account Status
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    font-bold
                    text-recon-light-text
                    dark:text-recon-dark-text
                  "
                >

                  {
                    user?.is_verified
                      ? "Verified Account"
                      : "Verification Required"
                  }

                </p>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* ===================================================
          SECURITY
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
            mb-6
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
            Security
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-recon-light-muted
              dark:text-recon-dark-muted
            "
          >
            Change your account password.
          </p>

        </div>


        <form
          onSubmit={
            handlePasswordChange
          }
          className="
            grid
            grid-cols-1
            md:grid-cols-3
            gap-5
          "
        >


          {/* CURRENT PASSWORD */}

          <div>

            <label
              className="
                block
                mb-2
                text-sm
                font-bold
                text-recon-light-text
                dark:text-recon-dark-text
              "
            >
              Current Password
            </label>


            <div className="relative">

              <Lock
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  w-4
                  h-4
                  text-recon-light-muted
                "
              />

              <input

                type={
                  showCurrentPassword
                    ? "text"
                    : "password"
                }

                value={
                  currentPassword
                }

                onChange={
                  event =>
                    setCurrentPassword(
                      event.target.value
                    )
                }

                required

                className="
                  w-full
                  pl-10
                  pr-10
                  py-3
                  rounded-xl
                  border
                  border-recon-light-border
                  dark:border-recon-dark-border
                  bg-recon-light-bg
                  dark:bg-recon-dark-bg
                  text-recon-light-text
                  dark:text-recon-dark-text
                  focus:outline-none
                  focus:ring-2
                  focus:ring-recon-forest/20
                "

              />

              <button

                type="button"

                onClick={() =>
                  setShowCurrentPassword(
                    !showCurrentPassword
                  )
                }

                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-recon-light-muted
                "

              >

                {
                  showCurrentPassword

                    ? <EyeOff className="w-4 h-4" />

                    : <Eye className="w-4 h-4" />

                }

              </button>

            </div>

          </div>


          {/* NEW PASSWORD */}

          <div>

            <label
              className="
                block
                mb-2
                text-sm
                font-bold
                text-recon-light-text
                dark:text-recon-dark-text
              "
            >
              New Password
            </label>


            <div className="relative">

              <Lock
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  w-4
                  h-4
                  text-recon-light-muted
                "
              />

              <input

                type={
                  showNewPassword
                    ? "text"
                    : "password"
                }

                value={
                  newPassword
                }

                onChange={
                  event =>
                    setNewPassword(
                      event.target.value
                    )
                }

                required

                className="
                  w-full
                  pl-10
                  pr-10
                  py-3
                  rounded-xl
                  border
                  border-recon-light-border
                  dark:border-recon-dark-border
                  bg-recon-light-bg
                  dark:bg-recon-dark-bg
                  text-recon-light-text
                  dark:text-recon-dark-text
                  focus:outline-none
                  focus:ring-2
                  focus:ring-recon-forest/20
                "

              />

              <button

                type="button"

                onClick={() =>
                  setShowNewPassword(
                    !showNewPassword
                  )
                }

                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-recon-light-muted
                "

              >

                {
                  showNewPassword

                    ? <EyeOff className="w-4 h-4" />

                    : <Eye className="w-4 h-4" />

                }

              </button>

            </div>

          </div>


          {/* CONFIRM PASSWORD */}

          <div>

            <label
              className="
                block
                mb-2
                text-sm
                font-bold
                text-recon-light-text
                dark:text-recon-dark-text
              "
            >
              Confirm Password
            </label>


            <input

              type="password"

              value={
                confirmPassword
              }

              onChange={
                event =>
                  setConfirmPassword(
                    event.target.value
                  )
              }

              required

              className="
                w-full
                px-4
                py-3
                rounded-xl
                border
                border-recon-light-border
                dark:border-recon-dark-border
                bg-recon-light-bg
                dark:bg-recon-dark-bg
                text-recon-light-text
                dark:text-recon-dark-text
                focus:outline-none
                focus:ring-2
                focus:ring-recon-forest/20
              "

            />

          </div>


          <div
            className="
              md:col-span-3
            "
          >

            <button

              type="submit"

              disabled={
                loadingPassword
              }

              className="
                inline-flex
                items-center
                gap-2
                px-5
                py-3
                rounded-xl
                bg-recon-forest
                dark:bg-recon-dark-accent
                text-white
                text-sm
                font-bold
                hover:opacity-90
                disabled:opacity-50
                transition-all
              "

            >

              <Lock
                className="
                  w-4
                  h-4
                "
              />

              {
                loadingPassword
                  ? "Changing Password..."
                  : "Change Password"
              }

            </button>

          </div>

        </form>

      </div>

    </div>

  );

};