'use client'

import { formatCurrency } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
// Card components no longer needed
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { OrderStatus } from '@/types'
import { useRouter } from 'next/navigation'

interface RecentOrder {
  id: string
  user: {
    name: string | null
  }
  total: number
  status: OrderStatus
  createdAt: string | Date
}

interface RecentOrdersProps {
  orders: RecentOrder[]
}

const statusColors = {
  [OrderStatus.PENDING]: { backgroundColor: 'var(--rr-light-gray)', color: 'var(--rr-dark-text)' },
  [OrderStatus.PROCESSING]: { backgroundColor: 'var(--rr-pure-black)', color: 'var(--rr-light-bg)' },
  [OrderStatus.SHIPPED]: { backgroundColor: 'var(--rr-dark-text)', color: 'var(--rr-light-bg)' },
  [OrderStatus.DELIVERED]: { backgroundColor: 'var(--rr-pure-black)', color: 'var(--rr-light-bg)' },
  [OrderStatus.CANCELLED]: { backgroundColor: 'var(--rr-light-gray)', color: 'var(--rr-dark-text)' },
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  const router = useRouter()

  // Handle undefined or empty orders
  if (!orders || !Array.isArray(orders) || orders.length === 0) {
    return (
      <div className='flex items-center justify-center py-8'>
        <p className='rr-body' style={{ color: 'var(--rr-medium-gray)' }}>
          No recent orders found
        </p>
      </div>
    )
  }

  return (
    <div className='overflow-x-auto'>
      <Table>
        <TableHeader>
          <TableRow style={{ borderBottom: '1px solid var(--rr-light-gray)' }}>
            <TableHead className='rr-label w-32' style={{ color: 'var(--rr-dark-text)' }}>Order ID</TableHead>
            <TableHead className='rr-label min-w-32' style={{ color: 'var(--rr-dark-text)' }}>Customer</TableHead>
            <TableHead className='rr-label w-24 text-right' style={{ color: 'var(--rr-dark-text)' }}>Total</TableHead>
            <TableHead className='rr-label w-28' style={{ color: 'var(--rr-dark-text)' }}>Status</TableHead>
            <TableHead className='rr-label w-28' style={{ color: 'var(--rr-dark-text)' }}>Date</TableHead>
            <TableHead className='rr-label w-20 text-right' style={{ color: 'var(--rr-dark-text)' }}>Actions</TableHead>
          </TableRow>
        </TableHeader>
      <TableBody>
        {orders.map((order, index) => {
          // Ensure we have valid data
          const orderId = order.id || order._id || `order-${index}`
          const customerName = order.user?.name || 'Guest User'
          const orderTotal = typeof order.total === 'number' ? order.total : 0
          const orderStatus = order.status || 'PENDING'
          const orderDate = order.createdAt ? new Date(order.createdAt) : new Date()
          
          return (
            <TableRow key={orderId} className='hover:opacity-70 transition-opacity' style={{ borderBottom: '1px solid var(--rr-light-gray)' }}>
              <TableCell className='rr-body font-medium' style={{ color: 'var(--rr-pure-black)' }}>
                #{orderId.toString().slice(-8).toUpperCase()}
              </TableCell>
              <TableCell className='rr-body' style={{ color: 'var(--rr-dark-text)' }}>
                {customerName}
              </TableCell>
              <TableCell className='rr-body font-medium text-right' style={{ color: 'var(--rr-pure-black)' }}>
                {formatCurrency(orderTotal)}
              </TableCell>
              <TableCell>
                <Badge
                  variant='secondary'
                  className='rr-label'
                  style={statusColors[orderStatus as OrderStatus] || { backgroundColor: 'var(--rr-light-gray)', color: 'var(--rr-dark-text)' }}
                >
                  {orderStatus}
                </Badge>
              </TableCell>
              <TableCell className='rr-body' style={{ color: 'var(--rr-dark-text)' }}>
                {orderDate.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </TableCell>
              <TableCell className='text-right'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='icon' className='hover:opacity-70 transition-opacity' style={{ color: 'var(--rr-pure-black)' }}>
                      <MoreHorizontal className='h-4 w-4' />
                      <span className='sr-only'>Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' style={{ backgroundColor: 'var(--rr-light-bg)', border: '1px solid var(--rr-light-gray)' }}>
                    <DropdownMenuItem
                      onClick={() => router.push(`/admin/orders/${orderId}`)}
                      className='rr-body-sm hover:opacity-70 transition-opacity'
                      style={{ color: 'var(--rr-pure-black)' }}
                    >
                      <Eye className='mr-2 h-4 w-4' />
                      View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )
        })}
        </TableBody>
      </Table>
    </div>
  )
}
