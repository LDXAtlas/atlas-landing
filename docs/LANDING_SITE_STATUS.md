# Landing site status (updated Oct 17, 2026)

Live at www.atlaschurchsolutions.com from `main` at `f22abe6` (PR #3, mobile-layout, on top of PR #1, clean-urls). Supersedes the setup notes in LANDING_REDESIGN_HANDOFF_2026-10-14.md. Mirrors `claude/LANDING_SITE_STATUS_2026-10-16.md` in the Atlas Claude project.

This folder is excluded from the public site by `.vercelignore`, so files here aren't served at any URL.

## Pages and addresses
| Page | Address |
|---|---|
| Home | `/` (sections: `#why`, `#how`, `#screens`, `#founding`, `#team`, `#apply`, `#faq`) |
| About | `/about` |
| Contact | `/contact-us` |
| Legal & Privacy Center | `/legal` (`#privacy-policy`, `#tos`, `#aup`, `#dpa`, `#cookie-policy`) |
| Sub-processors | `/sub-processors` |

- `vercel.json`: `cleanUrls: true`, `trailingSlash: false`. Old `.html` addresses redirect to the clean ones and keep their `#anchor`.
- Redirects: `/pricing` and `/learn-more` go to `/`; `/Founder-Signup` goes to `/#apply`. `pricing.html` is deleted.
- Link previews: `og-image.png` (1200×630) plus og/twitter/canonical tags on all five pages.
- Local testing: `npx serve -l 8000` from the repo (Python's server doesn't understand clean URLs). On a phone on the same Wi-Fi, use the Mac's network address on port 8000.

## Mobile (PR #3, Oct 17)
All changes are phone-only: CSS inside `max-width` media queries, nothing removed or edited, desktop pixel-identical at 1440 and 1024.
- **Menu:** a Menu button in the nav pill on every page opens a full-screen frosted overlay. Links are centered and stacked (How it works, The app, Founding churches, FAQ, About, Contact, Privacy), with Log in and Let's talk pinned at the bottom. The space above the links equals the space below them. Focus is kept inside while open; Escape and ✕ close it.
- **Section links from other pages** (e.g. `/#apply` from About) now land on the section. This bug fix also runs on desktop.
- **Sub-processors:** the table is hidden on phones; the cards show the same list.
- **App screenshots:** a "Tap to enlarge" pill on phones; the enlarged view is zoomable.
- **Tap targets** are at least 44px and small labels at least 12px on phones. The floating "Become a founding church" bar is hidden on Contact. Legal tabs get a scroll fade.

## Forms (HubSpot, free plan, portal 246126781, region na2)
| Form | Page | HubSpot form ID | Custom property |
|---|---|---|---|
| Founding church inquiry | `/#apply` | `c293f662-09ec-45a2-a3d1-dd80a0d29804` | `staff_size` |
| General contact | `/contact-us` | `8f08139b-bd1a-48bb-bcef-2f8517a309c0` | `contact_reason` |

- The pages post straight to the HubSpot submission API (`api.hsforms.com`, falling back to `api-na2.hsforms.com`). No HubSpot script loads, so no HubSpot cookie is set. This matches Cookie Policy §2.
- Every field the page sends must exist on the HubSpot form, and Company must be the **Contact** property (`0-1/company`), not the Company object's Name. A mismatch caused a 400 error on Oct 16.

## Copy and claims (matched to Main 5 and the legal chat)
- Workspace is the only plan shown, with no prices on the page. Founding churches get "90 days free," then a founding rate. Never "lifetime" or "No credit card required."
- FAQ: no long-term contract, cancel anytime, admins can export anytime. Huddle recording and AI summaries are live for churches that turn on AI; Atlas AI chat, Messages, Serve, Care and Workflows are still coming.
- Lucas is Founder & CEO; Ben is Co-founder & CTO; Josiah is Co-founder & CMO.
- The AI Brief button was edited out of the project-board screenshot.

## Ideas discussed, not built
- **Glass forms:** frosted form panels with a soft color wash behind them, lighter fields, pill choices instead of dropdowns for staff size and contact reason (same values, so HubSpot is unchanged), and a cleaner contact header. The prompt is in the landing chat of Oct 16; the `form-glass` branch was created but has no changes.

## Still open
- [ ] Vercel: redirect `atlaschurchsolutions.com` to `www`.
- [ ] Turn off the Zapier zap and close the old Google Form.
- [ ] Delete test contacts in HubSpot; submit one real test from the live site on a phone.
- [ ] App (Main 5): update links to `/legal#tos` and `/legal#privacy-policy` (the old ones still redirect). The app's own phone layout isn't built yet; plan it with Ben.
- [ ] Legal: LLC name and mailing address placeholders; lawyer review. The draft banner was removed Oct 15 at Lucas's request, so review is tracked only in LEGAL_LAUNCH_CHECKLIST.md.
- [ ] Screenshots are 1×; recapture at 2× when Ben finishes migrating pages. Consider adding the onboarding flow as a seventh screen.
