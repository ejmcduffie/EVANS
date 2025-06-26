// No authentication middleware needed for demo
export default function middleware() {
  // No authentication checks - all routes are public
}

export const config = {
  // No protected routes - all pages are public
  matcher: []
};
