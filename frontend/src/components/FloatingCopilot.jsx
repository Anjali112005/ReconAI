import React, {
  useState,
  useRef,
  useEffect,
} from 'react';

import {
  Bot,
  Sparkles,
  Send,
  X,
  Minus,
  RefreshCw,
  User,
} from 'lucide-react';

import ReactMarkdown from 'react-markdown';

import {
  copilotPrompts,
} from '../data/mockData';

import {
  askCopilot,
} from '../services/api';

import {
  useRecon,
} from '../context/ReconContext';


export const FloatingCopilot = () => {

  /* =========================================
     RECONCILIATION CONTEXT
  ========================================= */

  const {
    reconciliationResult: contextResult,
  } = useRecon();


  /* =========================================
     STATE
  ========================================= */

  const [isOpen, setIsOpen] =
    useState(false);

  const [
    reconciliationResult,
    setReconciliationResult,
  ] = useState(
    contextResult || null
  );


  const [messages, setMessages] =
    useState([
      {
        role: 'assistant',

        content:
          `Hi! I'm ReconAI Copilot.

I can help you understand your reconciliation results, financial risks, exceptions, and AI investigation insights.`,
      },
    ]);


  const [
    inputPrompt,
    setInputPrompt,
  ] = useState('');


  const [
    isTyping,
    setIsTyping,
  ] = useState(false);


  const chatBottomRef =
    useRef(null);


  /* =========================================
     LOAD RECONCILIATION RESULT
  ========================================= */

  useEffect(() => {

    if (contextResult) {

      setReconciliationResult(
        contextResult
      );

      return;

    }


    const savedResult =
      sessionStorage.getItem(
        'reconciliationResult'
      );


    if (savedResult) {

      try {

        const parsedResult =
          JSON.parse(
            savedResult
          );


        setReconciliationResult(
          parsedResult
        );

      } catch (error) {

        console.error(
          'Failed to load reconciliation result:',
          error
        );

      }

    }

  }, [
    contextResult,
  ]);


  /* =========================================
     AUTO SCROLL
  ========================================= */

  useEffect(() => {

    if (isOpen) {

      chatBottomRef.current
        ?.scrollIntoView({

          behavior:
            'smooth',

        });

    }

  }, [
    messages,
    isTyping,
    isOpen,
  ]);


  /* =========================================
     EXTRACT COPILOT RESPONSE
  ========================================= */

  const extractCopilotResponse =
    (
      response
    ) => {

      if (!response) {

        return (
          'I was unable to generate a response.'
        );

      }


      if (
        typeof response ===
        'string'
      ) {

        return response;

      }


      return (

        response.answer ||

        response.response ||

        response.message ||

        response.content ||

        response.copilot_response ||

        response.result ||

        JSON.stringify(
          response,
          null,
          2
        )

      );

    };


  /* =========================================
     SEND MESSAGE
  ========================================= */

  const handleSend =
    async (
      textToSend
    ) => {

      const query = (

        textToSend ||
        inputPrompt

      ).trim();


      if (
        !query ||
        isTyping
      ) {

        return;

      }


      /* CLEAR INPUT */

      setInputPrompt(
        ''
      );


      /* ADD USER MESSAGE */

      setMessages(
        (
          previousMessages
        ) => [

          ...previousMessages,

          {
            role:
              'user',

            content:
              query,
          },

        ]
      );


      /* CHECK DATA */

      if (
        !reconciliationResult
      ) {

        setMessages(
          (
            previousMessages
          ) => [

            ...previousMessages,

            {
              role:
                'assistant',

              content:
                `⚠️ **No reconciliation data is currently available.**

Please upload your Bank Statement CSV and Internal Ledger CSV, then run the ReconAI analysis before asking financial questions.`,
            },

          ]
        );


        return;

      }


      /* START TYPING */

      setIsTyping(
        true
      );


      try {

        /* CALL BACKEND */

        const response =
          await askCopilot(

            query,

            reconciliationResult

          );


        console.log(
          'FLOATING COPILOT RESPONSE:',
          response
        );


        /* EXTRACT RESPONSE */

        const responseText =
          extractCopilotResponse(
            response
          );


        /* ADD AI RESPONSE */

        setMessages(
          (
            previousMessages
          ) => [

            ...previousMessages,

            {
              role:
                'assistant',

              content:
                responseText,
            },

          ]
        );


      } catch (
        error
      ) {

        console.error(
          'Floating Copilot API Error:',
          error
        );


        setMessages(
          (
            previousMessages
          ) => [

            ...previousMessages,

            {
              role:
                'assistant',

              content:
                `❌ **Sorry, I could not process your question right now.**

${

  error.message ||

  'Failed to communicate with the ReconAI Copilot.'

}`,
            },

          ]
        );


      } finally {

        setIsTyping(
          false
        );

      }

    };


  /* =========================================
     RESET CHAT
  ========================================= */

  const handleResetChat =
    () => {

      setMessages([
        {
          role:
            'assistant',

          content:
            `Hi! I'm ReconAI Copilot.

I can help you understand your reconciliation results, financial risks, exceptions, and AI investigation insights.`,
        },
      ]);

    };


  /* =========================================
     COMPONENT
  ========================================= */

  return (

    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">


      {/* =====================================
          FLOATING CHAT WINDOW
      ===================================== */}

      {

        isOpen && (

          <div className="w-[360px] sm:w-[400px] h-[540px] mb-4 rounded-3xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">


            {/* HEADER */}

            <div className="p-4 bg-recon-forest dark:bg-recon-dark-cardHover text-white flex items-center justify-between shadow-sm">


              <div className="flex items-center gap-3">


                <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">

                  <Bot className="w-5 h-5" />

                </div>


                <div>


                  <div className="flex items-center gap-2">


                    <h3 className="font-extrabold text-sm tracking-tight text-white">

                      ReconAI Copilot

                    </h3>


                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">


                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />


                      AI Online


                    </span>


                  </div>


                  <p className="text-[11px] text-emerald-100/80 font-medium">

                    Financial Intelligence Assistant

                  </p>


                </div>


              </div>


              <div className="flex items-center gap-1">


                <button
                  onClick={
                    handleResetChat
                  }
                  className="p-1.5 rounded-lg text-emerald-100/70 hover:text-white hover:bg-white/10 transition-colors"
                  title="Reset conversation"
                >

                  <RefreshCw className="w-4 h-4" />

                </button>


                <button
                  onClick={() =>
                    setIsOpen(false)
                  }
                  className="p-1.5 rounded-lg text-emerald-100/70 hover:text-white hover:bg-white/10 transition-colors"
                  title="Minimize chat"
                >

                  <Minus className="w-4 h-4" />

                </button>


                <button
                  onClick={() =>
                    setIsOpen(false)
                  }
                  className="p-1.5 rounded-lg text-emerald-100/70 hover:text-white hover:bg-white/10 transition-colors"
                  title="Close chat"
                >

                  <X className="w-4 h-4" />

                </button>


              </div>


            </div>


            {/* =================================
                CHAT BODY
            ================================= */}

            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-recon-light-bg/50 dark:bg-recon-dark-bg/50">


              {

                messages.map(

                  (
                    msg,
                    idx
                  ) => (

                    <div
                      key={idx}
                      className={`flex items-start gap-2.5 ${
                        msg.role === 'user'
                          ? 'flex-row-reverse'
                          : 'flex-row'
                      }`}
                    >


                      {/* AVATAR */}

                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                          msg.role === 'user'
                            ? 'bg-recon-forest dark:bg-recon-dark-accent text-white'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >

                        {

                          msg.role ===
                          'user'

                            ? (

                              <User className="w-3.5 h-3.5" />

                            )

                            : (

                              <Bot className="w-3.5 h-3.5" />

                            )

                        }

                      </div>


                      {/* MESSAGE */}

                      <div
                        className={`p-3 rounded-2xl text-xs font-medium leading-relaxed max-w-[82%] ${
                          msg.role === 'user'
                            ? 'bg-recon-forest text-white dark:bg-recon-dark-accent dark:text-white rounded-tr-none shadow-sm'
                            : 'bg-white dark:bg-recon-dark-card text-recon-light-text dark:text-recon-dark-text border border-recon-light-border dark:border-recon-dark-border rounded-tl-none shadow-soft'
                        }`}
                      >


                        {/* =========================
                            MARKDOWN RENDERING
                        ========================= */}

                        <ReactMarkdown
                          components={{

                            p: ({
                              children
                            }) => (

                              <p className="mb-2 last:mb-0">

                                {children}

                              </p>

                            ),


                            h1: ({
                              children
                            }) => (

                              <h1 className="text-base font-bold mb-2">

                                {children}

                              </h1>

                            ),


                            h2: ({
                              children
                            }) => (

                              <h2 className="text-sm font-bold mb-2">

                                {children}

                              </h2>

                            ),


                            h3: ({
                              children
                            }) => (

                              <h3 className="text-sm font-bold mb-2">

                                {children}

                              </h3>

                            ),


                            ul: ({
                              children
                            }) => (

                              <ul className="list-disc pl-4 mb-2 space-y-1">

                                {children}

                              </ul>

                            ),


                            ol: ({
                              children
                            }) => (

                              <ol className="list-decimal pl-4 mb-2 space-y-1">

                                {children}

                              </ol>

                            ),


                            li: ({
                              children
                            }) => (

                              <li>

                                {children}

                              </li>

                            ),


                            strong: ({
                              children
                            }) => (

                              <strong className="font-extrabold">

                                {children}

                              </strong>

                            ),

                          }}
                        >

                          {msg.content}

                        </ReactMarkdown>


                      </div>


                    </div>

                  )

                )

              }


              {/* SUGGESTED QUESTIONS */}

              {

                messages.length ===
                1 && (

                  <div className="pt-2 space-y-2 animate-in fade-in duration-200">


                    <p className="text-[11px] font-bold text-recon-light-muted dark:text-recon-dark-muted flex items-center gap-1 uppercase tracking-wider">

                      <Sparkles className="w-3 h-3 text-recon-forest dark:text-recon-dark-accent" />

                      Suggested Questions:

                    </p>


                    <div className="flex flex-wrap gap-1.5">


                      {

                        copilotPrompts.map(

                          (
                            prompt,
                            idx
                          ) => (

                            <button
                              key={idx}
                              onClick={() =>
                                handleSend(prompt)
                              }
                              disabled={isTyping}
                              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border text-[11px] font-semibold text-recon-light-text dark:text-recon-dark-text hover:border-recon-forest dark:hover:border-recon-dark-accent hover:bg-recon-light-soft dark:hover:bg-recon-dark-cardHover transition-all text-left"
                            >

                              {prompt}

                            </button>

                          )

                        )

                      }


                    </div>


                  </div>

                )

              }


              {/* TYPING INDICATOR */}

              {

                isTyping && (

                  <div className="flex items-center gap-2">


                    <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">

                      <Bot className="w-3.5 h-3.5 animate-spin" />

                    </div>


                    <div className="p-2.5 rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border text-[11px] text-recon-light-muted dark:text-recon-dark-muted font-medium flex items-center gap-1.5">


                      <span>

                        Analyzing your question

                      </span>


                      <span className="flex items-center gap-0.5">

                        <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" />

                        <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />

                        <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />

                      </span>


                    </div>


                  </div>

                )

              }


              <div
                ref={chatBottomRef}
              />


            </div>


            {/* =================================
                CHAT INPUT
            ================================= */}

            <div className="p-3 bg-white dark:bg-recon-dark-card border-t border-recon-light-border dark:border-recon-dark-border">


              <form
                onSubmit={(
                  event
                ) => {

                  event.preventDefault();

                  handleSend();

                }}
                className="flex items-center gap-2"
              >


                <input
                  type="text"
                  value={inputPrompt}
                  onChange={(
                    event
                  ) =>

                    setInputPrompt(
                      event.target.value
                    )

                  }
                  disabled={isTyping}
                  placeholder="Ask Copilot a financial question..."
                  className="flex-1 px-3 py-2 text-xs font-medium rounded-xl bg-recon-light-bg dark:bg-recon-dark-cardHover border border-recon-light-border dark:border-recon-dark-border text-recon-light-text dark:text-recon-dark-text placeholder-recon-light-muted dark:placeholder-recon-dark-muted focus:outline-none focus:ring-1 focus:ring-recon-forest dark:focus:ring-recon-dark-accent"
                />


                <button
                  type="submit"
                  disabled={
                    !inputPrompt.trim() ||
                    isTyping
                  }
                  className="p-2 rounded-xl bg-recon-forest dark:bg-recon-dark-accent text-white disabled:opacity-40 hover:bg-recon-forestHover transition-all shrink-0"
                >

                  <Send className="w-4 h-4" />

                </button>


              </form>


            </div>


          </div>

        )

      }


      {/* =====================================
          FLOATING BUTTON
      ===================================== */}

      <div className="relative group">


        {

          !isOpen && (

            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-recon-forest dark:bg-recon-dark-accent text-white text-xs font-bold whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-1.5">

              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />

              <span>

                Ask ReconAI

              </span>

            </div>

          )

        }


        <button
          onClick={() =>
            setIsOpen(!isOpen)
          }
          className="w-14 h-14 rounded-full bg-recon-forest dark:bg-recon-dark-accent text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center relative ring-4 ring-recon-forest/20 dark:ring-recon-dark-accent/30"
          aria-label="Open ReconAI Finance Copilot"
        >


          {

            isOpen

              ? (

                <X className="w-6 h-6" />

              )

              : (

                <Bot className="w-6 h-6" />

              )

          }


          {

            !isOpen && (

              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white dark:border-recon-dark-bg animate-pulse" />

            )

          }


        </button>


      </div>


    </div>

  );

};