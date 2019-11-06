# PLEX #NowPlaying

<div align="center">
![SUPER FUTURE](_screenshots/v1.png)
</div>

PLEX #NowPlaying (PnP) is a simple node.js app that shares your current PLEX session. The app is simply a node script that accesses your PLEX server and proxies the data to a consumable javascript object.

## Usage

```
npm start
npm stop
```

## To-Do
- [ ] Continue updating README
- [ ] Create PM2 release branch
- [ ] Create Proxy Layer
- [ ] Create Config Layer
- [ ] Create Debug Layer
- [ ] "Templatize" the client/render on server
- [ ] Smmother, Smaller Client

## Future
- [ ] Playlists
- [ ] Full Minimal Library View for "what do you listen to? type questions"
- [ ] Album Mode

## Dev Notes

### API

Full - http://10.0.0.173:32400/library/metadata/9516/thumb/1518149414?X-Plex-Token=vYF5nUQcaTYNXsvU19EM

Sessions- http://10.0.0.173:32400/status/sessions?X-Plex-Token=vYF5nUQcaTYNXsvU19EM

Transcoded - http://10.0.0.173:32400/photo/:/transcode?url=http%3A%2F%2F10.0.0.173%3A32400%2Flibrary%2Fmetadata%2F9516%2Fthumb%2F1518149414%3F&width=148&height=156&X-Plex-Token=vYF5nUQcaTYNXsvU19EM

URL Encoder - https://www.urlencoder.org/

## More Info
- https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/
- https://support.plex.tv/articles/categories/plex-media-server/using-plex-web-app/
- https://github.com/Arcanemagus/plex-api/wiki/Plex-Web-API-Overview
- https://github.com/Arcanemagus/plex-api/wiki/Playback-Control