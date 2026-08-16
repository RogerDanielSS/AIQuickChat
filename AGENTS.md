# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.


# Project structure

```
src/
├── app/
│   └── index.tsx          # Route
├── screens/
│   └── ChatScreen.tsx     # UI
├── services/
│   ├── apiClient.ts       # Axios config
│   └── chatService.ts     # API functions
├── hooks/
│   └── useChat.ts         # Logic + state
├── components/
│   └── MessageBubble.tsx  # Reusable UI
├── utils/
│   └── formatters.ts      # Helpers
└── constants/
    └── config.ts          # App settings
```