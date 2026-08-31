import React, {
  useState,
  useRef,
  useEffect,
} from 'react';

import {
  Sun,
  Moon,
  Monitor,
  ChevronDown,
} from 'lucide-react';

import {
  useTheme,
} from '../context/ThemeContext';


export const ThemeToggle = () => {

  const {
    theme,
    setTheme,
  } = useTheme();


  const [
    isOpen,
    setIsOpen,
  ] = useState(false);


  const dropdownRef =
    useRef(null);


  /* =========================================
     CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  ========================================= */

  useEffect(() => {

    const handleClickOutside =
      (event) => {

        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(
            event.target
          )
        ) {

          setIsOpen(false);

        }

      };


    document.addEventListener(
      'mousedown',
      handleClickOutside
    );


    return () => {

      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );

    };

  }, []);


  /* =========================================
     THEME OPTIONS
  ========================================= */

  const options = [

    {
      key: 'light',
      label: 'Light',
      icon: Sun,
    },

    {
      key: 'dark',
      label: 'Dark',
      icon: Moon,
    },

    {
      key: 'system',
      label: 'System',
      icon: Monitor,
    },

  ];


  /* =========================================
     CURRENT THEME
  ========================================= */

  const currentOption =
    options.find(
      (option) =>
        option.key === theme
    ) || options[2];


  const CurrentIcon =
    currentOption.icon;


  return (

    <div
      className="relative"
      ref={dropdownRef}
    >

      {/* =====================================
          THEME BUTTON - ICON ONLY
      ===================================== */}

      <button
        onClick={() =>
          setIsOpen(!isOpen)
        }
        className="
          flex
          items-center
          justify-center
          w-9
          h-9
          rounded-xl
          bg-recon-light-bg
          dark:bg-recon-dark-cardHover
          border
          border-recon-light-border
          dark:border-recon-dark-border
          text-recon-light-text
          dark:text-recon-dark-text
          hover:bg-recon-light-soft
          dark:hover:bg-recon-dark-border
          transition-colors
        "
        title="Change theme"
        aria-label="Change theme"
      >

        <CurrentIcon
          className="
            w-4
            h-4
            text-recon-forest
            dark:text-recon-dark-accent
          "
        />

      </button>


      {/* =====================================
          THEME DROPDOWN
      ===================================== */}

      {isOpen && (

        <div
          className="
            absolute
            right-0
            mt-2
            w-32
            rounded-xl
            bg-white
            dark:bg-recon-dark-card
            border
            border-recon-light-border
            dark:border-recon-dark-border
            shadow-soft
            dark:shadow-dark-soft
            py-1
            z-50
            animate-in
            fade-in
            slide-in-from-top-2
            duration-150
          "
        >

          {options.map(
            (option) => {

              const Icon =
                option.icon;


              const isSelected =
                theme === option.key;


              return (

                <button
                  key={option.key}

                  onClick={() => {

                    setTheme(
                      option.key
                    );

                    setIsOpen(false);

                  }}

                  className={`
                    flex
                    items-center
                    w-full
                    gap-2
                    px-3
                    py-2
                    text-xs
                    font-medium
                    text-left
                    transition-colors

                    ${
                      isSelected

                        ? `
                          bg-recon-light-soft
                          dark:bg-recon-dark-cardHover
                          text-recon-forest
                          dark:text-recon-dark-accent
                          font-semibold
                        `

                        : `
                          text-recon-light-text
                          dark:text-recon-dark-text
                          hover:bg-gray-50
                          dark:hover:bg-recon-dark-border/50
                        `
                    }
                  `}
                >

                  <Icon
                    className={`
                      w-3.5
                      h-3.5

                      ${
                        isSelected

                          ? `
                            text-recon-forest
                            dark:text-recon-dark-accent
                          `

                          : `
                            text-recon-light-muted
                            dark:text-recon-dark-muted
                          `
                      }
                    `}
                  />

                  <span>
                    {option.label}
                  </span>

                </button>

              );

            }
          )}

        </div>

      )}

    </div>

  );

};