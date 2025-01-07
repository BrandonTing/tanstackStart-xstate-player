import { useAuth } from '@clerk/tanstack-start';
import { Navigate, Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
})

function RouteComponent() {
  const { isLoaded, userId } = useAuth()
  if (!isLoaded) {
    return <p className="pt-20 ">Loading...</p>;
  }
  if (!userId) {
    return <Navigate to="/" />
  }
  return <Outlet />
}
