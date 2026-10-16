# Landing site status (Oct 16, 2026)

Live at www.atlaschurchsolutions.com from `main` at `458ff59` (PR #1, clean-urls). Mirrors `claude/LANDING_SITE_STATUS_2026-10-16.md` in the Atlas Claude project.

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
- Local testing: `python3 -m http.server` doesn't understand clean URLs. Use `npx serve -l 8000`, or test on a Vercel branch preview.

## Forms (HubSpot, free plan, portal 246126781, region na2)
| Form | Page | HubSpot form ID | Custom property |
|---|---|---|---|
| Founding church inquiry | `/#apply` | `c293f662-09ec-45a2-a3d1-dd80a0d29804` | `staff_size` |
| General contact | `/contact-us` | `8f08139b-bd1a-48bb-bcef-2f8517a309c0` | `contact_reason` |

- The pages post straight to the HubSpot submission API (`api.hsforms.com`, falling back to `api-na2.hsforms.com`). No HubSpot script loads, so no HubSpot cookie is set. This matches Cookie Policy §2.
- Every field the page sends must exist on the HubSpot form. The `name` attributes must match HubSpot internal names exactly: `firstname`, `lastname`, `email`, `company`, `jobtitle`, `staff_size`, `contact_reason`, `message`.
- Company must be the **Contact** property (`0-1/company`), not the Company object's Name (`0-2/name`). A mismatch caused a 400 error on Oct 16.
- Dropdown option internal values in HubSpot must match the option text on the page exactly.
- Both forms were tested working on localhost on Oct 16.

## Copy and claims (matched to the app and the legal drafts)
- Workspace is the only plan shown, with no prices on the page. Founding churches get "90 days free," then a founding rate. Never "lifetime" or "No credit card required."
- FAQ: no long-term contract, cancel anytime, admins can export anytime. Huddle recording and AI summaries are live for churches that turn on AI; Atlas AI chat, Messages, Serve, Care and Workflows are still coming.
- Don't claim Atlas "detects" crises; follow-up flags are prompts. Don't claim a phone app.
- Lucas is Founder & CEO; Ben is Co-founder & CTO; Josiah is Co-founder & CMO.
- The AI Brief button was edited out of the project-board screenshot (AI chat isn't in launch scope).
- Adding any new third-party service to the site means updating `/sub-processors` and the Privacy Policy first.

## Still open
- [ ] Vercel: redirect `atlaschurchsolutions.com` to `www`.
- [ ] Turn off the Zapier zap and close the old Google Form.
- [ ] Delete Oct 16 test contacts in HubSpot; submit one real test from the live site.
- [ ] App: update links to `/legal#tos` and `/legal#privacy-policy` (the old ones still redirect).
- [ ] Legal: fill the `[legal entity name]` and `[mailing address]` placeholders after the LLC filing; lawyer review of all five policies.
- [ ] Screenshots are 1×; recapture at 2× when page migration is done. Consider adding the onboarding flow as a seventh screen.
