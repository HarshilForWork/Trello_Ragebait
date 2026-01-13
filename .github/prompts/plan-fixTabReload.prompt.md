# Plan: Fix tab-switch reload issue

The website likely reloads when switching tabs due to a **circular dependency** in the data loading logic and **Supabase auth state listeners** triggering unnecessary re-fetches. The `loadData` callback depends on `activeBoard` but also modifies it, creating a chain reaction when the tab regains focus and Supabase checks session validity.

## Steps

1. **Fix circular dependency** in [store/index.jsx](store/index.jsx#L51-L67) by removing `activeBoard` from `loadData` dependencies and using a ref or restructuring the board selection logic
2. **Stabilize auth listeners** in [store/index.jsx](store/index.jsx#L84-L97) to only call `loadData` on actual sign-in events, not token refreshes or session checks
3. **Add defensive checks** in [store/auth.jsx](store/auth.jsx#L10-L27) to prevent redundant session updates when tab visibility changes
4. **Test** by adding console logs to track when `loadData` fires, then switching tabs to verify it only loads on actual auth changes, not tab switches

## Further Considerations

1. **Performance optimization** - Consider caching fetched data and only refetching when truly stale, not on every visibility change
2. **StrictMode** - Currently enabled in [main.jsx](main.jsx#L6) causes double-renders in development; this is expected behavior but worth noting for testing

## Root Causes Identified

### 1. Problematic useCallback Dependency - MOST LIKELY CAUSE (store/index.jsx:51-67)

```jsx
const loadData = useCallback(async () => {
  // ... loads data from Supabase
  if (sortedBoards.length > 0 && !activeBoard) {
    setActiveBoard(sortedBoards[0].id)  // This can change activeBoard
  }
}, [activeBoard])  // ⚠️ Depends on activeBoard!

useEffect(() => {
  loadData()
}, [loadData])  // Re-runs when loadData changes
```

**Problem**: This creates a potential infinite loop/excessive re-fetching:
- `loadData` depends on `activeBoard`
- `loadData` can modify `activeBoard` (line 65)
- When `activeBoard` changes, `loadData` is recreated
- This triggers the useEffect again
- When you switch tabs and return, React may re-evaluate these effects

### 2. Supabase Auth State Listener (store/auth.jsx:10-27)

```jsx
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session)
    setUser(session?.user ?? null)
    setLoading(false)
  })

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }
  )

  return () => subscription.unsubscribe()
}, [])
```

**Behavior**: This listener triggers on:
- Initial load
- Token refresh (Supabase tokens typically refresh every hour)
- Tab visibility changes (some browsers pause/resume network activity)

### 3. Additional Auth State Listener in Store (store/index.jsx:84-97)

```jsx
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        if (event === 'SIGNED_OUT') {
          setBoards([])
          setNotes([])
          setActiveBoard(null)
        } else {
          loadData()  // Triggers full data reload
        }
      }
    }
  )
  return () => subscription.unsubscribe()
}, [loadData])
```

**Impact**: If Supabase emits auth events when tabs become visible (token refresh check), this could trigger `loadData`

## Most Likely Scenario

When you switch tabs and return:

1. **Browser behavior**: Some browsers (especially mobile) may pause JavaScript execution or network requests
2. **Supabase SDK**: When the tab becomes visible again, the Supabase client may check the auth session validity
3. **Auth state change**: If the token needs refreshing or validation, `onAuthStateChange` fires
4. **Cascade effect**: This triggers the listener in store/index.jsx which calls `loadData`
5. **Dependency issue**: The `loadData` callback dependency on `activeBoard` may cause additional re-renders
6. **Visual result**: The entire app appears to "reload" because data is being re-fetched and components re-render
