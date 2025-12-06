# Overview

This is a Facebook Messenger bot built with Node.js that provides automated messaging, group management, economy features, and Islamic content posting. The bot uses the `ws3-fca` library to interface with Facebook Messenger and includes a web dashboard built with Express for configuration management.

The bot is designed for Pakistani/Urdu-speaking communities, featuring Islamic messages, economy/currency system, group moderation tools, media commands, and AI chat capabilities. It includes both a command-line interface (raza.js) and a web interface (index.js) for managing bot settings.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Core Bot Architecture

**Problem**: Need a scalable, event-driven bot that can handle multiple Facebook groups simultaneously with configurable features.

**Solution**: Modular command and event system with centralized controllers for user data, thread data, and currencies.

**Key Components**:
- **Command System**: Individual command modules in `raza/commands/` loaded dynamically at runtime
- **Event System**: Event handlers in `raza/events/` for group joins, leaves, reactions, etc.
- **Listen Handler**: Central message router (`Data/system/listen.js`) that dispatches to appropriate handlers based on event type
- **Controllers Pattern**: Separate controllers for Users, Threads, and Currencies manage database operations

**Pros**: 
- Easy to add new commands without modifying core code
- Clear separation of concerns
- Commands can be reloaded without restarting bot

**Cons**: 
- File I/O for each command load
- No hot module replacement for events

## Database Architecture

**Problem**: Need persistent storage for user data, group settings, economy balances, and bot configuration.

**Solution**: SQLite database via better-sqlite3 with JSON file fallbacks for configuration.

**Database Schema** (inferred from controllers):
- **users**: User profiles, balances, ban status, daily claim tracking
- **threads**: Group information, approval status, custom settings
- **currencies**: Wallet and bank balances for economy system

**Configuration Storage**:
- `appstate.json`: Facebook authentication cookies
- `Data/config/envconfig.json`: Bot settings (prefix, admins, timezone, features)
- `Data/config/islamic_messages.json`: Scheduled Islamic posts
- `fb_dtsg_data.json`: Facebook security tokens

**Pros**:
- SQLite provides ACID compliance without external database server
- JSON configs are human-readable and easily editable
- File-based storage works well for bot scale

**Cons**:
- No built-in replication or backup
- Concurrent writes could cause locking issues

## Authentication & Session Management

**Problem**: Maintain persistent Facebook session across bot restarts.

**Solution**: Cookie-based authentication stored in `appstate.json` using ws3-fca library.

**Flow**:
1. Initial login creates appstate cookies
2. Cookies stored in JSON format
3. Bot reuses cookies on restart to avoid re-authentication
4. Multiple account support via fb_dtsg_data.json

**Pros**: 
- No password storage required
- Fast bot startup with saved session

**Cons**: 
- Session can expire requiring manual re-login
- Cookies are sensitive and must be protected

## Command Processing Pipeline

**Problem**: Route user messages to appropriate command handlers with permission checking, cooldowns, and reply tracking.

**Solution**: Multi-stage processing pipeline in handleCommand.js:

1. **Message Parsing**: Extract command name and arguments from message
2. **Prefix Validation**: Check if message starts with configured prefix
3. **Command Resolution**: Match command name or aliases to registered commands
4. **Permission Checks**: Validate admin-only, group-only, ban status
5. **Cooldown Management**: Track and enforce per-user command cooldowns
6. **Execution**: Run command with injected dependencies (api, event, send, controllers)
7. **Reply Tracking**: Store command info for reply-based interactions

**Pros**:
- Comprehensive permission system
- Prevents command spam via cooldowns
- Reply tracking enables stateful interactions

**Cons**:
- All checks run on every message (performance overhead)
- No command queue for rate limiting

## Web Dashboard Architecture

**Problem**: Provide user-friendly interface for bot configuration without editing JSON files.

**Solution**: Express.js REST API with JSON response format for configuration management.

