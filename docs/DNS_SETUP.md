# DNS Setup For Pattypan.ca

The domain `pattypan.ca` is managed through GoDaddy. Vercel will host the Expo web export.

Do not change DNS until the Vercel project exists and the GitHub deployment is working.

## Domains

- Root domain: `pattypan.ca`
- WWW domain: `www.pattypan.ca`

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
