'use client'

import { SignInButton, SignOutButton, SignUpButton, SignedIn, SignedOut, useUser } from '@clerk/tanstack-start'
import { Link, useLocation } from '@tanstack/react-router'
import { Info, LogOut, User } from 'lucide-react'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

export function UserMenu() {
  const { pathname } = useLocation()
  const { user } = useUser()
  return <div>
    <SignedIn>
      <Popover>
        <PopoverTrigger asChild>
          {
            user ? <Button variant="ghost" size="icon" className="text-white rounded-full">
              <img className="w-6 h-6 rounded-full" src={user?.imageUrl} alt={user?.username ?? "user"} />
            </Button> : null
          }
        </PopoverTrigger>
        <PopoverContent className="w-56 bg-zinc-800 border-zinc-700">
          <div className="grid gap-4">
            <Link href="/user-info">
              <Button
                variant="ghost"
                className={`w-full justify-start text-white hover:text-gray-300 hover:bg-zinc-700 ${pathname === '/user-info' ? 'bg-zinc-700' : ''
                  }`}
              >
                <Info className="w-4 h-4 mr-2" />
                User Info
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="justify-start w-full text-white hover:text-gray-300 hover:bg-zinc-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <SignOutButton />
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </SignedIn>
    <SignedOut>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="text-white">
            <User className="w-6 h-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 bg-zinc-800 border-zinc-700">
          <div className="grid gap-4">
            <Button
              variant="ghost"
              className="text-white hover:text-gray-900"
            >
              <SignInButton />
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:text-gray-900"
            >
              <SignUpButton />
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </SignedOut>
  </div>
}

