import React, {
  useState,
  useRef,
  useEffect,
} from 'react';

import {
  Send,
  Sparkles,
  User,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

import ReactMarkdown from 'react-markdown';

import {
  PageHeader,
} from '../components/PageHeader';

import {
  askCopilot,
} from '../services/api';

import {
  useRecon,
} from '../context/ReconContext';


export const FinanceCopilot = () => {

  /* =========================================
     RECONCILIATION CONTEXT
  ========================================= */

  const {
    reconciliationResult:
      contextResult,
  } = useRecon();


  /* =========================================
     RECONCILIATION DATA
  ========================================= */

  const [
    reconciliationResult,
    setReconciliationResult,
  ] = useState(
    contextResult || null
  );


  /* =========================================
     CHAT STATE
  ========================================= */

  const [
    messages,
    setMessages,
  ] = useState([
    {
      role:
        'assistant',

      content:
        `Hello! I am your **ReconAI Finance Copilot**.

Ask me anything about your reconciliation results, financial risk exposure, exceptions, or transaction discrepancies.`,
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


  const [
    error,
    setError,
  ] = useState(null);


  const chatBottomRef =
    useRef(null);


  /* =========================================
     LOAD RECONCILIATION RESULT
  ========================================= */

  useEffect(() => {

    if (
      contextResult
    ) {

      setReconciliationResult(
        contextResult
      );

      return;

    }


    const savedResult =
      sessionStorage.getItem(
        'reconciliationResult'
      );


    if (
      savedResult
    ) {

      try {

        const parsedResult =
          JSON.parse(
            savedResult
          );


        setReconciliationResult(
          parsedResult
        );


      } catch (
        error
      ) {

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
     AUTO SCROLL CHAT
  ========================================= */

  useEffect(() => {

    chatBottomRef.current
      ?.scrollIntoView({

        behavior:
          'smooth',

      });

  }, [
    messages,
    isTyping,
  ]);


  /* =========================================
     SUGGESTED PROMPTS
  ========================================= */

  const suggestedPrompts = [

    'What is the total financial exposure?',

    'How many transactions were matched?',

    'What are the highest risk exceptions?',

    'What should I investigate first?',

    'Give me a summary of the reconciliation results.',

  ];


  /* =========================================
     EXTRACT AI RESPONSE
  ========================================= */

  const extractCopilotResponse =
    (
      response
    ) => {

      if (
        !response
      ) {

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


      /* CLEAR ERROR */

      setError(
        null
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


      /* CHECK RECONCILIATION DATA */

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

Please upload your Bank Statement CSV and Internal Ledger CSV, then run the ReconAI analysis before asking questions.`,
            },

          ]
        );


        return;

      }


      /* START LOADING */

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
          'COPILOT RESPONSE:',
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
          'Copilot API Error:',
          error
        );


        const errorMessage =

          error.message ||

          'Failed to communicate with the ReconAI Copilot.';


        setError(
          errorMessage
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

${errorMessage}`,
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

            reconciliationResult

              ?

              `Chat history cleared.

I still have access to your current reconciliation analysis. **How can I help you?**`

              :

              `Chat history cleared.

Upload reconciliation data to begin asking financial analysis questions.`,

        },

      ]);


      setError(
        null
      );


    };


  /* =========================================
     PAGE UI
  ========================================= */

  return (

    <div className="space-y-6 pb-12 animate-in fade-in duration-200 flex flex-col h-[calc(100vh-6rem)]">


      {/* PAGE HEADER */}

      <PageHeader

        title="ReconAI Finance Copilot"

        subtitle="Conversational AI assistant for reconciliation analysis, financial exposure, and risk investigation."

        actions={

          <button

            onClick={
              handleResetChat
            }

            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border text-recon-light-muted dark:text-recon-dark-muted font-bold text-xs hover:text-recon-light-text transition-colors"

          >


            <RefreshCw className="w-3.5 h-3.5" />


            <span>

              Reset Chat

            </span>


          </button>

        }

      />


      {/* =====================================
          NO RECONCILIATION DATA WARNING
      ===================================== */}

      {

        !reconciliationResult && (

          <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 flex items-center gap-2">


            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />


            <p className="text-xs font-medium text-amber-700 dark:text-amber-300">

              No active reconciliation analysis found.
              Upload Bank and Ledger CSV files to give
              the Finance Copilot real financial context.

            </p>


          </div>

        )

      }


      {/* =====================================
          SUGGESTED QUESTIONS
      ===================================== */}

      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs shrink-0">


        <span className="text-recon-light-muted dark:text-recon-dark-muted font-bold text-[11px] uppercase tracking-wider shrink-0 flex items-center gap-1">


          <Sparkles className="w-3 h-3 text-recon-forest dark:text-recon-dark-accent" />


          Suggested:


        </span>


        {

          suggestedPrompts.map(

            (
              prompt,
              index
            ) => (

              <button

                key={index}

                onClick={() =>
                  handleSend(prompt)
                }

                disabled={
                  isTyping
                }

                className="px-3 py-1.5 rounded-full bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border text-recon-light-text dark:text-recon-dark-text hover:border-recon-forest dark:hover:border-recon-dark-accent hover:bg-recon-light-soft dark:hover:bg-recon-dark-cardHover transition-all shrink-0 font-medium disabled:opacity-50"

              >

                {prompt}

              </button>

            )

          )

        }


      </div>


      {/* =====================================
          ERROR MESSAGE
      ===================================== */}

      {

        error && (

          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-medium">

            {error}

          </div>

        )

      }


      {/* =====================================
          CHAT PANEL
      ===================================== */}

      <div className="flex-1 p-5 rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border shadow-soft overflow-y-auto space-y-4">


        {/* CHAT MESSAGES */}

        {

          messages.map(

            (
              message,
              index
            ) => (

              <div

                key={index}

                className={`flex items-start gap-3 ${
                  message.role === 'user'
                    ? 'flex-row-reverse'
                    : 'flex-row'
                }`}

              >


                {/* AVATAR */}

                <div

                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    message.role === 'user'
                      ? 'bg-recon-forest dark:bg-recon-dark-accent text-white'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  }`}

                >

                  {

                    message.role ===
                    'user'

                      ?

                      <User className="w-4 h-4" />

                      :

                      <ShieldCheck className="w-4 h-4" />

                  }

                </div>


                {/* MESSAGE BUBBLE */}

                <div

                  className={`p-4 rounded-2xl max-w-2xl text-xs sm:text-sm font-medium leading-relaxed shadow-sm ${
                    message.role === 'user'
                      ? 'bg-recon-forest text-white dark:bg-recon-dark-accent dark:text-white rounded-tr-none'
                      : 'bg-recon-light-bg dark:bg-recon-dark-cardHover text-recon-light-text dark:text-recon-dark-text border border-recon-light-border/60 dark:border-recon-dark-border/60 rounded-tl-none'
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

                        <p className="mb-3 last:mb-0">

                          {children}

                        </p>

                      ),


                      h1: ({
                        children
                      }) => (

                        <h1 className="text-base sm:text-lg font-extrabold mb-3">

                          {children}

                        </h1>

                      ),


                      h2: ({
                        children
                      }) => (

                        <h2 className="text-sm sm:text-base font-extrabold mb-3">

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

                        <ul className="list-disc pl-5 mb-3 space-y-1">

                          {children}

                        </ul>

                      ),


                      ol: ({
                        children
                      }) => (

                        <ol className="list-decimal pl-5 mb-3 space-y-1">

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


                      code: ({
                        children
                      }) => (

                        <code className="px-1 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-[0.85em]">

                          {children}

                        </code>

                      ),

                    }}

                  >

                    {message.content}

                  </ReactMarkdown>


                </div>


              </div>

            )

          )

        }


        {/* =====================================
            TYPING INDICATOR
        ===================================== */}

        {

          isTyping && (

            <div className="flex items-center gap-3">


              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">

                <ShieldCheck className="w-4 h-4 animate-spin" />

              </div>


              <div className="p-3 rounded-2xl bg-recon-light-bg dark:bg-recon-dark-cardHover border border-recon-light-border dark:border-recon-dark-border text-xs text-recon-light-muted dark:text-recon-dark-muted font-semibold flex items-center gap-1.5">


                <span>

                  Copilot is analyzing your reconciliation data

                </span>


                <span className="flex items-center gap-0.5">


                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />

                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />

                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />


                </span>


              </div>


            </div>

          )

        }


        {/* AUTO SCROLL TARGET */}

        <div
          ref={chatBottomRef}
        />


      </div>


      {/* =====================================
          CHAT INPUT
      ===================================== */}

      <div className="shrink-0">


        <form

          onSubmit={(
            event
          ) => {

            event.preventDefault();

            handleSend();

          }}

          className="flex items-center gap-2 p-2 rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border shadow-soft"

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

            disabled={
              isTyping
            }

            placeholder="Ask about matches, exceptions, exposure, or transaction risks..."

            className="flex-1 px-4 py-2.5 text-xs sm:text-sm font-medium bg-transparent text-recon-light-text dark:text-recon-dark-text placeholder-recon-light-muted dark:placeholder-recon-dark-muted focus:outline-none disabled:opacity-60"

          />


          <button

            type="submit"

            disabled={

              !inputPrompt.trim() ||

              isTyping

            }

            className="px-4 py-2.5 rounded-xl bg-recon-forest dark:bg-recon-dark-accent text-white font-extrabold text-xs shadow-soft hover:bg-recon-forestHover disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"

          >


            <span>

              Send

            </span>


            <Send className="w-3.5 h-3.5" />


          </button>


        </form>


      </div>


    </div>

  );

};