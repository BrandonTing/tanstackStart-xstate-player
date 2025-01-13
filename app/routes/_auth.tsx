import { Button } from '@/components/ui/button';
import { SignInButton, SignUpButton, useAuth } from '@clerk/tanstack-start';
import { Outlet, createFileRoute } from '@tanstack/react-router';
import { Match } from 'effect';

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
})

const matcher = Match.type<{
  isLoaded: boolean,
  userId: string | null | undefined
}>().pipe(
  Match.when({
    isLoaded: false
  }, () => {
    return <p className="pt-20 ">Loading...</p>;
  }),
  Match.not({
    userId: Match.string
  }, () => {
    return <div className='mt-20'>
      <h1 className="mb-8 text-4xl font-bold text-center text-white">Sign In Required</h1>
      <div className='flex items-center justify-center w-full'>
        <div className="w-full max-w-md p-8 rounded-lg bg-zinc-800">
          <p className="mb-6 text-lg text-center text-white">
            Please sign in or sign up to access this content.
          </p>
          <div className="flex justify-center space-x-4">
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
        </div>
      </div>
    </div>
  }),
  Match.orElse(() => {
    return <Outlet />
  })
)

function RouteComponent() {
  const { isLoaded, userId } = useAuth()
  return <main className="container px-4 pt-24 mx-auto">
    {matcher({
      isLoaded,
      userId
    })}
  </main>
}
