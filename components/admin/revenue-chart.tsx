'use client'

// Card components no longer needed
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface RevenueData {
  date: string
  revenue: number
}

interface RevenueChartProps {
  data: RevenueData[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  // Handle undefined or empty data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className='h-[400px] flex items-center justify-center'>
        <p className='rr-body' style={{ color: 'var(--rr-medium-gray)' }}>
          No revenue data available
        </p>
      </div>
    )
  }

  return (
    <div className='h-[400px]'>
      <ResponsiveContainer width='100%' height='100%'>
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray='3 3' stroke='var(--rr-light-gray)' />
          <XAxis
            dataKey='date'
            tickLine={false}
            axisLine={false}
            dy={10}
            tick={{ fill: 'var(--rr-medium-gray)', fontSize: 12 }}
          />
          <YAxis
            tickFormatter={(value) => formatCurrency(value)}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--rr-medium-gray)', fontSize: 12 }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className='p-3' style={{ backgroundColor: 'var(--rr-light-bg)', border: '1px solid var(--rr-light-gray)' }}>
                    <div className='grid grid-cols-2 gap-2'>
                      <div className='flex flex-col'>
                        <span className='rr-label' style={{ color: 'var(--rr-dark-text)' }}>
                          Date
                        </span>
                        <span className='rr-body font-medium' style={{ color: 'var(--rr-pure-black)' }}>
                          {payload[0].payload.date}
                        </span>
                      </div>
                      <div className='flex flex-col'>
                        <span className='rr-label' style={{ color: 'var(--rr-dark-text)' }}>
                          Revenue
                        </span>
                        <span className='rr-body font-medium' style={{ color: 'var(--rr-pure-black)' }}>
                          {formatCurrency(payload[0].value as number)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Area
            type='monotone'
            dataKey='revenue'
            stroke='var(--rr-pure-black)'
            fill='var(--rr-pure-black)'
            fillOpacity={0.1}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
