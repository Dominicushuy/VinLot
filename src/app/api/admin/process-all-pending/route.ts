// src/app/api/admin/process-all-pending/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { checkBetResult } from '@/lib/utils/bet-result-processor'

// Định nghĩa interface cho cược
interface Bet {
  id: string
  user_id: string
  bet_date: string
  draw_date: string
  region_type: 'M1' | 'M2'
  province_id: string
  bet_type: string
  bet_variant?: string
  numbers: string[]
  selection_method: string
  denomination: number
  total_amount: number
  potential_win_amount: number
  status: 'pending' | 'won' | 'lost'
  win_amount?: number
  [key: string]: any // Cho phép các trường khác nếu cần
}

// Định nghĩa interface cho giao dịch
interface Transaction {
  user_id: string
  bet_id: string
  amount: number
  type: string
  status: string
  description: string
}

export async function POST(request: Request) {
  try {
    const requestData = await request.json()
    const date = requestData.date

    // Kiểm tra xem có đang ở chế độ demo hay không
    const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

    console.log(
      `Starting process-all-pending ${
        isDemo ? 'in DEMO MODE' : `for date: ${date}`
      }`
    )

    // 1. Lấy tất cả các cược đang chờ kết quả
    let query = supabase.from('bets').select('*').eq('status', 'pending')

    // Nếu không phải chế độ demo, lọc theo ngày cụ thể
    if (!isDemo && date) {
      query = query.eq('draw_date', date.split('T')[0])
    }

    // Giới hạn số lượng để tránh timeout
    query = query.limit(100)

    const { data: pendingBets, error: betsError } = await query

    if (betsError) {
      console.error('Error fetching pending bets:', betsError)
      throw new Error(`Lỗi khi lấy cược: ${betsError.message}`)
    }

    const count = pendingBets?.length || 0

    console.log(
      `Found ${count} pending bets ${
        isDemo ? 'in total' : `for date ${date}`
      }, processing ${pendingBets?.length || 0}`
    )

    if (!pendingBets || pendingBets.length === 0) {
      return NextResponse.json({
        message: isDemo
          ? 'Không có cược nào đang chờ đối soát'
          : 'Không có cược cần đối soát cho ngày này',
        processed: 0,
        won: 0,
      })
    }

    // 2. Lấy tất cả kết quả xổ số từ database
    // Trong chế độ demo, lấy tất cả kết quả có sẵn
    const { data: allResults, error: resultsError } = await supabase
      .from('results')
      .select('*')

    if (resultsError) {
      console.error(`Error fetching results:`, resultsError)
      throw new Error(`Lỗi khi lấy kết quả xổ số: ${resultsError.message}`)
    }

    if (!allResults || allResults.length === 0) {
      return NextResponse.json({
        message: 'Chưa có kết quả xổ số nào trong database',
        processed: 0,
        won: 0,
        status: 'no_results',
      })
    }

    console.log(`Fetched ${allResults.length} lottery results from database`)

    // 3. Lấy thông tin loại cược
    const { data: betTypes, error: betTypesError } = await supabase
      .from('rules')
      .select('*')

    if (betTypesError) {
      console.error('Error fetching bet types:', betTypesError)
      throw new Error(
        `Lỗi khi lấy thông tin loại cược: ${betTypesError.message}`
      )
    }

    if (!betTypes || betTypes.length === 0) {
      return NextResponse.json({
        message: 'Không tìm thấy thông tin loại cược',
        processed: 0,
        won: 0,
        status: 'no_bet_types',
      })
    }

    // 4. Đối soát từng cược
    const processedBets: Array<{
      id: string
      status: 'won' | 'lost'
      win_amount: number
      winning_details: any
    }> = []
    const transactions: Transaction[] = []
    let totalWinAmount = 0
    let skippedBets = 0

    for (const bet of pendingBets as Bet[]) {
      console.log(
        `Processing bet ID: ${bet.id}, type: ${bet.bet_type}, province: ${bet.province_id}, draw date: ${bet.draw_date}`
      )

      // Tìm kết quả xổ số cho ngày và tỉnh của cược
      const provinceResults = allResults.filter(
        (r) => r.province_id === bet.province_id && r.date === bet.draw_date
      )

      if (provinceResults.length === 0) {
        console.log(
          `No results found for province ${bet.province_id} on date ${bet.draw_date}`
        )
        skippedBets++
        continue // Bỏ qua nếu chưa có kết quả cho tỉnh và ngày này
      }

      // Tìm loại cược
      const betType = betTypes.find((bt) => bt.bet_type_id === bet.bet_type)
      if (!betType) {
        console.log(`Bet type not found: ${bet.bet_type}`)
        skippedBets++
        continue
      }

      // Đối soát kết quả
      try {
        // Parse JSONB fields từ database nếu cần
        const betTypeWithParsedFields = {
          ...betType,
          region_rules:
            typeof betType.region_rules === 'string'
              ? JSON.parse(betType.region_rules)
              : betType.region_rules,
          variants:
            typeof betType.variants === 'string'
              ? JSON.parse(betType.variants)
              : betType.variants,
          winning_ratio:
            typeof betType.winning_ratio === 'string'
              ? JSON.parse(betType.winning_ratio)
              : betType.winning_ratio,
        }

        const { winAmount, winningDetails } = checkBetResult(
          bet,
          provinceResults[0],
          betTypeWithParsedFields
        )

        console.log(`Bet ${bet.id} result: win amount = ${winAmount}`)

        // Cập nhật trạng thái cược
        const status = winAmount > 0 ? 'won' : 'lost'

        processedBets.push({
          id: bet.id,
          status,
          win_amount: winAmount,
          winning_details: winningDetails,
        })

        console.log(
          `Bet ${bet.id} processed: ${status}, win amount: ${winAmount}`
        )

        // Tạo giao dịch nếu thắng
        if (winAmount > 0) {
          totalWinAmount += winAmount
          transactions.push({
            user_id: bet.user_id,
            bet_id: bet.id,
            amount: winAmount,
            type: 'win',
            status: 'completed',
            description: `Thắng cược ${bet.bet_type} ngày ${bet.draw_date}`,
          })
        }
      } catch (error: any) {
        console.error(`Error processing bet ${bet.id}:`, error)
        skippedBets++
        // Continue with other bets even if one fails
      }
    }

    console.log(
      `Successfully processed ${processedBets.length} bets, ${transactions.length} winning bets, ${skippedBets} skipped`
    )

    // 5. Cập nhật các cược trong database
    const updatePromises = processedBets.map(async (bet) => {
      try {
        const { error: updateError } = await supabase
          .from('bets')
          .update({
            status: bet.status,
            win_amount: bet.win_amount,
            winning_details: bet.winning_details,
            updated_at: new Date().toISOString(),
          })
          .eq('id', bet.id)

        if (updateError) {
          console.error(`Error updating bet ${bet.id}:`, updateError)
          return false
        }
        return true
      } catch (error) {
        console.error(`Error in update promise for bet ${bet.id}:`, error)
        return false
      }
    })

    // Chờ tất cả các update hoàn thành
    const updateResults = await Promise.all(updatePromises)
    const successfulUpdates = updateResults.filter((result) => result).length

    console.log(`Updated ${successfulUpdates} bets in database`)

    // 6. Tạo giao dịch cho các cược thắng
    if (transactions.length > 0) {
      try {
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert(transactions)

        if (transactionError) {
          console.error('Error creating transactions:', transactionError)
        } else {
          console.log(`Created ${transactions.length} transactions`)

          // 7. Cập nhật số dư người dùng
          for (const transaction of transactions) {
            try {
              const { data: user, error: userError } = await supabase
                .from('users')
                .select('balance')
                .eq('id', transaction.user_id)
                .single()

              if (userError) {
                console.error(
                  `Error fetching user ${transaction.user_id}:`,
                  userError
                )
                continue
              }

              if (user) {
                const newBalance = user.balance + transaction.amount
                const { error: updateUserError } = await supabase
                  .from('users')
                  .update({
                    balance: newBalance,
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', transaction.user_id)

                if (updateUserError) {
                  console.error(
                    `Error updating user balance ${transaction.user_id}:`,
                    updateUserError
                  )
                } else {
                  console.log(
                    `Updated user ${transaction.user_id} balance to ${newBalance}`
                  )
                }
              }
            } catch (error) {
              console.error(
                `Error updating user balance for transaction:`,
                error
              )
            }
          }
        }
      } catch (error) {
        console.error('Error in transactions handling:', error)
      }
    }

    // Trả về kết quả đối soát
    return NextResponse.json({
      success: true,
      processed: processedBets.length,
      won: transactions.length,
      total: count,
      updated: successfulUpdates,
      totalWinAmount: totalWinAmount,
      skippedBets: skippedBets,
      isDemo: isDemo,
      message: isDemo
        ? `Đã xử lý ${processedBets.length} trên ${count} cược (bỏ qua ${skippedBets} cược chưa có kết quả)`
        : undefined,
    })
  } catch (error: any) {
    console.error('Error processing all pending bets:', error)
    return NextResponse.json(
      { error: 'Lỗi hệ thống', details: error.message },
      { status: 500 }
    )
  }
}

// Tăng timeout API route nếu cần
export const maxDuration = 60 // 60 seconds
