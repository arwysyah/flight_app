# Flight Search App


### Step 1: Configure API Key

1. Sign up at [RapidAPI](https://rapidapi.com/)
2. Subscribe to [Sky Scrapper API](https://rapidapi.com/apiheya/api/sky-scrapper)
3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Open `.env` and add your RapidAPI key:
   ```
   RAPIDAPI_KEY=your_actual_rapidapi_key_here
   RAPIDAPI_HOST=sky-scrapper.p.rapidapi.com
   ```

### Step 2: Install iOS Dependencies (macOS only)

```bash
cd ios && pod install && cd ..
```

### Step 4: Run the App

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```


