import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import { WEB_APP_HTML } from './assets/web/webAppHtml';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#2563eb" />
      <WebView
        originWhitelist={['*']}
        // baseUrl gives the page a real origin so localStorage works and
        // walkthrough progress survives between launches.
        source={{ html: WEB_APP_HTML, baseUrl: 'https://ledgerly.app/' }}
        style={styles.webview}
        allowFileAccess
        domStorageEnabled
        javaScriptEnabled
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2563eb',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
