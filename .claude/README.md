# .claude/ — project Claude config

`settings.json` holds project-local permissions. Plugin marketplaces are
registered per-user, not in this file. After cloning, run:

```
/plugin marketplace add mattpocock/skills
/plugin marketplace add nimrodfisher/data-analytics-skills
```

Then `/setup-matt-pocock-skills` to scaffold `docs/agents/`.
