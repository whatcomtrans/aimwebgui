# AimWebGui

React app for switching console displays via the AIM API. Served via a static file server using `pm2` on `SRVWEBNODE3` from `C:\ProgramData\WTA\aimwebgui`. `pm2.json` config file defines the port to use.

#### Query Parameters

- `id` - Dispatch station id (`d1`, `d2`, `d3`, `d4`, or `d5`)
- `layout` [optional] - Layout name (`2x4`, or defaults to triangle layout)

## Deployment

`npm run build` to generate build directory and move to appropriate location based on `PM2_SERVE_PATH` defined in `pm2.json`
