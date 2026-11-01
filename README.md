# Baby Hoodie Landing

Single-product landing page for newborn baby hoodies (Bangla + English), plus an admin
dashboard for orders. Next.js 16 (App Router) + Tailwind.

## Routes

| URL                | What                                   |
| ------------------ | -------------------------------------- |
| `/`                | Landing page (public)                  |
| `/dashboard/login` | Admin login                            |
| `/dashboard`       | Orders list (admin only)               |

## Structure

```
app/
  layout.tsx                 # root: <html>, font, site SEO
  (public)/                  # route group — public site, not in URL
    layout.tsx               #   Navbar + Footer
    page.tsx                 #   "/" landing page
    <new-page>/page.tsx      #   add more public pages here (e.g. privacy-policy)
  dashboard/
    layout.tsx               # noindex for all admin pages
    actions.ts               # login / logout server actions
    login/page.tsx           # "/dashboard/login"
    (protected)/             # everything here requires admin login
      layout.tsx             #   requireAdmin() + dashboard header
      page.tsx               #   "/dashboard" orders list
components/
  landing/                   # Navbar, Footer, StickyOrderBar, sections/ (Hero, Stats, ...)
                             # ProductGallery, ColorCards, VideoPlayer, OrderSelection (shared colour state)
  dashboard/                 # LoginForm, DashboardHeader, OrdersTable
  ui/                        # shared: Section, SectionTitle, OrderButton
lib/
  product.ts                 # ALL landing page content (text, prices, sizes, reviews)
  types.ts                   # Order type
  auth.ts                    # session cookie + requireAdmin()
  api/                       # backend calls (currently mocked — see TODOs)
    auth.ts                  #   adminLogin()
    orders.ts                #   getOrders()
proxy.ts                     # redirects /dashboard <-> /dashboard/login
public/assets/
  products/                  # <colour>-baby|front|back.webp (640px), og.jpg (link preview)
  video/                     # product-demo.mp4 (540p, ~3 MB) + poster
assets-source/               # original full-size photos/video — NOT deployed
```

## Adding / replacing product media

- Photos: one square WebP per colour and view, named `<colour>-<view>.webp`
  (views: `baby`, `front`, `back`). Colours are listed in `lib/product.ts`.
- Video: keep it small for mobile data — re-encode originals to ~540p H.264,
  e.g. `ffmpeg -i in.mp4 -vf scale=540:-2 -crf 28 -movflags +faststart out.mp4`.

## Admin login

Until the backend is ready, login is checked against `ADMIN_EMAIL` / `ADMIN_PASSWORD`
in `.env.local`, and orders are mock data. To connect the real API, replace the mock
bodies in `lib/api/auth.ts` and `lib/api/orders.ts` (example code is in the comments).

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run lint` — ESLint
