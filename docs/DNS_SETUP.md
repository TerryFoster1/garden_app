# DNS Setup For Pattypan.ca

The domain `pattypan.ca` is managed through GoDaddy. Vercel will host the Expo web export.

Do not change DNS until the Vercel project exists and the GitHub deployment is working.

## Domains

- Root domain: `pattypan.ca`
- WWW domain: `www.pattypan.ca`
- Vercel project alias status: both `pattypan.ca` and `www.pattypan.ca` have been assigned to the Pattypan Vercel project.
- Current nameservers from Vercel CLI inspection: GoDaddy nameservers `ns07.domaincontrol.com` and `ns08.domaincontrol.com`.

## Recommended Setup

Keep GoDaddy as the registrar and manage DNS records there unless you intentionally move nameservers to Vercel.

In Vercel:

1. Open the Pattypan project.
2. Go to Settings → Domains.
3. Add `pattypan.ca`.
4. Add `www.pattypan.ca`.
5. Copy the exact DNS records Vercel provides.

In GoDaddy:

1. Open My Products.
2. Choose `pattypan.ca`.
3. Open DNS / Manage DNS.
4. Add or update the root domain record exactly as Vercel provides.
5. Add or update the `www` record exactly as Vercel provides.

Typical Vercel DNS patterns are an `A` record for the root domain and a `CNAME` record for `www`, but use the exact values shown in Vercel for this project.

## Current GoDaddy Records To Check

Vercel CLI confirmed the domain exists and the aliases were created, but it did not return project-specific dynamic DNS targets. In the Vercel dashboard, open Project Settings -> Domains for Pattypan and use the recommended records shown there.

If the dashboard shows the standard Vercel records, GoDaddy should have:

| Type | Name | Value | Notes |
| --- | --- | --- | --- |
| A | `@` | `76.76.21.21` or the Vercel-recommended apex IP shown in Project Settings | Root domain `pattypan.ca` |
| CNAME | `www` | `cname.vercel-dns-0.com` or the Vercel-recommended CNAME shown in Project Settings | `www.pattypan.ca` |

Remove conflicting parked-domain, forwarding, or duplicate A/CNAME records for `@` and `www`.

## SSL

Vercel should automatically provision SSL after DNS resolves. This can take a few minutes and sometimes longer during DNS propagation.

## Verification

After DNS changes propagate:

```bash
nslookup pattypan.ca
nslookup www.pattypan.ca
```

Then open:

- `https://pattypan.ca`
- `https://www.pattypan.ca`

Both should reach the Pattypan Vercel deployment with a valid HTTPS certificate.

## Troubleshooting

- If Vercel says invalid configuration, re-check the GoDaddy record name, type, and value.
- If the root works but `www` fails, check the `www` CNAME.
- If `www` works but root fails, check the apex/root record.
- If SSL is pending, wait for DNS propagation and then re-check in Vercel.
- Never put provider API keys into GoDaddy DNS records or public repo files.