**API Endpoints** (inferred from index.js):
- Configuration read/write endpoints
- Appstate management
- Islamic messages CRUD
- Bot start/stop controls

**Pros**:
- No direct file access needed
- Can be extended to full web UI
- JSON API works with any frontend

**Cons**:
- Currently incomplete implementation
- No authentication on API endpoints
- No CORS configuration visible

## Auto-Features Architecture

**Problem**: Enable scheduled and automated behaviors (Islamic posts, group messages, autoban).

**Solution**: node-cron scheduled tasks combined with event-driven triggers.

**Auto Features**:
1. **Auto Islamic Posts**: Cron job posts Islamic messages to groups at scheduled times
2. **Auto Group Messages**: Welcome messages on user join
3. **Autoban System**: Spam detection with temporary 15-minute bans
4. **Busy/AFK System**: Records mentions when admin is away
5. **Autosend**: Scheduled messages at custom intervals per group

**Implementation**: Each feature maintains its own JSON data file in `raza/data/` for persistence.

**Pros**:
- Features can be toggled per group
- Persistent across bot restarts
- Independent data storage prevents conflicts

**Cons**:
- Multiple JSON files to manage
- No centralized scheduling system
- Time-based features rely on bot uptime

## Economy System

**Problem**: Gamification and engagement through virtual currency system.

**Solution**: SQLite-backed economy with wallet/bank separation and daily rewards.

**Features**:
- **Dual Balance System**: Wallet (at-risk) and Bank (safe storage)
- **Daily Rewards**: Streak-based bonuses for consecutive daily claims
- **Transactions**: Deposit, withdraw, transfer between users
- **Persistence**: All balances stored in currencies database table

**Pros**:
- Encourages daily engagement
- Bank system prevents total loss
- Transaction history possible via database

**Cons**:
- No currency earning mechanisms visible (gambling, work commands)
- No economy leaderboard
- Inflation control unclear

# External Dependencies

## Facebook Integration
- **ws3-fca** (v2.0.1): Unofficial Facebook Chat API for Node.js - handles all Facebook Messenger communication, message sending, group management, and session persistence

## Web Framework
- **express** (v5.2.1): Web server for REST API dashboard

## Database
- **better-sqlite3** (v12.5.0): Synchronous SQLite3 bindings for user/thread/currency data storage

## Scheduling & Time
- **node-cron** (v4.2.1): Task scheduler for automated Islamic posts and scheduled messages
- **moment-timezone** (v0.6.0): Timezone-aware date/time handling (Asia/Karachi timezone)

## Media & Content
- **axios** (v1.13.2): HTTP client for external API calls (image upload, GIF search, audio download)
- **yt-search** (v2.13.1): YouTube search functionality for music command

## Utilities
- **fs-extra** (v11.3.2): Enhanced file system operations with Promise support
- **chalk** (v4.1.2): Terminal string styling for colored console logs
- **string-similarity** (v4.0.4): String comparison for fuzzy command matching

## External APIs
- **Tenor GIF API**: GIF search and retrieval (key: LIVDSRZULELA)
- **ImgBB**: Image hosting service (key: cc23943e41ab69d5f498f5d56d090680)
- **Cerebras AI**: Conversational AI for goibot command (requires CEREBRAS_API_KEYS env var)
- **YouTube Audio API**: Music download service (https://yt-tt.onrender.com)
- **Facebook Graph API**: Profile pictures and user information retrieval
- **Google Translate TTS**: Text-to-speech conversion for say command

## Data Storage Files
- **appstate.json**: Facebook authentication cookies and session data
- **fb_dtsg_data.json**: Facebook security tokens per account
- **Data/config/envconfig.json**: Bot configuration (prefix, admins, features)
- **Data/config/islamic_messages.json**: Islamic content for automated posting
- **raza/data/**: Various JSON files for feature-specific data (spam tracking, autosend schedules, busy status, nicklock)