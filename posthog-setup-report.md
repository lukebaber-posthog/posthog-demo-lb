# PostHog post-wizard report

The wizard has completed a deep integration of PostHog into the Sprout Demo anonymous message board. Client-side tracking is initialized via `instrumentation-client.ts` (Next.js 15.3+ pattern), with a reverse proxy configured in `next.config.ts` to route PostHog requests through `/ingest`. A server-side singleton client in `src/lib/posthog-server.ts` captures post creation events via the Server Action. Users are identified (with email and name) on both sign-up and sign-in using their better-auth user ID as the distinct ID, and `posthog.reset()` is called on sign-out.

| Event | Description | File |
|---|---|---|
| `user_signed_up` | Fired when a user successfully creates a new account. | `src/app/sign-up/page.tsx` |
| `sign_up_failed` | Fired when a sign-up attempt fails with an error. | `src/app/sign-up/page.tsx` |
| `user_signed_in` | Fired when a user successfully signs in to their account. | `src/app/sign-in/page.tsx` |
| `sign_in_failed` | Fired when a sign-in attempt fails with an error. | `src/app/sign-in/page.tsx` |
| `user_signed_out` | Fired when a user signs out from their account. | `src/components/navbar.tsx` |
| `post_submitted` | Fired on the client when the post form is submitted. | `src/components/posts/post-form.tsx` |
| `post_created` | Fired server-side when a post is successfully written to the database. | `src/lib/posts/actions.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) dashboard](https://us.posthog.com/project/452081/dashboard/1746662)
- [Sign-ups over time](https://us.posthog.com/project/452081/insights/VdifCNIf)
- [Sign-ins over time](https://us.posthog.com/project/452081/insights/xtDKh5vd)
- [Posts submitted over time](https://us.posthog.com/project/452081/insights/pm1gmmEp)
- [Sign-up to first post funnel](https://us.posthog.com/project/452081/insights/ZXj9QlXG)
- [Auth failures over time](https://us.posthog.com/project/452081/insights/J1jRB4In)

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.example` and any bootstrap scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.
- [ ] Confirm the returning-visitor path also calls `identify` — a handler that only identifies on fresh login can leave returning sessions on anonymous distinct IDs.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
