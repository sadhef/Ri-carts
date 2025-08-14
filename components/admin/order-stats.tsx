'use client'

// Card components no longer needed
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = ['#141414', '#2F2F2F', '#666666', '#999999', '#E7E6E4']

interface OrderStatsProps {
  data: {
    name: string
    value: number
  }[]
}

export function OrderStats({ data }: OrderStatsProps) {
  // Handle undefined or empty data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className='h-[400px] flex items-center justify-center'>
        <p className='rr-body' style={{ color: 'var(--rr-medium-gray)' }}>
          No order data available
        </p>
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className='h-[400px]'>
      <ResponsiveContainer width='100%' height='100%'>
        <PieChart>
          <Pie
            data={data}
            cx='50%'
            cy='50%'
            labelLine={false}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={120}
            fill='#8884d8'
            dataKey='value'
            style={{ fontSize: '12px', fill: 'var(--rr-dark-text)' }}
          >
            {data?.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            )) || []}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className='p-3' style={{ backgroundColor: 'var(--rr-light-bg)', border: '1px solid var(--rr-light-gray)' }}>
                    <div className='grid gap-2'>
                      <div className='flex flex-col'>
                        <span className='rr-label' style={{ color: 'var(--rr-dark-text)' }}>
                          Status
                        </span>
                        <span className='rr-body font-medium' style={{ color: 'var(--rr-pure-black)' }}>
                          {data.name}
                        </span>
                      </div>
                      <div className='flex flex-col'>
                        <span className='rr-label' style={{ color: 'var(--rr-dark-text)' }}>
                          Orders
                        </span>
                        <span className='rr-body font-medium' style={{ color: 'var(--rr-pure-black)' }}>
                          {data.value} (
                          {((data.value / total) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
