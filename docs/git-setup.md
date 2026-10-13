# Git identity and accounts

## Two different things

**Identity** is the name and email stamped on a commit.
**Authentication** is which GitHub account is allowed to push.

They are solved separately. Do not confuse them.

## Accounts: use one, not two

One GitHub account (Ryan's existing personal account), added as a member of
the Cornerstone organization. The org owns the repos.

Why not a second CF-only account: GitHub Desktop holds one GitHub.com account
signed in at a time. Two accounts means signing in and out constantly.

This still gets the separation that matters:
- The church owns the code, not a personal account.
- Removing a person's org membership removes their access; the repos stay.
- Add Dennis as a second org owner so there is never one key.

Revisit only if CF enforces SAML SSO on the org and requires a managed
identity.

## Identity: one-time setup

Git evaluates this on every command based on where the repo lives. There is
no state and nothing to switch. Run it once.

Add to the bottom of `~/.gitconfig`, leaving the existing personal identity
as the global default:

```
[includeIf "gitdir:~/Projects/cornerstone/"]
    path = ~/.gitconfig-cornerstone
```

The trailing slash matters. It applies the rule to everything under that
folder.

Then create `~/.gitconfig-cornerstone`:

```
[user]
    name = Ryan Bicker
    email = <CF address>
```

## Verify

```
cd ~/Projects/cornerstone/cf-internal-tools
git config user.email     # CF address

cd ~/Projects/touchpoint
git config user.email     # personal address
```

If the first shows the personal address, the `gitdir` path or the trailing
slash is wrong.

## New CF repos

Anything created under `~/Projects/cornerstone/` picks this up automatically.
No per-repo setup.
