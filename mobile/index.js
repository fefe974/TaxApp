import { registerRootComponent } from 'expo';

import App from './App';
import LibroMayorApp from './libro-mayor/App';

// EXPO_PUBLIC_ vars are inlined by Expo at bundle time and safe to branch on here.
// Default (unset) behavior is unchanged: the LedgerLab Classroom WebView app loads as before.
const Root = process.env.EXPO_PUBLIC_APP_VARIANT === 'libro-mayor' ? LibroMayorApp : App;

// registerRootComponent calls AppRegistry.registerComponent('main', () => Root);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(Root);
