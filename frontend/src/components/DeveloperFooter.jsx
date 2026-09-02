import React from "react";
import {
  Github,
  Linkedin,
  Mail,
} from "lucide-react";

export const DeveloperFooter = ({
  showLinks = false,
}) => {

  return (
    <footer
      className="
        w-full
        border-t
        border-recon-light-border
        dark:border-recon-dark-border
        bg-white
        dark:bg-recon-dark-card
      "
    >

      <div
        className="
          max-w-7xl
          mx-auto
          px-5
          sm:px-8
          lg:px-10
          py-5
        "
      >

        <div
          className="
            flex
            flex-col
            items-center
            justify-center
            gap-3
            text-center
          "
        >

          {/* DEVELOPER NAME */}

          <p
            className="
              text-xs
              sm:text-sm
              font-bold
              text-recon-light-text
              dark:text-recon-dark-text
            "
          >
            Developed by{" "}

            <span
              className="
                font-black
                text-recon-forest
                dark:text-recon-dark-accent
              "
            >
              NEELAM ANJALI
            </span>
          </p>


          {/* DESCRIPTION */}

          <p
            className="
              text-[10px]
              sm:text-xs
              font-medium
              text-recon-light-muted
              dark:text-recon-dark-muted
            "
          >
            Computer Science and Engineering Student ·
            AI · Technology · Creative Development
          </p>


          {/* SOCIAL LINKS */}

          {showLinks && (

            <div
              className="
                flex
                items-center
                justify-center
                gap-3
                mt-1
              "
            >

              {/* GITHUB */}

              <a
                href="https://github.com/Anjali112005"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="
                  w-9
                  h-9
                  rounded-xl
                  border
                  border-recon-light-border
                  dark:border-recon-dark-border
                  bg-recon-light-bg
                  dark:bg-recon-dark-bg
                  flex
                  items-center
                  justify-center
                  text-recon-light-text
                  dark:text-recon-dark-text
                  hover:text-recon-forest
                  dark:hover:text-recon-dark-accent
                  hover:border-recon-forest
                  dark:hover:border-recon-dark-accent
                  transition-colors
                "
              >

                <Github className="w-4 h-4" />

              </a>


              {/* LINKEDIN */}

              <a
                href="https://www.linkedin.com/in/anjali-neelam-a1a1422a6/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="
                  w-9
                  h-9
                  rounded-xl
                  border
                  border-recon-light-border
                  dark:border-recon-dark-border
                  bg-recon-light-bg
                  dark:bg-recon-dark-bg
                  flex
                  items-center
                  justify-center
                  text-recon-light-text
                  dark:text-recon-dark-text
                  hover:text-recon-forest
                  dark:hover:text-recon-dark-accent
                  hover:border-recon-forest
                  dark:hover:border-recon-dark-accent
                  transition-colors
                "
              >

                <Linkedin className="w-4 h-4" />

              </a>


              {/* EMAIL */}

              <a
                href="mailto:anjalineelam11@gmail.com"
                aria-label="Email"
                className="
                  w-9
                  h-9
                  rounded-xl
                  border
                  border-recon-light-border
                  dark:border-recon-dark-border
                  bg-recon-light-bg
                  dark:bg-recon-dark-bg
                  flex
                  items-center
                  justify-center
                  text-recon-light-text
                  dark:text-recon-dark-text
                  hover:text-recon-forest
                  dark:hover:text-recon-dark-accent
                  hover:border-recon-forest
                  dark:hover:border-recon-dark-accent
                  transition-colors
                "
              >

                <Mail className="w-4 h-4" />

              </a>

            </div>

          )}


          {/* COPYRIGHT */}

          <p
            className="
              text-[9px]
              text-recon-light-muted
              dark:text-recon-dark-muted
              font-medium
              mt-1
            "
          >
            © {new Date().getFullYear()} ReconAI. All rights reserved.
          </p>

        </div>

      </div>

    </footer>
  );
};