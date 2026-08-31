import React, { useState } from 'react';

import {
  ChevronRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

import { RiskBadge } from './RiskBadge';
import { formatCurrency } from '../utils/formatCurrency';


export const ActionQueue = ({
  items = [],
  onInvestigateItem,
}) => {

  const [resolvedIds, setResolvedIds] =
    useState([]);


  const handleResolve = (
    id,
    event
  ) => {

    event.stopPropagation();

    setResolvedIds(
      (previousIds) => [

        ...previousIds,

        id,

      ]
    );

  };


  return (

    <div className="
      p-5
      rounded-2xl
      bg-white
      dark:bg-recon-dark-card
      border
      border-recon-light-border
      dark:border-recon-dark-border
      shadow-soft
      transition-colors
    ">


      {/* HEADER */}

      <div className="
        flex
        items-center
        justify-between
        mb-5
      ">

        <div>

          <div className="
            flex
            items-center
            gap-2
          ">

            <h2 className="
              text-base
              font-extrabold
              text-recon-light-text
              dark:text-recon-dark-text
              tracking-tight
            ">

              AI Priority Action Queue

            </h2>


            <span className="
              px-2
              py-0.5
              rounded-full
              text-[10px]
              font-bold
              bg-recon-forest/10
              dark:bg-recon-dark-accent/20
              text-recon-forest
              dark:text-recon-dark-accent
            ">

              Live Priority Ranking

            </span>

          </div>


          <p className="
            text-xs
            text-recon-light-muted
            dark:text-recon-dark-muted
            mt-0.5
            font-medium
          ">

            Financial discrepancies ranked by
            priority, risk score, and exposure amount

          </p>

        </div>

      </div>


      {/* EMPTY STATE */}

      {items.length === 0 ? (

        <div className="
          py-10
          text-center
        ">

          <CheckCircle2
            className="
              w-10
              h-10
              mx-auto
              mb-3
              text-emerald-500
            "
          />


          <p className="
            text-sm
            font-bold
            text-recon-light-text
            dark:text-recon-dark-text
          ">

            No active priority actions

          </p>


          <p className="
            text-xs
            mt-1
            text-recon-light-muted
            dark:text-recon-dark-muted
          ">

            Your reconciliation currently has
            no unresolved exceptions.

          </p>

        </div>

      ) : (

        <div className="
          space-y-3
        ">

          {items.map(
            (item, index) => {

              const itemId =
                item.id ||
                item.case_id ||
                `exception-${index}`;


              const isResolved =
                resolvedIds.includes(
                  itemId
                );


              return (

                <div

                  key={itemId}

                  onClick={() =>
                    onInvestigateItem &&
                    onInvestigateItem(item)
                  }

                  className={`
                    p-4
                    rounded-xl
                    border
                    transition-all
                    cursor-pointer
                    group

                    ${
                      isResolved

                        ? `
                          bg-gray-50/50
                          dark:bg-recon-dark-bg/50
                          border-gray-200/50
                          dark:border-recon-dark-border/40
                          opacity-60
                        `

                        : `
                          bg-recon-light-bg/60
                          dark:bg-recon-dark-cardHover/60
                          border-recon-light-border
                          dark:border-recon-dark-border
                          hover:border-recon-forest/30
                          dark:hover:border-recon-dark-accent/40
                          hover:shadow-sm
                        `
                    }
                  `}
                >


                  <div className="
                    flex
                    flex-col
                    md:flex-row
                    md:items-center
                    justify-between
                    gap-3
                  ">


                    {/* LEFT DETAILS */}

                    <div className="
                      flex
                      items-start
                      gap-3
                      flex-1
                      min-w-0
                    ">

                      <div className="
                        mt-0.5
                      ">

                        <RiskBadge
                          priority={
                            item.priority ||
                            'MEDIUM'
                          }
                        />

                      </div>


                      <div className="
                        flex-1
                        min-w-0
                      ">


                        <div className="
                          flex
                          items-center
                          gap-2
                          flex-wrap
                        ">

                          <h3 className="
                            text-xs
                            sm:text-sm
                            font-bold
                            text-recon-light-text
                            dark:text-recon-dark-text
                            truncate
                          ">

                            {
                              item.issue ||
                              item.exception_type ||
                              'Financial Exception'
                            }

                          </h3>


                          <span className="
                            text-[10px]
                            font-mono
                            text-recon-light-muted
                            dark:text-recon-dark-muted
                          ">

                            Ref: {
                              item.bankRef ||
                              item.bank_reference ||
                              item.id ||
                              'N/A'
                            }

                          </span>

                        </div>


                        <p className="
                          text-xs
                          text-recon-light-muted
                          dark:text-recon-dark-muted
                          mt-1
                          line-clamp-1
                        ">

                          {
                            item.description ||
                            item.reason ||
                            'Financial discrepancy detected.'
                          }

                        </p>


                        <div className="
                          mt-2
                          flex
                          items-center
                          gap-2
                          text-[11px]
                          text-recon-forest
                          dark:text-recon-dark-accent
                          font-semibold
                        ">

                          <Sparkles
                            className="
                              w-3
                              h-3
                            "
                          />


                          <span>

                            {
                              item.recommendedAction ||
                              item.recommended_action ||
                              'Review this transaction.'
                            }

                          </span>

                        </div>

                      </div>

                    </div>


                    {/* RIGHT SIDE */}

                    <div className="
                      flex
                      items-center
                      justify-between
                      md:justify-end
                      gap-4
                      pt-2
                      md:pt-0
                      border-t
                      md:border-t-0
                      border-recon-light-border/40
                      dark:border-recon-dark-border/40
                    ">


                      <div className="
                        text-left
                        md:text-right
                      ">

                        <p className="
                          text-xs
                          font-extrabold
                          text-recon-light-text
                          dark:text-recon-dark-text
                        ">

                          {
                            formatCurrency(
                              item.amount ||
                              item.amount_at_risk ||
                              0
                            )
                          }

                        </p>


                        <p className="
                          text-[10px]
                          text-recon-light-muted
                          dark:text-recon-dark-muted
                        ">

                          Risk Score:

                          <span className="
                            font-bold
                            text-rose-600
                            dark:text-rose-400
                          ">

                            {
                              item.riskScore ||
                              item.risk_score ||
                              0
                            }/100

                          </span>

                        </p>

                      </div>


                      <div className="
                        flex
                        items-center
                        gap-2
                      ">


                        {isResolved ? (

                          <span className="
                            inline-flex
                            items-center
                            gap-1
                            text-xs
                            font-bold
                            text-emerald-600
                            dark:text-emerald-400
                          ">

                            <CheckCircle2
                              className="
                                w-4
                                h-4
                              "
                            />

                            Resolved

                          </span>

                        ) : (

                          <>

                            <button

                              onClick={
                                (event) =>
                                  handleResolve(
                                    itemId,
                                    event
                                  )
                              }

                              className="
                                px-2.5
                                py-1
                                text-[11px]
                                font-bold
                                rounded-lg
                                bg-emerald-50
                                dark:bg-emerald-950/60
                                text-emerald-700
                                dark:text-emerald-300
                                hover:bg-emerald-100
                                transition-colors
                              "
                            >

                              Resolve

                            </button>


                            <div className="
                              p-1.5
                              rounded-lg
                              text-recon-light-muted
                              dark:text-recon-dark-muted
                              group-hover:text-recon-forest
                              dark:group-hover:text-recon-dark-accent
                              group-hover:translate-x-0.5
                              transition-all
                            ">

                              <ChevronRight
                                className="
                                  w-4
                                  h-4
                                "
                              />

                            </div>

                          </>

                        )}

                      </div>

                    </div>

                  </div>

                </div>

              );

            }
          )}

        </div>

      )}

    </div>

  );

};