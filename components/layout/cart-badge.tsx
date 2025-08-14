'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/store/use-cart'

export function CartBadge() {
  const cart = useCart()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant='ghost' size='icon' asChild className='relative hover:bg-black/5 text-black'>
        <Link href='/cart'>
          <ShoppingBag className='h-5 w-5' />
        </Link>
      </Button>
    )
  }

  return (
    <Button variant='ghost' size='icon' asChild className='relative hover:bg-black/5 text-black group'>
      <Link href='/cart'>
        <ShoppingBag className='h-5 w-5 transition-transform group-hover:scale-105' />
        {cart.itemCount > 0 && (
          <span className='absolute -top-1 -right-1 h-5 w-5 bg-black text-white rounded-full text-xs font-medium flex items-center justify-center'>
            {cart.itemCount > 9 ? '9+' : cart.itemCount}
          </span>
        )}
      </Link>
    </Button>
  )
}