# Life Lab Glint Clone

Standalone static clone of the supplied menu video, adapted to the Life Lab concept axes and domain-specific hover visualizations.

Run:

```sh
node server.mjs
```

Open `http://localhost:4175`.

The desktop layout follows the source video: a centered 1728x972 plane, five equal vertical fields, and the original fixed header/footer chrome. Hover or keyboard focus reveals:

- Sleep and Diet target-versus-yesterday bars
- Exercise today's full routine
- Time Management live earnings and a 24-hour schedule marker
- Exploration habits and three candidate activities

Click pins one field for touch use; Escape clears it. The mobile layout is inferred as expanding horizontal rows because the source video does not show a responsive state. Values are demo data; the live earnings and current-time marker update from the browser's local clock.
